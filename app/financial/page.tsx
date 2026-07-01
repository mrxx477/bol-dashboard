import { Euro, TrendingUp, Receipt, Banknote } from 'lucide-react';
import { StatCard } from '@/components/StatCard';
import { BarChart } from '@/components/BarChart';
import { PageHeader } from '@/components/PageHeader';
import { financialMonthData, financialSummary } from '@/lib/mockData';

const fmtEur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

export default function FinancialPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      <PageHeader title="Financieel" subtitle="Omzet, kosten en uitbetalingen deze maand" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Omzet deze maand"
          value={fmtEur(financialSummary.omzetMaand)}
          icon={Euro}
        />
        <StatCard
          label="Bol commissie"
          value={fmtEur(financialSummary.commissieMaand)}
          icon={Receipt}
          iconColor="text-orange-500"
        />
        <StatCard
          label="BTW (21%)"
          value={fmtEur(financialSummary.btwMaand)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
        <StatCard
          label="Netto uitbetaling"
          value={fmtEur(financialSummary.uitbetalingEstimate)}
          icon={Banknote}
          iconColor="text-green-600"
        />
      </div>

      {/* Chart */}
      <div className="mb-8">
        <BarChart
          data={financialMonthData as unknown as Record<string, unknown>[]}
          dataKey="omzet"
          xKey="dag"
          title="Omzet per dag — juni 2026"
          total={fmtEur(financialSummary.omzetMaand)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900 text-sm">Dagelijks overzicht — juni 2026</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                {['Datum', 'Omzet', 'Commissie', 'BTW', 'Netto uitbetaling'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {financialMonthData.map((row, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-500 font-medium">{row.dag}</td>
                  <td className="px-5 py-3 font-semibold text-gray-900">{fmtEur(row.omzet)}</td>
                  <td className="px-5 py-3 text-orange-600">{fmtEur(row.commissie)}</td>
                  <td className="px-5 py-3 text-purple-600">{fmtEur(row.btw)}</td>
                  <td className="px-5 py-3 font-semibold text-green-600">{fmtEur(row.netto)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50 border-t-2 border-gray-200">
                <td className="px-5 py-3 font-bold text-gray-700">Totaal</td>
                <td className="px-5 py-3 font-bold text-gray-900">{fmtEur(financialSummary.omzetMaand)}</td>
                <td className="px-5 py-3 font-bold text-orange-600">{fmtEur(financialSummary.commissieMaand)}</td>
                <td className="px-5 py-3 font-bold text-purple-600">{fmtEur(financialSummary.btwMaand)}</td>
                <td className="px-5 py-3 font-bold text-green-600">{fmtEur(financialSummary.uitbetalingEstimate)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
