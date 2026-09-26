import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  FileText,
  Download,
  Eye,
  UploadCloud,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  X,
  Printer,
  Building2,
  Lock,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Check,
  ChevronDown,
  Sparkles,
  Award
} from 'lucide-react';
import { BankDocument } from '../../types/banking';
import { NorthernTrustLogo } from '../common/NorthernTrustLogo';
import { IrsLogo } from '../common/IrsLogo';
import { StatementTaxModal } from './StatementTaxModal';

export const DocumentsView: React.FC = () => {
  const { documents, uploadDocument, accounts, transactions, navigateTo } = useBanking();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewDoc, setPreviewDoc] = useState<BankDocument | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showOfficialModal, setShowOfficialModal] = useState(false);
  const [autoStartDownloadInModal, setAutoStartDownloadInModal] = useState(false);
  const [officialModalType, setOfficialModalType] = useState<'statement' | 'tax_1099_int' | 'tax_1099_b' | 'proof_of_funds'>('statement');
  const [selectedAccountIdForModal, setSelectedAccountIdForModal] = useState<string>(accounts[0]?.id || '');
  const [selectedPeriodForGenerator, setSelectedPeriodForGenerator] = useState<string>('curr_month');

  // Active account for quick generator
  const currentSelectedAccount = accounts.find(a => a.id === selectedAccountIdForModal) || accounts[0];

  const handleDownloadStatementClick = (accountId?: string) => {
    if (accountId) {
      setSelectedAccountIdForModal(accountId);
    }
    setOfficialModalType('statement');
    setAutoStartDownloadInModal(true);
    setShowOfficialModal(true);
  };

  const handleOpenStatementViewer = (accountId?: string) => {
    if (accountId) {
      setSelectedAccountIdForModal(accountId);
    }
    setOfficialModalType('statement');
    setAutoStartDownloadInModal(false);
    setShowOfficialModal(true);
  };

  const openDocumentViewer = (doc: BankDocument) => {
    const titleLower = doc.title.toLowerCase();
    if (titleLower.includes('1099-b')) {
      setOfficialModalType('tax_1099_b');
    } else if (titleLower.includes('1099') || titleLower.includes('tax')) {
      setOfficialModalType('tax_1099_int');
    } else if (titleLower.includes('custody') || titleLower.includes('proof') || titleLower.includes('verification') || titleLower.includes('audit')) {
      setOfficialModalType('proof_of_funds');
    } else {
      setOfficialModalType('statement');
    }
    setAutoStartDownloadInModal(false);
    setShowOfficialModal(true);
  };

  // Upload state
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'legal' | 'tax' | 'statement'>('legal');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const filteredDocs = activeCategory === 'all'
    ? documents
    : documents.filter((d) => (d.category || d.type) === activeCategory);

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle) return;

    uploadDocument({
      title: uploadTitle,
      category: uploadCategory,
      type: uploadCategory === 'legal' ? 'contract' : uploadCategory === 'tax' ? 'tax' : 'statement',
      date: new Date().toISOString().slice(0, 10),
      fileSize: '1.8 MB',
      downloadUrl: '#',
      accountNumber: 'NT-VAULT-DOC'
    });

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setUploadTitle('');
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header with Prominent Download Statement & Official Generation CTAs */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> IRS, FINMA &amp; FDIC Compliant Document Enclave
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Documents &amp; e-Statements
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Generate and download certified monthly statements, tax certifications, and bank reference reports.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigateTo('/tax')}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer border border-[#0B1F6A]"
          >
            <FileSpreadsheet className="w-4 h-4 stroke-[2.25]" />
            <span>Tax Documents &amp; History</span>
          </button>

          {/* PRIMARY DOWNLOAD STATEMENT BUTTON */}
          <button
            type="button"
            onClick={() => handleDownloadStatementClick(selectedAccountIdForModal)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-[#147A52] hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-emerald-500/30"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Statement</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenStatementViewer(selectedAccountIdForModal)}
            className="px-4 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <FileText className="w-4 h-4 stroke-[2.25]" />
            <span>View All Forms</span>
          </button>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] text-[#20242A] font-bold text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 stroke-[2.25]" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      {/* Interactive Account Statement Generator Card */}
      <div className="bg-gradient-to-br from-[#0B1F6A] to-[#101F7A] rounded-2xl p-5 sm:p-6 text-white shadow-lg border-2 border-[#0B1F6A]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-white/15 text-emerald-300 text-[11px] font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" /> DYNAMIC STATEMENT ENGINE
            </div>
            <h2 className="text-lg sm:text-xl font-black font-serif tracking-tight">
              Instant Account Statement &amp; Report Generator
            </h2>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              Select an account below to dynamically assemble an official, tamper-evident regulatory statement formatted for real bank printing and PDF archival.
            </p>
          </div>

          {/* Generator Controls */}
          <div className="bg-white/10 backdrop-blur-xs p-4 rounded-xl border border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-emerald-300 block">Select Account</label>
              <select
                value={selectedAccountIdForModal}
                onChange={(e) => setSelectedAccountIdForModal(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 rounded-lg bg-white text-[#20242A] font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (${acc.balance.toLocaleString('en-US', { maximumFractionDigits: 0 })})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono uppercase font-bold text-emerald-300 block">Statement Cycle</label>
              <select
                value={selectedPeriodForGenerator}
                onChange={(e) => setSelectedPeriodForGenerator(e.target.value)}
                className="w-full sm:w-44 px-3 py-2 rounded-lg bg-white text-[#20242A] font-bold text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 cursor-pointer"
              >
                <option value="curr_month">Current Month (Sep 2026)</option>
                <option value="prev_month">August 2026</option>
                <option value="q2_2026">Q2 2026 Summary</option>
                <option value="ytd_2026">Year-to-Date (2026)</option>
                <option value="year_2025">Full Year 2025</option>
              </select>
            </div>

            <div className="sm:self-end pt-1 flex gap-2">
              <button
                type="button"
                onClick={() => handleDownloadStatementClick(selectedAccountIdForModal)}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#0B1F6A] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Download formatted statement report PDF"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download Statement</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenStatementViewer(selectedAccountIdForModal)}
                className="px-3 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer border border-white/30"
                title="Preview & Print Statement"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Selected Account Summary Preview Bar */}
        {currentSelectedAccount && (
          <div className="mt-4 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-300 font-sans block">Selected Account:</span>
              <span className="font-bold text-white truncate block">{currentSelectedAccount.name}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 font-sans block">Account / ABA:</span>
              <span className="font-bold text-emerald-300">••••{currentSelectedAccount.accountNumber.slice(-4)} / {currentSelectedAccount.routingNumber}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 font-sans block">Cleared Available Balance:</span>
              <span className="font-black text-white">${currentSelectedAccount.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currentSelectedAccount.currency}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-300 font-sans block">Yield Tier / APY:</span>
              <span className="font-bold text-emerald-300">{currentSelectedAccount.interestRateAPY || 4.85}% APY Secured</span>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter Tabs with 3-Year Tax Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F5F7FA] p-1.5 rounded-xl border-2 border-[#D8DEE8] text-xs shadow-2xs">
          {[
            { id: 'all', label: 'All Files (3 Years)' },
            { id: 'tax', label: 'Tax Forms (2023–2025)' },
            { id: 'statement', label: 'e-Statements' },
            { id: 'legal', label: 'Legal & Custody' }
          ].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#147A52] text-white shadow-2xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Quick Tax Year Jumper */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border-2 border-[#D8DEE8] text-xs">
          <span className="text-[11px] font-bold text-[#5F6670] px-2">Tax Filings:</span>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('tax');
              openDocumentViewer({
                id: 'doc_2025_tax_01',
                title: '2025 Form 1099-INT: Sovereign Interest Income ($981,540.25)',
                type: 'tax',
                category: 'tax',
                date: '2026-01-31',
                fileSize: '1.5 MB PDF',
                period: 'Tax Year 2025',
                downloadUrl: '#tax-1099-int-2025',
                isEncrypted: true
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-black hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-300"
          >
            2025 1099-INT
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('tax');
              openDocumentViewer({
                id: 'doc_2024_tax_01',
                title: '2024 Form 1099-INT: Sovereign Interest Income ($894,220.10)',
                type: 'tax',
                category: 'tax',
                date: '2025-01-31',
                fileSize: '1.4 MB PDF',
                period: 'Tax Year 2024',
                downloadUrl: '#tax-1099-int-2024',
                isEncrypted: true
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0B1F6A] font-bold hover:bg-slate-200 transition-colors cursor-pointer border border-slate-300"
          >
            2024 1099-INT
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveCategory('tax');
              openDocumentViewer({
                id: 'doc_2023_tax_01',
                title: '2023 Form 1099-INT: Sovereign Interest Income ($742,880.50)',
                type: 'tax',
                category: 'tax',
                date: '2024-01-31',
                fileSize: '1.3 MB PDF',
                period: 'Tax Year 2023',
                downloadUrl: '#tax-1099-int-2023',
                isEncrypted: true
              });
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-100 text-[#0B1F6A] font-bold hover:bg-slate-200 transition-colors cursor-pointer border border-slate-300"
          >
            2023 1099-INT
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocs.map((doc) => {
          const isStatement = doc.category === 'statement' || doc.type === 'statement' || doc.title.toLowerCase().includes('statement');
          const isTaxDoc = doc.category === 'tax' || doc.type === 'tax' || doc.title.includes('1099') || doc.title.includes('K-1') || doc.title.includes('1042');
          return (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#147A52] transition-all"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {isTaxDoc ? (
                    <IrsLogo variant="mark" size="sm" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[#147A52] shadow-2xs">
                      <FileText className="w-5 h-5 stroke-[2.25]" />
                    </div>
                  )}
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-black bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300">
                    {isTaxDoc ? 'IRS e-FILE' : 'VERIFIED'}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-sm text-[#20242A] leading-snug">{doc.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#5F6670] mt-2 font-mono font-bold">
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span>{doc.fileSize}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-[#F5F7FA] flex items-center gap-2">
                {/* Download Statement Button on each card */}
                <button
                  type="button"
                  onClick={() => isStatement ? handleDownloadStatementClick(selectedAccountIdForModal) : openDocumentViewer(doc)}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-[#147A52] font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Download Formatted PDF Statement"
                >
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Download Statement</span>
                </button>

                <button
                  type="button"
                  onClick={() => openDocumentViewer(doc)}
                  className="p-2 rounded-xl bg-[#F5F7FA] hover:bg-slate-200 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#20242A] transition-all cursor-pointer shadow-2xs"
                  title="View Official Document"
                >
                  <Eye className="w-4 h-4 stroke-[2.25]" />
                </button>

                <button
                  type="button"
                  onClick={() => openDocumentViewer(doc)}
                  className="p-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#0B1F6A] transition-all cursor-pointer shadow-2xs"
                  title="Print or Export PDF"
                >
                  <Printer className="w-4 h-4 stroke-[2.25]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border-2 border-[#D8DEE8] p-6 sm:p-7 space-y-5 shadow-2xl text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <div className="flex items-center gap-3">
                <NorthernTrustLogo className="w-7 h-7 text-[#147A52]" color="#147A52" />
                <div>
                  <span className="font-black text-sm text-[#20242A] block">{previewDoc.title}</span>
                  <span className="text-[11px] text-[#5F6670] font-mono font-medium">Issued: {previewDoc.date}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            {/* Simulated Document Body */}
            <div className="p-6 bg-[#F5F7FA] rounded-xl border-2 border-[#D8DEE8] space-y-4 text-xs font-serif leading-relaxed text-[#20242A] shadow-2xs">
              <div className="flex justify-between items-center pb-3 border-b-2 border-[#F5F7FA] font-sans">
                <span className="font-black text-xs uppercase tracking-wider text-[#147A52]">NORTHERN TRUST COMPANY</span>
                <span className="text-[10px] font-mono font-bold text-[#5F6670]">CONFIDENTIAL CLIENT RECORD</span>
              </div>

              <p className="text-sm font-bold">
                Official Certification of Custody and Settlement Records
              </p>

              <p className="text-xs text-[#5F6670] font-medium">
                This certified statement confirms all active balances, cash inflows, and asset sweeps for the account holder under SEC Rule 206(4)-2 and FINMA Swiss Banking Directives.
              </p>

              <div className="p-3.5 bg-white rounded-lg border-2 border-[#D8DEE8] font-mono text-xs space-y-1.5 font-sans">
                <div className="flex justify-between"><span>Audit Checksum:</span><strong className="text-[#147A52] font-bold">SHA256-4921E908B</strong></div>
                <div className="flex justify-between"><span>Filing Status:</span><strong className="text-[#147A52] font-bold">CLEARED &amp; ARCHIVED</strong></div>
                <div className="flex justify-between"><span>Enclave Verification:</span><strong>AES-256-GCM Hardware Vault</strong></div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] hover:border-[#147A52] text-[#147A52] font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
              >
                <Printer className="w-4 h-4 stroke-[2.25]" />
                <span>Print Document</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all shadow-sm cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <span className="font-black text-sm text-[#147A52]">Upload Client Document / KYC Proof</span>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            {uploadSuccess ? (
              <div className="p-5 rounded-xl bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-center space-y-2.5">
                <CheckCircle2 className="w-9 h-9 mx-auto stroke-[2.25]" />
                <p className="font-black text-sm">Document Encrypted &amp; Uploaded</p>
                <p className="text-xs text-[#5F6670] font-medium">Transferred to compliance officer queue.</p>
              </div>
            ) : (
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Document Title / Description</label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="Document title or description"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Document Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  >
                    <option value="legal">Legal &amp; Trust Agreement</option>
                    <option value="tax">Tax Exemption / W-8BEN</option>
                    <option value="statement">External Bank Statement</option>
                  </select>
                </div>

                <div className="border-2 border-dashed border-[#D8DEE8] rounded-xl p-6 text-center space-y-2 bg-[#F5F7FA] hover:border-[#147A52] transition-all">
                  <UploadCloud className="w-9 h-9 mx-auto text-[#147A52] stroke-[2.25]" />
                  <p className="text-xs font-bold text-[#20242A]">Click to browse or drop file here</p>
                  <p className="text-[10px] text-[#5F6670] font-medium">PDF, JPG, PNG up to 25MB (Encrypted on transfer)</p>
                </div>

                <div className="pt-2 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all shadow-sm cursor-pointer"
                  >
                    Upload Document
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Official High-Fidelity Statement, IRS Tax Form & Proof of Funds Modal */}
      <StatementTaxModal
        isOpen={showOfficialModal}
        onClose={() => setShowOfficialModal(false)}
        initialType={officialModalType}
        initialAccountId={selectedAccountIdForModal}
        autoStartDownload={autoStartDownloadInModal}
      />
    </div>
  );
};
