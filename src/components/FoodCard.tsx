import React from 'react';
import { Clock, MapPin, Star, ShoppingBag } from 'lucide-react';
import { FoodDeal } from '../types';

interface FoodCardProps {
  deal: FoodDeal;
  onReserve: (deal: FoodDeal) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ deal, onReserve }) => {
  const isAvailable = deal.quantity_available > 0 && deal.status === 'published';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col group">
      
      {/* Product Image Frame */}
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={deal.image_url}
          alt={deal.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          onError={(e) => {
            // Styled fallback if image fails
            (e.target as HTMLImageElement).src = '/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg';
          }}
        />

        {/* Discount Badge */}
        <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-md shadow-sm">
          {deal.discount_percentage}% OFF
        </div>

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs">
          {deal.quantity_available > 0 ? `ඉතිරි: ${deal.quantity_available}` : 'අවසන්'}
        </div>

        {/* Pickup time banner overlay */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>අද {deal.pickup_start} - {deal.pickup_end}</span>
          </div>
          <span className="text-[11px] text-slate-200">ලබාගැනීමේ වේලාව</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        
        <div>
          {/* Store & Location info */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700 truncate max-w-[70%]">
              {deal.store_name}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{deal.store_city || 'කොළඹ'}</span>
            </div>
          </div>

          {/* Deal Title */}
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
            {deal.title}
          </h3>

          {/* Description preview */}
          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
            {deal.description}
          </p>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] text-slate-400 line-through tabular-nums">
              රු. {deal.original_price.toLocaleString()}
            </div>
            <div className="text-lg font-extrabold text-slate-900 tabular-nums">
              රු. {deal.discounted_price.toLocaleString()}
            </div>
          </div>

          <button
            onClick={() => onReserve(deal)}
            disabled={!isAvailable}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
              isAvailable
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{isAvailable ? 'දැන් වෙන්කර ගන්න' : 'තොග අවසන්'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
