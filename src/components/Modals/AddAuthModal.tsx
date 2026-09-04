import React, { useState, useEffect } from 'react';
import { X, KeyRound, Eye, EyeOff, Sparkles } from 'lucide-react';
import { AuthBoard, AuthItem } from '../../types';

interface AddAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  boards: Record<string, AuthBoard>;
  targetBoardId: string | null;
  itemToEdit?: AuthItem | null;
  onSave: (boardId: string, itemData: Omit<AuthItem, 'id' | 'createdAt'>) => void;
  onUpdate?: (itemId: string, updates: Partial<AuthItem>) => void;
}

export const AddAuthModal: React.FC<AddAuthModalProps> = ({
  isOpen,
  onClose,
  boards,
  targetBoardId,
  itemToEdit,
  onSave,
  onUpdate,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setUrl(itemToEdit.url);
      setUserId(itemToEdit.userId);
      setPassword(itemToEdit.password || '');
      setNotes(itemToEdit.notes || '');
    } else {
      setTitle('');
      setUrl('');
      setUserId('');
      setPassword('');
      setNotes('');
    }

    if (targetBoardId && boards[targetBoardId]) {
      setSelectedBoardId(targetBoardId);
    } else {
      const firstBoard = Object.keys(boards)[0];
      setSelectedBoardId(firstBoard || '');
    }
  }, [isOpen, itemToEdit, targetBoardId, boards]);

  if (!isOpen) return null;

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(res);
    setShowPassword(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !userId.trim()) return;

    if (itemToEdit && onUpdate) {
      onUpdate(itemToEdit.id, {
        title: title.trim(),
        url: url.trim(),
        userId: userId.trim(),
        password: password.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } else if (selectedBoardId) {
      onSave(selectedBoardId, {
        title: title.trim(),
        url: url.trim(),
        userId: userId.trim(),
        password: password.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-md rounded-3xl liquid-glass-modal p-6 shadow-2xl z-10 animate-fade-in text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[var(--theme-accent,#22c55e)]" />
            <h2 className="text-base font-bold text-white">
              {itemToEdit ? 'Edit Auth Credential' : 'Add Auth Credential'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!itemToEdit && Object.keys(boards).length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Card</label>
              <select
                value={selectedBoardId}
                onChange={(e) => setSelectedBoardId(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl liquid-glass text-slate-200 outline-none border border-white/15"
              >
                {Object.values(boards).map((b) => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Service / Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. GitHub, AWS Console, Vercel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Website Login URL</label>
            <input
              type="text"
              placeholder="https://example.com/login"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">User ID / Username / Email *</label>
            <input
              type="text"
              required
              placeholder="e.g. admin@company.com or username"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <button
                type="button"
                onClick={generatePassword}
                className="flex items-center gap-1 text-[11px] font-semibold text-[var(--theme-accent,#22c55e)] hover:underline cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Generate</span>
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs pl-3.5 pr-10 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Notes (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 2FA backup code or team name"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl liquid-glass text-white placeholder-slate-500 outline-none border border-white/15 focus:border-[var(--theme-accent,#22c55e)]"
            />
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
              {itemToEdit ? 'Save Changes' : 'Add Credential'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
