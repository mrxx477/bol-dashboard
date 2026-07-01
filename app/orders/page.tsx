'use client';
import { DataTable } from '@/components/DataTable';
import { StatusBadge } from '@/components/StatusBadge';
import { PageHeader } from '@/components/PageHeader';
import { orders } from '@/lib/mockData';
import type { Order } from '@/lib/mockData';

const fmtEur = (n: number) =>
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(n);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' });

const columns = [
  {
    key: 'bestelnummer',
    label: 'Bestelnummer',
    render: (row: Order) => (
      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
        {row.bestelnummer}
      </span>
    ),
  },
  {
    key: 'datum',
    label: 'Datum',
    render: (row: Order) => <span className="text-gray-500">{fmtDate(row.datum)}</span>,
  },
  {
    key: 'productnaam',
    label: 'Productnaam',
    render: (row: Order) => <span className="font-medium text-gray-900">{row.productnaam}</span>,
  },
  {
    key: 'aantal',
    label: 'Aantal',
    className: 'text-center',
    render: (row: Order) => <span className="font-medium">{row.aantal}</span>,
  },
  {
    key: 'bedrag',
    label: 'Bedrag',
    render: (row: Order) => <span className="font-semibold text-gray-900">{fmtEur(row.bedrag)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (row: Order) => <StatusBadge status={row.status} />,
  },
];

export default function OrdersPage() {
  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      <PageHeader
        title="Bestellingen"
        subtitle="Overzicht van al jouw bol.com bestellingen"
      />
      <DataTable
        data={orders as unknown as Record<string, unknown>[]}
        columns={columns}
        searchKeys={['productnaam', 'bestelnummer']}
        filterOptions={{
          key: 'status',
          options: [
            { value: 'open', label: 'Open' },
            { value: 'verzonden', label: 'Verzonden' },
            { value: 'geannuleerd', label: 'Geannuleerd' },
          ],
        }}
        pageSize={10}
        emptyMessage="Geen bestellingen gevonden."
      />
    </div>
  );
}
