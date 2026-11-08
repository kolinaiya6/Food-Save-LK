import React from 'react';
import { ArrowRight, Store, ShieldCheck, HeartHandshake, Sparkles, CheckCircle2 } from 'lucide-react';

interface HeroProps {
  onExploreFood: () => void;
  onRegisterStore: () => void;
  stats: {
    totalSavingsLKR: number;
    totalFoodSavedKg: number;
    approvedStores: number;
    completedOrders: number;
  };
}

export const Hero: React.FC<HeroProps> = ({
  onExploreFood,
  onRegisterStore,
  stats
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-white to-slate-50 pt-8 pb-16 lg:py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Value proposition kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ශ්‍රී ලංකාවේ ප්‍රථම අතිරික්ත ආහාර හුවමාරු වෙළඳපොළ</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
              හොඳම කෑම, <span className="text-emerald-600 underline decoration-emerald-300 underline-offset-8">අඩුම මිලට!</span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              ඔබේ ප්‍රියතම වෙළඳසැල්වල ඉතිරිවන රසවත් ආහාර අඩු මිලට මිලදී ගන්න. ඔබත් ආහාර අපතේ යාම වළක්වන්න දායක වන්න.
            </p>

            {/* Highlighted in-store payment guarantee */}
            <div className="bg-amber-50/90 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm text-amber-900">
                <p className="font-bold text-amber-950 mb-0.5">Online ගෙවීම් හෝ කාඩ්පත් කිසිවක් අවශ්‍ය නැත!</p>
                <p className="text-amber-800/90 leading-relaxed">
                  නොමිලේ Reservation කර QR වවුචරය ලබාගන්න. කඩයට ගොස් වවුචරය පෙන්වා එම මොහොතේදීම මුදල් ගෙවා කෑම එකතු කරගන්න.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreFood}
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <span>කෑම සොයන්න</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onRegisterStore}
                className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs hover:border-slate-400 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Store className="w-4 h-4 text-emerald-600" />
                <span>ඔබේ කඩය ලියාපදිංචි කරන්න</span>
              </button>
            </div>

          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 aspect-4/3 sm:aspect-16/10 lg:aspect-4/3">
              <img
                src="/src/assets/images/hero_sri_lanka_food_1794103809164.jpg"
                alt="ශ්‍රී ලංකාවේ නැවුම් සහ රසවත් ආහාර එකතුව"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5 text-white">
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                  කෑම සුරකින්නෝ · කොළඹ, නුවර, ගාල්ල
                </span>
                <p className="text-sm sm:text-base font-bold leading-tight">
                  බේකරි, කැෆේ සහ හෝටල්වල රසවත් ආහාර 50% - 70% දක්වා අඩු මිලට!
                </p>
              </div>
            </div>

            {/* Floating Trust Badge */}
            <div className="hidden sm:flex absolute -bottom-5 -left-5 bg-white rounded-xl p-3 shadow-lg border border-slate-100 items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">100% ක්ෂණික සහතිකය</p>
                <p className="text-[11px] text-slate-500">කඩයේදී සත්‍යාපනය කර මුදල් ගෙවන්න</p>
              </div>
            </div>
          </div>

        </div>

        {/* Real Database Statistics Strip */}
        <div className="mt-16 pt-8 border-t border-slate-200/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono tabular-nums">
                රු. {stats.totalSavingsLKR.toLocaleString()}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                සුරැකි මුදල (LKR)
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono tabular-nums">
                {stats.totalFoodSavedKg.toLocaleString()} kg
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                සුරැකි ආහාර ප්‍රමාණය
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {stats.approvedStores}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                ලියාපදිංචි වෙළඳසැල්
              </p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                {stats.completedOrders}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                සම්පූර්ණ කළ ඇණවුම්
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
