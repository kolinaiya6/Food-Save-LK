import React, { useState, useRef } from 'react';
import { X, Store, CheckCircle, AlertCircle, Building2, MapPin, Clock, Upload, Camera } from 'lucide-react';
import { CityLocation, Store as StoreType } from '../types';
import { uploadImage } from '../lib/supabase';

interface StoreRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: CityLocation[];
  onRegisterStore: (storeData: Omit<StoreType, 'id' | 'created_at' | 'rating' | 'total_reviews'>) => StoreType;
}

export const StoreRegisterModal: React.FC<StoreRegisterModalProps> = ({
  isOpen,
  onClose,
  cities,
  onRegisterStore,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState(cities[0]?.name || 'කොළඹ');
  const [address, setAddress] = useState('');
  const [storeType, setStoreType] = useState<StoreType['store_type']>('bakery');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('20:30');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await uploadImage(file, 'store-images');
      setImageUrl(url);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || !ownerName.trim() || !phone.trim() || !address.trim()) {
      setErrorMsg('කරුණාකර අනිවාර්ය තොරතුරු සියල්ල සම්පූර්ණ කරන්න.');
      return;
    }

    try {
      onRegisterStore({
        name: name.trim(),
        owner_name: ownerName.trim(),
        phone: phone.trim(),
        email: email.trim() || 'store@foodsavers.lk',
        city,
        address: address.trim(),
        store_type: storeType,
        image_url: imageUrl,
        status: 'pending', // Requires admin approval
        opening_time: openingTime,
        closing_time: closingTime,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg('ලියාපදිංචි කිරීමේදී දෝෂයක් ඇති විය.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ඔබේ වෙළඳසැල ලියාපදිංචි කරන්න
              </h3>
              <p className="text-xs text-slate-500">
                ඉතිරිවන ආහාර අපතේ නොයවා අමතර ආදායමක් උපයන්න
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

        {isSuccess ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-slate-900">
              ලියාපදිංචි ඉල්ලීම සාර්ථකව ලැබුණි!
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              ඔබේ ආයතනයේ තොරතුරු පරිපාලක (Admin) වෙත යොමු කර ඇත. පරිපාලක විසින් අනුමත කළ විගස ඔබට ආහාර පැකේජ පළ කළ හැක.
            </p>
            <div className="pt-4">
              <button
                onClick={() => {
                  setIsSuccess(false);
                  onClose();
                }}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
              >
                හරි, ස්තූතියි
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
            
            {/* Store Photo Upload */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                ආයතනයේ ඡායාරූපය (Store Photo Upload)
              </label>
              
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center bg-slate-50/70">
                {imageUrl && (
                  <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-2 border border-slate-200">
                    <img src={imageUrl} alt="Store Preview" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'අප්ලෝඩ් වෙමින්...' : 'ඡායාරූපය Upload කරන්න'}</span>
                </button>
              </div>
            </div>

            {/* Store Name & Owner Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ආයතනයේ නම *
                </label>
                <input
                  type="text"
                  required
                  placeholder="උදා: සෙන්ට්‍රල් බේකර්ස්"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  හිමිකරුගේ නම *
                </label>
                <input
                  type="text"
                  required
                  placeholder="උදා: නිහාල් පෙරේරා"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Phone & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  දුරකථන අංකය *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0112345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ඊමේල් ලිපිනය *
                </label>
                <input
                  type="email"
                  required
                  placeholder="bakery@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
            </div>

            {/* City & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  නගරය (සියලුම දිස්ත්‍රික්ක) *
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  {cities.map((c) => (
                    <option key={c.id} value={c.name}>{c.name} ({c.name_en})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  ආයතනයේ වර්ගය *
                </label>
                <select
                  value={storeType}
                  onChange={(e) => setStoreType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                >
                  <option value="bakery">බේකරි සහ පේස්ට්‍රි</option>
                  <option value="restaurant">අවන්හල් / හෝටල්</option>
                  <option value="supermarket">සුපිරි වෙළඳසැල්</option>
                  <option value="cafe">කැෆේ සහ අතුරුපස</option>
                  <option value="grocery">සිල්ලර සහ පළතුරු කඩ</option>
                </select>
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                සම්පූර්ණ වීදි ලිපිනය (Address) *
              </label>
              <input
                type="text"
                required
                placeholder="නො. 45, ගාලු පාර, කොල්ලුපිටිය, කොළඹ 03"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
            </div>

            {/* Operating Times */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  විවෘත වේලාව
                </label>
                <input
                  type="time"
                  value={openingTime}
                  onChange={(e) => setOpeningTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  වසන වේලාව
                </label>
                <input
                  type="time"
                  value={closingTime}
                  onChange={(e) => setClosingTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600 font-mono"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                ලියාපදිංචි ඉල්ලීම යොමු කරන්න
              </button>
              <p className="text-[11px] text-center text-slate-400 mt-2">
                ලියාපදිංචිය නොමිලේ · කිසිදු පෙර ගාස්තුවක් අය නොකෙරේ
              </p>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
