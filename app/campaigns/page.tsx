'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import {
  Zap, Plus, Trash2, Edit, RefreshCw, CheckCircle, AlertCircle, Send,
  ToggleLeft, ToggleRight, Code, Eye, FolderOpen, X, FileText,
} from 'lucide-react';

interface Campaign {
  id: number;
  name: string;
  triggerType: string;
  delayDays: number;
  delayHours: number;
  sendAtTime: string | null;
  subject: string;
  body: string;
  bodyHtml: string | null;
  useHtml: boolean;
  includeInvoice: boolean;
  enabled: boolean;
  sentCount: number;
  openedCount: number;
  clickedCount: number;
}

interface SentEntry {
  id: number;
  sentAt: string;
  customerName: string;
  customerEmail: string;
  orderId: string;
  opened: boolean;
  clicked: boolean;
}

interface EmailTemplate {
  id: number;
  name: string;
  html: string;
}

const TRIGGERS = [
  { value: 'review_request', label: 'Review verzoek' },
  { value: 'order_confirmation', label: 'Bestelbevestiging' },
  { value: 'shipping_confirmation', label: 'Verzendbevestiging' },
  { value: 'delivery_followup', label: 'Levering follow-up' },
];

const DELAY_PRESETS = [
  { label: 'Direct', days: 0, hours: 0 },
  { label: '1 uur', days: 0, hours: 1 },
  { label: '2 uur', days: 0, hours: 2 },
  { label: '6 uur', days: 0, hours: 6 },
  { label: '12 uur', days: 0, hours: 12 },
  { label: '1 dag', days: 1, hours: 0 },
  { label: '3 dagen', days: 3, hours: 0 },
  { label: '5 dagen', days: 5, hours: 0 },
  { label: '7 dagen', days: 7, hours: 0 },
  { label: '14 dagen', days: 14, hours: 0 },
];

const VARIABLES = ['{klantnaam}', '{bestelnummer}', '{productnamen}', '{productlijst}', '{reviewlink}'];

const EMPTY_FORM = {
  name: '', triggerType: 'review_request', delayDays: 7, delayHours: 0,
  sendAtTime: '', subject: '', body: '', bodyHtml: '', useHtml: false,
  includeInvoice: false, enabled: false,
};

const inp = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]';

function Toggle({ checked, onChange, color = 'green' }: { checked: boolean; onChange: (v: boolean) => void; color?: 'green' | 'orange' }) {
  const bg = checked
    ? color === 'green' ? 'bg-green-500' : 'bg-orange-500'
    : 'bg-gray-200';
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${bg}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sentLog, setSentLog] = useState<SentEntry[]>([]);
  const [processorLog, setProcessorLog] = useState<string[]>([]);
  const [processorRunning, setProcessorRunning] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [tab, setTab] = useState<'campaigns' | 'log' | 'diagnostic'>('campaigns');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // HTML editor
  const [htmlTab, setHtmlTab] = useState<'code' | 'preview'>('code');

  // Variable insertion
  const [focusedField, setFocusedField] = useState<'subject' | 'body' | 'bodyHtml'>('subject');
  const subjectRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const bodyHtmlRef = useRef<HTMLTextAreaElement>(null);

  // Templates
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [showTemplateLoader, setShowTemplateLoader] = useState(false);

  // Test email
  const [testEmail, setTestEmail] = useState('');
  const [testSending, setTestSending] = useState(false);
  const [testMsg, setTestMsg] = useState('');

  // Diagnostic
  const [diagLoading, setDiagLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      const [camps, status] = await Promise.all([
        apiGet<{ campaigns: Campaign[] }>('/api/campaigns'),
        apiGet<{ running: boolean; log: string[] }>('/api/campaigns/processor/status'),
      ]);
      setCampaigns(camps.campaigns);
      setProcessorRunning(status.running);
      setProcessorLog(status.log);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadLog = async () => {
    const data = await apiGet<{ entries: SentEntry[] }>('/api/campaigns/log/sent');
    setSentLog(data.entries);
  };

  const loadTemplates = async () => {
    try {
      const data = await apiGet<{ templates: EmailTemplate[] }>('/api/campaigns/templates/list');
      setTemplates(data.templates || []);
    } catch {}
  };

  const insertVariable = (variable: string) => {
    const insertAt = (el: HTMLInputElement | HTMLTextAreaElement, key: keyof typeof form) => {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newVal = el.value.slice(0, start) + variable + el.value.slice(end);
      setForm(f => ({ ...f, [key]: newVal }));
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    };

    if (focusedField === 'subject' && subjectRef.current) {
      insertAt(subjectRef.current, 'subject');
    } else if (focusedField === 'body' && bodyRef.current) {
      insertAt(bodyRef.current, 'body');
    } else if (focusedField === 'bodyHtml' && bodyHtmlRef.current) {
      insertAt(bodyHtmlRef.current, 'bodyHtml');
    } else {
      setForm(f => ({ ...f, subject: f.subject + variable }));
    }
  };

  const isPresetActive = (p: typeof DELAY_PRESETS[0]) =>
    form.delayDays === p.days && form.delayHours === p.hours;

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setTestMsg('');
    setHtmlTab('code');
    setShowTemplateLoader(false);
    setModal(true);
  };

  const openEdit = (c: Campaign) => {
    setEditId(c.id);
    setForm({
      name: c.name, triggerType: c.triggerType, delayDays: c.delayDays,
      delayHours: c.delayHours, sendAtTime: c.sendAtTime || '',
      subject: c.subject, body: c.body, bodyHtml: c.bodyHtml || '',
      useHtml: c.useHtml, includeInvoice: c.includeInvoice, enabled: c.enabled,
    });
    setFormError('');
    setTestMsg('');
    setHtmlTab('code');
    setShowTemplateLoader(false);
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.subject || (!form.useHtml && !form.body) || (form.useHtml && !form.bodyHtml && !form.body)) {
      setFormError('Naam, onderwerp en tekst zijn verplicht');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form,
        sendAtTime: form.sendAtTime || null,
        bodyHtml: form.useHtml ? form.bodyHtml : null,
      };
      if (editId) {
        await apiPut(`/api/campaigns/${editId}`, payload);
      } else {
        await apiPost('/api/campaigns', payload);
      }
      setModal(false);
      await load();
    } catch (e: any) {
      setFormError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (id: number, enabled: boolean) => {
    await apiPost(`/api/campaigns/${id}/toggle`, { enabled });
    await load();
  };

  const remove = async (id: number) => {
    if (!confirm('Campagne verwijderen?')) return;
    await apiDelete(`/api/campaigns/${id}`);
    await load();
  };

  const restart = async () => {
    await apiPost('/api/campaigns/processor/restart');
    await load();
  };

  const sendTest = async () => {
    if (!testEmail) return;
    setTestSending(true);
    setTestMsg('');
    try {
      await apiPost('/api/campaigns/test-preview', {
        testEmail, subject: form.subject, body: form.body,
        bodyHtml: form.bodyHtml, useHtml: form.useHtml,
      });
      setTestMsg(`✓ Test verzonden naar ${testEmail}`);
    } catch (e: any) {
      setTestMsg(`✗ ${e.message}`);
    } finally {
      setTestSending(false);
    }
  };

  const pasteHtml = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setForm(f => ({ ...f, bodyHtml: text }));
    } catch {}
  };

  const saveTemplate = async () => {
    const name = window.prompt('Template naam:');
    if (!name) return;
    try {
      await apiPost('/api/campaigns/templates', { name, html: form.bodyHtml });
      await loadTemplates();
    } catch (e: any) {
      alert('Fout: ' + e.message);
    }
  };

  const loadTemplate = (t: EmailTemplate) => {
    setForm(f => ({ ...f, bodyHtml: t.html }));
    setShowTemplateLoader(false);
  };

  const runDiagnostic = async () => {
    setDiagLoading(true);
    setDiagnostic(null);
    try {
      const r = await apiGet('/api/campaigns/diagnostic');
      setDiagnostic(r);
    } catch (e: any) {
      setDiagnostic({ error: e.message });
    } finally {
      setDiagLoading(false);
    }
  };

  const triggerLabel = (t: string) => TRIGGERS.find(x => x.value === t)?.label || t;

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Campagnes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Automatische e-mails naar klanten na hun bestelling</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#0060e5] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 shrink-0"
        >
          <Plus className="w-4 h-4" /> Nieuwe campagne
        </button>
      </div>

      {/* Processor status */}
      {campaigns.some(c => c.enabled) && (
        <div className={`flex items-center justify-between rounded-lg px-4 py-2.5 mb-4 text-sm ${
          processorRunning
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${processorRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {processorRunning
              ? 'Processor actief — controleert elke 5 minuten op nieuwe bestellingen'
              : '⚠️ Processor gestopt — e-mails worden niet verstuurd'
            }
          </div>
          {!processorRunning && (
            <button onClick={restart} className="flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700">
              <RefreshCw className="w-3.5 h-3.5" /> Herstart
            </button>
          )}
        </div>
      )}

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {(['campaigns', 'log', 'diagnostic'] as const).map(t => (
          <button
            key={t}
            onClick={() => { setTab(t); if (t === 'log') loadLog(); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t ? 'border-[#0060e5] text-[#0060e5]' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'campaigns' ? `Campagnes (${campaigns.length})` : t === 'log' ? 'Verzonden Log' : 'Diagnostiek'}
          </button>
        ))}
      </div>

      {/* Campaigns list */}
      {tab === 'campaigns' && (
        loading ? (
          <div className="text-sm text-gray-400 py-8 text-center">Laden...</div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
            <Zap className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nog geen campagnes. Maak je eerste aan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{c.name}</span>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {c.enabled ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 space-y-0.5">
                      <div>{triggerLabel(c.triggerType)} — na {c.delayDays}d {c.delayHours > 0 ? `${c.delayHours}u` : ''}</div>
                      <div className="text-gray-400 truncate">Onderwerp: {c.subject}</div>
                    </div>
                    <div className="flex gap-4 mt-3">
                      {[
                        { label: 'Verzonden', val: c.sentCount, color: 'text-blue-600' },
                        { label: 'Geopend', val: c.openedCount, color: 'text-green-600' },
                        { label: 'Geklikt', val: c.clickedCount, color: 'text-purple-600' },
                      ].map(s => (
                        <div key={s.label}>
                          <div className={`text-lg font-bold ${s.color}`}>{s.val}</div>
                          <div className="text-xs text-gray-400">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => toggle(c.id, !c.enabled)} className="text-gray-400 hover:text-[#0060e5]" title={c.enabled ? 'Deactiveren' : 'Activeren'}>
                      {c.enabled ? <ToggleRight className="w-6 h-6 text-[#0060e5]" /> : <ToggleLeft className="w-6 h-6" />}
                    </button>
                    <button onClick={() => openEdit(c)} className="text-gray-400 hover:text-gray-700">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Log tab */}
      {tab === 'log' && (
        <div className="space-y-4">
          {processorLog.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-2">Processor Log</h3>
              <div className="max-h-48 overflow-y-auto text-xs font-mono text-gray-500 space-y-0.5 bg-gray-50 rounded p-2">
                {processorLog.map((line, i) => <div key={i}>{line}</div>)}
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Datum', 'Klant', 'Bestelling', 'Status'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sentLog.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">Nog geen e-mails verzonden</td></tr>
                ) : sentLog.map(e => (
                  <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(e.sentAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 text-xs">{e.customerName || '—'}</div>
                      <div className="text-gray-400 text-xs">{e.customerEmail}</div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.orderId}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700">Verzonden</span>
                        {e.opened && <span className="px-1.5 py-0.5 rounded text-xs bg-green-100 text-green-700">Geopend</span>}
                        {e.clicked && <span className="px-1.5 py-0.5 rounded text-xs bg-purple-100 text-purple-700">Geklikt</span>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Diagnostic tab */}
      {tab === 'diagnostic' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">E-mail Diagnostiek</h3>
              <p className="text-xs text-gray-500 mt-0.5">Controleer waarom campagne-e-mails niet worden verzonden</p>
            </div>
            <button
              onClick={runDiagnostic}
              disabled={diagLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${diagLoading ? 'animate-spin' : ''}`} />
              {diagLoading ? 'Bezig...' : 'Diagnose uitvoeren'}
            </button>
          </div>

          {diagnostic && !diagnostic.error && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'FBR bestellingen', val: diagnostic.fbrPage1Count, color: 'text-blue-600' },
                  { label: 'FBB bestellingen', val: diagnostic.fbbPage1Count, color: 'text-indigo-600' },
                  { label: 'E-mail beschikbaar', val: diagnostic.emailAvailable, color: 'text-green-600' },
                  { label: 'Geen e-mail (FBB)', val: diagnostic.emailMissing, color: 'text-red-600' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">{s.label}</div>
                    <div className={`text-2xl font-bold ${s.color}`}>{s.val}</div>
                  </div>
                ))}
              </div>
              {diagnostic.emailMissing > 0 && diagnostic.emailAvailable === 0 && (
                <div className="flex gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span><strong>Probleem gevonden:</strong> Bol.com geeft géén e-mailadres terug voor FBB-bestellingen. Campagnes werken alleen bij FBR (eigen verzending). Bij FBB beheert bol.com de klantcommunicatie.</span>
                </div>
              )}
              {diagnostic.emailAvailable > 0 && (
                <div className="flex gap-2 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                  <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>E-mailadressen zijn beschikbaar. Bekijk de Processor Log voor meer details.</span>
                </div>
              )}
              {diagnostic.samples?.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 mb-1">Steekproef:</div>
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-0.5">
                    {diagnostic.samples.map((s: any, i: number) => (
                      <div key={i} className={`text-xs font-mono ${s.email?.startsWith('✓') ? 'text-green-600' : 'text-red-500'}`}>
                        [{s.method}] {s.orderId} · {s.ageDays?.toFixed(1)}d oud · {s.email}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
          {diagnostic?.error && <div className="text-sm text-red-600">Fout: {diagnostic.error}</div>}
        </div>
      )}

      {/* ─── MODAL ─── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-900 text-base">{editId ? 'Campagne bewerken' : 'Nieuwe campagne'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 p-1 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Naam + Trigger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campagne Naam *</label>
                  <input
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className={inp}
                    placeholder="Bijv. Review verzoek 7 dagen"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Trigger</label>
                  <select
                    value={form.triggerType}
                    onChange={e => setForm(f => ({ ...f, triggerType: e.target.value }))}
                    className={inp + ' bg-white'}
                  >
                    {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Vertraging */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <label className="block text-xs font-semibold text-gray-700">Vertraging na bestelling</label>

                {/* Preset buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {DELAY_PRESETS.map(p => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => setForm(f => ({ ...f, delayDays: p.days, delayHours: p.hours }))}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        isPresetActive(p)
                          ? 'bg-[#0060e5] text-white border-[#0060e5]'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-[#0060e5] hover:text-[#0060e5]'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                {/* Manual input */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Dagen</label>
                    <input
                      type="number" min={0} value={form.delayDays}
                      onChange={e => setForm(f => ({ ...f, delayDays: +e.target.value }))}
                      className={inp}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">Uren</label>
                    <input
                      type="number" min={0} max={23} value={form.delayHours}
                      onChange={e => setForm(f => ({ ...f, delayHours: +e.target.value }))}
                      className={inp}
                    />
                  </div>
                </div>

                {/* Specific time */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Verstuur op specifiek tijdstip (optioneel)</label>
                  <input
                    type="time"
                    value={form.sendAtTime}
                    onChange={e => setForm(f => ({ ...f, sendAtTime: e.target.value }))}
                    className={inp + ' w-40'}
                  />
                </div>
              </div>

              {/* Onderwerp */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Onderwerp *</label>
                <input
                  ref={subjectRef}
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  onFocus={() => setFocusedField('subject')}
                  className={inp}
                  placeholder="Bijv. Hoe bevalt uw aankoop? — bestelling {bestelnummer}"
                />
              </div>

              {/* Beschikbare Variabelen */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Beschikbare Variabelen</label>
                <p className="text-xs text-gray-400 mb-2">Klik op een variabele om deze in het gefocuste veld in te voegen</p>
                <div className="flex flex-wrap gap-2">
                  {VARIABLES.map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => insertVariable(v)}
                      className="px-3 py-1 bg-blue-50 text-[#0060e5] border border-blue-200 rounded-full text-xs font-mono hover:bg-blue-100 transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* E-mail Type toggle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">E-mail Type</label>
                <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, useHtml: false }))}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors ${
                      !form.useHtml ? 'bg-[#0060e5] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" /> Platte Tekst
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(f => ({ ...f, useHtml: true }))}
                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-l border-gray-300 transition-colors ${
                      form.useHtml ? 'bg-[#0060e5] text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Code className="w-3.5 h-3.5" /> HTML Design
                  </button>
                </div>
              </div>

              {/* Plain text body */}
              {!form.useHtml && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">E-mail Tekst *</label>
                  <textarea
                    ref={bodyRef}
                    value={form.body}
                    onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                    onFocus={() => setFocusedField('body')}
                    rows={6}
                    className={inp + ' resize-none'}
                    placeholder="Hallo {klantnaam},&#10;&#10;Bedankt voor uw bestelling {bestelnummer}.&#10;&#10;Met vriendelijke groet"
                  />
                </div>
              )}

              {/* HTML editor */}
              {form.useHtml && (
                <div className="space-y-3">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex rounded-lg border border-gray-300 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setHtmlTab('code')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                          htmlTab === 'code' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5" /> Code
                      </button>
                      <button
                        type="button"
                        onClick={() => setHtmlTab('preview')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-l border-gray-300 transition-colors ${
                          htmlTab === 'preview' ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </button>
                    </div>

                    <div className="flex gap-1.5 relative">
                      <button type="button" onClick={() => setForm(f => ({ ...f, bodyHtml: '' }))}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        Verwijder Code
                      </button>
                      <button type="button" onClick={pasteHtml}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        Plakken
                      </button>
                      <button type="button" onClick={saveTemplate}
                        className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
                        Opslaan als Template
                      </button>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => { loadTemplates(); setShowTemplateLoader(v => !v); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          <FolderOpen className="w-3.5 h-3.5" /> Laden
                        </button>
                        {showTemplateLoader && (
                          <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-64 py-1">
                            {templates.length === 0 ? (
                              <div className="px-4 py-3 text-xs text-gray-400">Geen templates opgeslagen</div>
                            ) : templates.map(t => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => loadTemplate(t)}
                                className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                              >
                                {t.name}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Code editor */}
                  {htmlTab === 'code' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">HTML E-mail Design</label>
                      <textarea
                        ref={bodyHtmlRef}
                        value={form.bodyHtml}
                        onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))}
                        onFocus={() => setFocusedField('bodyHtml')}
                        rows={10}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] resize-y bg-gray-900 text-green-400"
                        placeholder="Schrijf uw eigen HTML of plak een template..."
                        spellCheck={false}
                      />
                    </div>
                  )}

                  {/* Preview */}
                  {htmlTab === 'preview' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">HTML Preview</label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white min-h-[200px]">
                        {form.bodyHtml ? (
                          <iframe
                            srcDoc={form.bodyHtml}
                            title="E-mail preview"
                            className="w-full min-h-[300px] border-0"
                            sandbox="allow-same-origin"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                            Geen HTML om te previewen
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fallback tekst */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fallback Tekst <span className="font-normal text-gray-400">(voor e-mail clients zonder HTML)</span></label>
                    <textarea
                      ref={bodyRef}
                      value={form.body}
                      onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                      onFocus={() => setFocusedField('body')}
                      rows={4}
                      className={inp + ' resize-none'}
                      placeholder="Platte tekst fallback voor klanten zonder HTML..."
                    />
                  </div>
                </div>
              )}

              {/* Toggles */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">BTW Factuur Bijvoegen</div>
                    <div className="text-xs text-gray-400 mt-0.5">Voeg automatisch een BTW-factuur bij als PDF</div>
                  </div>
                  <Toggle checked={form.includeInvoice} onChange={v => setForm(f => ({ ...f, includeInvoice: v }))} color="orange" />
                </div>
                <div className="border-t border-gray-200" />
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-gray-800">Campagne direct activeren</div>
                    <div className="text-xs text-gray-400 mt-0.5">Start de campagne meteen na opslaan</div>
                  </div>
                  <Toggle checked={form.enabled} onChange={v => setForm(f => ({ ...f, enabled: v }))} color="green" />
                </div>
              </div>

              {/* Test e-mail */}
              <div className="border border-dashed border-gray-300 rounded-xl p-4 space-y-3">
                <div>
                  <div className="text-sm font-semibold text-gray-800">Test e-mail versturen</div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Stuur een testversie naar jezelf met voorbeelddata, zodat je de e-mail kunt controleren voor je de campagne activeert.
                  </p>
                </div>
                <div className="flex gap-2">
                  <input
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    type="email"
                    placeholder="jouw@email.com"
                    className={inp + ' flex-1'}
                  />
                  <button
                    type="button"
                    onClick={sendTest}
                    disabled={testSending || !testEmail}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {testSending ? 'Sturen...' : 'Test Versturen'}
                  </button>
                </div>
                {testMsg && <div className={`text-xs ${testMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{testMsg}</div>}
              </div>

              {formError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</div>}
            </div>

            {/* Footer */}
            <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuleren</button>
              <button
                onClick={save}
                disabled={saving}
                className="px-6 py-2 bg-[#0060e5] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Opslaan...' : editId ? 'Bijwerken' : 'Aanmaken'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
