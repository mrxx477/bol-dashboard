'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { Send, Clock, Trash2, Bell } from 'lucide-react';

interface Reminder {
  id: number;
  scheduledFor: string;
  subject: string;
  recipientEmail: string;
  parentEmailId: number | null;
}

export default function EmailPage() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [useHtml, setUseHtml] = useState(false);
  const [htmlBody, setHtmlBody] = useState('');
  const [scheduledFor, setScheduledFor] = useState('');
  const [reminder, setReminder] = useState(false);
  const [reminderDays, setReminderDays] = useState(7);

  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [tab, setTab] = useState<'compose' | 'planned'>('compose');

  const loadReminders = async () => {
    setRemindersLoading(true);
    try {
      const data = await apiGet<{ reminders: Reminder[] }>('/api/custom-emails/reminders');
      setReminders(data.reminders || []);
    } catch {}
    finally { setRemindersLoading(false); }
  };

  useEffect(() => { loadReminders(); }, []);

  const send = async () => {
    if (!to || !subject || !body) {
      setResult({ success: false, message: 'Vul ontvanger, onderwerp en tekst in' });
      return;
    }
    setSending(true);
    setResult(null);
    try {
      const payload: any = {
        to, subject, body, useHtml, bodyHtml: useHtml ? htmlBody : undefined,
        reminder, reminderDays,
        ...(scheduledFor ? { scheduledFor } : {}),
      };
      const res = await apiPost<{ success: boolean; message?: string; scheduled?: boolean }>('/api/custom-emails/send', payload);
      setResult({
        success: true,
        message: res.scheduled ? `Ingepland voor ${new Date(scheduledFor).toLocaleString('nl-NL')}` : 'E-mail verzonden!',
      });
      if (res.success) {
        setTo(''); setSubject(''); setBody(''); setHtmlBody(''); setScheduledFor('');
        loadReminders();
      }
    } catch (e: any) {
      setResult({ success: false, message: e.message });
    } finally {
      setSending(false);
    }
  };

  const deleteReminder = async (id: number) => {
    await apiDelete(`/api/custom-emails/reminders/${id}`);
    await loadReminders();
  };

  const sendNow = async (id: number) => {
    await apiPost(`/api/custom-emails/reminders/${id}/send-now`);
    await loadReminders();
  };

  return (
    <div className="p-6 md:p-8 max-w-[900px]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">E-mail Versturen</h1>
        <p className="text-sm text-gray-500 mt-0.5">Stuur handmatig een e-mail naar een klant</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-5">
        {(['compose', 'planned'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#0060e5] text-[#0060e5]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'compose' ? 'Opstellen' : `Gepland (${reminders.length})`}
          </button>
        ))}
      </div>

      {tab === 'compose' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Aan (e-mailadres) *</label>
            <input value={to} onChange={e => setTo(e.target.value)} type="email" placeholder="klant@email.com"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Onderwerp *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Onderwerp van de e-mail"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-gray-700">Bericht *</label>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input type="checkbox" checked={useHtml} onChange={e => setUseHtml(e.target.checked)} className="rounded" />
                HTML
              </label>
            </div>
            {useHtml ? (
              <textarea value={htmlBody} onChange={e => setHtmlBody(e.target.value)} rows={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] resize-none"
                placeholder="<p>Beste klant, ...</p>" />
            ) : (
              <textarea value={body} onChange={e => setBody(e.target.value)} rows={6}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] resize-none"
                placeholder="Beste klant, ..." />
            )}
          </div>

          {/* Schedule */}
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1" />
                Later versturen (optioneel)
              </label>
              <input type="datetime-local" value={scheduledFor} onChange={e => setScheduledFor(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input type="checkbox" checked={reminder} onChange={e => setReminder(e.target.checked)} className="rounded" />
              Automatische herinnering sturen na
              <input type="number" min={1} max={60} value={reminderDays} onChange={e => setReminderDays(+e.target.value)}
                disabled={!reminder}
                className="w-16 border border-gray-300 rounded px-2 py-1 text-sm disabled:opacity-40" />
              dagen
            </label>
          </div>

          {result && (
            <div className={`text-sm rounded-lg px-4 py-3 ${result.success ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {result.message}
            </div>
          )}

          <button onClick={send} disabled={sending}
            className="flex items-center gap-2 bg-[#0060e5] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            <Send className="w-4 h-4" />
            {sending ? 'Versturen...' : scheduledFor ? 'Inplannen' : 'Versturen'}
          </button>
        </div>
      )}

      {tab === 'planned' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {remindersLoading ? (
            <div className="py-10 text-center text-sm text-gray-400">Laden...</div>
          ) : reminders.length === 0 ? (
            <div className="py-12 text-center">
              <Bell className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Geen geplande e-mails</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Type', 'Ontvanger', 'Onderwerp', 'Gepland voor', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reminders.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.parentEmailId === null ? 'bg-orange-100 text-orange-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {r.parentEmailId === null ? 'Verzending' : 'Herinnering'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{r.recipientEmail}</td>
                    <td className="px-4 py-3 text-gray-700 text-xs truncate max-w-[200px]">{r.subject}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(r.scheduledFor).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => sendNow(r.id)} className="text-xs text-[#0060e5] hover:underline font-medium">Nu sturen</button>
                        <button onClick={() => deleteReminder(r.id)} className="text-gray-400 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
