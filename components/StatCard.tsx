import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  iconColor?: string;
  trend?: number;
  trendLabel?: string;
}

export function StatCard({ label, value, icon: Icon, iconColor = 'text-[#0060e5]', trend, trendLabel }: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-5 py-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className={`p-2 rounded-lg bg-gray-50 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{value}</span>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            positive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
          }`}>
            {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {positive ? '+' : ''}{trend}%
            {trendLabel && <span className="text-gray-400 font-normal ml-0.5">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
