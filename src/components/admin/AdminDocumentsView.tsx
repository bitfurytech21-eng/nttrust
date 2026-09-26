import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  FileCheck,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  X
} from 'lucide-react';
import { BankDocument } from '../../types/banking';

export const AdminDocumentsView: React.FC = () => {
  const { documents } = useBanking();
  const [search, setSearch] = useState('');
  const [statusMap, setStatusMap] = useState<Record<string, 'approved' | 'rejected'>>({});
  const [selectedDoc, setSelectedDoc] = useState<BankDocument | null>(null);

  const filtered = documents.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.category && d.category.toLowerCase().includes(search.toLowerCase())) ||
    (d.accountNumber && d.accountNumber.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSetStatus = (id: string, st: 'approved' | 'rejected') => {
    setStatusMap(prev => ({ ...prev, [id]: st }));
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-md border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-1">
            <FileCheck className="w-3.5 h-3.5" /> Identity Dossier &amp; KYC Verification Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            KYC &amp; Legal Document Queue
          </h1>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Review client passports, source of wealth certifications, and tax compliance declarations.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-md p-4 border border-[#D8DEE8] flex items-center gap-3 shadow-xs">
        <Search className="w-4 h-4 text-[#5F6670]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents by title, category, or reference..."
          className="w-full bg-transparent border-none text-[#20242A] text-xs placeholder-[#5F6670] focus:outline-none"
        />
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc) => {
          const status = statusMap[doc.id] || 'approved';
          return (
            <div
              key={doc.id}
              className="bg-white rounded-md p-5 border border-[#D8DEE8] flex flex-col justify-between space-y-4 shadow-xs"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#F5F7FA] border border-[#D8DEE8] text-[#5F6670]">
                    {doc.category || doc.type}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    status === 'approved'
                      ? 'bg-[#147A52]/10 text-[#147A52] border border-[#147A52]/20'
                      : 'bg-red-50 text-[#B42318] border border-red-200'
                  }`}>
                    {status}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#20242A]">{doc.title}</h3>
                <div className="flex items-center gap-3 text-xs text-[#5F6670] mt-2 font-mono">
                  <span>{doc.date}</span>
                  <span>•</span>
                  <span>{doc.fileSize}</span>
                </div>
                {doc.accountNumber && (
                  <div className="text-[11px] text-[#5F6670] font-mono mt-1">
                    Client: Angelina Jolie ({doc.accountNumber})
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#D8DEE8] flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="text-[#147A52] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect File
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSetStatus(doc.id, 'rejected')}
                    className="p-1.5 rounded text-[#5F6670] hover:text-[#B42318] hover:bg-red-50 border border-[#D8DEE8] transition-colors cursor-pointer"
                    title="Reject KYC Document"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetStatus(doc.id, 'approved')}
                    className="p-1.5 rounded text-[#5F6670] hover:text-[#147A52] hover:bg-[#081552]/10 border border-[#D8DEE8] transition-colors cursor-pointer"
                    title="Approve &amp; Certify Document"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspect Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded max-w-lg w-full border border-[#D8DEE8] p-6 space-y-4 shadow-xl text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8DEE8]">
              <div>
                <h3 className="font-bold text-sm text-[#20242A]">{selectedDoc.title}</h3>
                <p className="text-[11px] text-[#5F6670]">File Ref: {selectedDoc.id} • {selectedDoc.fileSize}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="text-[#5F6670] hover:text-[#20242A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-[#F5F7FA] rounded border border-[#D8DEE8] text-xs space-y-2">
              <div className="flex justify-between text-[#5F6670]">
                <span>Category:</span> <strong className="text-[#20242A]">{selectedDoc.category}</strong>
              </div>
              <div className="flex justify-between text-[#5F6670]">
                <span>Uploaded On:</span> <span className="font-mono text-[#20242A]">{selectedDoc.date}</span>
              </div>
              <div className="flex justify-between text-[#5F6670]">
                <span>Issuer / Jurisdiction:</span> <strong className="text-[#20242A]">Northern Trust Custody Compliance Desk</strong>
              </div>
              <div className="flex justify-between text-[#5F6670]">
                <span>Digital Watermark:</span> <span className="font-mono text-[#147A52]">SHA-256 Verified (0x8F94...3B10)</span>
              </div>
            </div>

            <p className="text-[#5F6670] leading-relaxed">
              This digital legal document is stored in high-resiliency sovereign cold-storage vaults with immutable append-only checksum integrity.
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDoc(null)}
                className="px-4 py-2 rounded bg-[#147A52] text-white font-semibold shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
