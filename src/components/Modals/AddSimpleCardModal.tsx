import React, { useState } from 'react';
import { X, Layers } from 'lucide-react';
import { BOARD_COLORS, COLOR_OPTIONS } from '../../theme/boardColors';

interface AddSimpleCardModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onSave: (title: string, color: string) => void;
}

export const AddSimpleCardModal: React.FC<AddSimpleCardModalProps> = ({
  isOpen,
  title: modalTitle,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('emerald');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave(title.trim(), selectedColor);
    setTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-3xl liquid-glass-modal p-6 shadow-2xl z-10 animate-fade-in text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-[var(--theme-accent,#22c55e)]" />
            <h2 className="text-base font-bold text-white">{modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Card Title *</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="e.g. Work Logins, Quick Scratchpad"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Card Accent</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((cId) => {
                const c = BOARD_COLORS[cId];
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`w-6 h-6 rounded-full ${c.dot} transition-transform ${
                      selectedColor === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'opacity-60 hover:opacity-100'
                    }`}
                    title={c.label}
                  />
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[var(--theme-accent,#22c55e)] hover:brightness-110 shadow-lg shadow-[var(--theme-accent,rgba(34,197,94,0.4))] transition-all cursor-pointer"
            >
              Create Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
