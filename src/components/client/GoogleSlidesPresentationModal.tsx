import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Presentation,
  CheckCircle2,
  AlertCircle,
  Download,
  X,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  FileText,
  Plus,
  FolderOpen,
  ArrowRight,
  PieChart,
  Building2,
  Check
} from 'lucide-react';
import {
  signInWithGoogleSlides,
  getCachedSlidesAccessToken,
  createWealthReportPresentation,
  listUserPresentations,
  DrivePresentationFile,
  WealthReportParams
} from '../../services/googleSlides';
import { useBanking } from '../../context/BankingContext';

interface GoogleSlidesPresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSlidesPresentationModal: React.FC<GoogleSlidesPresentationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, accounts, totalAvailableUSD, addNotification } = useBanking();

  const [accessToken, setAccessToken] = useState<string | null>(getCachedSlidesAccessToken());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'browse'>('create');

  // Deck Creation Form State
  const [deckTitle, setDeckTitle] = useState('Northern Trust - Executive Portfolio & Wealth Strategy Deck');
  const [selectedQuarter, setSelectedQuarter] = useState('Q3 2026 Strategic Review');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(accounts.map(a => a.id));
  const [isCreating, setIsCreating] = useState(false);
  const [createdDeckUrl, setCreatedDeckUrl] = useState<string | null>(null);

  // Browse State
  const [existingDecks, setExistingDecks] = useState<DrivePresentationFile[]>([]);
  const [isLoadingDecks, setIsLoadingDecks] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && accessToken) {
      handleLoadDecks();
    }
  }, [isOpen, accessToken]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    setErrorMessage(null);
    try {
      const token = await signInWithGoogleSlides();
      setAccessToken(token);
      handleLoadDecks(token);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google Sign-In failed');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLoadDecks = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken;
    if (!token) return;

    setIsLoadingDecks(true);
    setErrorMessage(null);
    try {
      const files = await listUserPresentations(token);
      setExistingDecks(files);
    } catch (err: any) {
      console.warn('Unable to load presentations from Google Drive:', err);
    } finally {
      setIsLoadingDecks(false);
    }
  };

  const toggleAccountSelection = (accId: string) => {
    setSelectedAccountIds(prev =>
      prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
    );
  };

  const handleCreatePresentation = async () => {
    if (!accessToken) {
      setErrorMessage('Please sign in with Google first.');
      return;
    }

    if (!deckTitle.trim()) {
      setErrorMessage('Please provide a presentation title.');
      return;
    }

    const selectedAccObjects = accounts.filter(a => selectedAccountIds.includes(a.id)).map(a => ({
      name: a.name,
      balance: `$${a.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      accountNumber: `••••${a.accountNumber.slice(-4)}`,
      type: a.type
    }));

    const confirmCreate = window.confirm(
      `Confirm Export to Google Slides?\n\nThis will create a new presentation titled "${deckTitle}" in your Google Drive account.`
    );

    if (!confirmCreate) return;

    setIsCreating(true);
    setErrorMessage(null);
    setCreatedDeckUrl(null);

    try {
      const result = await createWealthReportPresentation({
        title: deckTitle,
        clientName: currentUser?.fullName || 'Northern Trust Client',
        totalPortfolioValue: `$${totalAvailableUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`,
        quarter: selectedQuarter,
        accounts: selectedAccObjects,
      }, accessToken);

      setCreatedDeckUrl(result.webViewLink);

      addNotification({
        type: 'security',
        title: 'Google Slides Deck Generated',
        message: `Successfully created "${result.title}" presentation in your Google Drive.`,
        category: 'system'
      });

      // Refresh deck list
      handleLoadDecks();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to create Google Slides presentation.');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl max-w-2xl w-full border-2 border-[#D8DEE8] p-5 sm:p-6 space-y-4 shadow-2xl text-xs text-[#20242A] max-h-[92vh] overflow-y-auto animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
            <div className="flex items-center gap-2.5 text-[#0B1F6A]">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border-2 border-amber-300 text-amber-700 flex items-center justify-center shadow-2xs">
                <Presentation className="w-5 h-5 stroke-[2.25]" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#20242A] leading-none">
                  Google Slides Wealth Presentation Generator
                </h3>
                <span className="text-[11px] text-[#5F6670] font-medium mt-0.5 block">
                  Export certified portfolio presentations &amp; client decks directly to Google Slides
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Authentication Card if not signed in */}
          {!accessToken ? (
            <div className="p-6 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-4 shadow-2xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto border-2 border-amber-200 shadow-2xs">
                <Presentation className="w-6 h-6 stroke-[2.25]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-[#0B1F6A]">Connect Google Workspace for Slides Integration</h4>
                <p className="text-xs text-[#5F6670] max-w-md mx-auto leading-relaxed">
                  Authorize Northern Trust to generate and update presentation decks directly inside your Google Drive using official Google Slides API permissions.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold text-xs inline-flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer border border-[#0B1F6A]"
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
                <span>Sign in with Google Slides</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected Badge & Navigation Tabs */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] font-extrabold text-xs">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.25]" /> Google Slides OAuth Active
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                  presentations.readonly &amp; drive.file
                </span>
              </div>

              <div className="flex items-center gap-2 border-b-2 border-[#F5F7FA] pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'create'
                      ? 'bg-[#0B1F6A] text-white shadow-xs'
                      : 'bg-slate-100 text-[#5F6670] hover:bg-slate-200'
                  }`}
                >
                  <Plus className="w-4 h-4 stroke-[2.25]" />
                  <span>Generate New Deck</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('browse');
                    handleLoadDecks();
                  }}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'browse'
                      ? 'bg-[#0B1F6A] text-white shadow-xs'
                      : 'bg-slate-100 text-[#5F6670] hover:bg-slate-200'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 stroke-[2.25]" />
                  <span>Existing Google Drive Decks ({existingDecks.length})</span>
                </button>
              </div>

              {/* TAB 1: CREATE DECK */}
              {activeTab === 'create' && (
                <div className="space-y-4">
                  <div className="space-y-3 p-4 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8]">
                    <div>
                      <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                        Presentation Title
                      </label>
                      <input
                        type="text"
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-semibold bg-white focus:border-[#0B1F6A] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                          Reporting Period
                        </label>
                        <select
                          value={selectedQuarter}
                          onChange={(e) => setSelectedQuarter(e.target.value)}
                          className="w-full p-2.5 border-2 border-[#D8DEE8] rounded-xl text-xs font-bold bg-white focus:border-[#0B1F6A] focus:outline-none"
                        >
                          <option value="Q3 2026 Strategic Review">Q3 2026 Strategic Review</option>
                          <option value="Q2 2026 Performance Deck">Q2 2026 Performance Deck</option>
                          <option value="2026 Year-to-Date Wealth Overview">2026 Year-to-Date Wealth Overview</option>
                          <option value="Annual Custody & Liquidity Brief">Annual Custody &amp; Liquidity Brief</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-black text-xs text-[#0B1F6A] block mb-1">
                          Target Client
                        </label>
                        <div className="p-2.5 bg-slate-100 border-2 border-[#D8DEE8] rounded-xl text-xs font-bold text-[#20242A]">
                          {currentUser?.fullName || 'Sovereign Client'}
                        </div>
                      </div>
                    </div>

                    {/* Account Selector */}
                    <div>
                      <label className="font-black text-xs text-[#0B1F6A] block mb-1.5">
                        Include Accounts in Deck:
                      </label>
                      <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                        {accounts.map((acc) => {
                          const isSelected = selectedAccountIds.includes(acc.id);
                          return (
                            <div
                              key={acc.id}
                              onClick={() => toggleAccountSelection(acc.id)}
                              className={`p-2.5 rounded-xl border-2 cursor-pointer flex items-center justify-between text-xs transition-all ${
                                isSelected
                                  ? 'bg-emerald-50/80 border-emerald-400 text-[#147A52]'
                                  : 'bg-white border-[#D8DEE8] text-[#5F6670] hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected ? 'bg-[#147A52] border-[#147A52] text-white' : 'border-slate-300'
                                }`}>
                                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                                </div>
                                <span className="font-extrabold text-[#20242A]">{acc.name}</span>
                                <span className="font-mono text-[11px] text-[#5F6670]">••••{acc.accountNumber.slice(-4)}</span>
                              </div>
                              <span className="font-black font-mono text-[#0B1F6A]">
                                ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Created Success Banner */}
                  {createdDeckUrl && (
                    <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] space-y-3 animate-fade-in shadow-2xs">
                      <div className="flex items-center gap-2 font-black text-sm">
                        <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                        <span>Presentation Successfully Exported to Google Drive!</span>
                      </div>
                      <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
                        Your deck has been generated. Click below to open and present directly inside Google Slides.
                      </p>
                      <a
                        href={createdDeckUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#147A52] hover:bg-emerald-800 text-white font-black text-xs shadow-md transition-all"
                      >
                        <span>Open Presentation in Google Slides</span>
                        <ExternalLink className="w-4 h-4 stroke-[2.25]" />
                      </a>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] hover:bg-slate-50 text-[#20242A] font-bold text-xs cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreatePresentation}
                      disabled={isCreating}
                      className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer border border-[#0B1F6A]"
                    >
                      {isCreating ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Generating Deck...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-300" />
                          <span>Export Deck to Google Slides</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: BROWSE EXISTING DECKS */}
              {activeTab === 'browse' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#0B1F6A]">Google Slides Presentations in Your Drive</span>
                    <button
                      type="button"
                      onClick={() => handleLoadDecks()}
                      disabled={isLoadingDecks}
                      className="text-[11px] text-[#147A52] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDecks ? 'animate-spin' : ''}`} />
                      <span>Refresh</span>
                    </button>
                  </div>

                  {isLoadingDecks ? (
                    <div className="p-8 text-center text-[#5F6670] space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0B1F6A]" />
                      <p className="text-xs font-bold">Scanning Google Drive for Slides presentations...</p>
                    </div>
                  ) : existingDecks.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-center space-y-2">
                      <Presentation className="w-8 h-8 text-[#5F6670] mx-auto" />
                      <p className="font-bold text-xs text-[#20242A]">No Google Slides presentations found</p>
                      <p className="text-[11px] text-[#5F6670]">
                        Click "Generate New Deck" above to create your first presentation directly into Google Drive!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {existingDecks.map((deck) => (
                        <div
                          key={deck.id}
                          className="p-3.5 rounded-xl border-2 border-[#D8DEE8] bg-white hover:border-[#0B1F6A] flex items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                              <Presentation className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-extrabold text-xs text-[#20242A] line-clamp-1">{deck.name}</h5>
                              <p className="text-[10px] text-[#5F6670] font-mono mt-0.5">
                                ID: {deck.id} {deck.modifiedTime ? `• Updated ${new Date(deck.modifiedTime).toLocaleDateString()}` : ''}
                              </p>
                            </div>
                          </div>

                          <a
                            href={deck.webViewLink || `https://docs.google.com/presentation/d/${deck.id}/edit`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-lg bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-[11px] inline-flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                          >
                            <span>Open</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
