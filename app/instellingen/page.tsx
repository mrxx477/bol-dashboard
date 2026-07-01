'use client';
import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '@/lib/api';
import { CheckCircle, XCircle, Save, Trash2 } from 'lucide-react';

interface BolStatus { connected: boolean; clientId?: string }
interface GmailStatus { configured: boolean; email?: string }
interface ResendStatus { configured: boolean; fromEmail?: string }
interface CompanySettings {
  companyName: string; street: string; zipCity: string;
  country: string; kvkNumber: string; btwNumber: string; iban: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-bold text-gray-900 text-sm border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}

const input = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]";
const btn = "px-4 py-2 text-sm font-semibold rounded-lg transition-colors";

export default function InstellingenPage() {
  // Bol.com
  const [bolStatus, setBolStatus] = useState<BolStatus | null>(null);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [bolSaving, setBolSaving] = useState(false);
  const [bolMsg, setBolMsg] = useState('');

  // Gmail
  const [gmailStatus, setGmailStatus] = useState<GmailStatus | null>(null);
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailPassword, setGmailPassword] = useState('');
  const [gmailSaving, setGmailSaving] = useState(false);
  const [gmailMsg, setGmailMsg] = useState('');

  // Resend
  const [resendStatus, setResendStatus] = useState<ResendStatus | null>(null);
  const [resendKey, setResendKey] = useState('');
  const [resendFrom, setResendFrom] = useState('');
  const [resendSaving, setResendSaving] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Company
  const [company, setCompany] = useState<CompanySettings>({
    companyName: '', street: '', zipCity: '', country: 'NL',
    kvkNumber: '', btwNumber: '', iban: '',
  });
  const [companySaving, setCompanySaving] = useState(false);
  const [companyMsg, setCompanyMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [bol, gmail, resend, comp] = await Promise.all([
          apiGet<BolStatus>('/api/auth/status').catch(() => ({ connected: false })),
          apiGet<GmailStatus>('/api/email/status').catch(() => ({ configured: false })),
          apiGet<ResendStatus>('/api/email/resend-status').catch(() => ({ configured: false })),
          apiGet<CompanySettings>('/api/email/company').catch(() => null),
        ]);
        setBolStatus(bol);
        setGmailStatus(gmail);
        setResendStatus(resend);
        if (comp) setCompany(c => ({ ...c, ...comp }));
      } catch {}
    };
    load();
  }, []);

  const saveBol = async () => {
    setBolSaving(true); setBolMsg('');
    try {
      await apiPost('/api/auth/connect', { clientId, clientSecret });
      setBolMsg('✓ Bol.com API gekoppeld');
      setBolStatus({ connected: true, clientId });
      setClientId(''); setClientSecret('');
    } catch (e: any) { setBolMsg(`✗ ${e.message}`); }
    finally { setBolSaving(false); }
  };

  const saveGmail = async () => {
    setGmailSaving(true); setGmailMsg('');
    try {
      await apiPost('/api/email/setup', { email: gmailEmail, appPassword: gmailPassword });
      setGmailMsg('✓ Gmail ingesteld');
      setGmailStatus({ configured: true, email: gmailEmail });
      setGmailEmail(''); setGmailPassword('');
    } catch (e: any) { setGmailMsg(`✗ ${e.message}`); }
    finally { setGmailSaving(false); }
  };

  const deleteGmail = async () => {
    await apiDelete('/api/email/gmail');
    setGmailStatus({ configured: false });
    setGmailMsg('Gmail verwijderd');
  };

  const saveResend = async () => {
    setResendSaving(true); setResendMsg('');
    try {
      await apiPost('/api/email/resend-setup', { apiKey: resendKey, fromEmail: resendFrom });
      setResendMsg('✓ Resend ingesteld');
      setResendStatus({ configured: true, fromEmail: resendFrom });
      setResendKey(''); setResendFrom('');
    } catch (e: any) { setResendMsg(`✗ ${e.message}`); }
    finally { setResendSaving(false); }
  };

  const deleteResend = async () => {
    await apiDelete('/api/email/resend');
    setResendStatus({ configured: false });
    setResendMsg('Resend verwijderd');
  };

  const saveCompany = async () => {
    setCompanySaving(true); setCompanyMsg('');
    try {
      await apiPost('/api/email/company', company);
      setCompanyMsg('✓ Bedrijfsgegevens opgeslagen');
    } catch (e: any) { setCompanyMsg(`✗ ${e.message}`); }
    finally { setCompanySaving(false); }
  };

  const StatusBadge = ({ ok, label }: { ok: boolean; label: string }) => (
    <div className={`flex items-center gap-1.5 text-sm ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {ok ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {label}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-[800px] space-y-5">
      <div className="mb-2">
        <h1 className="text-xl font-bold text-gray-900">Instellingen</h1>
        <p className="text-sm text-gray-500 mt-0.5">API-koppelingen, e-mail en bedrijfsgegevens</p>
      </div>

      {/* Bol.com API */}
      <Section title="Bol.com API">
        <StatusBadge ok={!!bolStatus?.connected} label={bolStatus?.connected ? `Verbonden (${bolStatus.clientId || ''})` : 'Niet verbonden'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Client ID">
            <input value={clientId} onChange={e => setClientId(e.target.value)} className={input} placeholder="Jouw bol.com Client ID" />
          </Field>
          <Field label="Client Secret">
            <input value={clientSecret} onChange={e => setClientSecret(e.target.value)} type="password" className={input} placeholder="••••••••••••" />
          </Field>
        </div>
        {bolMsg && <div className={`text-sm ${bolMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{bolMsg}</div>}
        <button onClick={saveBol} disabled={bolSaving || !clientId || !clientSecret}
          className={`${btn} bg-[#0060e5] text-white hover:bg-blue-700 disabled:opacity-40`}>
          <Save className="w-4 h-4 inline mr-1.5" />{bolSaving ? 'Opslaan...' : 'Verbinden'}
        </button>
      </Section>

      {/* Gmail */}
      <Section title="Gmail SMTP">
        <StatusBadge ok={!!gmailStatus?.configured} label={gmailStatus?.configured ? `Ingesteld (${gmailStatus.email})` : 'Niet ingesteld'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Gmail adres">
            <input value={gmailEmail} onChange={e => setGmailEmail(e.target.value)} type="email" className={input} placeholder="jouw@gmail.com" />
          </Field>
          <Field label="App-wachtwoord">
            <input value={gmailPassword} onChange={e => setGmailPassword(e.target.value)} type="password" className={input} placeholder="App-specifiek wachtwoord" />
          </Field>
        </div>
        <p className="text-xs text-gray-400">Maak een app-wachtwoord aan via Google Account → Beveiliging → 2-staps verificatie → App-wachtwoorden</p>
        {gmailMsg && <div className={`text-sm ${gmailMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{gmailMsg}</div>}
        <div className="flex gap-2">
          <button onClick={saveGmail} disabled={gmailSaving || !gmailEmail || !gmailPassword}
            className={`${btn} bg-[#0060e5] text-white hover:bg-blue-700 disabled:opacity-40`}>
            {gmailSaving ? 'Opslaan...' : 'Opslaan'}
          </button>
          {gmailStatus?.configured && (
            <button onClick={deleteGmail} className={`${btn} text-red-600 border border-red-200 hover:bg-red-50`}>
              <Trash2 className="w-4 h-4 inline mr-1" />Verwijderen
            </button>
          )}
        </div>
      </Section>

      {/* Resend */}
      <Section title="Resend (alternatief voor Gmail)">
        <StatusBadge ok={!!resendStatus?.configured} label={resendStatus?.configured ? `Ingesteld (${resendStatus.fromEmail})` : 'Niet ingesteld'} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Resend API Key">
            <input value={resendKey} onChange={e => setResendKey(e.target.value)} type="password" className={input} placeholder="re_••••••••••••" />
          </Field>
          <Field label="Van adres">
            <input value={resendFrom} onChange={e => setResendFrom(e.target.value)} type="email" className={input} placeholder="noreply@jouwdomein.nl" />
          </Field>
        </div>
        {resendMsg && <div className={`text-sm ${resendMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{resendMsg}</div>}
        <div className="flex gap-2">
          <button onClick={saveResend} disabled={resendSaving || !resendKey || !resendFrom}
            className={`${btn} bg-[#0060e5] text-white hover:bg-blue-700 disabled:opacity-40`}>
            {resendSaving ? 'Opslaan...' : 'Opslaan'}
          </button>
          {resendStatus?.configured && (
            <button onClick={deleteResend} className={`${btn} text-red-600 border border-red-200 hover:bg-red-50`}>
              <Trash2 className="w-4 h-4 inline mr-1" />Verwijderen
            </button>
          )}
        </div>
      </Section>

      {/* Company */}
      <Section title="Bedrijfsgegevens (voor BTW-facturen)">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            ['Bedrijfsnaam', 'companyName', 'Mijn BV'],
            ['Straat + huisnummer', 'street', 'Keizersgracht 1'],
            ['Postcode + stad', 'zipCity', '1015 AB Amsterdam'],
            ['Land', 'country', 'NL'],
            ['KVK-nummer', 'kvkNumber', '12345678'],
            ['BTW-nummer', 'btwNumber', 'NL123456789B01'],
            ['IBAN', 'iban', 'NL91ABNA0417164300'],
          ] as [string, keyof CompanySettings, string][]).map(([label, key, ph]) => (
            <Field key={key} label={label}>
              <input value={company[key]} onChange={e => setCompany(c => ({ ...c, [key]: e.target.value }))}
                className={input} placeholder={ph} />
            </Field>
          ))}
        </div>
        {companyMsg && <div className={`text-sm ${companyMsg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}`}>{companyMsg}</div>}
        <button onClick={saveCompany} disabled={companySaving}
          className={`${btn} bg-[#0060e5] text-white hover:bg-blue-700 disabled:opacity-40`}>
          <Save className="w-4 h-4 inline mr-1.5" />{companySaving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </Section>
    </div>
  );
}
