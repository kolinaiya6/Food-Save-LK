import React from 'react';
import { Home, ShoppingBag, Ticket, BarChart2, ShieldCheck, Store } from 'lucide-react';
import { UserRole } from '../types';
import { storage } from '../lib/storage';

interface BottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentRole: UserRole;
  voucherCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  setCurrentTab,
  currentRole,
  voucherCount,
}) => {
  return (
    <nav 
      aria-label="ජංගම දුරකථන පහළ සංචලනය"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg"
    >
      
      <button
        onClick={() => setCurrentTab('home')}
        className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
          currentTab === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>මුල් පිටුව</span>
      </button>

      <button
        onClick={() => setCurrentTab('marketplace')}
        className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
          currentTab === 'marketplace' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <ShoppingBag className="w-5 h-5 mb-0.5" />
        <span>කෑම</span>
      </button>

      <button
        onClick={() => setCurrentTab('vouchers')}
        className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors relative cursor-pointer ${
          currentTab === 'vouchers' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <Ticket className="w-5 h-5 mb-0.5" />
        <span>වවුචර්</span>
        {voucherCount > 0 && (
          <span className="absolute top-1 right-2 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] flex items-center justify-center font-mono">
            {voucherCount}
          </span>
        )}
      </button>

      <button
        onClick={() => setCurrentTab('impact')}
        className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
          currentTab === 'impact' ? 'text-emerald-600 font-bold' : 'text-slate-500'
        }`}
      >
        <BarChart2 className="w-5 h-5 mb-0.5" />
        <span>බලපෑම</span>
      </button>

      {currentRole === 'admin' && storage.isAdminAuthenticated() ? (
        <button
          onClick={() => setCurrentTab('admin')}
          className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'admin' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <ShieldCheck className="w-5 h-5 mb-0.5" />
          <span>පාලක</span>
        </button>
      ) : currentRole === 'merchant' ? (
        <button
          onClick={() => setCurrentTab('merchant')}
          className={`flex flex-col items-center py-1.5 px-2 text-[10px] font-medium transition-colors cursor-pointer ${
            currentTab === 'merchant' ? 'text-emerald-600 font-bold' : 'text-slate-500'
          }`}
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span>වෙළඳසැල</span>
        </button>
      ) : null}

    </nav>
  );
};
