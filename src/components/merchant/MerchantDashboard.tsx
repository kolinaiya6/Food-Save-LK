import React, { useState, useRef } from 'react';
import { 
  Store as StoreIcon, 
  Plus, 
  QrCode, 
  Package, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  Search, 
  Coins, 
  User, 
  Phone, 
  MapPin, 
  Calendar,
  X,
  Upload,
  Image as ImageIcon,
  Camera
} from 'lucide-react';
import { Store, FoodDeal, FoodCategory, Reservation, CityLocation } from '../../types';
import { uploadImage } from '../../lib/supabase';

interface MerchantDashboardProps {
  currentStore: Store;
  deals: FoodDeal[];
  reservations: Reservation[];
  categories: FoodCategory[];
  cities: CityLocation[];
  onAddDeal: (dealData: Omit<FoodDeal, 'id' | 'created_at' | 'discount_percentage'>) => void;
  onUpdateDeal: (id: string, updates: Partial<FoodDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onConfirmCashCollection: (orderNumber: string, merchantName: string) => { success: boolean; message: string; reservation?: Reservation };
}

export const MerchantDashboard: React.FC<MerchantDashboardProps> = ({
  currentStore,
  deals,
  reservations,
  categories,
  cities,
  onAddDeal,
  onUpdateDeal,
  onDeleteDeal,
  onConfirmCashCollection
}) => {
  const [activeTab, setActiveTab] = useState<'deals' | 'reservations' | 'scanner' | 'profile'>('deals');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<FoodDeal | null>(null);

  // QR Scanner / Manual Verification states
  const [scanCode, setScanCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success?: boolean;
    message?: string;
    reservation?: Reservation;
  } | null>(null);
  const [cashCollectedChecked, setCashCollectedChecked] = useState(false);
  const [foodHandedOverChecked, setFoodHandedOverChecked] = useState(false);

  // Form states for Food Deal
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || 'cat-1');
  const [formDesc, setFormDesc] = useState('');
  const [formImage, setFormImage] = useState('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
  const [formOriginalPrice, setFormOriginalPrice] = useState('1500');
  const [formDiscountedPrice, setFormDiscountedPrice] = useState('550');
  const [formQuantity, setFormQuantity] = useState('6');
  const [formCity, setFormCity] = useState(currentStore.city || 'කොළඹ');
  const [formPickupStart, setFormPickupStart] = useState('17:30');
  const [formPickupEnd, setFormPickupEnd] = useState('20:00');
  const [formPickupDate, setFormPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [formAllergens, setFormAllergens] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Store-specific data
  const storeDeals = deals.filter(d => d.store_id === currentStore.id || d.store_name === currentStore.name);
  const storeReservations = reservations.filter(r => r.store_id === currentStore.id || r.store_name === currentStore.name);

  // Calculated stats
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReservations = storeReservations.filter(r => r.created_at.startsWith(todayStr));
  const completedOrders = storeReservations.filter(r => r.status === 'completed');
  const pendingPickup = storeReservations.filter(r => r.status === 'reserved');
  const activeDealsCount = storeDeals.filter(d => d.status === 'published' && d.quantity_available > 0).length;
  const remainingStock = storeDeals.reduce((acc, d) => acc + d.quantity_available, 0);

  // Image Upload Handler
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const uploadedUrl = await uploadImage(file, 'food-images');
      setFormImage(uploadedUrl);
    } catch (err) {
      console.error('Image upload failed:', err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const openAddModal = () => {
    setEditingDeal(null);
    setFormTitle('');
    setFormCategory(categories[0]?.id || 'cat-1');
    setFormDesc('');
    setFormImage('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
    setFormOriginalPrice('1500');
    setFormDiscountedPrice('550');
    setFormQuantity('6');
    setFormCity(currentStore.city || 'කොළඹ');
    setFormPickupStart('17:30');
    setFormPickupEnd('20:00');
    setFormPickupDate(todayStr);
    setFormAllergens('');
    setDealModalOpen(true);
  };

  const openEditModal = (deal: FoodDeal) => {
    setEditingDeal(deal);
    setFormTitle(deal.title);
    setFormCategory(deal.category_id);
    setFormDesc(deal.description);
    setFormImage(deal.image_url);
    setFormOriginalPrice(deal.original_price.toString());
    setFormDiscountedPrice(deal.discounted_price.toString());
    setFormQuantity(deal.quantity_available.toString());
    setFormCity(deal.store_city || currentStore.city);
    setFormPickupStart(deal.pickup_start);
    setFormPickupEnd(deal.pickup_end);
    setFormPickupDate(deal.pickup_date);
    setFormAllergens(deal.allergens || '');
    setDealModalOpen(true);
  };

  const handleSaveDeal = (e: React.FormEvent) => {
    e.preventDefault();
    const orig = parseFloat(formOriginalPrice) || 1000;
    const disc = parseFloat(formDiscountedPrice) || 400;
    const qty = parseInt(formQuantity) || 1;

    if (disc >= orig) {
      alert('වට්ටම් කළ මිල මුල් මිලට වඩා අඩු විය යුතුය.');
      return;
    }

    if (editingDeal) {
      onUpdateDeal(editingDeal.id, {
        title: formTitle,
        category_id: formCategory,
        description: formDesc,
        image_url: formImage,
        original_price: orig,
        discounted_price: disc,
        quantity_available: qty,
        quantity_total: Math.max(qty, editingDeal.quantity_total),
        pickup_start: formPickupStart,
        pickup_end: formPickupEnd,
        pickup_date: formPickupDate,
        allergens: formAllergens,
        store_city: formCity
      });
    } else {
      onAddDeal({
        store_id: currentStore.id,
        store_name: currentStore.name,
        store_city: formCity,
        store_address: currentStore.address,
        category_id: formCategory,
        title: formTitle,
        description: formDesc,
        image_url: formImage,
        original_price: orig,
        discounted_price: disc,
        quantity_available: qty,
        quantity_total: qty,
        pickup_start: formPickupStart,
        pickup_end: formPickupEnd,
        pickup_date: formPickupDate,
        allergens: formAllergens,
        status: 'published',
      });
    }
    setDealModalOpen(false);
  };

  // QR / Code Verification lookup
  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCashCollectedChecked(false);
    setFoodHandedOverChecked(false);

    let cleanCode = scanCode.trim().toUpperCase();
    if (cleanCode.startsWith('FOODSAVERS_LK:')) {
      cleanCode = cleanCode.replace('FOODSAVERS_LK:', '');
    }

    const res = reservations.find(r => r.order_number.toUpperCase() === cleanCode);
    if (!res) {
      setVerificationResult({
        success: false,
        message: `ඇණවුම් අංක ${cleanCode} සඳහා වෙන්කිරීමක් හමු නොවීය. කරුණාකර නැවත පරීක්ෂා කරන්න.`
      });
      return;
    }

    setVerificationResult({
      success: true,
      reservation: res,
      message: res.status === 'completed'
        ? 'මෙම ඇණවුම දැනටමත් සම්පූර්ණ කර අවසන් (Collected).'
        : res.status === 'cancelled'
        ? 'මෙම ඇණවුම අවලංගු කර ඇත.'
        : 'වලංගු වවුචරයකි! කරුණාකර මුදල් ලබාගෙන කෑම භාර දෙන්න.'
    });
  };

  // Confirm In-Store Cash Received and Food Handed Over
  const handleFinalizeCollection = () => {
    if (!verificationResult?.reservation) return;
    const result = onConfirmCashCollection(
      verificationResult.reservation.order_number,
      currentStore.owner_name || currentStore.name
    );
    setVerificationResult({
      success: result.success,
      message: result.message,
      reservation: result.reservation
    });
  };

  return (
    <div className="py-8 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Merchant Store Header */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentStore.image_url || '/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg'}
              alt={currentStore.name}
              className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {currentStore.name}
                </h1>
                {currentStore.status === 'approved' ? (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    අනුමතයි
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    අනුමැතිය බලාපොරොත්තුවෙන්
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentStore.address} ({currentStore.city})</span>
                <span className="mx-1">·</span>
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentStore.phone}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('scanner')}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <QrCode className="w-4 h-4 text-emerald-400" />
              <span>QR කේත පරීක්ෂාව</span>
            </button>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>නව කෑම පැකේජයක්</span>
            </button>
          </div>
        </div>

        {/* Dashboard 6 Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">අද ඇණවුම්</p>
            <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">{todayReservations.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">මුළු ඇණවුම්</p>
            <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">{storeReservations.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">සම්පූර්ණ කළ</p>
            <p className="text-2xl font-black text-emerald-700 font-mono tabular-nums mt-1">{completedOrders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">ලබාගත යුතු</p>
            <p className="text-2xl font-black text-amber-600 font-mono tabular-nums mt-1">{pendingPickup.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">සක්‍රීය පැකේජ</p>
            <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">{activeDealsCount}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <p className="text-xs text-slate-500 font-medium">ඉතිරි තොගය</p>
            <p className="text-2xl font-black text-slate-900 font-mono tabular-nums mt-1">{remainingStock}</p>
          </div>
        </div>

        {/* Merchant Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('deals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deals' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            මගේ ආහාර පැකේජ ({storeDeals.length})
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reservations' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            වෙන්කිරීම් සහ ඇණවුම් ({storeReservations.length})
          </button>
          <button
            onClick={() => setActiveTab('scanner')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scanner' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-emerald-400" />
            <span>QR කේත පරීක්ෂාව</span>
          </button>
        </div>

        {/* Tab 1: Food Deals CRUD */}
        {activeTab === 'deals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">
                ඔබේ වෙළඳසැලේ ආහාර පැකේජ කළමනාකරණය
              </h2>
              <button
                onClick={openAddModal}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>නව පැකේජයක් එක් කරන්න</span>
              </button>
            </div>

            {storeDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {storeDeals.map((deal) => (
                  <div
                    key={deal.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-3 bg-slate-100">
                        <img
                          src={deal.image_url}
                          alt={deal.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                          {deal.discount_percentage}% OFF
                        </div>
                        <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-semibold px-2 py-0.5 rounded">
                          තොග: {deal.quantity_available} / {deal.quantity_total}
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {deal.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {deal.description}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-slate-400 line-through text-[11px] block">
                            රු. {deal.original_price}
                          </span>
                          <span className="font-bold text-slate-900 text-sm font-mono">
                            රු. {deal.discounted_price}
                          </span>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <span>වේලාව: {deal.pickup_start} - {deal.pickup_end}</span>
                          <span className="block">{deal.pickup_date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        {deal.status === 'published' ? (
                          <button
                            onClick={() => onUpdateDeal(deal.id, { status: 'paused' })}
                            className="px-2.5 py-1 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                            title="Pause Listing"
                          >
                            <PauseCircle className="w-3.5 h-3.5" />
                            <span>නවත්වන්න</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateDeal(deal.id, { status: 'published' })}
                            className="px-2.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 cursor-pointer font-medium"
                            title="Publish Listing"
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>පළ කරන්න</span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(deal)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="සංස්කරණය"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('මෙම ආහාර පැකේජය මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්න?')) {
                              onDeleteDeal(deal.id);
                            }
                          }}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="මකාදමන්න"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">
                  තවමත් ආහාර පැකේජ පළ කර නොමැත
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto mb-4">
                  අද දින ඉතිරිවන අතිරික්ත ආහාර එකතු කර වට්ටම් සහිතව විකිණීම අරඹන්න.
                </p>
                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  පළමු පැකේජය එක් කරන්න
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Reservations & Cash Collection */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  ලැබුණු වෙන්කිරීම් සහ ඇණවුම් ලැයිස්තුව
                </h2>
                <p className="text-xs text-slate-500">
                  පාරිභෝගිකයා පැමිණි විට මුදල් ලබාගෙන කෑම භාරදීම තහවුරු කරන්න
                </p>
              </div>
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full font-mono">
                මුළු: {storeReservations.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Order ID</th>
                    <th className="px-4 py-3">කෑම පැකේජය</th>
                    <th className="px-4 py-3">පාරිභෝගිකයා</th>
                    <th className="px-4 py-3">ප්‍රමාණය</th>
                    <th className="px-4 py-3">මුදල (LKR)</th>
                    <th className="px-4 py-3">වේලාව</th>
                    <th className="px-4 py-3">තත්ත්වය</th>
                    <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {storeReservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {res.order_number}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 max-w-[180px] truncate">
                        {res.deal_title}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        <span className="font-medium block">{res.customer_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{res.customer_phone}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-bold">{res.quantity}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">
                        රු. {res.total_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {res.pickup_start} - {res.pickup_end}
                      </td>
                      <td className="px-4 py-3">
                        {res.status === 'completed' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            සම්පූර්ණයි (ගෙවා ඇත)
                          </span>
                        ) : res.status === 'cancelled' ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                            අවලංගුයි
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            වෙන්කර ඇත (කඩේදී ගෙවිය යුතුයි)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {res.status === 'reserved' && (
                          <button
                            onClick={() => {
                              setScanCode(res.order_number);
                              setActiveTab('scanner');
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-[11px] cursor-pointer"
                          >
                            මුදල් ලබාගැනීම
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {storeReservations.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                        කිසිදු ඇණවුමක් මෙතෙක් ලැබී නොමැත.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: QR Scanner & In-Store Cash Collection System */}
        {activeTab === 'scanner' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <QrCode className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                QR වවුචර පරීක්ෂාව සහ මුදල් ලබාගැනීම
              </h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                පාරිභෝගිකයාගේ QR සංකේතය හෝ ඇණවුම් අංකය (උදා: KS-2026-8942) ඇතුළත් කර සත්‍යාපනය කරන්න.
              </p>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerifyCode} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Order Number (උදා: KS-2026-8942)"
                  value={scanCode}
                  onChange={(e) => setScanCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 font-mono text-sm uppercase font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                පරීක්ෂා කරන්න
              </button>
            </form>

            {/* Quick Demo Test Buttons */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-500">පරීක්ෂා කිරීමට උදාහරණයක් තෝරන්න:</span>
              <div className="flex gap-2 font-mono">
                <button
                  type="button"
                  onClick={() => setScanCode('KS-2026-8942')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  KS-2026-8942
                </button>
                <button
                  type="button"
                  onClick={() => setScanCode('KS-2026-7819')}
                  className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-800 hover:bg-slate-100 cursor-pointer"
                >
                  KS-2026-7819
                </button>
              </div>
            </div>

            {/* Result Box */}
            {verificationResult && (
              <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50 space-y-4">
                
                {/* Status banner */}
                <div className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-semibold ${
                  verificationResult.success && verificationResult.reservation?.status !== 'completed'
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                    : 'bg-amber-100 border-amber-300 text-amber-900'
                }`}>
                  {verificationResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />}
                  <span>{verificationResult.message}</span>
                </div>

                {verificationResult.reservation && (
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {verificationResult.reservation.order_number}
                      </span>
                      <span className="font-semibold text-emerald-700">
                        {verificationResult.reservation.store_name}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-600">
                      <div>
                        <span className="text-slate-400 block">පාරිභෝගිකයා:</span>
                        <strong className="text-slate-800">{verificationResult.reservation.customer_name}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">දුරකථනය:</span>
                        <span className="font-mono font-semibold">{verificationResult.reservation.customer_phone}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">කෑම පැකේජය:</span>
                        <span className="font-bold text-slate-800">{verificationResult.reservation.deal_title}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">ප්‍රමාණය:</span>
                        <strong className="text-slate-800">පැකේජ {verificationResult.reservation.quantity}</strong>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between">
                      <span className="font-bold text-slate-800">කඩේදී එකතු කරගත යුතු මුදල:</span>
                      <span className="text-xl font-black text-emerald-800 font-mono">
                        රු. {verificationResult.reservation.total_amount.toLocaleString()}
                      </span>
                    </div>

                    {/* Cash Collection & Handover Step */}
                    {verificationResult.reservation.status === 'reserved' && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="checkbox"
                              checked={cashCollectedChecked}
                              onChange={(e) => setCashCollectedChecked(e.target.checked)}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <span>1. පාරිභෝගිකයාගෙන් මුදල් ලැබුණි (Cash Received)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                            <input
                              type="checkbox"
                              checked={foodHandedOverChecked}
                              onChange={(e) => setFoodHandedOverChecked(e.target.checked)}
                              className="w-4 h-4 accent-emerald-600 rounded"
                            />
                            <span>2. කෑම පැකේජය පාරිභෝගිකයාට ලබා දුන්නා (Food Handed Over)</span>
                          </label>
                        </div>

                        <button
                          onClick={handleFinalizeCollection}
                          disabled={!cashCollectedChecked || !foodHandedOverChecked}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>ඇණවුම සම්පූර්ණ කරන්න (Complete Order)</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>
        )}

        {/* Modal: Add/Edit Food Package with Photo Upload */}
        {dealModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
              
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="text-base font-bold text-slate-900">
                  {editingDeal ? 'ආහාර පැකේජය සංස්කරණය කරන්න' : 'නව ආහාර පැකේජයක් එක් කරන්න'}
                </h3>
                <button
                  onClick={() => setDealModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeal} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs">
                
                {/* Image Upload Dropzone */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5">
                    කෑම පැකේජයේ ඡායාරූපය (Photo Upload) *
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50/70 hover:bg-slate-100/70 transition-colors">
                    {formImage ? (
                      <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-3 border border-slate-200 group">
                        <img src={formImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-white text-slate-900 rounded-lg text-xs font-bold shadow-md cursor-pointer flex items-center gap-1"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>වෙනස් කරන්න</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="py-4">
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-600 font-medium">ඡායාරූපය මෙතැනට ඇද දමන්න හෝ තෝරන්න</p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />

                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'අප්ලෝඩ් වෙමින්...' : 'ඡායාරූපයක් Upload කරන්න'}</span>
                      </button>

                      <span className="text-slate-400 text-[11px]">හෝ URL එකක් යොදන්න</span>
                    </div>

                    <input
                      type="text"
                      placeholder="https://..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="mt-2.5 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-[11px] font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    ආහාර පැකේජයේ නම *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="උදා: සවස ෂෝට්ඊට්ස් සප්‍රයිස් බොක්ස්"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      කාණ්ඩය *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-600"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      නගරය *
                    </label>
                    <select
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-emerald-600"
                    >
                      {cities.map((city) => (
                        <option key={city.id} value={city.name}>{city.name} ({city.name_en})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    විස්තරය *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="පැකේජයේ අඩංගු දෑ සහ ප්‍රමාණය විස්තර කරන්න..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                  />
                </div>

                {/* Pricing & Calculated Discount */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      මුල් මිල (රු.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={formOriginalPrice}
                      onChange={(e) => setFormOriginalPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      වට්ටම් මිල (රු.) *
                    </label>
                    <input
                      type="number"
                      required
                      min="50"
                      value={formDiscountedPrice}
                      onChange={(e) => setFormDiscountedPrice(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      වට්ටම (%):
                    </label>
                    <div className="px-3 py-2 rounded-xl bg-slate-100 font-mono font-bold text-red-600 text-sm">
                      {Math.max(0, Math.round(((parseFloat(formOriginalPrice) - parseFloat(formDiscountedPrice)) / (parseFloat(formOriginalPrice) || 1)) * 100))}%
                    </div>
                  </div>
                </div>

                {/* Quantity and Pickup Times */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      පැකේජ ගණන *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formQuantity}
                      onChange={(e) => setFormQuantity(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ආරම්භක වේලාව *
                    </label>
                    <input
                      type="time"
                      required
                      value={formPickupStart}
                      onChange={(e) => setFormPickupStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      අවසන් වේලාව *
                    </label>
                    <input
                      type="time"
                      required
                      value={formPickupEnd}
                      onChange={(e) => setFormPickupEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Expiry Date & Allergens */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      ලබාගැනීමේ දිනය *
                    </label>
                    <input
                      type="date"
                      required
                      value={formPickupDate}
                      onChange={(e) => setFormPickupDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      අසාත්මිකතා තොරතුරු
                    </label>
                    <input
                      type="text"
                      placeholder="තිරිඟු, කිරි, රටකජු..."
                      value={formAllergens}
                      onChange={(e) => setFormAllergens(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setDealModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                  >
                    අවලංගු කරන්න
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer shadow-xs"
                  >
                    {editingDeal ? 'යාවත්කාලීන කරන්න' : 'පළ කරන්න'}
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
