'use client';
import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, Copy, ExternalLink, Info, Maximize2 } from 'lucide-react';
import { MetricCard } from '@/components/MetricCard';
import { topVerkocht, topOmzet } from '@/lib/mockData';
import { apiGet } from '@/lib/api';

const fmtEur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

const PERIODE_OPTIONS = [
  { label: 'Vandaag', value: 'vandaag' },
  { label: 'Gisteren', value: 'gisteren' },
  { label: 'Afgelopen 7 dagen', value: '7d' },
  { label: 'Afgelopen 28 dagen', value: '28d' },
];

const PRODUCTGROEPEN = ['Alle productgroepen', 'Weerstandsbanden', 'Creditcardhouders', 'Portemonnees'];

const EMPTY_HOURLY = Array.from({ length: 24 }, (_, h) => ({
  hour: `${String(h).padStart(2, '0')}:00`,
  bestellingen: 0, omzet: 0, verkocht: 0,
}));

interface DayStats {
  bestellingen: number;
  omzet: number;
  verkocht: number;
  hourlyData: typeof EMPTY_HOURLY;
}

export default function DashboardPage() {
  const [periode, setPeriode] = useState('vandaag');
  const [periodeOpen, setPeriodeOpen] = useState(false);
  const [vergelijken, setVergelijken] = useState(false);
  const [productgroep, setProductgroep] = useState('Alle productgroepen');
  const [productgroepOpen, setProductgroepOpen] = useState(false);
  const [land, setLand] = useState<'nl' | 'be'>('nl');

  const [stats, setStats] = useState<DayStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState('');

  const today = new Date().toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const yesterday = new Date(Date.now() - 86400000).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const periodeDisplay = periode === 'vandaag' ? today : periode === 'gisteren' ? yesterday : periode === '7d' ? '7 dagen' : '28 dagen';

  const loadStats = useCallback(async () => {
    setLoadingStats(true);
    setStatsError('');
    try {
      const data = await apiGet<DayStats>('/api/orders/stats/today');
      setStats(data);
    } catch (e: any) {
      setStatsError(e.message);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  const chartData = stats?.hourlyData ?? EMPTY_HOURLY;
  const bestellingen = stats?.bestellingen ?? 0;
  const omzet = stats?.omzet ?? 0;
  const verkocht = stats?.verkocht ?? 0;

  const periodeLabel = PERIODE_OPTIONS.find(o => o.value === periode)?.label ?? 'Vandaag';

  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 bg-white border border-gray-200 rounded-lg px-4 py-3">
        {/* Periode */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Periode <Info className="w-3 h-3 text-gray-400" />
          </span>
          <div className="relative">
            <button
              onClick={() => { setPeriodeOpen(o => !o); setProductgroepOpen(false); }}
              className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 hover:border-gray-400 min-w-[130px] justify-between"
            >
              <span>{periodeDisplay}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {periodeOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-52 py-1">
                {PERIODE_OPTIONS.map(opt => (
                  <button key={opt.value} onClick={() => { setPeriode(opt.value); setPeriodeOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${opt.value === periode ? 'font-semibold text-[#0000a4]' : 'text-gray-700'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* t.o.v. */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">t.o.v.</span>
          <button onClick={() => setVergelijken(v => !v)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${vergelijken ? 'bg-[#0000a4]' : 'bg-gray-300'}`}>
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${vergelijken ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </button>
          <span className={`border border-gray-300 rounded px-3 py-1.5 text-sm min-w-[110px] text-center ${vergelijken ? 'text-gray-800' : 'text-gray-400 bg-gray-50'}`}>
            {yesterday}
          </span>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Productgroepen */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Productgroepen <Info className="w-3 h-3 text-gray-400" />
          </span>
          <div className="relative">
            <button onClick={() => { setProductgroepOpen(o => !o); setPeriodeOpen(false); }}
              className="flex items-center gap-2 border border-gray-300 rounded px-3 py-1.5 text-sm text-gray-800 hover:border-gray-400 min-w-[180px] justify-between">
              <span>{productgroep}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
            </button>
            {productgroepOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 w-56 py-1">
                {PRODUCTGROEPEN.map(g => (
                  <button key={g} onClick={() => { setProductgroep(g); setProductgroepOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${g === productgroep ? 'font-semibold text-[#0000a4]' : 'text-gray-700'}`}>
                    {g}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="h-5 w-px bg-gray-200" />

        {/* Land */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
            Land <Info className="w-3 h-3 text-gray-400" />
          </span>
          <div className="flex border border-gray-300 rounded overflow-hidden text-sm">
            <button onClick={() => setLand('nl')}
              className={`px-4 py-1.5 ${land === 'nl' ? 'bg-[#0000a4] text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              Nederland
            </button>
            <button onClick={() => setLand('be')}
              className={`px-4 py-1.5 border-l border-gray-300 ${land === 'be' ? 'bg-[#0000a4] text-white font-medium' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>
              België
            </button>
          </div>
        </div>

        <div className="ml-auto">
          <button onClick={loadStats} className="p-1.5 border border-gray-300 rounded hover:bg-gray-50" title="Vernieuwen">
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {statsError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
          Kon geen data laden: {statsError}
        </div>
      )}

      {/* 3 Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard
          title="Bestellingen"
          total={loadingStats ? '...' : String(bestellingen)}
          data={chartData as { hour: string; [key: string]: number | string }[]}
          dataKey="bestellingen"
        />
        <MetricCard
          title="Omzet"
          total={loadingStats ? '...' : fmtEur(omzet)}
          data={chartData as { hour: string; [key: string]: number | string }[]}
          dataKey="omzet"
        />
        <MetricCard
          title="Verkocht"
          total={loadingStats ? '...' : String(verkocht)}
          data={chartData as { hour: string; [key: string]: number | string }[]}
          dataKey="verkocht"
        />
      </div>

      {/* Product ranking tables — still mock until rankings API is added */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { title: 'Meest verkocht', subtitle: `Meest verkochte artikelen — ${periodeLabel}`, rows: topVerkocht, isOmzet: false },
          { title: 'Meest omzet', subtitle: `Artikelen met het meeste omzet — ${periodeLabel}`, rows: topOmzet, isOmzet: true },
        ].map(({ title, subtitle, rows, isOmzet }) => (
          <div key={title} className="bg-white rounded-lg border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">{title}</h2>
              <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500 w-14">Score</th>
                  <th className="text-left px-2 py-2 text-xs font-semibold text-gray-500">Artikel</th>
                  <th className="text-right px-4 py-2 text-xs font-semibold text-gray-500">Volume</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.ean} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">{row.rank}</td>
                    <td className="px-2 py-3">
                      <div className="flex items-start gap-2.5">
                        <div className="w-9 h-9 rounded bg-gray-100 flex items-center justify-center text-base flex-shrink-0">{row.emoji}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900 text-xs truncate max-w-[160px]">{row.artikel}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="text-xs text-gray-400 font-mono">EAN: {row.ean}</span>
                            <button onClick={() => navigator.clipboard.writeText(row.ean)} className="text-gray-400 hover:text-gray-600">
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">{row.categorie}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {isOmzet ? fmtEur(row.volume) : row.volume}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100">
              <a href="/products" className="text-xs text-[#0000a4] hover:underline font-medium">&rsaquo; Bekijk alles</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
