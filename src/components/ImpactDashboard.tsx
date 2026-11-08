import React from 'react';
import { 
  TreePine, 
  Coins, 
  CheckCircle2, 
  Store, 
  Heart, 
  Flame, 
  Leaf, 
  Scale, 
  Sparkles 
} from 'lucide-react';
import { Review } from '../types';

interface ImpactDashboardProps {
  stats: {
    totalSavingsLKR: number;
    totalFoodSavedKg: number;
    completedOrders: number;
    approvedStores: number;
    totalOrders: number;
  };
  reviews: Review[];
  onExploreFood: () => void;
}

export const ImpactDashboard: React.FC<ImpactDashboardProps> = ({
  stats,
  reviews,
  onExploreFood
}) => {
  // Approximate environmental metrics
  const co2AvoidedKg = Math.round(stats.totalFoodSavedKg * 2.5);
  const mealsRescued = Math.round(stats.totalFoodSavedKg / 0.45);

  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
            <Leaf className="w-3.5 h-3.5 text-emerald-600" />
            <span>අපගේ සාමූහික පාරිසරික සහ ආර්ථික බලපෑම</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight text-balance">
            ශ්‍රී ලංකාවේ ආහාර සුරකිමු, මුදල් ඉතිරි කරමු!
          </h2>
          <p className="text-base text-slate-600 leading-relaxed">
            "ඔබේ සෑම මිලදී ගැනීමකින්ම ආහාර අපතේ යාම අඩු කිරීමට දායක වේ."
          </p>
        </div>

        {/* 4 Primary Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Scale className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              සුරැකි ආහාර ප්‍රමාණය
            </p>
            <p className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {stats.totalFoodSavedKg.toLocaleString()} <span className="text-base font-bold text-slate-500">kg</span>
            </p>
            <p className="text-xs text-emerald-700 font-medium">
              කුණු කසල ගොඩවලට එක්වීම වැළැක්වූ ආහාර
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Coins className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              පාරිභෝගිකයින් ඉතිරි කළ මුදල
            </p>
            <p className="text-3xl font-black text-emerald-700 font-mono tabular-nums">
              රු. {stats.totalSavingsLKR.toLocaleString()}
            </p>
            <p className="text-xs text-amber-700 font-medium">
              සාමාන්‍ය වෙළඳපොළ මිලට වඩා 60% අඩුයි
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <TreePine className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              වළක්වාගත් කාබන් විමෝචනය
            </p>
            <p className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              ~{co2AvoidedKg.toLocaleString()} <span className="text-base font-bold text-slate-500">kg CO₂e</span>
            </p>
            <p className="text-xs text-sky-700 font-medium">
              පරිසරයට හානි වීම වැළැක්වීම
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-2">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Store className="w-6 h-6" />
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              එක්වූ වෙළඳසැල්
            </p>
            <p className="text-3xl font-black text-slate-900 font-mono tabular-nums">
              {stats.approvedStores}
            </p>
            <p className="text-xs text-purple-700 font-medium">
              ශ්‍රී ලංකාව පුරා බේකරි, කැෆේ සහ හෝටල්
            </p>
          </div>

        </div>

        {/* How It Works for Sri Lanka */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xs">
          <h3 className="text-xl font-bold text-slate-900 text-center mb-8">
            අපගේ පියවර 4 ක්‍රමවේදය (100% කඩේදී මුදල් ගෙවීම)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            <div className="space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-slate-900 text-sm">කෑම තෝරන්න</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                ඔබේ නගරයේ ප්‍රියතම බේකරි හෝ හෝටලයක ඇති අතිරික්ත ආහාර පැකේජයක් තෝරන්න.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-slate-900 text-sm">නොමිලේ වෙන්කරන්න</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                කාඩ්පත් හෝ Online ගෙවීම් නැත. ක්ෂණික QR වවුචරය ඔබේ දුරකථනයට ලබාගන්න.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-slate-900 text-sm">කඩයට යන්න</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                නියමිත වේලාව තුළ වෙළඳසැලට ගොස් ඔබේ QR සංකේතය පෙන්වන්න.
              </p>
            </div>

            <div className="space-y-2 text-center md:text-left">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto md:mx-0 shadow-sm">
                4
              </div>
              <h4 className="font-bold text-slate-900 text-sm">මුදල් ගෙවා කෑම ගන්න</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                වට්ටම් සහිත මුදල කඩයට අතින් ගෙවා රසවත් නැවුම් ආහාර රැගෙන යන්න.
              </p>
            </div>

          </div>
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 text-center">
              පාරිභෝගික අදහස් සහ සමාලෝචන
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviews.filter(r => r.status === 'published').map((rev) => (
                <div key={rev.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{rev.customer_name}</p>
                      <p className="text-xs text-emerald-700 font-semibold">{rev.store_name}</p>
                    </div>
                    <div className="flex items-center text-amber-500 font-bold text-sm">
                      {'★'.repeat(rev.rating)}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                  <p className="text-[11px] text-slate-400">
                    පැකේජය: {rev.deal_title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onExploreFood}
            className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            අදම ආහාර සුරැකීමට දායක වන්න
          </button>
        </div>

      </div>
    </div>
  );
};
