import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Store as StoreIcon, 
  MapPin, 
  User, 
  ShieldCheck, 
  Sparkles, 
  Menu, 
  X, 
  Database,
  Ticket,
  RefreshCw
} from 'lucide-react';
import { CityLocation, UserRole } from '../types';
import { isSupabaseConfigured } from '../lib/supabase';
import { storage } from '../lib/storage';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  cities: CityLocation[];
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onOpenStoreRegister: () => void;
  onOpenSetupGuide: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  selectedCity,
  setSelectedCity,
  cities,
  currentRole,
  onSwitchRole,
  onOpenStoreRegister,
  onOpenSetupGuide,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSupabaseReady = isSupabaseConfigured();

  return (
    <>
      {/* Top Notification Bar - Zero login details exposed, zero Supabase text */}
      <aside aria-label="පද්ධති දැනුම්දීම" className="bg-emerald-950 text-emerald-100 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between border-b border-emerald-900/60">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-400">මුදල් ගෙවීම:</span>
          <span>කඩේට ගිය පසු එහිදී මුදල් ගෙවන්න (Online Card අවශ්‍ය නැත)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSetupGuide}
              className="flex items-center gap-1.5 text-xs text-emerald-300 hover:text-emerald-100 transition-colors cursor-pointer"
              title="දත්ත ගබඩා තත්ත්වය සහ SQL සැකසුම්"
            >
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>සජීවීව සම්බන්ධයි</span>
              </span>
            </button>

            <button
              onClick={async () => {
                await storage.syncWithSupabase();
              }}
              className="p-1 hover:bg-emerald-900 rounded text-emerald-300 hover:text-white transition-all cursor-pointer"
              title="දත්ත සමමුහුර්ත කරන්න (Sync Now)"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${storage.isSyncing() ? 'animate-spin text-amber-400' : ''}`} />
            </button>
          </div>

          <span className="text-emerald-800">|</span>

          {/* Discrete Portal Navigation without exposing credentials */}
          {currentRole !== 'customer' ? (
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold bg-emerald-900/80 px-2 py-0.5 rounded text-[11px]">
                {currentRole === 'admin' ? 'පරිපාලක ප්‍රකාරය' : 'වෙළඳසැල් ප්‍රකාරය'}
              </span>
              <button
                onClick={() => onSwitchRole('customer')}
                className="text-emerald-200 hover:text-white text-[11px] underline cursor-pointer"
              >
                පාරිභෝගික මුහුණතට
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => onSwitchRole('merchant')}
                className="text-emerald-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                වෙළඳසැල් පිවිසුම
              </button>
              <span className="text-emerald-800">·</span>
              <button
                onClick={() => onSwitchRole('admin')}
                className="text-emerald-300 hover:text-white transition-colors cursor-pointer text-[11px]"
              >
                පරිපාලක
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-8 h-18">
            
            {/* Zone 1: Single text element Brand Title */}
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => setCurrentTab('home')}
                className="flex items-center gap-2.5 text-left focus:outline-none cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 block leading-tight">
                    කෑම සුරකින්නෝ
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 block -mt-0.5 tracking-wider">
                    FOOD SAVERS SRI LANKA
                  </span>
                </div>
              </button>

              {/* City Selector */}
              <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-slate-200 text-xs">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-50 text-slate-700 font-medium py-1 px-2 rounded-md border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">සියලුම නගර</option>
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.name_en})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Zone 2: 4-5 single-line clean navigation links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                onClick={() => setCurrentTab('home')}
                className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                  currentTab === 'home' ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600' : 'hover:text-slate-900'
                }`}
              >
                මුල් පිටුව
              </button>
              <button
                onClick={() => setCurrentTab('marketplace')}
                className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                  currentTab === 'marketplace' ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600' : 'hover:text-slate-900'
                }`}
              >
                සියලුම කෑම
              </button>
              <button
                onClick={() => setCurrentTab('vouchers')}
                className={`whitespace-nowrap transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                  currentTab === 'vouchers' ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600' : 'hover:text-slate-900'
                }`}
              >
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>මගේ වවුචර්</span>
              </button>
              <button
                onClick={() => setCurrentTab('impact')}
                className={`whitespace-nowrap transition-colors cursor-pointer py-1 ${
                  currentTab === 'impact' ? 'text-emerald-600 font-semibold border-b-2 border-emerald-600' : 'hover:text-slate-900'
                }`}
              >
                අපගේ බලපෑම
              </button>
              <button
                onClick={onOpenStoreRegister}
                className="whitespace-nowrap text-amber-700 hover:text-amber-800 transition-colors cursor-pointer flex items-center gap-1"
              >
                <StoreIcon className="w-4 h-4" />
                <span>කඩේ ලියාපදිංචිය</span>
              </button>
            </nav>

            {/* Zone 3: 1 primary action / Role Dashboard */}
            <div className="flex items-center gap-3 shrink-0">
              {currentRole === 'admin' ? (
                <button
                  onClick={() => setCurrentTab('admin')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-slate-900 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>පාලක පුවරුව</span>
                </button>
              ) : currentRole === 'merchant' ? (
                <button
                  onClick={() => setCurrentTab('merchant')}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-all cursor-pointer ${
                    currentTab === 'merchant'
                      ? 'bg-emerald-700 text-white shadow-md'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <StoreIcon className="w-4 h-4 text-emerald-600" />
                  <span>වෙළඳසැල් කළමනාකරණය</span>
                </button>
              ) : (
                <button
                  onClick={() => setCurrentTab('marketplace')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>කෑම සොයන්න</span>
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-600 hover:text-slate-900 focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3">
            <div className="mb-2">
              <label className="text-xs text-slate-500 font-medium block mb-1">නගරය තෝරන්න:</label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 text-slate-800 text-sm py-2 px-3 rounded-lg border border-slate-200"
              >
                <option value="all">සියලුම නගර</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} ({c.name_en})</option>
                ))}
              </select>
            </div>

            <button
              onClick={() => { setCurrentTab('home'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium ${
                currentTab === 'home' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
              }`}
            >
              මුල් පිටුව
            </button>
            <button
              onClick={() => { setCurrentTab('marketplace'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium ${
                currentTab === 'marketplace' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
              }`}
            >
              සියලුම කෑම
            </button>
            <button
              onClick={() => { setCurrentTab('vouchers'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium ${
                currentTab === 'vouchers' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
              }`}
            >
              මගේ වවුචර්
            </button>
            <button
              onClick={() => { setCurrentTab('impact'); setMobileMenuOpen(false); }}
              className={`w-full text-left py-2 px-3 rounded-md text-sm font-medium ${
                currentTab === 'impact' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-700'
              }`}
            >
              අපගේ බලපෑම
            </button>
            <button
              onClick={() => { onOpenStoreRegister(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-md text-sm font-medium text-amber-700 bg-amber-50"
            >
              ඔබේ කඩය ලියාපදිංචි කරන්න
            </button>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              {currentRole !== 'customer' ? (
                <button
                  onClick={() => { onSwitchRole('customer'); setMobileMenuOpen(false); }}
                  className="text-emerald-700 font-semibold underline"
                >
                  පාරිභෝගික මුහුණතට ආපසු යන්න
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full justify-between">
                  <span>ද්වාර පිවිසුම:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { onSwitchRole('merchant'); setMobileMenuOpen(false); }}
                      className="text-xs text-slate-600 hover:text-emerald-700 underline"
                    >
                      වෙළඳසැල
                    </button>
                    <span>·</span>
                    <button
                      onClick={() => { onSwitchRole('admin'); setMobileMenuOpen(false); }}
                      className="text-xs text-slate-600 hover:text-emerald-700 underline"
                    >
                      පරිපාලක
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
};
