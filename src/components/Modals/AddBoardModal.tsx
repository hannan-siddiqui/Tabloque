import React, { useState } from 'react';
import { X, Columns3, Palette } from 'lucide-react';

interface AddBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, color: string) => void;
}

const COLOR_CHOICES = [
  { id: 'indigo', label: 'Indigo', dot: 'bg-indigo-500' },
  { id: 'emerald', label: 'Emerald', dot: 'bg-emerald-500' },
  { id: 'purple', label: 'Purple', dot: 'bg-purple-500' },
  { id: 'amber', label: 'Amber', dot: 'bg-amber-500' },
  { id: 'rose', label: 'Rose', dot: 'bg-rose-500' },
  { id: 'sky', label: 'Sky Blue', dot: 'bg-sky-500' },
];

export const AddBoardModal: React.FC<AddBoardModalProps> = ({ isOpen, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [color, setColor] = useState('indigo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(title.trim(), color);
      setTitle('');
      setColor('indigo');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md rounded-3xl liquid-glass-modal p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl liquid-glass-pill text-emerald-400 flex items-center justify-center">
              <Columns3 className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Create New Board</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="text-slate-300 font-medium">Board Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Design Systems, Quick Links, Backlog"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-white placeholder-slate-400/70 outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-300 font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-slate-400" /> Accent Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLOR_CHOICES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`w-7 h-7 rounded-xl ${c.dot} transition-all flex items-center justify-center cursor-pointer ${
                    color === c.id ? 'ring-2 ring-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.5)]' : 'opacity-60 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl liquid-glass-pill text-slate-300 hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl font-semibold shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all cursor-pointer"
            >
              Create Board
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
