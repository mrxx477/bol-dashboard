'use client';
import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';
import { Zap, Plus, Mail, ToggleLeft, ToggleRight, Trash2, Edit, RefreshCw, CheckCircle, AlertCircle, Send } from 'lucide-react';

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

const TRIGGERS = [
  { value: 'review_request', label: 'Review verzoek' },
  { value: 'order_confirmation', label: 'Bestelbevestiging' },
  { value: 'shipping_confirmation', label: 'Verzendbevestiging' },
  { value: 'delivery_followup', label: 'Levering follow-up' },
];

const EMPTY_FORM = {
  name: '', triggerType: 'review_request', delayDays: 7, delayHours: 0,
  sendAtTime: '', subject: '', body: '', bodyHtml: '', useHtml: false,
  includeInvoice: false, enabled: false,
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [sentLog, setSentLog] = useState<SentEntry[]>([]);
  const [processorLog, setProcessorLog] = useState<string[]>([]);
  const [processorRunning, setProcessorRunning] = useState(false);
  const [diagnostic, setDiagnostic] = useState<any>(null);
  const [tab, setTab] = useState<'campaigns' | 'log' | 'diagnostic'>('campaigns');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal state
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

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

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setFormError('');
    setTestMsg('');
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
    setModal(true);
  };

  const save = async () => {
    if (!form.name || !form.subject || !form.body) {
      setFormError('Naam, onderwerp en tekst zijn verplicht');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = {
        ...form, sendAtTime: form.sendAtTime || null,
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
                    {/* Stats */}
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
                  <span>
                    <strong>Probleem gevonden:</strong> Bol.com geeft géén e-mailadres terug voor FBB-bestellingen.
                    Campagnes werken alleen bij FBR (eigen verzending). Bij FBB beheert bol.com de klantcommunicatie.
                  </span>
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
                  <div className="bg-gray-50 rounded-lg p-3 max-h-48 overflow-y-auto space-y-1">
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

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{editId ? 'Campagne bewerken' : 'Nieuwe campagne'}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-700 text-xl leading-none">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Naam *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]"
                    placeholder="Bijv. Review verzoek" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Trigger</label>
                  <select value={form.triggerType} onChange={e => setForm(f => ({ ...f, triggerType: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] bg-white">
                    {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vertraging (dagen)</label>
                  <input type="number" min={0} value={form.delayDays} onChange={e => setForm(f => ({ ...f, delayDays: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Extra uren</label>
                  <input type="number" min={0} max={23} value={form.delayHours} onChange={e => setForm(f => ({ ...f, delayHours: +e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Onderwerp *</label>
                <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]"
                  placeholder="Bijv. Hoe bevalt uw aankoop?" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tekst *</label>
                <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] resize-none"
                  placeholder="Hallo {klantnaam}, ..." />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.useHtml} onChange={e => setForm(f => ({ ...f, useHtml: e.target.checked }))} className="rounded" />
                  HTML template gebruiken
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.includeInvoice} onChange={e => setForm(f => ({ ...f, includeInvoice: e.target.checked }))} className="rounded" />
                  BTW factuur bijvoegen
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.enabled} onChange={e => setForm(f => ({ ...f, enabled: e.target.checked }))} className="rounded" />
                  Direct activeren
                </label>
              </div>

              {form.useHtml && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">HTML body</label>
                  <textarea value={form.bodyHtml} onChange={e => setForm(f => ({ ...f, bodyHtml: e.target.value }))} rows={6}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5] resize-none"
                    placeholder="<p>Hallo {klantnaam}...</p>" />
                </div>
              )}

              {/* Test email */}
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-medium text-gray-700 mb-2">Test e-mail sturen</div>
                <div className="flex gap-2">
                  <input value={testEmail} onChange={e => setTestEmail(e.target.value)} type="email"
                    placeholder="test@email.com"
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]" />
                  <button onClick={sendTest} disabled={testSending || !testEmail}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                    <Send className="w-3.5 h-3.5" />
                    {testSending ? 'Sturen...' : 'Test'}
                  </button>
                </div>
                {testMsg && <div className={`text-xs mt-1.5 ${testMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{testMsg}</div>}
              </div>

              {formError && <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{formError}</div>}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Annuleren</button>
              <button onClick={save} disabled={saving}
                className="px-5 py-2 bg-[#0060e5] text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
