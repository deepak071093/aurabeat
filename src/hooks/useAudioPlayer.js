import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioPlayer(initialTracks = []) {
  const audioRef = useRef(null);
  
  const [playlist, setPlaylist] = useState(initialTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('aurabeat_volume');
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  // 'off' | 'all' | 'one'
  const [repeatMode, setRepeatMode] = useState('all');
  const [shuffleHistory, setShuffleHistory] = useState([]);

  const currentTrack = playlist[currentIndex] || null;

  // Initialize favorites from localStorage
  useEffect(() => {
    try {
      const savedFavs = JSON.parse(localStorage.getItem('aurabeat_favorites') || '[]');
      if (savedFavs.length > 0 && playlist.length > 0) {
        setPlaylist(prev =>
          prev.map(t => ({
            ...t,
            isFavorite: savedFavs.includes(t.id) || t.isFavorite
          }))
        );
      }
    } catch (e) {
      console.warn('Error loading favorites:', e);
    }
  }, []);

  // Update volume on audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
    localStorage.setItem('aurabeat_volume', volume.toString());
  }, [volume, isMuted]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Sync title and media session
  useEffect(() => {
    if (!currentTrack) return;
    document.title = `${isPlaying ? '▶ ' : '⏸ '}${currentTrack.title} — AuraBeat`;

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: currentTrack.coverUrl ? [{ src: currentTrack.coverUrl, sizes: '512x512', type: 'image/png' }] : []
      });

      navigator.mediaSession.setActionHandler('play', () => play());
      navigator.mediaSession.setActionHandler('pause', () => pause());
      navigator.mediaSession.setActionHandler('previoustrack', () => prevTrack());
      navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) seekTo(details.seekTime);
      });
    }
  }, [currentTrack, isPlaying]);

  const play = useCallback(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback prevented or interrupted:', err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const playTrack = useCallback((index, autoPlay = true) => {
    if (index >= 0 && index < playlist.length) {
      setCurrentIndex(index);
      setCurrentTime(0);
      if (autoPlay) {
        // Will auto play via src change effect or next tick
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
          }
        }, 50);
      }
    }
  }, [playlist.length]);

  const nextTrack = useCallback(() => {
    if (playlist.length === 0) return;

    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (isShuffle && playlist.length > 1) {
      let nextIndex;
      do {
        nextIndex = Math.floor(Math.random() * playlist.length);
      } while (nextIndex === currentIndex && playlist.length > 1);
      
      setShuffleHistory(prev => [...prev, currentIndex]);
      playTrack(nextIndex, true);
      return;
    }

    const nextIndex = currentIndex + 1;
    if (nextIndex < playlist.length) {
      playTrack(nextIndex, true);
    } else if (repeatMode === 'all') {
      playTrack(0, true);
    } else {
      // Reached end with repeat off
      setIsPlaying(false);
    }
  }, [playlist.length, repeatMode, isShuffle, currentIndex, playTrack]);

  const prevTrack = useCallback(() => {
    if (playlist.length === 0) return;

    // If more than 3 seconds in, restart track
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }

    if (isShuffle && shuffleHistory.length > 0) {
      const prevIndex = shuffleHistory[shuffleHistory.length - 1];
      setShuffleHistory(prev => prev.slice(0, -1));
      playTrack(prevIndex, true);
      return;
    }

    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      playTrack(prevIndex, true);
    } else if (repeatMode === 'all') {
      playTrack(playlist.length - 1, true);
    } else {
      playTrack(0, true);
    }
  }, [playlist.length, currentIndex, isShuffle, shuffleHistory, repeatMode, playTrack]);

  const seekTo = useCallback((time) => {
    if (audioRef.current && isFinite(time)) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  }, []);

  const setVolumeLevel = useCallback((val) => {
    const clamped = Math.max(0, Math.min(1, val));
    setVolume(clamped);
    if (clamped > 0 && isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
    setShuffleHistory([]);
  }, []);

  const cycleRepeatMode = useCallback(() => {
    setRepeatMode(prev => {
      if (prev === 'off') return 'all';
      if (prev === 'all') return 'one';
      return 'off';
    });
  }, []);

  const toggleFavorite = useCallback((trackId) => {
    setPlaylist(prev => {
      const updated = prev.map(t =>
        t.id === trackId ? { ...t, isFavorite: !t.isFavorite } : t
      );
      try {
        const favIds = updated.filter(t => t.isFavorite).map(t => t.id);
        localStorage.setItem('aurabeat_favorites', JSON.stringify(favIds));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  }, []);

  const addTracks = useCallback((newTracks, autoPlayFirst = false) => {
    if (!newTracks || newTracks.length === 0) return;

    setPlaylist(prev => {
      const startIndex = prev.length;
      const combined = [...prev, ...newTracks];
      if (autoPlayFirst || prev.length === 0) {
        setTimeout(() => {
          playTrack(startIndex, true);
        }, 100);
      }
      return combined;
    });
  }, [playTrack]);

  const removeTrack = useCallback((trackId) => {
    setPlaylist(prev => {
      const targetIndex = prev.findIndex(t => t.id === trackId);
      if (targetIndex === -1) return prev;

      const updated = prev.filter(t => t.id !== trackId);

      if (updated.length === 0) {
        setCurrentIndex(0);
        setIsPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return [];
      }

      if (targetIndex === currentIndex) {
        // Track removed was current track
        const newIndex = targetIndex >= updated.length ? 0 : targetIndex;
        setCurrentIndex(newIndex);
        setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            if (isPlaying) audioRef.current.play();
          }
        }, 50);
      } else if (targetIndex < currentIndex) {
        setCurrentIndex(currentIndex - 1);
      }

      return updated;
    });
  }, [currentIndex, isPlaying]);

  const clearPlaylist = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setPlaylist([]);
    setCurrentIndex(0);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  // Audio event listeners
  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      // Update buffer
      const buf = audioRef.current.buffered;
      if (buf.length > 0) {
        setBuffered((buf.end(buf.length - 1) / (audioRef.current.duration || 1)) * 100);
      }
    }
  };

  const onLoadedMetadata = () => {
    if (audioRef.current) {
      const dur = audioRef.current.duration;
      if (isFinite(dur)) {
        setDuration(dur);
      }
    }
  };

  const onEnded = () => {
    nextTrack();
  };

  return {
    audioRef,
    playlist,
    currentTrack,
    currentIndex,
    isPlaying,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    playbackSpeed,
    isShuffle,
    repeatMode,
    play,
    pause,
    togglePlay,
    playTrack,
    nextTrack,
    prevTrack,
    seekTo,
    setVolumeLevel,
    toggleMute,
    toggleShuffle,
    cycleRepeatMode,
    setPlaybackSpeed,
    toggleFavorite,
    addTracks,
    removeTrack,
    clearPlaylist,
    audioEventProps: {
      onTimeUpdate,
      onLoadedMetadata,
      onEnded,
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false)
    }
  };
}
