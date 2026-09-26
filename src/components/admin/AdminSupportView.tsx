import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  LifeBuoy,
  Mail,
  Send,
  User,
  ShieldCheck
} from 'lucide-react';
import { SecureMessage } from '../../types/banking';

export const AdminSupportView: React.FC = () => {
  const { messages, replyToMessage, markMessageRead } = useBanking();
  const [selectedMsgId, setSelectedMsgId] = useState<string>(messages[0]?.id || '');
  const [replyBody, setReplyBody] = useState('');
  const [search, setSearch] = useState('');

  const selectedMsg = messages.find((m) => m.id === selectedMsgId) || messages[0];

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim() || !selectedMsg) return;
    replyToMessage(selectedMsg.id, replyBody);
    setReplyBody('');
  };

  const filtered = messages.filter((m) =>
    m.subject.toLowerCase().includes(search.toLowerCase()) ||
    m.senderName.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-md border border-[#D8DEE8] p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#147A52]/10 border border-[#147A52]/20 text-[#147A52] text-xs font-semibold mb-1">
            <LifeBuoy className="w-3.5 h-3.5" /> Client Advisory &amp; Escalations Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#20242A] tracking-tight">
            Customer Support &amp; Secure Inbox
          </h1>
          <p className="text-xs text-[#5F6670] mt-0.5">
            Respond directly to institutional wealth clients, handle high-priority wire questions, and resolve escalations.
          </p>
        </div>
      </div>

      {/* Mailbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-md border border-[#D8DEE8] overflow-hidden min-h-[580px] shadow-xs">
        {/* Left List */}
        <div className="lg:col-span-5 border-r border-[#D8DEE8] bg-[#F5F7FA] p-3 space-y-2 overflow-y-auto max-h-[650px]">
          <div className="p-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full p-2 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs placeholder-[#5F6670] focus:outline-none focus:border-[#147A52]"
            />
          </div>

          {filtered.map((msg) => {
            const isSelected = selectedMsg?.id === msg.id;
            const threadList = msg.threads || msg.thread || [];
            const lastThread = threadList[threadList.length - 1];
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMsgId(msg.id);
                  markMessageRead(msg.id);
                }}
                className={`p-3.5 rounded transition-all cursor-pointer border text-xs space-y-1.5 ${
                  isSelected
                    ? 'bg-[#147A52]/10 border-[#147A52] shadow-xs'
                    : 'bg-white border-[#D8DEE8] hover:border-[#bcc5cc]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#20242A] text-xs">{msg.senderName}</span>
                  <span className="text-[10px] text-[#5F6670] font-mono">{msg.timestamp.split(' ')[0]}</span>
                </div>
                <div className="font-semibold text-[#20242A] line-clamp-1">{msg.subject}</div>
                <div className="text-[#5F6670] line-clamp-1 text-[11px]">
                  {lastThread?.body || lastThread?.text || msg.preview}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase bg-[#F5F7FA] border border-[#D8DEE8] text-[#147A52]">
                    {msg.category}
                  </span>
                  <span className="text-[10px] text-[#5F6670] font-mono">{threadList.length} replies</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Active Chat */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white p-5">
          {selectedMsg ? (
            <div className="flex flex-col h-full justify-between space-y-4">
              <div className="border-b border-[#D8DEE8] pb-3">
                <h2 className="text-base font-bold text-[#20242A] tracking-tight">{selectedMsg.subject}</h2>
                <div className="flex items-center gap-2 text-xs text-[#5F6670] mt-1">
                  <span>Client: <strong className="text-[#20242A]">{selectedMsg.senderName}</strong></span>
                  <span>•</span>
                  <span className="text-[#147A52] font-mono text-[11px] font-bold">Category: {selectedMsg.category.toUpperCase()}</span>
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto pr-1 max-h-[380px]">
                {(selectedMsg.threads || selectedMsg.thread || []).map((t) => {
                  const isStaff = t.senderRole === 'admin' || t.senderRole === 'officer';
                  return (
                    <div
                      key={t.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-[11px] font-bold text-[#5F6670]">
                          {isStaff ? 'Operations Staff (You)' : (t.senderName || t.sender)}
                        </span>
                        <span className="text-[10px] text-[#5F6670] font-mono">{t.timestamp}</span>
                      </div>
                      <div
                        className={`p-3.5 rounded-lg text-xs max-w-lg leading-relaxed ${
                          isStaff
                            ? 'bg-[#147A52] text-white font-medium rounded-br-none shadow-xs'
                            : 'bg-[#F5F7FA] border border-[#D8DEE8] text-[#20242A] rounded-bl-none'
                        }`}
                      >
                        {t.body || t.text}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply */}
              <form onSubmit={handleReply} className="pt-3 border-t border-[#D8DEE8] space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder="Type official dispatch response to client..."
                    className="w-full p-3 rounded bg-white border border-[#D8DEE8] text-[#20242A] text-xs focus:outline-none focus:border-[#147A52]"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-[#101F7A] hover:bg-[#081552] text-white font-semibold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Send Staff Reply
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-[#5F6670]">
              Select a conversation from the left to view dispatches.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
