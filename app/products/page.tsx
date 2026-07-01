'use client';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { products } from '@/lib/mockData';
import type { Product } from '@/lib/mockData';

const fmtEur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

const columns = [
  {
    key: 'img',
    label: '',
    className: 'w-12',
    render: () => (
      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-lg">
        📦
      </div>
    ),
  },
  {
    key: 'ean',
    label: 'EAN',
    render: (row: Product) => (
      <span className="font-mono text-xs text-gray-400">{row.ean}</span>
    ),
  },
  {
    key: 'titel',
    label: 'Titel',
    render: (row: Product) => (
      <span className="font-medium text-gray-900">{row.titel}</span>
    ),
  },
  {
    key: 'prijs',
    label: 'Prijs',
    render: (row: Product) => fmtEur(row.prijs),
  },
  {
    key: 'bolKosten',
    label: 'Bol kosten',
    render: (row: Product) => (
      <span className="text-gray-500">{fmtEur(row.bolKosten)}</span>
    ),
  },
  {
    key: 'marge',
    label: 'Marge',
    render: (row: Product) => (
      <span className={`font-semibold ${row.marge >= 0 ? 'text-green-600' : 'text-red-500'}`}>
        {row.marge.toFixed(1)}%
      </span>
    ),
  },
  {
    key: 'voorraad',
    label: 'Voorraad',
    render: (row: Product) =>
      row.voorraad < 10 ? (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600">
          {row.voorraad} — laag
        </span>
      ) : (
        <span className="font-medium">{row.voorraad}</span>
      ),
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: Product) => <StatusBadge status={row.status} />,
  },
];

export default function ProductsPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      <PageHeader
        title="Producten"
        subtitle="Jouw actieve producten op bol.com"
      />
      <DataTable
        data={products as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKeys={['titel', 'ean']}
        pageSize={10}
        emptyMessage="Geen producten gevonden."
      />
    </div>
  );
}
