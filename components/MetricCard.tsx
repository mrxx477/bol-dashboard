'use client';
import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, LineChart, Bar, Line,
  XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { BarChart2, TrendingUp } from 'lucide-react';

interface MetricCardProps {
  title: string;
  total: string;
  data: { hour: string; [key: string]: number | string }[];
  dataKey: string;
  formatTick?: (val: number) => string;
}

export function MetricCard({ title, total, data, dataKey, formatTick }: MetricCardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');

  const tickFormatter = (val: string, index: number) => {
    const h = parseInt(val.split(':')[0], 10);
    return h % 2 === 0 ? val : '';
  };

  const yFormatter = (val: number) => (formatTick ? formatTick(val) : String(val));

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <span className="font-bold text-gray-900 text-sm">{title}</span>
        <div className="flex border border-gray-300 rounded overflow-hidden text-gray-500">
          <button
            onClick={() => setChartType('bar')}
            className={`px-2 py-1 ${chartType === 'bar' ? 'bg-gray-100 text-gray-800' : 'bg-white'}`}
            title="Staafdiagram"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setChartType('line')}
            className={`px-2 py-1 border-l border-gray-300 ${chartType === 'line' ? 'bg-gray-100 text-gray-800' : 'bg-white'}`}
            title="Lijndiagram"
          >
            <TrendingUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-1 text-2xl font-bold text-gray-900">{total}</div>

      <div className="px-1 pb-2">
        <ResponsiveContainer width="100%" height={160}>
          {chartType === 'bar' ? (
            <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yFormatter}
                width={36}
              />
              <Bar dataKey={dataKey} fill="#0000a4" radius={[1, 1, 0, 0]} maxBarSize={12} />
            </BarChart>
          ) : (
            <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 8, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={tickFormatter}
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 8, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={yFormatter}
                width={36}
              />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#0000a4"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="px-4 pb-2 flex items-center gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-[#0000a4]" />
        <span className="text-xs text-gray-500">Vandaag</span>
      </div>

      <div className="border-t border-gray-100 px-4 py-2">
        <a href="#" className="text-xs text-[#0000a4] hover:underline font-medium">
          &rsaquo; Meer info
        </a>
      </div>
    </div>
  );
}
