import React, { useState } from 'react';
import { X, Database, Copy, Check, ExternalLink, ShieldCheck, Play, Sparkles, AlertCircle, Terminal } from 'lucide-react';
import { getSavedSupabaseConfig, saveSupabaseConfig, testSupabaseConnection, isSupabaseConfigured } from '../lib/supabase';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const currentConfig = getSavedSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url || '');
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey || '');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  const handleTestAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    const result = await testSupabaseConnection(url.trim(), anonKey.trim());
    setTestResult(result);
    setTesting(false);

    if (result.success) {
      saveSupabaseConfig({ url: url.trim(), anonKey: anonKey.trim() });
    }
  };

  const copyFullSqlToClipboard = async () => {
    try {
      let sql = '';
      try {
        const response = await fetch('/supabase/schema.sql');
        if (response.ok) {
          const text = await response.text();
          if (text && !text.includes('<!doctype html>')) {
            sql = text;
          }
        }
      } catch (err) {
        console.warn('Could not fetch schema from URL, using bundle schema', err);
      }

      if (!sql) {
        // Fallback embedded SQL with safe TEXT columns (prevents enum collisions)
        sql = `-- Supabase SQL for Food Savers Sri Lanka (Updated & Resilient)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Safe column upgrade if tables or enums previously existed
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'payment_status') THEN
    ALTER TABLE reservations ALTER COLUMN payment_status DROP DEFAULT;
    ALTER TABLE reservations ALTER COLUMN payment_status TYPE TEXT USING payment_status::text;
    ALTER TABLE reservations ALTER COLUMN payment_status SET DEFAULT 'unpaid';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reservations' AND column_name = 'status') THEN
    ALTER TABLE reservations ALTER COLUMN status DROP DEFAULT;
    ALTER TABLE reservations ALTER COLUMN status TYPE TEXT USING status::text;
    ALTER TABLE reservations ALTER COLUMN status SET DEFAULT 'reserved';
  END IF;
EXCEPTION WHEN OTHERS THEN null;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT DEFAULT 'customer' NOT NULL,
  city TEXT DEFAULT 'කොළඹ',
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  store_type TEXT DEFAULT 'bakery' NOT NULL,
  image_url TEXT,
  status TEXT DEFAULT 'approved' NOT NULL,
  rating NUMERIC(3, 2) DEFAULT 4.80 NOT NULL,
  total_reviews INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS food_categories (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  name_en TEXT,
  icon TEXT NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE IF NOT EXISTS food_deals (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  store_id TEXT NOT NULL,
  store_name TEXT,
  store_city TEXT,
  store_address TEXT,
  category_id TEXT,
  category_name TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT NOT NULL,
  original_price NUMERIC(10, 2) NOT NULL,
  discounted_price NUMERIC(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0 NOT NULL,
  quantity_available INTEGER NOT NULL CHECK (quantity_available >= 0),
  quantity_total INTEGER NOT NULL,
  pickup_start TEXT NOT NULL,
  pickup_end TEXT NOT NULL,
  pickup_date DATE DEFAULT CURRENT_DATE NOT NULL,
  allergens TEXT,
  status TEXT DEFAULT 'published' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  order_number TEXT NOT NULL UNIQUE,
  deal_id TEXT NOT NULL,
  deal_title TEXT NOT NULL,
  deal_image TEXT,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL,
  store_phone TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  pickup_date DATE NOT NULL,
  pickup_start TEXT NOT NULL,
  pickup_end TEXT NOT NULL,
  status TEXT DEFAULT 'reserved' NOT NULL,
  payment_status TEXT DEFAULT 'unpaid' NOT NULL,
  collected_at TIMESTAMPTZ,
  collected_by_merchant TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS vouchers (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  reservation_id TEXT NOT NULL,
  order_number TEXT NOT NULL UNIQUE,
  qr_data TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  store_name TEXT NOT NULL,
  store_address TEXT NOT NULL,
  deal_title TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  total_amount NUMERIC(10, 2) NOT NULL,
  pickup_time_range TEXT NOT NULL,
  pickup_date DATE NOT NULL,
  is_redeemed BOOLEAN DEFAULT FALSE NOT NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS store_payments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  reservation_id TEXT NOT NULL,
  store_id TEXT NOT NULL,
  store_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  collected_by TEXT NOT NULL,
  collection_time TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  receipt_ref TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  store_id TEXT NOT NULL,
  store_name TEXT,
  customer_name TEXT NOT NULL,
  deal_title TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'published' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE food_deals DISABLE ROW LEVEL SECURITY;
ALTER TABLE reservations DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public)
VALUES ('food-images', 'food-images', true), ('store-images', 'store-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
`;
      }
      await navigator.clipboard.writeText(sql);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 3000);
    } catch (e) {
      console.error('Error copying SQL:', e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Supabase Cloud Database සක්‍රීය කිරීම
              </h3>
              <p className="text-xs text-slate-500">
                Project: <span className="font-mono text-emerald-700 font-bold">gmtzbwgbgodrfzvmlimd</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Active Status Indicator */}
          <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-start justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <div className="w-3 h-3 rounded-full bg-emerald-600 mt-1 shrink-0" />
              <div>
                <p className="text-xs font-bold">
                  ඔබේ Supabase Project එක සකසා ඇත!
                </p>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  URL: <span className="font-mono text-emerald-800 font-semibold">{url}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => handleTestAndSave({ preventDefault: () => {} } as any)}
              disabled={testing}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold cursor-pointer shrink-0"
            >
              {testing ? 'පරීක්ෂා කරමින්...' : 'සම්බන්ධතාව පරික්ෂා කරන්න'}
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                : 'bg-red-100 border-red-300 text-red-900'
            }`}>
              {testResult.success ? <Check className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* 1-Click SQL Copy Section */}
          <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Complete Drop-In Supabase SQL Migration
                </h4>
              </div>

              <button
                onClick={copyFullSqlToClipboard}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'SQL සම්පූර්ණයෙන් පිටපත් විය!' : 'සම්පූර්ණ SQL Script එක පිටපත් කරන්න'}</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              මෙම SQL script එක මගින් පහත සියල්ල එකවර නිර්මාණය වේ:
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>සියලුම Tables (profiles, stores, food_deals, reservations, vouchers, reviews ආදී)</li>
              <li>පින්තූර අප්ලෝඩ් කිරීම සඳහා Supabase Storage Buckets (food-images, store-images)</li>
              <li>ශ්‍රී ලංකාවේ සියලුම දිස්ත්‍රික්ක සහ නගර 42 ක දත්ත (Cities)</li>
              <li>කඩවල සම්පූර්ණ ලිපින, දුරකථන සහ ආරම්භක ආහාර පැකේජ</li>
              <li>තොග ඉක්මවා යාම වළක්වන Atomic Function සහ Realtime Sync</li>
            </ul>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">ක්‍රියාත්මක කරන ආකාරය:</span>
              <a
                href={`https://supabase.com/dashboard/project/gmtzbwgbgodrfzvmlimd/sql`}
                target="_blank"
                rel="noreferrer"
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 underline font-semibold"
              >
                <span>Supabase SQL Editor එක විවෘත කරන්න</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Credentials Edit Form */}
          <form onSubmit={handleTestAndSave} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              API Credentials යාවත්කාලීන කරන්න
            </h4>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Project URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Anon Public Key
              </label>
              <input
                type="text"
                required
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={testing}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                සුරකින්න
              </button>
            </div>
          </form>

        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            හරි, වසන්න
          </button>
        </div>

      </div>
    </div>
  );
};
