import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'Play / Pause' },
    { key: '→', desc: 'Seek Forward 5s' },
    { key: '←', desc: 'Seek Rewind 5s' },
    { key: '↑', desc: 'Volume Up (+5%)' },
    { key: '↓', desc: 'Volume Down (-5%)' },
    { key: 'N', desc: 'Next Track' },
    { key: 'P', desc: 'Previous Track' },
    { key: 'M', desc: 'Mute / Unmute' },
    { key: 'S', desc: 'Toggle Shuffle' },
    { key: 'R', desc: 'Cycle Repeat Mode' },
    { key: 'Esc', desc: 'Close dialog' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md glass-panel bg-slate-900/90 border border-white/15 rounded-2xl p-6 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-aura-500/20 text-aura-300">
              <Keyboard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Keyboard Shortcuts</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map(({ key, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/5"
            >
              <span className="text-xs text-slate-300">{desc}</span>
              <kbd className="px-2.5 py-1 text-xs font-mono font-semibold text-aura-300 bg-aura-950/80 border border-aura-500/30 rounded-lg shadow-sm">
                {key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-aura-600 hover:bg-aura-500 text-white font-medium text-xs rounded-xl transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
