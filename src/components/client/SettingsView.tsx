import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Settings,
  Bell,
  Globe2,
  Check,
  Save,
  Sun,
  Moon,
  ShieldCheck,
  Monitor,
  Sparkles,
  Zap,
  Bot,
  AlertTriangle,
  Sliders,
  CheckCircle2
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    setDarkMode,
    aiSpendingAlerts,
    setAiSpendingAlerts,
    aiSpendingThreshold,
    setAiSpendingThreshold,
    navigateTo
  } = useBanking();

  const [saved, setSaved] = useState(false);

  // Form states
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en-US');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [aiSensitivity, setAiSensitivity] = useState<'standard' | 'high' | 'ultra'>('standard');
  const [localAiThreshold, setLocalAiThreshold] = useState(String(aiSpendingThreshold || 10000));
  const [localAiEnabled, setLocalAiEnabled] = useState(aiSpendingAlerts ?? true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedThreshold = Math.max(500, parseInt(localAiThreshold, 10) || 10000);
    setAiSpendingAlerts(localAiEnabled);
    setAiSpendingThreshold(parsedThreshold);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };


  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#147A52]/10 border-2 border-emerald-300 text-[#147A52] text-xs font-black mb-2 shadow-2xs">
            <Settings className="w-4 h-4 text-[#147A52] stroke-[2.25]" /> System Preferences &amp; Notification Rules
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Client Portal Settings
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Configure display modes, regional settlement currencies, and AI-driven spending anomaly alerts.
          </p>
        </div>

        {saved && (
          <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-[#147A52] font-bold text-xs flex items-center gap-2 animate-fade-in shadow-2xs">
            <CheckCircle2 className="w-4 h-4 text-[#147A52]" />
            <span>Preferences saved successfully!</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. VISUAL THEME & DISPLAY STANDARD */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 sm:p-7 shadow-sm space-y-5">
        <div>
          <h3 className="text-sm font-black text-[#20242A] flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
            <span>Visual Interface &amp; High-Contrast Display</span>
          </h3>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Select high-assurance visual styling tailored for executive daylight reading or low-light institutional treasury monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Light Theme Card */}
          <div
            onClick={() => setDarkMode(false)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              !darkMode
                ? 'border-[#147A52] bg-[#147A52]/5 shadow-sm ring-1 ring-[#147A52]'
                : 'border-[#D8DEE8] hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600 stroke-[2.25]" />
                <span className="font-extrabold text-xs text-[#20242A]">Executive Light</span>
              </div>
              {!darkMode && (
                <div className="w-5 h-5 rounded-full bg-[#147A52] text-white flex items-center justify-center">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-[#F5F7FA] border border-[#D8DEE8] space-y-1.5 text-[10px]">
              <div className="h-3 w-2/3 bg-[#0B1F6A] rounded-sm" />
              <div className="h-2 w-full bg-slate-300 rounded" />
              <div className="h-2 w-4/5 bg-slate-200 rounded" />
            </div>
            <p className="text-[11px] text-[#5F6670] mt-2.5 leading-relaxed">
              Standard high-clarity Northern Trust alabaster palette with navy accents.
            </p>
          </div>

          {/* Dark Theme Card */}
          <div
            onClick={() => setDarkMode(true)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              darkMode
                ? 'border-[#10B981] bg-[#161F36] text-white shadow-sm ring-1 ring-[#10B981]'
                : 'border-[#D8DEE8] hover:border-slate-400 bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-indigo-400 stroke-[2.25]" />
                <span className={`font-extrabold text-xs ${darkMode ? 'text-white' : 'text-[#20242A]'}`}>
                  Treasury Obsidian
                </span>
              </div>
              {darkMode && (
                <div className="w-5 h-5 rounded-full bg-[#10B981] text-[#0A0E1A] flex items-center justify-center font-bold">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </div>
            <div className="p-3 rounded-lg bg-[#0A0E1A] border border-[#242F48] space-y-1.5 text-[10px]">
              <div className="h-3 w-2/3 bg-[#10B981] rounded-sm" />
              <div className="h-2 w-full bg-[#1E293B] rounded" />
              <div className="h-2 w-4/5 bg-[#1E293B]/70 rounded" />
            </div>
            <p className={`text-[11px] mt-2.5 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-[#5F6670]'}`}>
              High-contrast midnight theme engineered for reduced eye strain and biometric glare reduction.
            </p>
          </div>

          {/* System Adaptive Card */}
          <div
            onClick={() => {
              const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
              setDarkMode(prefersDark);
            }}
            className="p-4 rounded-xl border-2 border-[#D8DEE8] hover:border-slate-400 bg-white cursor-pointer transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-[#5F6670] stroke-[2.25]" />
                <span className="font-extrabold text-xs text-[#20242A]">OS Synchronized</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-r from-[#F5F7FA] to-[#0B0F19] border border-[#D8DEE8] space-y-1.5 text-[10px]">
              <div className="h-3 w-2/3 bg-[#0B1F6A] rounded-sm" />
              <div className="h-2 w-full bg-slate-400/40 rounded" />
              <div className="h-2 w-4/5 bg-slate-400/30 rounded" />
            </div>
            <p className="text-[11px] text-[#5F6670] mt-2.5 leading-relaxed">
              Automatically synchronizes with your device operating system display mode.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. REGIONAL, NOTIFICATIONS & AI SPENDING SENTINEL */}
      {/* ========================================================================= */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Regional & Financial Preferences (Col 1-5) */}
          <div className="lg:col-span-5 bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-[#20242A] flex items-center gap-2 pb-3 border-b-2 border-[#F5F7FA]">
              <Globe2 className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
              <span>Regional &amp; Reporting Standards</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Primary Portfolio Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all cursor-pointer"
                >
                  <option value="USD">USD — United States Dollar ($)</option>
                  <option value="EUR">EUR — Euro (€)</option>
                  <option value="GBP">GBP — British Pound (£)</option>
                  <option value="CHF">CHF — Swiss Franc (Fr.)</option>
                  <option value="JPY">JPY — Japanese Yen (¥)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">Portal Language &amp; Localization</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all cursor-pointer"
                >
                  <option value="en-US">English (United States)</option>
                  <option value="en-GB">English (United Kingdom)</option>
                  <option value="de-CH">Deutsch (Schweiz)</option>
                  <option value="fr-CH">Français (Suisse)</option>
                </select>
              </div>

              <div className="pt-2 border-t border-[#D8DEE8] space-y-3">
                <span className="text-[11px] font-bold text-[#5F6670] uppercase tracking-wider block font-mono">
                  Standard Communication Channels
                </span>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] shadow-2xs">
                  <div>
                    <span className="font-extrabold text-xs text-[#20242A] block">Email Wire Advices</span>
                    <span className="text-[11px] text-[#5F6670]">Send cryptographic receipts upon execution</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#D8DEE8] text-[#147A52] focus:ring-[#147A52] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7FA] border-2 border-[#D8DEE8] shadow-2xs">
                  <div>
                    <span className="font-extrabold text-xs text-[#20242A] block">SMS Security Codes</span>
                    <span className="text-[11px] text-[#5F6670]">Send instant 2FA SMS tokens</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-5 h-5 rounded-md border-2 border-[#D8DEE8] text-[#147A52] focus:ring-[#147A52] cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* AI-Driven Spending Alerts & Anomaly Sentinel (Col 6-12) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border-2 border-[#D8DEE8] p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-[#F5F7FA]">
              <h3 className="text-sm font-black text-[#20242A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#147A52] stroke-[2.25]" />
                <span>AI-Driven Spending Alerts &amp; Fraud Sentinel</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 w-fit">
                Machine Learning Anomaly Protection
              </span>
            </div>

            {/* Main AI-Driven Spending Alerts Master Toggle */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50/70 via-[#F5F7FA] to-indigo-50/50 border-2 border-emerald-300 shadow-2xs space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-[#0B1F6A]">
                      AI-Driven Spending Alerts
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#147A52] text-white">
                      AI SENTINEL
                    </span>
                  </div>
                  <p className="text-xs text-[#5F6670] font-medium leading-relaxed">
                    Notifies the user when suspicious, uncharacteristic, or high-value transactions occur across accounts.
                  </p>
                </div>

                {/* Switch Toggle */}
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={localAiEnabled}
                    onChange={(e) => setLocalAiEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-12 h-6.5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#147A52]"></div>
                </label>
              </div>

              {localAiEnabled ? (
                <div className="pt-2 border-t border-emerald-200/80 flex items-center gap-2 text-[11px] text-[#147A52] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#147A52] shrink-0" />
                  <span>Sentinel active: Scanning 24/7 for rapid velocity spikes, off-hours international debits, and large wire departures.</span>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-200 flex items-center gap-2 text-[11px] text-amber-700 font-medium">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>AI spending alerts are currently disabled. High-value anomaly notices will not be pushed to your live feed.</span>
                </div>
              )}
            </div>

            {/* AI Threshold & Sensitivity Parameters */}
            <div className={`space-y-4 text-xs transition-opacity ${localAiEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5 flex items-center justify-between">
                  <span>High-Value Spending Alert Threshold ($ USD)</span>
                  <span className="font-mono text-[#147A52] font-bold text-xs">${parseInt(localAiThreshold || '0', 10).toLocaleString()}</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="500"
                    step="1000"
                    value={localAiThreshold}
                    onChange={(e) => setLocalAiThreshold(e.target.value)}
                    className="flex-1 p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-mono font-bold focus:bg-white focus:outline-none focus:border-[#147A52] transition-all"
                  />
                  {/* Quick Preset Threshold Chips */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {['5000', '10000', '25000', '50000'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setLocalAiThreshold(val)}
                        className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                          localAiThreshold === val
                            ? 'bg-[#0B1F6A] text-white border-[#0B1F6A]'
                            : 'bg-white border-[#D8DEE8] text-[#5F6670] hover:border-slate-400'
                        }`}
                      >
                        ${parseInt(val) / 1000}k
                      </button>
                    ))}
                  </div>
                </div>
                <span className="text-[11px] text-[#5F6670] font-medium mt-1.5 block">
                  Any individual transaction or wire transfer equal to or exceeding this amount triggers an AI Sentinel alert log.
                </span>
              </div>

              {/* Sensitivity Mode */}
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1.5">
                  AI Behavioral Analysis Sensitivity
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'standard', title: 'Standard', desc: 'Threshold & off-hours velocity' },
                    { id: 'high', title: 'Enhanced', desc: 'Unusual merchant & location flags' },
                    { id: 'ultra', title: 'Institutional High', desc: 'Every non-whitelisted counterparty' }
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setAiSensitivity(mode.id as any)}
                      className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        aiSensitivity === mode.id
                          ? 'bg-[#147A52]/10 border-[#147A52] ring-1 ring-[#147A52]'
                          : 'bg-[#F5F7FA] border-[#D8DEE8] hover:border-slate-300'
                      }`}
                    >
                      <span className="font-extrabold text-xs text-[#0B1F6A] block">{mode.title}</span>
                      <span className="text-[10.5px] text-[#5F6670] mt-0.5 block leading-tight">{mode.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => navigateTo('/notifications')}
            className="text-xs text-[#0B1F6A] hover:underline font-bold inline-flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5 text-[#147A52]" />
            <span>Go to Notifications &amp; Alerts Inbox &rarr;</span>
          </button>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.25]" />
            <span>Save All Notification Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
