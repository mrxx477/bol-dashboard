'use client';
import { useState } from 'react';
import { Search, ShoppingCart } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { products } from '@/lib/mockData';

function StockLabel({ stock }: { stock: number }) {
  if (stock === 0) return <span className="text-xs font-semibold text-red-500">Uitverkocht</span>;
  if (stock < 10) return <span className="text-xs font-semibold text-red-400">Laag voorraad</span>;
  if (stock > 20) return <span className="text-xs font-semibold text-green-600">Op voorraad</span>;
  return <span className="text-xs font-semibold text-orange-500">Beperkt</span>;
}

export default function InventoryPage() {
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.titel.toLowerCase().includes(search.toLowerCase()) ||
    p.ean.includes(search)
  );

  return (
    <div className="p-6 md:p-8 max-w-[1400px]">
      <PageHeader title="Voorraad" subtitle="Huidig voorraadniveau per product" />

      <div className="relative mb-6 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          placeholder="Zoek product of EAN..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0060e5]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">Geen producten gevonden.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => {
            const low = product.voorraad < 10;
            const high = product.voorraad > 20;
            const stockColor =
              product.voorraad === 0 ? 'text-red-500' :
              low ? 'text-red-400' :
              high ? 'text-green-600' :
              'text-orange-500';

            return (
              <div
                key={product.ean}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-2xl">
                  📦
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                    {product.titel}
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">{product.ean}</p>
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className={`text-4xl font-bold tracking-tight ${stockColor}`}>
                      {product.voorraad}
                    </p>
                    <StockLabel stock={product.voorraad} />
                  </div>
                  {low && (
                    <button className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[#0060e5] hover:bg-blue-700 px-3 py-1.5 rounded-lg transition-colors">
                      <ShoppingCart className="w-3 h-3" />
                      Bijbestellen
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
