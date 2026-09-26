import React, { useState } from 'react';
import { useBanking } from '../../context/BankingContext';
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  MapPin,
  Plus,
  Filter,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Download,
  Users,
  SendHorizontal,
  FileText,
  ShieldCheck,
  ChevronRight,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import {
  signInWithGoogleCalendar,
  getCachedCalendarAccessToken,
  listCalendarEvents,
  createCalendarEvent,
  GoogleCalendarEvent
} from '../../services/googleCalendar';

export interface BankEvent {
  id: string;
  title: string;
  category: 'advisory' | 'wire' | 'tax' | 'branch' | 'audit';
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM EST"
  duration: string;
  location: string;
  type: 'virtual' | 'branch' | 'phone';
  advisorName: string;
  advisorRole: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  description: string;
}

const INITIAL_EVENTS: BankEvent[] = [
  {
    id: 'evt_101',
    title: 'Q3 Sovereign Wealth Portfolio & Asset Allocation Strategy',
    category: 'advisory',
    date: '2026-09-29',
    time: '02:00 PM EST',
    duration: '45 mins',
    location: 'Virtual Conference (Encrypted Video Link)',
    type: 'virtual',
    advisorName: 'Victoria Sterling, Senior Managing Director',
    advisorRole: 'Private Wealth & Asset Allocation Desk',
    status: 'confirmed',
    description: 'Quarterly review of portfolio performance, fixed-income sweep yields, and global multi-asset rebalancing.'
  },
  {
    id: 'evt_102',
    title: 'Fedwire & Cross-Border SWIFT Settlement Verification',
    category: 'wire',
    date: '2026-10-02',
    time: '11:00 AM EST',
    duration: '30 mins',
    location: 'Northern Trust NYC Headquarters - Executive Suite 1400',
    type: 'branch',
    advisorName: 'Michael Chen, Director of Global Treasury',
    advisorRole: 'Institutional Clearing & Operations',
    status: 'confirmed',
    description: 'In-person sign-off for dual-control $500,000 corporate disbursement facility and beneficiary verification.'
  },
  {
    id: 'evt_103',
    title: '2026 Year-End IRS Form 1099-INT Tax Optimization Briefing',
    category: 'tax',
    date: '2026-10-08',
    time: '10:30 AM EST',
    duration: '60 mins',
    location: 'Virtual Briefing Room 2',
    type: 'virtual',
    advisorName: 'Sarah Jenkins, CPA, Managing Partner',
    advisorRole: 'Tax & Estate Advisory Enclave',
    status: 'confirmed',
    description: 'Joint consultation with PwC tax counsel regarding tax-exempt interest income allocations and municipal bond yields.'
  },
  {
    id: 'evt_104',
    title: 'Branch Vault Custody Inspection & Physical Metal Verification',
    category: 'branch',
    date: '2026-10-14',
    time: '03:15 PM EST',
    duration: '30 mins',
    location: 'Northern Trust Branch - 50 S La Salle St, Chicago, IL',
    type: 'branch',
    advisorName: 'Alexander Vance, Senior Custody Vault Officer',
    advisorRole: 'Vault Clearing Operations',
    status: 'pending',
    description: 'Annual physical audit check for allocated bullion safekeeping and physical certificates.'
  }
];

export const EventsView: React.FC = () => {
  const { addNotification, currentUser } = useBanking();

  const [events, setEvents] = useState<BankEvent[]>(INITIAL_EVENTS);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Google Calendar Sync State
  const [calendarToken, setCalendarToken] = useState<string | null>(getCachedCalendarAccessToken());
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  const handleSyncGoogleCalendar = async () => {
    setIsSyncingCalendar(true);
    setSyncSuccessMessage(null);
    try {
      let token = calendarToken;
      if (!token) {
        token = await signInWithGoogleCalendar();
        setCalendarToken(token);
      }

      const googleEvents = await listCalendarEvents('primary', token);

      if (googleEvents.length > 0) {
        const convertedGoogleEvents: BankEvent[] = googleEvents.map((gEvt) => {
          const startDate = gEvt.start?.dateTime ? gEvt.start.dateTime.slice(0, 10) : (gEvt.start?.date || '2026-10-01');
          const startTimeStr = gEvt.start?.dateTime
            ? new Date(gEvt.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'All Day';

          return {
            id: `g_evt_${gEvt.id}`,
            title: gEvt.summary || 'Google Calendar Meeting',
            category: 'advisory',
            date: startDate,
            time: startTimeStr,
            duration: '60 mins',
            location: gEvt.location || 'Google Calendar Meeting Room',
            type: gEvt.location?.toLowerCase().includes('branch') ? 'branch' : 'virtual',
            advisorName: gEvt.organizer?.displayName || gEvt.organizer?.email || 'Google Workspace Organizer',
            advisorRole: 'Calendar Host',
            status: 'confirmed',
            description: gEvt.description || 'Synchronized event from Google Calendar.'
          };
        });

        // Merge into events list ensuring no duplicate IDs
        setEvents(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const newUnique = convertedGoogleEvents.filter(c => !existingIds.has(c.id));
          return [...newUnique, ...prev];
        });

        setSyncSuccessMessage(`Synchronized ${convertedGoogleEvents.length} events from Google Calendar!`);
        addNotification({
          type: 'security',
          title: 'Google Calendar Synchronized',
          message: `Successfully loaded ${convertedGoogleEvents.length} upcoming events from your Google Calendar.`,
          category: 'system'
        });
      } else {
        setSyncSuccessMessage('Connected to Google Calendar. No upcoming events found.');
      }
    } catch (err: any) {
      console.error('Google Calendar Sync Error:', err);
      alert(`Google Calendar Sync Error: ${err?.message || 'Unable to sync'}`);
    } finally {
      setIsSyncingCalendar(false);
    }
  };

  // New Event Form State
  const [newTitle, setNewTaskTitle] = useState('Quarterly Wealth Review & Lombard Credit Line Consultation');
  const [newCategory, setNewCategory] = useState<'advisory' | 'wire' | 'tax' | 'branch'>('advisory');
  const [newDate, setNewDate] = useState('2026-10-18');
  const [newTime, setNewTime] = useState('11:00 AM EST');
  const [newType, setNewType] = useState<'virtual' | 'branch' | 'phone'>('virtual');
  const [newAdvisor, setNewAdvisor] = useState('Victoria Sterling, Senior Managing Director');
  const [newDesc, setNewDesc] = useState('Discussion on expanding revolving Lombard credit facility and yield optimization.');

  const filteredEvents = activeCategory === 'all'
    ? events
    : events.filter((e) => e.category === activeCategory);

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newEventItem: BankEvent = {
      id: `evt_${Date.now()}`,
      title: newTitle,
      category: newCategory,
      date: newDate,
      time: newTime,
      duration: '45 mins',
      location: newType === 'virtual' ? 'Encrypted Video Link (Sent to Email)' : newType === 'branch' ? 'Northern Trust Regional Center' : 'Secure Phone Line',
      type: newType,
      advisorName: newAdvisor,
      advisorRole: 'Private Banking Officer',
      status: 'confirmed',
      description: newDesc
    };

    setEvents(prev => [newEventItem, ...prev]);

    // If connected to Google Calendar, sync the new event
    if (calendarToken) {
      try {
        const startISO = new Date(`${newDate}T15:00:00Z`).toISOString();
        const endISO = new Date(`${newDate}T16:00:00Z`).toISOString();
        await createCalendarEvent({
          summary: newTitle,
          description: `${newDesc} (Assigned Advisor: ${newAdvisor})`,
          location: newEventItem.location,
          startDateTime: startISO,
          endDateTime: endISO,
        }, 'primary', calendarToken);
      } catch (gErr) {
        console.warn('Could not post event to Google Calendar:', gErr);
      }
    }

    addNotification({
      type: 'security',
      title: 'Appointment Scheduled Successfully',
      message: `Your appointment "${newTitle}" with ${newAdvisor} has been booked for ${newDate} at ${newTime}.`,
      category: 'system'
    });

    setShowScheduleModal(false);
  };

  const handleDownloadICal = (event: BankEvent) => {
    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Northern Trust Banking//Events//EN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description} - Advisor: ${event.advisorName}`,
      `LOCATION:${event.location}`,
      `DTSTART:${event.date.replace(/-/g, '')}T150000Z`,
      `DTEND:${event.date.replace(/-/g, '')}T160000Z`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title.slice(0, 20).replace(/\s+/g, '_')}_appointment.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-[#20242A]">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0B1F6A]/10 border-2 border-[#0B1F6A]/20 text-[#0B1F6A] text-xs font-black mb-2 shadow-2xs">
            <CalendarIcon className="w-4 h-4 stroke-[2.25]" /> Client Meeting &amp; Appointment Manager
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-[#20242A]">
            Upcoming Client Events &amp; Bank Appointments
          </h1>
          <p className="text-xs text-[#5F6670] mt-1 font-medium">
            Schedule and manage private consultations, wealth strategy meetings, and wire clearance appointments.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncingCalendar}
            className="px-4.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border-2 border-emerald-300 text-[#147A52] font-black text-xs flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingCalendar ? 'animate-spin' : ''}`} />
            <span>{isSyncingCalendar ? 'Syncing Calendar...' : 'Sync Google Calendar'}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="px-5 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-black text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer border border-[#0B1F6A]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Schedule Appointment</span>
          </button>
        </div>
      </div>

      {syncSuccessMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-[#147A52] text-xs font-bold flex items-center justify-between shadow-2xs animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#147A52] stroke-[2.5]" />
            <span>{syncSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncSuccessMessage(null)}
            className="text-[#147A52] hover:opacity-75"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#F5F7FA] p-2 rounded-2xl border-2 border-[#D8DEE8]">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {[
            { id: 'all', label: 'All Scheduled Events' },
            { id: 'advisory', label: 'Wealth & Advisory' },
            { id: 'wire', label: 'Wire & Settlement' },
            { id: 'tax', label: 'Tax & Compliance' },
            { id: 'branch', label: 'Branch & Vault' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-[#0B1F6A] text-white shadow-xs'
                  : 'text-[#5F6670] hover:text-[#20242A] hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#5F6670] font-mono font-bold px-2 hidden sm:block">
          Showing {filteredEvents.length} Events
        </div>
      </div>

      {/* Events List Grid */}
      <div className="space-y-4">
        {filteredEvents.map((evt) => {
          const isVirtual = evt.type === 'virtual';
          return (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border-2 border-[#D8DEE8] p-5 sm:p-6 shadow-sm hover:border-[#0B1F6A] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10.5px] font-mono font-black uppercase ${
                    evt.category === 'advisory' ? 'bg-blue-100 text-[#0B1F6A] border border-blue-200' :
                    evt.category === 'wire' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                    evt.category === 'tax' ? 'bg-emerald-100 text-[#147A52] border border-emerald-300' :
                    'bg-purple-100 text-purple-900 border border-purple-200'
                  }`}>
                    {evt.category}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-slate-100 text-[#5F6670] border border-slate-300 flex items-center gap-1">
                    {isVirtual ? <Video className="w-3 h-3 text-[#0B1F6A]" /> : <MapPin className="w-3 h-3 text-rose-600" />}
                    {evt.type.toUpperCase()}
                  </span>

                  <span className="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-extrabold bg-emerald-50 text-[#147A52] border border-emerald-300 flex items-center gap-1 ml-auto sm:ml-0">
                    <CheckCircle2 className="w-3 h-3" />
                    {evt.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#20242A] leading-snug">
                    {evt.title}
                  </h3>
                  <p className="text-xs text-[#5F6670] font-medium mt-1 leading-relaxed max-w-2xl">
                    {evt.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs pt-1 font-mono font-bold text-[#5F6670]">
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4 text-[#0B1F6A] shrink-0" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#0B1F6A] shrink-0" />
                    <span>Duration: {evt.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-1 sm:col-span-2 lg:col-span-1">
                    <UserCheck className="w-4 h-4 text-[#147A52] shrink-0" />
                    <span className="truncate">{evt.advisorName}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-row lg:flex-col items-center justify-end gap-2.5 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#F5F7FA] shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadICal(evt)}
                  className="px-4 py-2 rounded-xl bg-[#F5F7FA] hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                  title="Export .ics iCal event file"
                >
                  <Download className="w-3.5 h-3.5 stroke-[2.25]" />
                  <span>Download .ics</span>
                </button>

                <button
                  type="button"
                  onClick={() => addNotification({
                    type: 'security',
                    title: 'Appointment Confirmed',
                    message: `Reminder active for ${evt.title} on ${evt.date}.`,
                    category: 'system'
                  })}
                  className="px-4 py-2 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Schedule Appointment Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full border-2 border-[#D8DEE8] p-6 space-y-5 shadow-2xl text-xs">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#F5F7FA]">
              <span className="font-black text-sm text-[#0B1F6A] flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#147A52]" />
                Schedule Private Banking Appointment
              </span>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-[#5F6670] hover:text-[#20242A] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 stroke-[2.25]" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1">Appointment Purpose / Subject</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-semibold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                  >
                    <option value="advisory">Wealth &amp; Advisory Strategy</option>
                    <option value="wire">Fedwire &amp; SWIFT Clearance</option>
                    <option value="tax">IRS Tax &amp; Estate Consultation</option>
                    <option value="branch">Branch &amp; Vault Access</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Meeting Format</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                  >
                    <option value="virtual">Encrypted Video Conference</option>
                    <option value="branch">In-Person Branch Consultation</option>
                    <option value="phone">Private Telephone Call</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-semibold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                  />
                </div>

                <div>
                  <label className="font-bold text-xs text-[#20242A] block mb-1">Preferred Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-bold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                  >
                    <option value="09:30 AM EST">09:30 AM EST</option>
                    <option value="11:00 AM EST">11:00 AM EST</option>
                    <option value="02:00 PM EST">02:00 PM EST</option>
                    <option value="04:15 PM EST">04:15 PM EST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1">Assigned Banking Officer</label>
                <input
                  type="text"
                  required
                  value={newAdvisor}
                  onChange={(e) => setNewAdvisor(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-semibold focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                />
              </div>

              <div>
                <label className="font-bold text-xs text-[#20242A] block mb-1">Notes / Agenda Details</label>
                <textarea
                  rows={2}
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F7FA] border-2 border-[#D8DEE8] rounded-xl text-xs text-[#20242A] font-medium focus:bg-white focus:outline-none focus:border-[#0B1F6A] transition-all"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border-2 border-[#D8DEE8] text-[#20242A] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F6A] hover:bg-[#081552] text-white font-extrabold transition-all shadow-md cursor-pointer border border-[#0B1F6A]"
                >
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
