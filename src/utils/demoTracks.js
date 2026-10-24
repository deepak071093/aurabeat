import { getFallbackGradient } from './audioMetadata';

export const DEMO_TRACKS = [
  {
    id: 'demo-1',
    title: 'Cosmic Drift (Synthwave)',
    artist: 'SoundHelix Audio',
    album: 'Electronic Odyssey Vol. 1',
    genre: 'Synthwave / Ambient',
    year: 2024,
    duration: 372,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    fileName: 'SoundHelix-Song-1.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    gradient: getFallbackGradient('Cosmic Drift'),
    isFavorite: true,
    addedAt: Date.now() - 3000
  },
  {
    id: 'demo-2',
    title: 'Neon Skyline',
    artist: 'Aura Studio Ensemble',
    album: 'City Lights After Dark',
    genre: 'Chill / Lo-Fi',
    year: 2024,
    duration: 423,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    fileName: 'SoundHelix-Song-2.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    gradient: getFallbackGradient('Neon Skyline'),
    isFavorite: false,
    addedAt: Date.now() - 2000
  },
  {
    id: 'demo-3',
    title: 'Ethereal Sunrise',
    artist: 'Zenith Echoes',
    album: 'Acoustic Horizons',
    genre: 'Instrumental',
    year: 2024,
    duration: 345,
    src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    fileName: 'SoundHelix-Song-3.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    gradient: getFallbackGradient('Ethereal Sunrise'),
    isFavorite: false,
    addedAt: Date.now() - 1000
  }
];
