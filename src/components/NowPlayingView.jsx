import React from 'react';
import { 
  Heart, 
  Disc, 
  Music2, 
  FolderOpen, 
  Sparkles, 
  RotateCcw, 
  RotateCw, 
  Gauge
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';

export default function NowPlayingView({
  track,
  isPlaying,
  audioRef,
  onToggleFavorite,
  onSeekRelative,
  playbackSpeed,
  onChangeSpeed,
  onOpenFolderPicker,
  onLoadDemoTracks,
  isMobile = false
}) {
  if (!track) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-24 h-24 sm:w-32 sm:h-32 mb-6 rounded-3xl bg-aura-950/60 border border-aura-500/20 flex items-center justify-center relative shadow-2xl shadow-aura-500/10">
          <Music2 className="w-12 h-12 sm:w-16 sm:h-16 text-aura-400/80 animate-pulse" />
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-aura-500/20 to-indigo-500/20 blur-md pointer-events-none" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">No Music Loaded Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6 leading-relaxed">
          Select an MP3 folder from your local device to automatically import all tracks, or start with demo tracks to explore AuraBeat.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onOpenFolderPicker}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-aura-600 to-indigo-600 hover:from-aura-500 hover:to-indigo-500 text-white font-medium text-sm shadow-lg shadow-aura-500/25 transition duration-150 active:scale-95"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Select Local Folder</span>
          </button>
          <button
            onClick={onLoadDemoTracks}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-sm transition duration-150 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Load Demo Tracks</span>
          </button>
        </div>
      </div>
    );
  }

  const speeds = [0.75, 1, 1.25, 1.5, 2];

  return (
    <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'p-4' : 'p-6 lg:p-10'} relative overflow-y-auto`}>
      {/* Dynamic Background Glow matching track */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 rounded-full bg-aura-600/15 blur-[100px] pointer-events-none" 
      />

      {/* Album Artwork & Vinyl Presentation */}
      <div className="relative group my-auto flex flex-col items-center">
        {/* Vinyl Disc Container */}
        <div className="relative flex items-center justify-center">
          {/* Vinyl Disc that peeks out / spins */}
          <div 
            className={`absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full bg-slate-950 border-4 border-slate-800/80 shadow-2xl flex items-center justify-center transition-all duration-700 pointer-events-none ${
              isPlaying ? 'translate-x-12 sm:translate-x-16 rotate-180 animate-spin-slow' : 'translate-x-0 opacity-40'
            }`}
            style={{
              backgroundImage: 'radial-gradient(circle, #1a1a2e 15%, #0f1016 16%, #1a1a2e 30%, #0f1016 31%, #1a1a2e 50%, #0f1016 51%, #1a1a2e 70%, #0c0d14 71%)'
            }}
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-aura-500/40 bg-aura-900/60 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-slate-950 border border-white/40" />
            </div>
          </div>

          {/* Main Album Sleeve Card */}
          <div className="relative z-10 w-52 h-52 sm:w-72 sm:h-72 rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/10 bg-slate-900 group">
            {track.coverUrl ? (
              <img
                src={track.coverUrl}
                alt={track.title}
                className="w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${track.gradient || 'from-violet-600 to-indigo-900'} flex flex-col items-center justify-center p-6 text-white`}>
                <Disc className="w-20 h-20 sm:w-28 sm:h-28 text-white/30 mb-3 animate-spin-slow" />
                <span className="text-xs uppercase tracking-widest font-semibold text-white/70">
                  {track.genre || 'Local Audio'}
                </span>
              </div>
            )}

            {/* Glass Overlay with Track Status Badge */}
            <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[10px] uppercase font-semibold tracking-wider text-slate-300">
              {track.album || 'Local Track'}
            </div>

            {/* Favorite Button on Card */}
            <button
              onClick={() => onToggleFavorite(track.id)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition active:scale-90"
              title={track.isFavorite ? 'Remove from favorites' : 'Mark as favorite'}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  track.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white/80 hover:text-white'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Realtime Audio Visualizer */}
        <div className="w-full max-w-xs sm:max-w-md mt-4">
          <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
        </div>

        {/* Track Title and Artist Info */}
        <div className="text-center mt-2 max-w-sm sm:max-w-md px-4">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight line-clamp-1">
            {track.title}
          </h2>
          <p className="text-sm sm:text-base text-slate-400 font-medium mt-1 line-clamp-1">
            {track.artist}
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            {track.year && (
              <span className="text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                {track.year}
              </span>
            )}
            <span className="text-[11px] text-slate-500 bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
              {track.fileName}
            </span>
          </div>
        </div>

        {/* Relative Seek & Speed Helper Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={() => onSeekRelative(-10)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition"
            title="Rewind 10 seconds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>-10s</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
            <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`text-[11px] font-medium px-2 py-0.5 rounded-lg transition ${
                  playbackSpeed === s
                    ? 'bg-aura-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          <button
            onClick={() => onSeekRelative(10)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition"
            title="Fast forward 10 seconds"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+10s</span>
          </button>
        </div>
      </div>
    </div>
  );
}
