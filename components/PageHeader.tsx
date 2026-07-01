'use client';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const [spinning, setSpinning] = useState(false);

  const handleRefresh = () => {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 1200);
  };

  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <button
        onClick={handleRefresh}
        className="flex items-center gap-2 text-xs text-gray-400 hover:text-gray-600 transition-colors shrink-0 mt-1"
      >
        <RefreshCw className={`w-3.5 h-3.5 transition-all duration-700 ${spinning ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Vernieuwen</span>
      </button>
    </div>
  );
}
