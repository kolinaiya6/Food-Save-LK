import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  SlidersHorizontal, 
  RotateCcw,
  Sparkles,
  ShoppingBag
} from 'lucide-react';
import { FoodDeal, FoodCategory, CityLocation } from '../types';
import { FoodCard } from './FoodCard';

interface MarketplaceProps {
  deals: FoodDeal[];
  categories: FoodCategory[];
  cities: CityLocation[];
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  onReserve: (deal: FoodDeal) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({
  deals,
  categories,
  cities,
  selectedCity,
  setSelectedCity,
  onReserve,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'default' | 'price_low' | 'discount_high' | 'stock'>('default');
  const [maxPrice, setMaxPrice] = useState<number>(3000);

  // Filter deals in real-time
  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      // Status check
      if (deal.status !== 'published' || deal.quantity_available <= 0) return false;

      // City filter
      if (selectedCity !== 'all' && deal.store_city !== selectedCity) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && deal.category_id !== selectedCategory) {
        return false;
      }

      // Price filter
      if (deal.discounted_price > maxPrice) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = deal.title.toLowerCase().includes(query);
        const matchesStore = deal.store_name?.toLowerCase().includes(query);
        const matchesDesc = deal.description.toLowerCase().includes(query);
        const matchesCity = deal.store_city?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesStore && !matchesDesc && !matchesCity) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_low') {
        return a.discounted_price - b.discounted_price;
      }
      if (sortBy === 'discount_high') {
        return b.discount_percentage - a.discount_percentage;
      }
      if (sortBy === 'stock') {
        return b.quantity_available - a.quantity_available;
      }
      return 0;
    });
  }, [deals, selectedCity, selectedCategory, maxPrice, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCity('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setMaxPrice(3000);
    setSortBy('default');
  };

  return (
    <section id="marketplace-section" className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Marketplace Title & Search Bar */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>නැවුම් අතිරික්ත ආහාර ගනුදෙනු</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                අද දින ලබාගත හැකි කෑම පැකේජ
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                කඩේට ගොස් මුදල් ගෙවා ලබාගත හැකි රසවත් ආහාර {filteredDeals.length} ක්
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="කෑම හෝ කඩේ නම සොයන්න..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  මකන්න
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Chips/Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              සියලුම වර්ග
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Secondary Filter Bar: City & Sorting */}
          <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              
              {/* City selector */}
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-600 font-medium">නගරය:</span>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                >
                  <option value="all">සියලුම නගර</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price filter */}
              <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-200">
                <span className="text-slate-600 font-medium">උපරිම මිල:</span>
                <span className="font-mono font-bold text-emerald-700">රු. {maxPrice}</span>
                <input
                  type="range"
                  min="300"
                  max="3000"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-24 accent-emerald-600 cursor-pointer"
                />
              </div>

            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">පිළිවෙල:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 text-slate-800 font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
              >
                <option value="default">පෙරනිමි</option>
                <option value="price_low">අඩුම මිලෙන්</option>
                <option value="discount_high">වැඩිම වට්ටමෙන්</option>
                <option value="stock">වැඩිම තොග ප්‍රමාණයෙන්</option>
              </select>

              {(selectedCity !== 'all' || selectedCategory !== 'all' || searchQuery || maxPrice < 3000) && (
                <button
                  onClick={resetFilters}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="ෆිල්ටර් ඉවත් කරන්න"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {filteredDeals.map((deal) => (
              <FoodCard key={deal.id} deal={deal} onReserve={onReserve} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              කෑම පැකේජ හමු නොවීය
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              ඔබ තේරූ නගරය හෝ කාණ්ඩය යටතේ මේ මොහොතේ ලබාගත හැකි පැකේජ නොමැත. කරුණාකර වෙනත් නගරයක් තෝරන්න හෝ ෆිල්ටර් යළි සකසන්න.
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              සියලුම නගරවල කෑම පෙන්වන්න
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
