import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  Volume1, 
  VolumeX, 
  Heart,
  Disc,
  ListMusic
} from 'lucide-react';
import { formatTime } from '../utils/audioMetadata';

export default function PlayerControls({
  currentTrack,
  isPlaying,
  currentTime,
  duration,
  buffered,
  volume,
  isMuted,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleShuffle,
  onCycleRepeat,
  onToggleFavorite,
  onTogglePlaylistMobile,
  showPlaylistMobile
}) {
  const [hoverSeekTime, setHoverSeekTime] = useState(null);
  const [hoverSeekPos, setHoverSeekPos] = useState(0);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekMouseMove = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverSeekTime(pos * duration);
    setHoverSeekPos(pos * 100);
  };

  const handleSeekMouseLeave = () => {
    setHoverSeekTime(null);
  };

  const handleSeekClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(pos * duration);
  };

  return (
    <footer className="w-full glass-panel border-t border-white/10 px-4 py-3 md:py-4 shrink-0 z-40">
      {/* 1. Seek / Progress Bar (Spans full width on mobile or integrated) */}
      <div className="w-full max-w-5xl mx-auto mb-2 flex items-center gap-3">
        <span className="text-[11px] font-mono text-slate-400 tabular-nums w-10 text-right">
          {formatTime(currentTime)}
        </span>

        {/* Custom Progress Track */}
        <div
          onClick={handleSeekClick}
          onMouseMove={handleSeekMouseMove}
          onMouseLeave={handleSeekMouseLeave}
          className="relative flex-1 h-2 bg-white/10 hover:h-2.5 rounded-full cursor-pointer group transition-all duration-150"
        >
          {/* Buffered Track */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20 rounded-full pointer-events-none transition-all duration-300"
            style={{ width: `${Math.min(100, buffered)}%` }}
          />

          {/* Current Played Track */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-aura-500 to-indigo-400 rounded-full pointer-events-none shadow-sm shadow-aura-500/50"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Thumb handle */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-md shadow-aura-700/50 scale-0 group-hover:scale-100 transition-transform pointer-events-none"
            style={{ left: `${progressPercent}%` }}
          />

          {/* Hover Time Tooltip */}
          {hoverSeekTime !== null && (
            <div
              className="absolute -top-7 -translate-x-1/2 bg-slate-900 border border-white/20 text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-lg pointer-events-none"
              style={{ left: `${hoverSeekPos}%` }}
            >
              {formatTime(hoverSeekTime)}
            </div>
          )}
        </div>

        <span className="text-[11px] font-mono text-slate-400 tabular-nums w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* 2. Controls Grid */}
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Track Glance (Desktop / Tablet) */}
        <div className="hidden sm:flex items-center gap-3 min-w-[160px] max-w-[240px]">
          {currentTrack ? (
            <>
              <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800 shadow-md">
                {currentTrack.coverUrl ? (
                  <img
                    src={currentTrack.coverUrl}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${currentTrack.gradient} flex items-center justify-center`}>
                    <Disc className="w-5 h-5 text-white/50" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentTrack.title}</p>
                <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
              </div>
              <button
                onClick={() => onToggleFavorite(currentTrack.id)}
                className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition ml-1 shrink-0"
              >
                <Heart
                  className={`w-4 h-4 ${
                    currentTrack.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                  }`}
                />
              </button>
            </>
          ) : (
            <div className="text-xs text-slate-500 italic">No track playing</div>
          )}
        </div>

        {/* Center: Main Playback Controls */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 flex-1">
          {/* Shuffle Button */}
          <button
            onClick={onToggleShuffle}
            className={`p-2 rounded-xl transition ${
              isShuffle
                ? 'text-aura-400 bg-aura-500/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={onPrev}
            disabled={!currentTrack}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition active:scale-95"
            title="Previous track"
          >
            <SkipBack className="w-5 h-5 fill-current" />
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            disabled={!currentTrack}
            className="w-12 h-12 rounded-full bg-gradient-to-r from-aura-600 via-aura-500 to-indigo-600 hover:from-aura-500 hover:to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-aura-500/30 transition transform duration-150 active:scale-90 disabled:opacity-40"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={onNext}
            disabled={!currentTrack}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-transparent transition active:scale-95"
            title="Next track"
          >
            <SkipForward className="w-5 h-5 fill-current" />
          </button>

          {/* Repeat Mode */}
          <button
            onClick={onCycleRepeat}
            className={`p-2 rounded-xl transition ${
              repeatMode !== 'off'
                ? 'text-aura-400 bg-aura-500/20 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            title={`Repeat: ${repeatMode.toUpperCase()}`}
          >
            {repeatMode === 'one' ? (
              <Repeat1 className="w-4 h-4" />
            ) : (
              <Repeat className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Right: Volume & Mobile Toggle */}
        <div className="flex items-center justify-end gap-3 min-w-[140px]">
          {/* Mobile Playlist Drawer/Toggle */}
          <button
            onClick={onTogglePlaylistMobile}
            className={`md:hidden p-2 rounded-xl border transition ${
              showPlaylistMobile
                ? 'bg-aura-600 text-white border-aura-500'
                : 'bg-white/5 text-slate-300 border-white/10'
            }`}
            title="Toggle Queue"
          >
            <ListMusic className="w-4 h-4" />
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : volume < 0.5 ? (
                <Volume1 className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 lg:w-24 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-aura-500"
              title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
