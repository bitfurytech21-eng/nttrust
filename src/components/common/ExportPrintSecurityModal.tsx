import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, ShieldAlert, X, Lock, Printer, Download, FileSpreadsheet } from 'lucide-react';

interface ExportPrintSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthorized: () => void;
  actionTitle?: string;
  actionType?: 'export' | 'print' | 'download';
}

export const ExportPrintSecurityModal: React.FC<ExportPrintSecurityModalProps> = ({
  isOpen,
  onClose,
  onAuthorized,
  actionTitle = 'Sensitive Data Export / Print',
  actionType = 'export'
}) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError('Please enter your 4-digit security PIN.');
      return;
    }

    if (passcode.length >= 4) {
      setError('');
      setPasscode('');
      onAuthorized();
      onClose();
    } else {
      setError('Invalid security passcode. Please enter a valid 4-digit PIN.');
    }
  };

  const getHeaderIcon = () => {
    if (actionType === 'print') return <Printer className="w-4 h-4" />;
    if (actionType === 'download') return <Download className="w-4 h-4" />;
    return <FileSpreadsheet className="w-4 h-4" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-security-title"
      aria-describedby="export-security-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in text-xs"
    >
      <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0B1F6A] text-white flex items-center justify-center">
              {getHeaderIcon()}
            </div>
            <div>
              <h2 id="export-security-title" className="font-bold text-sm text-[#0B1F6A]">
                Security Authorization Required
              </h2>
              <p className="text-[10px] text-[#5F6670] font-medium">Card Protection Protocol Enforced</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close security authorization dialog"
            className="p-2 rounded-lg text-[#5F6670] hover:text-[#20242A] hover:bg-slate-100 transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-slate-50 border border-[#D8DEE8] rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-[#147A52] shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-[#0B1F6A] text-xs">{actionTitle}</p>
            <p id="export-security-desc" className="text-[11px] text-[#5F6670] leading-relaxed mt-0.5">
              To protect confidential financial information, enter your 4-digit security PIN before executing this export or print command.
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="export-verify-passcode" className="font-bold text-[#20242A] block mb-1">
              4-Digit Security PIN / Passcode <span className="text-rose-600" aria-hidden="true">*</span>
            </label>
            <input
              ref={inputRef}
              id="export-verify-passcode"
              type="password"
              maxLength={4}
              required
              aria-required="true"
              aria-invalid={!!error}
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value.replace(/\D/g, ''));
                if (error) setError('');
              }}
              placeholder="••••"
              className="w-full text-center text-2xl tracking-[0.5em] font-mono font-bold p-3 rounded-xl bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] focus:bg-white focus:outline-none focus:border-[#0B1F6A] focus-visible:ring-2 focus-visible:ring-[#0B1F6A] transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#20242A] font-bold min-h-[44px] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={passcode.length < 4}
              className="px-5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold disabled:opacity-50 min-h-[44px] cursor-pointer shadow-sm focus-visible:ring-2 focus-visible:ring-[#0B1F6A] focus-visible:outline-hidden flex items-center gap-1.5"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Authorize &amp; Proceed</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
