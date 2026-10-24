import React, { useRef } from 'react';
import { 
  FolderPlus, 
  FileAudio, 
  Sparkles, 
  Keyboard, 
  Disc3,
  HelpCircle
} from 'lucide-react';

export default function Navbar({
  onSelectFolder,
  onSelectFiles,
  onLoadDemoTracks,
  playlistCount,
  onOpenShortcuts,
  isLoadingFiles,
  loadingStatus
}) {
  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFolderChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFolder(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onSelectFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  return (
    <header className="w-full glass-panel border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between z-30 shrink-0">
      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-aura-600 via-aura-500 to-indigo-500 shadow-lg shadow-aura-500/25 ring-1 ring-white/20">
          <Disc3 className="w-5 h-5 text-white animate-spin-slow" />
          <div className="absolute inset-0 rounded-xl bg-white/20 blur-sm pointer-events-none" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-aura-300 bg-clip-text text-transparent">
              AuraBeat
            </h1>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold tracking-wider text-aura-300 uppercase bg-aura-950/80 border border-aura-500/30 rounded-md">
              MVP
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block">Local Audio Studio & Player</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Hidden File Inputs */}
        <input
          ref={folderInputRef}
          type="file"
          webkitdirectory="true"
          directory="true"
          multiple
          className="hidden"
          onChange={handleFolderChange}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.ogg,.flac,.m4a,.aac,.opus,.weba"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Loading Indicator */}
        {isLoadingFiles && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-aura-300 bg-aura-950/60 border border-aura-500/30 px-3 py-1.5 rounded-lg animate-pulse">
            <span className="w-2 h-2 rounded-full bg-aura-400 animate-ping" />
            <span>{loadingStatus || 'Processing audio files...'}</span>
          </div>
        )}

        {/* Load Demo Tracks Button */}
        <button
          onClick={onLoadDemoTracks}
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-xl transition duration-150 active:scale-95"
          title="Try with sample tracks"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Demo Tracks</span>
        </button>

        {/* Add Files Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 px-3 py-2 rounded-xl transition duration-150 active:scale-95"
          title="Select individual audio files"
        >
          <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden md:inline">Add Files</span>
          <span className="md:hidden">Files</span>
        </button>

        {/* Select Folder Primary Button */}
        <button
          onClick={() => folderInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-gradient-to-r from-aura-600 to-indigo-600 hover:from-aura-500 hover:to-indigo-500 shadow-md shadow-aura-700/25 border border-white/20 px-3.5 py-2 rounded-xl transition duration-150 active:scale-95"
          title="Choose a folder of MP3s from your local device"
        >
          <FolderPlus className="w-4 h-4 text-white" />
          <span>Select Folder</span>
        </button>

        {/* Keyboard Shortcuts Helper */}
        <button
          onClick={onOpenShortcuts}
          className="p-2 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition"
          title="Keyboard shortcuts"
          aria-label="Keyboard Shortcuts"
        >
          <Keyboard className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
