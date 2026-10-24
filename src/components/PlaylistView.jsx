import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Heart, 
  Music, 
  ArrowUpDown, 
  Clock, 
  Disc,
  Play,
  Volume2,
  ListMusic,
  FolderOpen
} from 'lucide-react';
import { formatTime } from '../utils/audioMetadata';

export default function PlaylistView({
  playlist,
  currentIndex,
  isPlaying,
  onPlayTrack,
  onToggleFavorite,
  onRemoveTrack,
  onClearPlaylist,
  onOpenFolderPicker
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default'); // 'default', 'title', 'artist', 'duration', 'favorites'

  // Filter & Sort tracks
  const filteredTracks = useMemo(() => {
    let result = [...playlist];

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        t =>
          t.title.toLowerCase().includes(q) ||
          t.artist.toLowerCase().includes(q) ||
          t.album.toLowerCase().includes(q) ||
          t.fileName.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'artist') {
      result.sort((a, b) => a.artist.localeCompare(b.artist));
    } else if (sortBy === 'duration') {
      result.sort((a, b) => (b.duration || 0) - (a.duration || 0));
    } else if (sortBy === 'favorites') {
      result.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
    }

    return result;
  }, [playlist, searchQuery, sortBy]);

  // Calculate total playlist time
  const totalDuration = useMemo(() => {
    const totalSecs = playlist.reduce((acc, t) => acc + (t.duration || 0), 0);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  }, [playlist]);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-darkbg-surface/50 border-r border-white/5">
      {/* Top Header / Stats & Actions */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-aura-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Queue & Library</h2>
            <span className="text-xs bg-aura-900/60 text-aura-300 font-semibold px-2 py-0.5 rounded-full border border-aura-500/30">
              {playlist.length} {playlist.length === 1 ? 'track' : 'tracks'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {playlist.length > 0 && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                {totalDuration} total
              </span>
            )}
            {playlist.length > 0 && (
              <button
                onClick={onClearPlaylist}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                title="Clear playlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar & Sort Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, artist, album..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-aura-500/50 focus:ring-1 focus:ring-aura-500/50 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="relative shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-aura-500/50 cursor-pointer"
            >
              <option value="default" className="bg-darkbg-surface text-slate-200">Default</option>
              <option value="title" className="bg-darkbg-surface text-slate-200">Title</option>
              <option value="artist" className="bg-darkbg-surface text-slate-200">Artist</option>
              <option value="duration" className="bg-darkbg-surface text-slate-200">Duration</option>
              <option value="favorites" className="bg-darkbg-surface text-slate-200">Favorites</option>
            </select>
          </div>
        </div>
      </div>

      {/* Playlist Content List */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04] px-2 py-1">
        {filteredTracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center px-4">
            <Music className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium text-slate-400">
              {searchQuery ? 'No matching tracks found' : 'Playlist is empty'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {searchQuery ? 'Try another keyword' : 'Select a local folder of MP3s to get started'}
            </p>
            {!searchQuery && (
              <button
                onClick={onOpenFolderPicker}
                className="mt-3 flex items-center gap-1.5 text-xs text-aura-400 hover:text-aura-300 font-medium"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Choose Folder</span>
              </button>
            )}
          </div>
        ) : (
          filteredTracks.map((track) => {
            // Find original index in playlist for active state
            const origIndex = playlist.findIndex(t => t.id === track.id);
            const isCurrent = origIndex === currentIndex;

            return (
              <div
                key={track.id}
                onClick={() => onPlayTrack(origIndex)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                  isCurrent
                    ? 'bg-aura-600/20 border border-aura-500/30 text-white shadow-sm'
                    : 'hover:bg-white/[0.05] text-slate-300 border border-transparent'
                }`}
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  {/* Thumbnail / Animated Equalizer */}
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-white/10 bg-slate-800 flex items-center justify-center">
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${track.gradient} flex items-center justify-center`}>
                        <Disc className="w-5 h-5 text-white/50" />
                      </div>
                    )}

                    {/* Equalizer overlay when playing */}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-end justify-center gap-0.5 pb-2">
                        <span className={`w-1 bg-aura-400 rounded-full ${isPlaying ? 'animate-equalizer h-4' : 'h-2'}`} />
                        <span className={`w-1 bg-aura-400 rounded-full ${isPlaying ? 'animate-equalizer h-3 [animation-delay:0.2s]' : 'h-3'}`} />
                        <span className={`w-1 bg-aura-400 rounded-full ${isPlaying ? 'animate-equalizer h-5 [animation-delay:0.4s]' : 'h-1.5'}`} />
                      </div>
                    )}
                  </div>

                  {/* Text Details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-aura-300' : 'text-slate-200'}`}>
                        {track.title}
                      </p>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {track.artist} • <span className="opacity-75">{track.album}</span>
                    </p>
                  </div>
                </div>

                {/* Right: Duration & Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {formatTime(track.duration)}
                  </span>

                  {/* Favorite Toggle Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(track.id);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-rose-400 transition"
                    title={track.isFavorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        track.isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                    />
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveTrack(track.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 rounded-md transition"
                    title="Remove from queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
