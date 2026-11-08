import React from 'react';
import { ShoppingBag, Heart, ShieldCheck, Phone, Mail, MapPin, Database } from 'lucide-react';
import { PlatformSettings } from '../types';

interface FooterProps {
  settings: PlatformSettings;
  onNavigate: (tab: string) => void;
  onOpenStoreRegister: () => void;
  onOpenSetupGuide: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onNavigate,
  onOpenStoreRegister,
  onOpenSetupGuide,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black text-white block">
                  {settings.site_title || 'කෑම සුරකින්නෝ'}
                </span>
                <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                  FOOD SAVERS SRI LANKA
                </span>
              </div>
            </div>

            <p className="text-slate-400 leading-relaxed max-w-sm">
              {settings.tagline || 'අඩු මිලට රසවත් කෑම අරන්, ආහාර අපතේ යාම වළක්වමු!'}
            </p>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <ShieldCheck className="w-4 h-4" />
                <span>100% කඩේදී මුදල් ගෙවීමේ ක්‍රමවේදය</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                අන්තර්ජාලයෙන් කාඩ්පත් ගෙවීම් අනවශ්‍යයි. කඩේට ගොස් QR කේතය පෙන්වා මුදල් ගෙවන්න.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              ප්‍රධාන පිටු
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  මුල් පිටුව
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  සියලුම කෑම පැකේජ
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('vouchers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  මගේ වවුචර් (My Vouchers)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('impact')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  අපගේ පාරිසරික බලපෑම
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStoreRegister}
                  className="text-amber-400 hover:text-amber-300 font-medium cursor-pointer"
                >
                  ඔබේ කඩය ලියාපදිංචි කරන්න
                </button>
              </li>
            </ul>
          </div>

          {/* Major Cities */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              ප්‍රධාන නගර
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>කොළඹ සහ තදාසන්න නගර</li>
              <li>මහනුවර සහ පේරාදෙණිය</li>
              <li>ගාල්ල සහ මාතර</li>
              <li>මීගමුව සහ ජා-ඇල</li>
              <li>කුරුණෑගල සහ රත්නපුර</li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider">
              සම්බන්ධීකරණය
            </h4>
            <div className="space-y-2 text-slate-400 text-xs">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings.support_phone || '+94 11 234 5678'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>{settings.support_email || 'hello@foodsavers.lk'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{settings.contact_address || 'කොළඹ 03, ශ්‍රී ලංකාව'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenSetupGuide}
                className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Supabase Database මාර්ගෝපදේශය</span>
              </button>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <p>
            © {new Date().getFullYear()} කෑම සුරකින්නෝ (Food Savers Sri Lanka). සියලු හිමිකම් ඇවිරිණි.
          </p>
          <div className="flex items-center gap-3">
            <span>කාල කලාපය: Asia/Colombo</span>
            <span>·</span>
            <span>මුදල් ඒකකය: ශ්‍රී ලංකා රුපියල් (LKR)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
