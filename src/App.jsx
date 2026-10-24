import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import NowPlayingView from './components/NowPlayingView';
import PlaylistView from './components/PlaylistView';
import PlayerControls from './components/PlayerControls';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { processAudioFile } from './utils/audioMetadata';
import { DEMO_TRACKS } from './utils/demoTracks';
import { FolderUp, Music, Sparkles, CheckCircle2 } from 'lucide-react';

const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.flac', '.aac', '.m4a', '.opus', '.weba'];

export default function App() {
  const {
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
    audioEventProps
  } = useAudioPlayer([]);

  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showPlaylistMobile, setShowPlaylistMobile] = useState(false);
  const [notification, setNotification] = useState(null);

  const folderInputRef = useRef(null);

  // Trigger temporary notification toast
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Helper to filter and process a list of File objects
  const handleProcessFiles = useCallback(async (fileList, folderName = '') => {
    const rawFiles = Array.from(fileList);
    
    // Filter audio files by extension or mime type
    const audioFiles = rawFiles.filter(file => {
      const name = file.name.toLowerCase();
      const isExt = AUDIO_EXTENSIONS.some(ext => name.endsWith(ext));
      const isMime = file.type && file.type.startsWith('audio/');
      return isExt || isMime;
    });

    if (audioFiles.length === 0) {
      showToast('No compatible audio files (.mp3, .wav, .flac, etc.) found', 'error');
      return;
    }

    setIsLoadingFiles(true);
    setLoadingStatus(`Reading ${audioFiles.length} audio ${audioFiles.length === 1 ? 'file' : 'files'}...`);

    const newTracks = [];
    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      setLoadingStatus(`Parsing metadata: ${i + 1}/${audioFiles.length} (${file.name.slice(0, 25)}...)`);
      try {
        const track = await processAudioFile(file, i);
        newTracks.push(track);
      } catch (err) {
        console.warn('Failed parsing file', file.name, err);
      }
    }

    setIsLoadingFiles(false);
    setLoadingStatus('');

    if (newTracks.length > 0) {
      addTracks(newTracks, playlist.length === 0);
      showToast(
        folderName
          ? `Added ${newTracks.length} tracks from "${folderName}"`
          : `Added ${newTracks.length} tracks to playlist`
      );
    }
  }, [addTracks, playlist.length]);

  // Folder selection handler
  const handleSelectFolder = (files) => {
    if (!files || files.length === 0) return;
    // Extract root folder name from webkitRelativePath if available
    let folderName = 'Folder';
    if (files[0].webkitRelativePath) {
      folderName = files[0].webkitRelativePath.split('/')[0] || 'Selected Folder';
    }
    handleProcessFiles(files, folderName);
  };

  // Files selection handler
  const handleSelectFiles = (files) => {
    if (!files || files.length === 0) return;
    handleProcessFiles(files, '');
  };

  // Load demo tracks
  const handleLoadDemoTracks = () => {
    addTracks(DEMO_TRACKS, true);
    showToast('Loaded AuraBeat Demo Tracks');
  };

  // Drag and Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    const files = e.dataTransfer.files;

    if (files && files.length > 0) {
      handleProcessFiles(files, 'Dropped Files');
    }
  };

  // Seek relative (e.g. +10s / -10s)
  const handleSeekRelative = (seconds) => {
    const target = Math.max(0, Math.min(duration, currentTime + seconds));
    seekTo(target);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in search input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSeekRelative(5);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSeekRelative(-5);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolumeLevel(volume + 0.05);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolumeLevel(volume - 0.05);
          break;
        case 'KeyN':
          nextTrack();
          break;
        case 'KeyP':
          prevTrack();
          break;
        case 'KeyM':
          toggleMute();
          break;
        case 'KeyS':
          toggleShuffle();
          break;
        case 'KeyR':
          cycleRepeatMode();
          break;
        case 'Escape':
          setShowShortcuts(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, handleSeekRelative, setVolumeLevel, volume, nextTrack, prevTrack, toggleMute, toggleShuffle, cycleRepeatMode]);

  return (
    <div 
      className="flex flex-col h-screen w-screen bg-darkbg-base text-slate-100 overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden HTML5 Audio Element */}
      <audio
        ref={audioRef}
        src={currentTrack ? currentTrack.src : undefined}
        preload="metadata"
        crossOrigin="anonymous"
        {...audioEventProps}
      />

      {/* Top Navigation */}
      <Navbar
        onSelectFolder={handleSelectFolder}
        onSelectFiles={handleSelectFiles}
        onLoadDemoTracks={handleLoadDemoTracks}
        playlistCount={playlist.length}
        onOpenShortcuts={() => setShowShortcuts(true)}
        isLoadingFiles={isLoadingFiles}
        loadingStatus={loadingStatus}
      />

      {/* Toast Notification */}
      {notification && (
        <div className="absolute top-16 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900/90 border border-aura-500/40 text-white text-xs shadow-2xl backdrop-blur-md animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-aura-400 shrink-0" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Drag & Drop Fullscreen Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 z-50 bg-aura-950/80 backdrop-blur-md border-4 border-dashed border-aura-400 flex flex-col items-center justify-center p-6 pointer-events-none">
          <FolderUp className="w-20 h-20 text-aura-400 animate-bounce mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">Drop your MP3 files or folder here</h3>
          <p className="text-sm text-aura-200">AuraBeat will scan all audio files and extract metadata automatically</p>
        </div>
      )}

      {/* Main Workspace (Responsive Split Layout) */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Column: Playlist / Queue (Always visible on desktop, toggleable on mobile) */}
        <div
          className={`
            ${showPlaylistMobile ? 'flex' : 'hidden'} 
            md:flex md:w-80 lg:w-96 shrink-0 h-full z-20 transition-all duration-300
            ${showPlaylistMobile ? 'absolute inset-0 bg-darkbg-base z-30' : ''}
          `}
        >
          <PlaylistView
            playlist={playlist}
            currentIndex={currentIndex}
            isPlaying={isPlaying}
            onPlayTrack={(idx) => {
              playTrack(idx);
              setShowPlaylistMobile(false);
            }}
            onToggleFavorite={toggleFavorite}
            onRemoveTrack={removeTrack}
            onClearPlaylist={clearPlaylist}
            onOpenFolderPicker={() => {
              const el = document.querySelector('input[webkitdirectory]');
              if (el) el.click();
            }}
          />
        </div>

        {/* Center / Right Column: Now Playing Centerpiece */}
        <NowPlayingView
          track={currentTrack}
          isPlaying={isPlaying}
          audioRef={audioRef}
          onToggleFavorite={toggleFavorite}
          onSeekRelative={handleSeekRelative}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          onOpenFolderPicker={() => {
            const el = document.querySelector('input[webkitdirectory]');
            if (el) el.click();
          }}
          onLoadDemoTracks={handleLoadDemoTracks}
        />
      </div>

      {/* Bottom Player Controls */}
      <PlayerControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        buffered={buffered}
        volume={volume}
        isMuted={isMuted}
        isShuffle={isShuffle}
        repeatMode={repeatMode}
        onTogglePlay={togglePlay}
        onNext={nextTrack}
        onPrev={prevTrack}
        onSeek={seekTo}
        onVolumeChange={setVolumeLevel}
        onToggleMute={toggleMute}
        onToggleShuffle={toggleShuffle}
        onCycleRepeat={cycleRepeatMode}
        onToggleFavorite={toggleFavorite}
        onTogglePlaylistMobile={() => setShowPlaylistMobile(prev => !prev)}
        showPlaylistMobile={showPlaylistMobile}
      />

      {/* Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
}
