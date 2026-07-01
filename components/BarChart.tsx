'use client';
import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

interface BarChartProps {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey: string;
  title: string;
  total: string;
  prefix?: string;
  color?: string;
}

export function BarChart({ data, dataKey, xKey, title, total, prefix = '', color = '#0060e5' }: BarChartProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</div>
      <div className="text-2xl font-bold text-gray-900 mb-4">{prefix}{total}</div>
      <ResponsiveContainer width="100%" height={140}>
        <ReBarChart data={data} barSize={22}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={{ fontSize: 11, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,.08)',
            }}
            cursor={{ fill: '#f9fafb' }}
            formatter={(v: unknown) => [`${prefix}${v}`, title]}
          />
          <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
        </ReBarChart>
      </ResponsiveContainer>
    </div>
  );
}
