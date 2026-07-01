'use client';
import { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api';
import { FileText, Download } from 'lucide-react';

interface Invoice {
  id: number;
  invoiceNumber: string;
  orderId: string;
  customerName: string;
  totalInclVat: number;
  createdAt: string;
  pdfUrl?: string;
}

interface Stats {
  totalInvoices: number;
  totalRevenue: number;
  thisMonthInvoices: number;
  thisMonthRevenue: number;
}

const fmtEur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

export default function FacturenPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [hist, s] = await Promise.all([
          apiGet<{ invoices: Invoice[] }>('/api/invoices/history'),
          apiGet<Stats>('/api/invoices/stats'),
        ]);
        setInvoices(hist.invoices || []);
        setStats(s);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 max-w-[1200px]">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Facturen</h1>
        <p className="text-sm text-gray-500 mt-0.5">BTW-facturen automatisch gegenereerd bij campagne-e-mails</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">{error}</div>}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Totaal facturen', val: stats.totalInvoices },
            { label: 'Totale omzet', val: fmtEur(stats.totalRevenue) },
            { label: 'Deze maand', val: stats.thisMonthInvoices },
            { label: 'Omzet deze maand', val: fmtEur(stats.thisMonthRevenue) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-1">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="py-10 text-center text-sm text-gray-400">Laden...</div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Nog geen facturen gegenereerd</p>
            <p className="text-xs text-gray-400 mt-1">Facturen worden automatisch aangemaakt als je een campagne hebt met &quot;BTW factuur bijvoegen&quot;</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Factuurnummer', 'Bestelling', 'Klant', 'Bedrag (incl. BTW)', 'Datum', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{inv.orderId}</td>
                  <td className="px-4 py-3 text-gray-700">{inv.customerName || '—'}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900">{fmtEur(inv.totalInclVat)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(inv.createdAt).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {inv.pdfUrl && (
                      <a href={inv.pdfUrl} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 text-xs text-[#0060e5] hover:underline font-medium">
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
