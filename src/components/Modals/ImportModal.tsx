import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Folder, Link2 } from 'lucide-react';
import { parseChromeBookmarksHtml, ParsedBookmarkGroup } from '../../services/bookmark-importer';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (groups: ParsedBookmarkGroup[], mode: 'single' | 'folders') => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [parsedGroups, setParsedGroups] = useState<ParsedBookmarkGroup[] | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [importMode, setImportMode] = useState<'single' | 'folders'>('folders');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const groups = parseChromeBookmarksHtml(text);
        if (groups.length === 0) {
          setError('No valid bookmarks found in this HTML file.');
          setParsedGroups(null);
        } else {
          setParsedGroups(groups);
        }
      } catch (err) {
        setError('Failed to parse bookmarks file. Please ensure it is a valid Chrome bookmark export.');
        setParsedGroups(null);
      }
    };
    reader.onerror = () => {
      setError('Could not read the selected file.');
    };
    reader.readAsText(file);
  };

  const totalBookmarks = parsedGroups
    ? parsedGroups.reduce((acc, g) => acc + g.bookmarks.length, 0)
    : 0;

  const handleConfirm = () => {
    if (parsedGroups && parsedGroups.length > 0) {
      onImport(parsedGroups, importMode);
      onClose();
      // Reset
      setParsedGroups(null);
      setFileName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl liquid-glass-modal p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl liquid-glass-pill text-emerald-400 flex items-center justify-center">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Chrome Bookmarks</h3>
              <p className="text-xs text-slate-400">Import HTML exported from Chrome Bookmark Manager</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload Zone */}
        {!parsedGroups ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/20 hover:border-emerald-400 rounded-2xl p-8 text-center cursor-pointer transition-all bg-white/[0.03] hover:bg-white/[0.07] flex flex-col items-center justify-center gap-3 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".html,.htm"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl liquid-glass-pill text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">Click to upload or drag bookmark file</p>
              <p className="text-xs text-slate-400 mt-1">
                Chrome → Bookmark Manager (Ctrl+Shift+O) → Three dots → Export bookmarks
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary card */}
            <div className="rounded-2xl liquid-glass p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  {fileName}
                </span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ready
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Folder className="w-3.5 h-3.5 text-amber-400" />
                  <span>{parsedGroups.length} Folders</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{totalBookmarks} Bookmarks</span>
                </div>
              </div>
            </div>

            {/* Import Mode Options */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">How would you like to import?</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setImportMode('folders')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    importMode === 'folders'
                      ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                      : 'border-white/10 liquid-glass-pill text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-semibold text-slate-200">Board per Folder</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Maintains your folder structure as boards</p>
                </button>

                <button
                  type="button"
                  onClick={() => setImportMode('single')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    importMode === 'single'
                      ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(34,197,94,0.25)]'
                      : 'border-white/10 liquid-glass-pill text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <p className="font-semibold text-slate-200">Single Board</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Places all links in one "Imported" board</p>
                </button>
              </div>
            </div>

            {/* Sample preview list */}
            <div className="max-h-36 overflow-y-auto custom-scrollbar rounded-xl liquid-glass p-2 text-xs space-y-1">
              {parsedGroups.slice(0, 3).map((g, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-white/[0.04] border border-white/5">
                  <span className="font-semibold text-slate-300">{g.folderName}:</span>{' '}
                  <span className="text-slate-400">{g.bookmarks.length} links</span>
                </div>
              ))}
              {parsedGroups.length > 3 && (
                <p className="text-[11px] text-slate-400 text-center pt-1">
                  + {parsedGroups.length - 3} more folders
                </p>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/15 border border-rose-500/30 p-2.5 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold liquid-glass-pill text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          {parsedGroups && (
            <button
              onClick={handleConfirm}
              className="px-4.5 py-2 rounded-xl text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(34,197,94,0.35)] transition-all cursor-pointer"
            >
              Import {totalBookmarks} Bookmarks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
