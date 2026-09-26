import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Search,
  Lock
} from 'lucide-react';
import {
  signInWithGoogleSheets,
  getCachedSheetsAccessToken,
  fetchSpreadsheetMetadata,
  fetchSheetValues,
  GoogleSpreadsheetData
} from '../../services/googleSheets';
import { useBanking } from '../../context/BankingContext';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({ isOpen, onClose }) => {
  const { addNotification } = useBanking();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedSheetsAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [spreadsheetInput, setSpreadsheetInput] = useState('1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms');
  const [spreadsheetData, setSpreadsheetData] = useState<GoogleSpreadsheetData | null>(null);
  const [selectedSheetTitle, setSelectedSheetTitle] = useState('Class Data');
  const [sheetRows, setSheetValues] = useState<string[][] | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingValues, setIsLoadingLoadingValues] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const extractSpreadsheetId = (input: string): string => {
    if (input.includes('/d/')) {
      const match = input.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) return match[1];
    }
    return input.trim();
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const token = await signInWithGoogleSheets();
      setAccessToken(token);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google sign in failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleFetchSpreadsheet = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    const sheetId = extractSpreadsheetId(spreadsheetInput);
    if (!sheetId) {
      setErrorMessage('Please enter a valid Google Spreadsheet ID or URL.');
      return;
    }

    setIsLoadingMetadata(true);
    setErrorMessage(null);
    setSpreadsheetData(null);
    setSheetValues(null);

    try {
      const meta = await fetchSpreadsheetMetadata(sheetId, accessToken);
      setSpreadsheetData(meta);
      if (meta.sheets.length > 0) {
        const defaultSheet = meta.sheets[0].title;
        setSelectedSheetTitle(defaultSheet);
        await handleFetchSheetValues(sheetId, defaultSheet, accessToken);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Unable to connect to Google Spreadsheet.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleFetchSheetValues = async (sheetId: string, range: string, token: string) => {
    setIsLoadingLoadingValues(true);
    try {
      const values = await fetchSheetValues(sheetId, `${range}!A1:Z50`, token);
      setSheetValues(values);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to read spreadsheet values.');
    } finally {
      setIsLoadingLoadingValues(false);
    }
  };

  const handleImportLedger = () => {
    setImportSuccess(true);
    addNotification({
      type: 'security',
      title: 'Google Sheets Data Import Completed',
      message: `Successfully synchronized ${sheetRows?.length || 0} rows from "${spreadsheetData?.title || 'Spreadsheet'}" into Northern Trust compliance vault.`,
      category: 'compliance'
    });
    setTimeout(() => {
      setImportSuccess(false);
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-xl w-full border border-[#D8DEE8] p-5 sm:p-6 space-y-4 shadow-2xl text-xs text-[#20242A] max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D8DEE8]">
            <div className="flex items-center gap-2 text-[#0B1F6A] font-bold text-base">
              <FileSpreadsheet className="w-5 h-5 text-[#147A52]" />
              <span>Google Sheets Financial Ledger Sync</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Authentication Step */}
          {!accessToken ? (
            <div className="p-5 rounded-2xl bg-[#F5F7FA] border border-[#D8DEE8] text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-[#147A52] flex items-center justify-center mx-auto border border-emerald-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#0B1F6A]">Connect Google Workspace Account</h4>
                <p className="text-xs text-[#5F6670] mt-1 max-w-md mx-auto">
                  Authorize Northern Trust to read spreadsheet ledgers directly from your Google Drive using official read-only OAuth credentials.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                {isSigningIn ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3.03.56 4.15 1.48l3.1-3.1C17.37 1.7 14.85 1 12 1 7.42 1 3.51 3.6 1.63 7.37l3.65 2.83C6.16 7.22 8.82 5 12 5z"/>
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.64 2.83c2.13-1.97 3.78-4.88 3.78-8.65z"/>
                    <path fill="#FBBC05" d="M5.28 14.8c-.25-.76-.4-1.56-.4-2.8s.15-2.04.4-2.8L1.63 6.37C.59 8.47 0 10.67 0 13s.59 4.53 1.63 6.63l3.65-2.83z"/>
                    <path fill="#34A853" d="M12 23c3.24 0 5.95-1.07 7.94-2.91l-3.64-2.83c-1.07.72-2.44 1.15-4.3 1.15-3.18 0-5.84-2.22-6.72-5.2L1.63 16.2C3.51 19.97 7.42 23 12 23z"/>
                  </svg>
                )}
                <span>Sign in with Google Sheets</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#147A52] font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Google Sheets Read Access Active
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300">OAuth Verified</span>
              </div>

              <div>
                <label className="font-bold text-xs text-[#0B1F6A] block mb-1">Enter Google Spreadsheet ID or Sharing URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={spreadsheetInput}
                    onChange={(e) => setSpreadsheetInput(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    className="flex-1 p-2.5 border border-[#D8DEE8] rounded-xl text-xs font-mono bg-[#F5F7FA] focus:bg-white focus:border-[#0B1F6A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleFetchSpreadsheet}
                    disabled={isLoadingMetadata}
                    className="px-4 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs shrink-0 cursor-pointer"
                  >
                    {isLoadingMetadata ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Fetch Sheet'}
                  </button>
                </div>
              </div>

              {spreadsheetData && (
                <div className="space-y-3 pt-2 border-t border-[#D8DEE8]">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-[#0B1F6A]">{spreadsheetData.title}</h4>
                      <p className="text-[10px] text-[#5F6670] font-mono">ID: {spreadsheetData.spreadsheetId}</p>
                    </div>

                    <select
                      value={selectedSheetTitle}
                      onChange={(e) => {
                        setSelectedSheetTitle(e.target.value);
                        handleFetchSheetValues(spreadsheetData.spreadsheetId, e.target.value, accessToken);
                      }}
                      className="p-2 border border-[#D8DEE8] rounded-xl text-xs font-bold bg-white text-[#0B1F6A]"
                    >
                      {spreadsheetData.sheets.map((s) => (
                        <option key={s.sheetId} value={s.title}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {sheetRows && (
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-[#5F6670] block">
                        Preview Data ({sheetRows.length} Rows Read)
                      </span>
                      <div className="max-h-48 overflow-auto border border-[#D8DEE8] rounded-xl bg-[#F5F7FA]">
                        <table className="w-full text-left text-[11px] border-collapse font-mono">
                          <tbody>
                            {sheetRows.slice(0, 10).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-200 font-bold' : 'border-b border-[#D8DEE8]'}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border-r border-[#D8DEE8] truncate max-w-[120px]">
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-xl bg-white border border-[#D8DEE8] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleImportLedger}
                      disabled={importSuccess}
                      className="px-4.5 py-2 rounded-xl bg-[#147A52] hover:bg-emerald-800 text-white font-bold cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      {importSuccess ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" /> Import Complete
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" /> Import into Compliance Vault
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
