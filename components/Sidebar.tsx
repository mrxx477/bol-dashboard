'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard, ShoppingBag, Package, Layers, Euro,
  Menu, X, Store, Mail, FileText, Settings, Zap, LogOut,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const overviewItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Bestellingen', icon: ShoppingBag },
  { href: '/products', label: 'Producten', icon: Package },
  { href: '/inventory', label: 'Voorraad', icon: Layers },
  { href: '/financial', label: 'Financieel', icon: Euro },
];

const toolItems = [
  { href: '/campaigns', label: 'Campagnes', icon: Zap },
  { href: '/email', label: 'E-mail Versturen', icon: Mail },
  { href: '/facturen', label: 'Facturen', icon: FileText },
  { href: '/instellingen', label: 'Instellingen', icon: Settings },
];

function NavSection({ title, items, pathname, onClose }: {
  title: string;
  items: typeof overviewItems;
  pathname: string;
  onClose?: () => void;
}) {
  return (
    <div className="mb-1">
      <div className="px-3 pt-4 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{title}</span>
      </div>
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={`flex items-center gap-3 mx-1 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active
                ? 'bg-[#0060e5] text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-[18px] h-[18px] shrink-0" />
            {label}
          </Link>
        );
      })}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { email, logout } = useAuth();

  if (pathname === '/login') return null;

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-[#0060e5] flex items-center justify-center shrink-0">
          <Store className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-[15px] tracking-tight">BolBot</span>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        <NavSection title="Overzicht" items={overviewItems} pathname={pathname} onClose={() => setOpen(false)} />
        <NavSection title="Tools" items={toolItems} pathname={pathname} onClose={() => setOpen(false)} />
      </nav>

      {email && (
        <div className="border-t border-white/10 px-4 py-3">
          <div className="text-xs text-slate-500 truncate mb-2">{email}</div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-white text-xs transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Uitloggen
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-[#0f172a] h-screen shrink-0">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-[#0f172a] flex items-center justify-between px-4 h-14 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#0060e5] flex items-center justify-center">
            <Store className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold text-sm">BolBot</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white p-1">
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-30">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute top-14 left-0 bottom-0 w-56 bg-[#0f172a] flex flex-col">
            <NavContent />
          </div>
        </div>
      )}

      {/* Mobile spacer */}
      <div className="md:hidden h-14 w-full" />
    </>
  );
}
