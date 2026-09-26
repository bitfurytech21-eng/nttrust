import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  SendHorizontal,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Search,
  Clock,
  ArrowRight,
  Building2,
  FileText,
  X
} from 'lucide-react';
import { TransferRequest } from '../../types/banking';
import { ReceiptModal } from '../common/ReceiptModal';
import { InternalCommandTotpModal } from './InternalCommandTotpModal';

export const AdminTransfersView: React.FC = () => {
  const {
    transfers,
    approveTransfer,
    rejectTransfer
  } = useBanking();

  const [search, setSearch] = useState('');
  const [selectedTrfForReceipt, setSelectedTrfForReceipt] = useState<TransferRequest | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Internal Command TOTP state
  const [totpCommand, setTotpCommand] = useState<{
    name: string;
    description: string;
    action: () => void;
  } | null>(null);

  const filtered = transfers.filter((t) =>
    t.beneficiaryName.toLowerCase().includes(search.toLowerCase()) ||
    t.referenceId.toLowerCase().includes(search.toLowerCase()) ||
    t.fromAccountName.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingId && rejectReason) {
      const currentId = rejectingId;
      const currentReason = rejectReason;
      setRejectingId(null);
      setRejectReason('');

      setTotpCommand({
        name: `Reject & AML Flag Wire #${currentId}`,
        description: `Permanently reject transfer and file FinCEN Suspicious Activity report: ${currentReason}`,
        action: () => rejectTransfer(currentId, currentReason)
      });
    }
  };

  const handleTriggerApprove = (trf: TransferRequest) => {
    setTotpCommand({
      name: `Authorize Wire Settlement #${trf.referenceId}`,
      description: `Release high-value remittance of ${trf.sourceCurrency} ${trf.amount.toLocaleString()} to ${trf.beneficiaryName} via Fedwire / SWIFT.`,
      action: () => approveTransfer(trf.id, 'Officer clearance authorized via Google Authenticator')
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <SendHorizontal className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> High-Value Remittance Clearance Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#20242A] tracking-tight">
            Wire &amp; SWIFT Approval Queue
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Perform dual-officer AML validation on transactions exceeding standard private banking velocity thresholds.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-4 border-2 border-[#D8DEE8] flex items-center gap-3 shadow-sm">
        <Search className="w-4 h-4 text-[#5F6670] stroke-[2.25]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by beneficiary, reference ID, or source account..."
          className="w-full bg-transparent border-none text-[#20242A] text-xs font-medium placeholder-[#5F6670] focus:outline-none"
        />
      </div>

      {/* Transfers Grid */}
      <div className="space-y-4">
        {filtered.map((trf) => (
          <div
            key={trf.id}
            className={`bg-white rounded-2xl p-6 sm:p-7 border-2 transition-all shadow-sm ${
              trf.status === 'pending_review'
                ? 'border-[#147A52] ring-2 ring-[#147A52]/20'
                : 'border-[#D8DEE8]'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-black uppercase ${
                    trf.status === 'completed'
                      ? 'bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300'
                      : trf.status === 'pending_review'
                      ? 'bg-red-50 text-[#B42318] border-2 border-red-200'
                      : 'bg-red-50 text-[#B42318] border-2 border-red-200'
                  }`}>
                    {trf.status.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-mono text-[#147A52] font-black">
                    Ref: {trf.referenceId}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#F5F7FA] text-[#5F6670] border-2 border-[#D8DEE8] uppercase font-bold">
                    {trf.type.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-[#20242A]">{trf.beneficiaryName}</h3>
                <p className="text-xs text-[#5F6670] font-medium mt-1">
                  Debit Source: <strong className="text-[#20242A]">{trf.fromAccountName}</strong> • Purpose: {trf.purpose}
                </p>
              </div>

              <div className="lg:text-right">
                <span className="text-xs text-[#5F6670] block font-mono font-medium">Transfer Principal</span>
                <div className="text-2xl font-black text-[#20242A] font-mono">
                  ${trf.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {trf.sourceCurrency}
                </div>
                {trf.exchangeRate && trf.targetCurrency !== 'USD' && (
                  <span className="text-xs text-[#147A52] font-mono font-black">
                    = {trf.targetCurrency} {(trf.amount * trf.exchangeRate).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Details Box */}
            <div className="mt-4 pt-4 border-t-2 border-[#F5F7FA] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] shadow-2xs">
                <span className="text-[#5F6670] block text-[10px] font-mono uppercase font-bold">Beneficiary Routing / SWIFT</span>
                <span className="text-[#20242A] font-mono font-black mt-0.5 block">{trf.toRoutingOrBic || 'FEDWIRE_DOMESTIC'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] shadow-2xs">
                <span className="text-[#5F6670] block text-[10px] font-mono uppercase font-bold">Target Account / IBAN</span>
                <span className="text-[#147A52] font-mono font-black mt-0.5 block">{trf.toAccountNumber || 'INTERNAL_SWEEP'}</span>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] shadow-2xs">
                <span className="text-[#5F6670] block text-[10px] font-mono uppercase font-bold">AML Risk Assessment</span>
                <span className={`font-mono font-black text-xs mt-0.5 block ${
                  trf.riskScore === 'LOW' ? 'text-[#147A52]' : 'text-[#B42318]'
                }`}>
                  {trf.riskScore} RISK SCORE
                </span>
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-3 border-t-2 border-[#F5F7FA] flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-[#5F6670] text-xs font-mono font-medium">Initiated: {trf.createdAt}</span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTrfForReceipt(trf);
                    setIsReceiptOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border-2 border-[#D8DEE8] text-[#20242A] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 inline mr-1.5 text-[#5F6670] stroke-[2.25]" /> View SWIFT Receipt
                </button>

                {trf.status === 'pending_review' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setRejectingId(trf.id)}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-red-50 border-2 border-[#D8DEE8] hover:border-red-300 text-[#B42318] text-xs font-bold transition-all shadow-2xs cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.25]" /> Flag &amp; Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTriggerApprove(trf)}
                      className="px-5 py-2 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5 stroke-[2.25]" /> Authorize Wire
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 sm:p-7 space-y-4 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <h3 className="font-extrabold text-sm text-[#B42318] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 stroke-[2.25]" /> Reject Wire Transaction
              </h3>
              <button
                type="button"
                onClick={() => setRejectingId(null)}
                className="p-1 rounded-lg text-[#5F6670] hover:text-[#20242A] cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[2.25]" />
              </button>
            </div>
            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#20242A] mb-1.5 uppercase font-mono">Reason for AML Rejection</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Specify regulatory non-compliance, sanctions match, or fraud hold reason..."
                  className="w-full p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] text-[#20242A] text-xs font-medium focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border-2 border-[#D8DEE8] text-[#5F6670] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-[#B42318] hover:bg-[#B42318] text-white font-bold shadow-sm transition-all cursor-pointer"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SWIFT / FedWire Receipt Modal */}
      {selectedTrfForReceipt && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => {
            setIsReceiptOpen(false);
            setSelectedTrfForReceipt(null);
          }}
          transfer={selectedTrfForReceipt}
        />
      )}

      {/* Internal Bank Command Google Authenticator Modal */}
      {totpCommand && (
        <InternalCommandTotpModal
          isOpen={true}
          onClose={() => setTotpCommand(null)}
          commandName={totpCommand.name}
          commandDescription={totpCommand.description}
          onConfirm={totpCommand.action}
        />
      )}
    </div>
  );
};
