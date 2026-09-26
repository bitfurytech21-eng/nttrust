import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Mail,
  Send,
  Plus,
  ShieldCheck,
  CheckCheck,
  Building2,
  Clock,
  User,
  X
} from 'lucide-react';
import { SecureMessage } from '../../types/banking';

export const MessagesView: React.FC = () => {
  const {
    messages,
    sendMessage,
    replyToMessage,
    markMessageRead
  } = useBanking();

  const [selectedMsgId, setSelectedMsgId] = useState<string>(messages[0]?.id || '');
  const [showCompose, setShowCompose] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState<string>('Account Inquiry');
  const [newBody, setNewBody] = useState('');

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || messages[0];

  const handleSelectMessage = (msg: SecureMessage) => {
    setSelectedMsgId(msg.id);
    if (!msg.isRead && !msg.unread) {
      markMessageRead(msg.id);
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedMsg) return;
    replyToMessage(selectedMsg.id, replyText);
    setReplyText('');
  };

  const handleComposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newBody.trim()) return;

    sendMessage({
      subject: newSubject,
      category: newCategory,
      body: newBody,
      priority: 'high'
    });

    setShowCompose(false);
    setNewSubject('');
    setNewBody('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> End-to-End Encrypted Advisory Line
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Secure Messages &amp; Wealth Concierge
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Communicate directly with your assigned private client manager and treasury team.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCompose(true)}
          className="px-5 py-2.5 rounded-xl bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.25]" />
          <span>Compose New Message</span>
        </button>
      </div>

      {/* Main Grid: Inbox / Threads (4 cols) & Message Viewer (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8">
        {/* Left List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#F5F7FA] border-b-2 border-[#F5F7FA] flex items-center justify-between">
              <span className="font-black text-xs text-[#20242A]">Conversations ({messages.length})</span>
              <span className="text-[10px] text-[#147A52] font-mono font-black uppercase">256-Bit SSL Enclave</span>
            </div>

            <div className="divide-y-2 divide-[#F5F7FA] max-h-[600px] overflow-y-auto">
              {messages.map((msg) => {
                const isSelected = selectedMsg?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => handleSelectMessage(msg)}
                    className={`p-4 cursor-pointer transition-all text-xs space-y-1.5 ${
                      isSelected
                        ? 'bg-[#147A52]/10 border-l-4 border-[#147A52]'
                        : 'hover:bg-[#F5F7FA]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-[#20242A] truncate">{msg.senderName}</span>
                      <span className="text-[10px] text-[#5F6670] font-mono font-bold">{msg.timestamp.slice(0, 10)}</span>
                    </div>

                    <div className="font-bold text-xs text-[#147A52] truncate">
                      {msg.subject}
                    </div>

                    <p className="text-xs text-[#5F6670] truncate font-medium">
                      {msg.preview}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Active Thread (8 cols) */}
        <div className="lg:col-span-8">
          {selectedMsg ? (
            <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] shadow-sm flex flex-col justify-between h-[600px] overflow-hidden">
              {/* Thread Header */}
              <div className="p-4 sm:p-5 bg-[#F5F7FA] border-b-2 border-[#F5F7FA] flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-sm text-[#20242A]">{selectedMsg.subject}</h3>
                  <div className="flex items-center gap-2.5 text-xs text-[#5F6670] mt-1 font-medium">
                    <span>Officer: <strong className="text-[#20242A] font-bold">{selectedMsg.senderName}</strong></span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-md bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300 text-[10px] font-black">
                      {selectedMsg.category}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-[#147A52]/10 text-[#147A52] border-2 border-emerald-300 font-black uppercase">
                  {selectedMsg.priority} PRIORITY
                </span>
              </div>

              {/* Chat Thread Messages */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs bg-[#fbfcfd]">
                {selectedMsg.thread?.map((item) => {
                  const isUser = item.senderRole === 'client';
                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#5F6670] font-medium">
                        <span>{item.senderName || (isUser ? 'You' : selectedMsg.senderName)}</span>
                        <span>•</span>
                        <span>{item.timestamp}</span>
                      </div>
                      <div className={`p-4 rounded-xl max-w-lg leading-relaxed shadow-2xs font-medium ${
                        isUser
                          ? 'bg-[#147A52] text-white font-semibold'
                          : 'bg-white text-[#20242A] border-2 border-[#D8DEE8]'
                      }`}>
                        {item.text || item.body}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Box */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t-2 border-[#F5F7FA] flex gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an encrypted reply to your private advisor..."
                  className="flex-1 px-4 py-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-5 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5 stroke-[2.25]" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>

      {/* Compose Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <span className="font-black text-sm text-[#147A52]">New Message to Wealth Advisor</span>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Subject line"
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                >
                  <option value="Account Inquiry">Account Inquiry</option>
                  <option value="Wire & Transfer">Wire &amp; Transfer</option>
                  <option value="Wealth Management">Wealth Management</option>
                  <option value="Card Services">Card Services</option>
                  <option value="Fraud & Security">Fraud &amp; Security</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Message Body</label>
                <textarea
                  required
                  rows={4}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Please provide specifics of your request..."
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium placeholder-[#5F6670] focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5 border-t-2 border-[#F5F7FA]">
                <button
                  type="button"
                  onClick={() => setShowCompose(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-[#101F7A] hover:bg-[#081552] text-white font-bold transition-all shadow-sm cursor-pointer"
                >
                  Transmit Secure Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
