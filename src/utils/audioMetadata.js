import jsmediatags from 'jsmediatags';

// Vibrant gradient presets for tracks without album artwork
const GRADIENTS = [
  'from-violet-600 to-indigo-900',
  'from-fuchsia-600 to-pink-900',
  'from-cyan-600 to-blue-900',
  'from-emerald-600 to-teal-950',
  'from-amber-600 to-orange-950',
  'from-rose-600 to-red-950',
  'from-purple-600 to-fuchsia-950',
  'from-blue-600 to-cyan-950'
];

export function getFallbackGradient(title = '') {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % GRADIENTS.length;
  return GRADIENTS[index];
}

// Format seconds into MM:SS
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Clean and parse filename if ID3 tags are missing
export function parseFilename(filename) {
  // Remove file extension
  const cleanName = filename.replace(/\.[^/.]+$/, '');
  
  // Check if filename is in "Artist - Title" format
  if (cleanName.includes(' - ')) {
    const parts = cleanName.split(' - ');
    const artist = parts[0].trim().replace(/^\d+[\s.-]*/, ''); // remove leading track number
    const title = parts.slice(1).join(' - ').trim();
    return { title: title || cleanName, artist: artist || 'Unknown Artist' };
  }
  
  // Check if starts with track number like "01 Song Title"
  const titleWithoutNum = cleanName.replace(/^\d+[\s._-]+/, '').replace(/_/g, ' ').trim();
  
  return {
    title: titleWithoutNum || cleanName,
    artist: 'Unknown Artist'
  };
}

// Read ID3 metadata using jsmediatags with Blob URL for cover
export function readTagsFromFile(file) {
  return new Promise((resolve) => {
    const reader = jsmediatags.read || (jsmediatags.default && jsmediatags.default.read);
    
    if (!reader) {
      resolve(null);
      return;
    }

    try {
      reader(file, {
        onSuccess: (tag) => {
          const tags = tag.tags || {};
          let coverUrl = null;

          if (tags.picture) {
            try {
              const { data, format } = tags.picture;
              const byteArray = new Uint8Array(data);
              const blob = new Blob([byteArray], { type: format });
              coverUrl = URL.createObjectURL(blob);
            } catch (err) {
              console.warn('Failed to parse album art:', err);
            }
          }

          resolve({
            title: tags.title ? tags.title.trim() : null,
            artist: tags.artist ? tags.artist.trim() : null,
            album: tags.album ? tags.album.trim() : null,
            genre: tags.genre ? tags.genre.trim() : null,
            year: tags.year ? tags.year : null,
            coverUrl
          });
        },
        onError: (error) => {
          // Fallback silently if tags couldn't be parsed
          resolve(null);
        }
      });
    } catch (e) {
      resolve(null);
    }
  });
}

// Get duration from an audio object URL
export function getAudioDuration(url) {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.src = url;

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('error', onError);
    };

    const onLoaded = () => {
      const dur = audio.duration;
      cleanup();
      resolve(isFinite(dur) ? dur : 0);
    };

    const onError = () => {
      cleanup();
      resolve(0);
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('error', onError);

    // Timeout safety in case metadata never loads
    setTimeout(() => {
      cleanup();
      resolve(0);
    }, 2500);
  });
}

// Parse a single audio File into full Track metadata object
export async function processAudioFile(file, index) {
  const fileUrl = URL.createObjectURL(file);
  const parsedFilename = parseFilename(file.name);
  
  // Try reading ID3 tags
  const tags = await readTagsFromFile(file);
  
  // Try loading duration
  const duration = await getAudioDuration(fileUrl);

  const title = (tags && tags.title) || parsedFilename.title;
  const artist = (tags && tags.artist) || parsedFilename.artist;
  const album = (tags && tags.album) || 'Local Music';

  return {
    id: `track-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 6)}`,
    title,
    artist,
    album,
    genre: (tags && tags.genre) || 'Audio',
    year: (tags && tags.year) || null,
    duration,
    src: fileUrl,
    file,
    fileName: file.name,
    fileSize: file.size,
    coverUrl: tags ? tags.coverUrl : null,
    gradient: getFallbackGradient(title),
    isFavorite: false,
    addedAt: Date.now()
  };
}
