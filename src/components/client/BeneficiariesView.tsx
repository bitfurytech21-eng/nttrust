import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Building2,
  SendHorizontal,
  Globe2,
  ShieldCheck,
  Search,
  ArrowRight,
  X
} from 'lucide-react';
import { Beneficiary } from '../../types/banking';

export const BeneficiariesView: React.FC = () => {
  const {
    beneficiaries,
    addBeneficiary,
    deleteBeneficiary,
    updateBeneficiary,
    navigateTo
  } = useBanking();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBen, setEditingBen] = useState<Beneficiary | null>(null);

  // Form State
  const [nickname, setNickname] = useState('');
  const [fullName, setFullName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [routingOrSwift, setRoutingOrSwift] = useState('');
  const [country, setCountry] = useState('United States');
  const [currency, setCurrency] = useState('USD');
  const [type, setType] = useState<'domestic' | 'international'>('domestic');

  const filteredBeneficiaries = beneficiaries.filter(
    (b) =>
      b.fullName.toLowerCase().includes(search.toLowerCase()) ||
      b.nickname.toLowerCase().includes(search.toLowerCase()) ||
      b.bankName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !accountNumber || !routingOrSwift) return;

    if (editingBen) {
      updateBeneficiary(editingBen.id, {
        nickname: nickname || fullName,
        fullName,
        bankName,
        accountNumber,
        routingOrSwift,
        country,
        currency,
        type
      });
      setEditingBen(null);
    } else {
      addBeneficiary({
        nickname: nickname || fullName,
        fullName,
        bankName,
        accountNumber,
        routingOrSwift,
        country,
        currency,
        type
      });
      setShowAddModal(false);
    }

    // Reset Form
    setNickname('');
    setFullName('');
    setBankName('');
    setAccountNumber('');
    setRoutingOrSwift('');
  };

  const openEdit = (b: Beneficiary) => {
    setEditingBen(b);
    setNickname(b.nickname);
    setFullName(b.fullName);
    setBankName(b.bankName);
    setAccountNumber(b.accountNumber);
    setRoutingOrSwift(b.routingOrSwift);
    setCountry(b.country);
    setCurrency(b.currency);
    setType(b.type);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> Verified Counterparty Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Saved Beneficiaries &amp; Payees
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Manage pre-cleared institutional wiring instructions, SWIFT routing, and domestic accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingBen(null);
            setNickname('');
            setFullName('');
            setBankName('');
            setAccountNumber('');
            setRoutingOrSwift('');
            setShowAddModal(true);
          }}
          className="px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.25]" />
          <span>Add New Beneficiary</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-4 sm:p-5 shadow-sm">
        <div className="relative">
          <Search className="w-4 h-4 text-[#5F6670] stroke-[2.25] absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search beneficiaries by name, bank, or nickname..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Beneficiaries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBeneficiaries.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#147A52] transition-all"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-300 flex items-center justify-center text-[#147A52] font-black text-sm shadow-2xs">
                    {b.nickname.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#20242A] leading-snug">{b.nickname}</h3>
                    <span className="text-xs text-[#5F6670] font-medium block">{b.fullName}</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-black border-2 ${
                  b.type === 'international'
                    ? 'bg-purple-50 text-purple-700 border-purple-300'
                    : 'bg-[#147A52]/10 text-[#147A52] border-emerald-300'
                }`}>
                  {b.type.toUpperCase()}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] space-y-2 text-xs shadow-2xs">
                <div className="flex justify-between">
                  <span className="text-[#5F6670] font-medium">Bank:</span>
                  <strong className="text-[#20242A] font-bold">{b.bankName}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#5F6670] font-medium">Account:</span>
                  <strong className="text-[#20242A] font-bold">{b.accountNumber}</strong>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#5F6670] font-medium">Routing / SWIFT:</span>
                  <strong className="text-[#147A52] font-black">{b.routingOrSwift}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#5F6670] font-medium">Country &amp; Currency:</span>
                  <span className="text-[#20242A] font-bold">{b.country} ({b.currency})</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t-2 border-[#F5F7FA] flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openEdit(b)}
                  className="p-2 rounded-lg border-2 border-transparent hover:border-[#D8DEE8] hover:bg-slate-100 text-[#5F6670] hover:text-[#20242A] transition-all cursor-pointer"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4 stroke-[2.25]" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteBeneficiary(b.id)}
                  className="p-2 rounded-lg border-2 border-transparent hover:border-red-200 hover:bg-red-50 text-[#5F6670] hover:text-[#B42318] transition-all cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 stroke-[2.25]" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => navigateTo('/transfers')}
                className="px-4 py-2 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Send Funds</span>
                <ArrowRight className="w-4 h-4 stroke-[2.25]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Beneficiary Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <span className="font-black text-sm text-[#147A52]">
                {editingBen ? 'Edit Beneficiary Record' : 'Register New Beneficiary'}
              </span>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Beneficiary Nickname / Label</label>
                <input
                  type="text"
                  required
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="Beneficiary nickname"
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Full Legal Entity / Individual Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Legal beneficiary entity name"
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Depository institution name"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Transfer Channel Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  >
                    <option value="domestic">Domestic (FedWire / ACH)</option>
                    <option value="international">International (SWIFT / SEPA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Account / IBAN Number</label>
                  <input
                    type="text"
                    required
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Account or IBAN number"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Routing ABA or SWIFT/BIC</label>
                  <input
                    type="text"
                    required
                    value={routingOrSwift}
                    onChange={(e) => setRoutingOrSwift(e.target.value)}
                    placeholder="ABA routing number or SWIFT/BIC"
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-bold uppercase focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                </div>
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1.5">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="CHF">CHF</option>
                    <option value="CAD">CAD</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t-2 border-[#F5F7FA]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingBen ? 'Update Record' : 'Save Beneficiary'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
