import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Store as StoreIcon, 
  Package, 
  FolderTree, 
  ShoppingBag, 
  Ticket, 
  Star, 
  Bell, 
  MapPin, 
  Globe, 
  Image as ImageIcon, 
  BarChart3, 
  Settings, 
  ShieldCheck, 
  History, 
  LogOut, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  Clock,
  Eye,
  RefreshCw,
  Upload,
  Camera
} from 'lucide-react';
import { uploadImage } from '../../lib/supabase';
import { 
  UserProfile, 
  Store, 
  FoodDeal, 
  FoodCategory, 
  Reservation, 
  Voucher, 
  Review, 
  NotificationItem, 
  CityLocation, 
  HomepageBanner, 
  AuditLog, 
  PlatformSettings,
  StoreStatus,
  DealStatus,
  ReservationStatus
} from '../../types';

interface AdminDashboardProps {
  stats: any;
  users: UserProfile[];
  stores: Store[];
  deals: FoodDeal[];
  categories: FoodCategory[];
  reservations: Reservation[];
  vouchers: Voucher[];
  reviews: Review[];
  cities: CityLocation[];
  banners: HomepageBanner[];
  auditLogs: AuditLog[];
  settings: PlatformSettings;
  onUpdateStore: (id: string, updates: Partial<Store>) => void;
  onDeleteStore: (id: string) => void;
  onAddStore: (store: Omit<Store, 'id' | 'created_at' | 'rating' | 'total_reviews'>) => void;
  onUpdateDeal: (id: string, updates: Partial<FoodDeal>) => void;
  onDeleteDeal: (id: string) => void;
  onAddDeal: (deal: Omit<FoodDeal, 'id' | 'created_at' | 'discount_percentage'>) => void;
  onUpdateCategory: (id: string, updates: Partial<FoodCategory>) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: (category: Omit<FoodCategory, 'id'>) => void;
  onUpdateUser: (id: string, updates: Partial<UserProfile>) => void;
  onDeleteUser: (id: string) => void;
  onAddUser: (user: UserProfile) => void;
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onRevokeVoucher: (id: string) => void;
  onUpdateReviewStatus: (id: string, status: 'published' | 'hidden' | 'flagged') => void;
  onDeleteReview: (id: string) => void;
  onUpdateCity: (id: string, updates: Partial<CityLocation>) => void;
  onAddCity: (city: Omit<CityLocation, 'id'>) => void;
  onDeleteCity: (id: string) => void;
  onUpdateBanner: (id: string, updates: Partial<HomepageBanner>) => void;
  onAddBanner: (banner: Omit<HomepageBanner, 'id'>) => void;
  onDeleteBanner: (id: string) => void;
  onUpdateSettings: (settings: Partial<PlatformSettings>) => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  users,
  stores,
  deals,
  categories,
  reservations,
  vouchers,
  reviews,
  cities,
  banners,
  auditLogs,
  settings,
  onUpdateStore,
  onDeleteStore,
  onAddStore,
  onUpdateDeal,
  onDeleteDeal,
  onAddDeal,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onUpdateReservation,
  onRevokeVoucher,
  onUpdateReviewStatus,
  onDeleteReview,
  onUpdateCity,
  onAddCity,
  onDeleteCity,
  onUpdateBanner,
  onAddBanner,
  onDeleteBanner,
  onUpdateSettings,
  onLogout
}) => {
  // Sidebar Navigation State (16 requested sections)
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCity, setFilterCity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // Generic Edit/Add Modal States
  const [modalType, setModalType] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Store Modal State
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storeFormName, setStoreFormName] = useState('');
  const [storeFormOwner, setStoreFormOwner] = useState('');
  const [storeFormPhone, setStoreFormPhone] = useState('');
  const [storeFormEmail, setStoreFormEmail] = useState('');
  const [storeFormCity, setStoreFormCity] = useState(cities[0]?.name || 'කොළඹ');
  const [storeFormAddress, setStoreFormAddress] = useState('');
  const [storeFormType, setStoreFormType] = useState<Store['store_type']>('bakery');
  const [storeFormImage, setStoreFormImage] = useState('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
  const [isUploadingStoreImg, setIsUploadingStoreImg] = useState(false);

  // Deal Modal State
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | null>(null);
  const [dealFormTitle, setDealFormTitle] = useState('');
  const [dealFormStoreId, setDealFormStoreId] = useState(stores[0]?.id || '');
  const [dealFormCatId, setDealFormCatId] = useState(categories[0]?.id || '');
  const [dealFormDesc, setDealFormDesc] = useState('');
  const [dealFormImage, setDealFormImage] = useState('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
  const [dealFormOriginalPrice, setDealFormOriginalPrice] = useState('1500');
  const [dealFormDiscountedPrice, setDealFormDiscountedPrice] = useState('550');
  const [dealFormQty, setDealFormQty] = useState('5');
  const [dealFormPickupStart, setDealFormPickupStart] = useState('17:30');
  const [dealFormPickupEnd, setDealFormPickupEnd] = useState('20:00');
  const [dealFormPickupDate, setDealFormPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [dealFormCity, setDealFormCity] = useState(cities[0]?.name || 'කොළඹ');
  const [isUploadingDealImg, setIsUploadingDealImg] = useState(false);

  // Open Store Modal
  const openAddStoreModal = () => {
    setEditingStoreId(null);
    setStoreFormName('');
    setStoreFormOwner('');
    setStoreFormPhone('');
    setStoreFormEmail('');
    setStoreFormCity(cities[0]?.name || 'කොළඹ');
    setStoreFormAddress('');
    setStoreFormType('bakery');
    setStoreFormImage('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
    setStoreModalOpen(true);
  };

  const openEditStoreModal = (store: Store) => {
    setEditingStoreId(store.id);
    setStoreFormName(store.name);
    setStoreFormOwner(store.owner_name);
    setStoreFormPhone(store.phone);
    setStoreFormEmail(store.email);
    setStoreFormCity(store.city);
    setStoreFormAddress(store.address);
    setStoreFormType(store.store_type);
    setStoreFormImage(store.image_url);
    setStoreModalOpen(true);
  };

  // Open Deal Modal
  const openAddDealModal = () => {
    setEditingDealId(null);
    setDealFormTitle('');
    setDealFormStoreId(stores[0]?.id || '');
    setDealFormCatId(categories[0]?.id || '');
    setDealFormDesc('');
    setDealFormImage('/src/assets/images/sri_lanka_bakery_box_1794103810760.jpg');
    setDealFormOriginalPrice('1500');
    setDealFormDiscountedPrice('550');
    setDealFormQty('5');
    setDealFormPickupStart('17:30');
    setDealFormPickupEnd('20:00');
    setDealFormPickupDate(new Date().toISOString().split('T')[0]);
    setDealFormCity(stores[0]?.city || 'කොළඹ');
    setDealModalOpen(true);
  };

  const openEditDealModal = (deal: FoodDeal) => {
    setEditingDealId(deal.id);
    setDealFormTitle(deal.title);
    setDealFormStoreId(deal.store_id);
    setDealFormCatId(deal.category_id);
    setDealFormDesc(deal.description);
    setDealFormImage(deal.image_url);
    setDealFormOriginalPrice(deal.original_price.toString());
    setDealFormDiscountedPrice(deal.discounted_price.toString());
    setDealFormQty(deal.quantity_available.toString());
    setDealFormPickupStart(deal.pickup_start);
    setDealFormPickupEnd(deal.pickup_end);
    setDealFormPickupDate(deal.pickup_date);
    setDealFormCity(deal.store_city || 'කොළඹ');
    setDealModalOpen(true);
  };

  // CSV Export utility
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { id: 'overview', label: '1. පාලක පුවරුව', icon: LayoutDashboard },
    { id: 'customers', label: '2. පාරිභෝගිකයින්', icon: Users, badge: users.filter(u => u.role === 'customer').length },
    { id: 'stores', label: '3. වෙළඳසැල්', icon: StoreIcon, badge: stats.pendingStores > 0 ? `${stats.pendingStores} අලුත්` : undefined },
    { id: 'deals', label: '4. ආහාර පැකේජ', icon: Package, badge: deals.length },
    { id: 'categories', label: '5. ආහාර කාණ්ඩ', icon: FolderTree, badge: categories.length },
    { id: 'orders', label: '6. සියලුම ඇණවුම්', icon: ShoppingBag, badge: reservations.length },
    { id: 'vouchers', label: '7. වවුචර්', icon: Ticket, badge: vouchers.length },
    { id: 'reviews', label: '8. සමාලෝචන', icon: Star, badge: reviews.length },
    { id: 'notifications', label: '9. දැනුම්දීම්', icon: Bell },
    { id: 'cities', label: '10. නගර සහ ස්ථාන', icon: MapPin, badge: cities.length },
    { id: 'homepage', label: '11. මුල් පිටුව කළමනාකරණය', icon: Globe },
    { id: 'banners', label: '12. දැන්වීම් සහ බැනර්', icon: ImageIcon, badge: banners.length },
    { id: 'reports', label: '13. වාර්තා සහ විශ්ලේෂණ', icon: BarChart3 },
    { id: 'settings', label: '14. පද්ධති සැකසුම්', icon: Settings },
    { id: 'admins', label: '15. පරිපාලක ගිණුම්', icon: ShieldCheck },
    { id: 'audit', label: '16. ක්‍රියාකාරකම් ඉතිහාසය', icon: History, badge: auditLogs.length },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800">
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black shadow-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">
                ප්‍රධාන පාලක පුවරුව
              </h2>
              <span className="text-[11px] text-emerald-400 font-mono">
                ADMIN CONSOLE v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items (Scrollable) */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)] scrollbar-thin">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSearchTerm('');
                  setFilterCity('all');
                  setFilterStatus('all');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/40 hover:text-red-300 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>17. පාලක පුවරුවෙන් ඉවත් වන්න</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto min-w-0">
        
        {/* Top bar with quick status */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 shadow-2xs">
          <div>
            <h1 className="text-lg font-extrabold text-slate-900">
              {navItems.find(n => n.id === activeSection)?.label}
            </h1>
            <p className="text-xs text-slate-500">
              සම්පූර්ණ පරිපාලන සහ CRUD පාලනය (Create, Read, Update, Delete)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:inline">
              අද දිනය: <strong className="text-slate-800">{new Date().toLocaleDateString('si-LK')}</strong>
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>සජීවී දත්ත පද්ධතිය</span>
            </div>
          </div>
        </header>

        {/* Content Views */}
        <div className="p-6 space-y-6">
          
          {/* 1. OVERVIEW SECTION (10 REQUIRED STATISTICS) */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              
              {/* 10 Statistics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">මුළු පාරිභෝගිකයින්</p>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.totalCustomers}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">මුළු වෙළඳසැල්</p>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.totalStores}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-amber-700 font-semibold">අනුමැතිය බලාපොරොත්තුවෙන්</p>
                  <p className="text-2xl font-black text-amber-600 font-mono mt-1">{stats.pendingStores}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-emerald-700 font-semibold">සක්‍රීය ආහාර පැකේජ</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.activeDeals}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">මුළු ඇණවුම්</p>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.totalOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">අද ඇණවුම්</p>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats.todayOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-emerald-700 font-semibold">සම්පූර්ණ කළ ඇණවුම්</p>
                  <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{stats.completedOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-red-600 font-medium">අවලංගු කළ ඇණවුම්</p>
                  <p className="text-2xl font-black text-red-600 font-mono mt-1">{stats.cancelledOrders}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-slate-500 font-medium">කඩවලින් ගත් ආදායම</p>
                  <p className="text-xl font-black text-slate-900 font-mono mt-1">රු. {stats.totalRevenueCollected.toLocaleString()}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <p className="text-xs text-emerald-700 font-semibold">සුරැකි ආහාර ප්‍රමාණය</p>
                  <p className="text-2xl font-black text-emerald-600 font-mono mt-1">{stats.totalFoodSavedKg} kg</p>
                </div>

              </div>

              {/* Quick Actions & Recent Orders Strip */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Reservations */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">නවතම වෙන්කිරීම්</h3>
                    <button
                      onClick={() => setActiveSection('orders')}
                      className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      සියල්ල බලන්න →
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    {reservations.slice(0, 5).map((res) => (
                      <div key={res.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-mono font-bold text-slate-900">{res.order_number}</p>
                          <p className="text-slate-500">{res.deal_title} · <span className="font-medium text-slate-700">{res.store_name}</span></p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-emerald-700">රු. {res.total_amount}</p>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            res.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {res.status === 'completed' ? 'සම්පූර්ණයි' : 'වෙන්කර ඇත'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pending Store Approvals */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-900 text-sm">අනුමැතිය බලාපොරොත්තු වන කඩ</h3>
                    <button
                      onClick={() => setActiveSection('stores')}
                      className="text-xs text-emerald-700 hover:underline font-semibold cursor-pointer"
                    >
                      කළමනාකරණය
                    </button>
                  </div>

                  <div className="space-y-3">
                    {stores.filter(s => s.status === 'pending').map((store) => (
                      <div key={store.id} className="p-3 rounded-xl bg-amber-50 border border-amber-200/70 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-slate-900 font-bold">{store.name}</strong>
                          <span className="text-[10px] text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded">අලුත්</span>
                        </div>
                        <p className="text-slate-600">{store.owner_name} · {store.city}</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => onUpdateStore(store.id, { status: 'approved' })}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] cursor-pointer"
                          >
                            අනුමත කරන්න
                          </button>
                          <button
                            onClick={() => onUpdateStore(store.id, { status: 'rejected' })}
                            className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-semibold text-[11px] cursor-pointer"
                          >
                            ප්‍රතික්ෂේප
                          </button>
                        </div>
                      </div>
                    ))}
                    {stores.filter(s => s.status === 'pending').length === 0 && (
                      <p className="text-xs text-slate-400 py-4 text-center">
                        අනුමැතිය බලාපොරොත්තුවෙන් ඇති නව වෙළඳසැල් නොමැත.
                      </p>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. CUSTOMERS MANAGEMENT (FULL CRUD) */}
          {activeSection === 'customers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">පාරිභෝගිකයින් කළමනාකරණය (Customers CRUD)</h3>
                  <p className="text-xs text-slate-500">ගිණුම් බැලීම, සංස්කරණය, සක්‍රීය/අක්‍රීය කිරීම සහ මකාදැමීම</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="නම, දුරකථනය හෝ ඊමේල් සොයන්න..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 w-52 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const name = prompt('නව පාරිභෝගිකයාගේ සම්පූර්ණ නම:');
                      if (!name) return;
                      const phone = prompt('දුරකථන අංකය:');
                      const email = prompt('ඊමේල් ලිපිනය:');
                      onAddUser({
                        id: `cust-${Date.now()}`,
                        full_name: name,
                        phone: phone || '0771234567',
                        email: email || `${Date.now()}@foodsavers.lk`,
                        role: 'customer',
                        is_active: true,
                        created_at: new Date().toISOString()
                      });
                    }}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>පාරිභෝගිකයෙකු එක් කරන්න</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">පාරිභෝගිකයා</th>
                      <th className="px-4 py-3">දුරකථනය</th>
                      <th className="px-4 py-3">ඊමේල්</th>
                      <th className="px-4 py-3">නගරය</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.filter(u => u.role === 'customer').filter(u => {
                      if (!searchTerm) return true;
                      const q = searchTerm.toLowerCase();
                      return u.full_name.toLowerCase().includes(q) || u.phone.includes(q) || u.email.toLowerCase().includes(q);
                    }).map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-900">{user.full_name}</td>
                        <td className="px-4 py-3 font-mono">{user.phone}</td>
                        <td className="px-4 py-3 text-slate-600">{user.email}</td>
                        <td className="px-4 py-3 text-slate-600">{user.city || 'කොළඹ'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onUpdateUser(user.id, { is_active: !user.is_active })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {user.is_active ? 'සක්‍රීයයි' : 'අත්හිටුවා ඇත'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              const newPhone = prompt('නව දුරකථන අංකය:', user.phone);
                              if (newPhone) onUpdateUser(user.id, { phone: newPhone });
                            }}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            title="දුරකථනය වෙනස් කරන්න"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${user.full_name} පාරිභෝගික ගිණුම මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්න?`)) {
                                onDeleteUser(user.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="ගිණුම මකන්න"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. STORES MANAGEMENT (FULL CRUD & APPROVAL WORKFLOW) */}
          {activeSection === 'stores' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">වෙළඳසැල් කළමනාකරණය (Stores Full CRUD)</h3>
                  <p className="text-xs text-slate-500">අනුමත කිරීම, ප්‍රතික්ෂේප කිරීම, විස්තර සංස්කරණය සහ මකාදැමීම</p>
                </div>

                <div className="flex items-center gap-3">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="all">සියලුම තත්ත්වයන්</option>
                    <option value="pending">අනුමැතිය බලාපොරොත්තුවෙන්</option>
                    <option value="approved">අනුමතයි</option>
                    <option value="suspended">අත්හිටුවා ඇත</option>
                  </select>

                  <button
                    onClick={openAddStoreModal}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>නව වෙළඳසැලක් එක් කරන්න</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">වෙළඳසැල</th>
                      <th className="px-4 py-3">හිමිකරු & දුරකථනය</th>
                      <th className="px-4 py-3">නගරය සහ ලිපිනය</th>
                      <th className="px-4 py-3">වර්ගය</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {stores.filter(s => filterStatus === 'all' || s.status === filterStatus).map((store) => (
                      <tr key={store.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={store.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <strong className="text-slate-900 font-bold">{store.name}</strong>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="block font-medium">{store.owner_name}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{store.phone}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-[200px] truncate">
                          {store.address} ({store.city})
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-500">{store.store_type}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            store.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            store.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {store.status === 'approved' ? 'අනුමතයි' :
                             store.status === 'pending' ? 'අනුමැතිය බලාපොරොත්තුවෙන්' : 'අත්හිටුවා ඇත'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {store.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStore(store.id, { status: 'approved' })}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                            >
                              අනුමත කරන්න
                            </button>
                          )}
                          {store.status === 'approved' ? (
                            <button
                              onClick={() => onUpdateStore(store.id, { status: 'suspended' })}
                              className="px-2 py-1 bg-amber-50 text-amber-800 rounded text-[10px] font-semibold cursor-pointer"
                            >
                              අත්හිටුවන්න
                            </button>
                          ) : store.status === 'suspended' ? (
                            <button
                              onClick={() => onUpdateStore(store.id, { status: 'approved' })}
                              className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded text-[10px] font-semibold cursor-pointer"
                            >
                              යළි සක්‍රීය කරන්න
                            </button>
                          ) : null}
                          <button
                            onClick={() => openEditStoreModal(store)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            title="සංස්කරණය"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${store.name} වෙළඳසැල මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්න?`)) {
                                onDeleteStore(store.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="මකාදමන්න"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. FOOD DEALS MANAGEMENT (FULL CRUD ACROSS ALL STORES) */}
          {activeSection === 'deals' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">සියලුම ආහාර පැකේජ (Food Deals Full CRUD)</h3>
                  <p className="text-xs text-slate-500">ඕනෑම වෙළඳසැලක පැකේජ මිල, තොග, පළ කිරීම සහ සංස්කරණය</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={openAddDealModal}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>නව පැකේජයක් එක් කරන්න</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">කෑම පැකේජය</th>
                      <th className="px-4 py-3">වෙළඳසැල</th>
                      <th className="px-4 py-3">මුල් මිල</th>
                      <th className="px-4 py-3">වට්ටම් මිල</th>
                      <th className="px-4 py-3">තොගය</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deals.map((deal) => (
                      <tr key={deal.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <img src={deal.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <strong className="text-slate-900 font-bold">{deal.title}</strong>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">{deal.store_name}</td>
                        <td className="px-4 py-3 font-mono line-through text-slate-400">රු. {deal.original_price}</td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-700">රු. {deal.discounted_price} ({deal.discount_percentage}%)</td>
                        <td className="px-4 py-3 font-mono font-bold">{deal.quantity_available} / {deal.quantity_total}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            deal.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {deal.status === 'published' ? 'සක්‍රීයයි' : deal.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          <button
                            onClick={() => onUpdateDeal(deal.id, { status: deal.status === 'published' ? 'paused' : 'published' })}
                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                          >
                            {deal.status === 'published' ? 'නවත්වන්න' : 'පළ කරන්න'}
                          </button>
                          <button
                            onClick={() => openEditDealModal(deal)}
                            className="p-1 text-slate-600 hover:text-slate-900"
                            title="සංස්කරණය"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('මෙම පැකේජය මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්න?')) {
                                onDeleteDeal(deal.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="මකාදමන්න"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. FOOD CATEGORIES MANAGEMENT */}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">ආහාර කාණ්ඩ කළමනාකරණය (Categories CRUD)</h3>
                  <p className="text-xs text-slate-500">කාණ්ඩ එක්කිරීම, සංස්කරණය, අනුපිළිවෙල සහ සක්‍රීය/අක්‍රීය කිරීම</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt('නව කාණ්ඩයේ නම (සිංහලෙන්):');
                    if (!name) return;
                    const nameEn = prompt('ඉංග්‍රීසි නම:') || name;
                    onAddCategory({
                      name,
                      name_en: nameEn,
                      icon: 'Package',
                      display_order: categories.length + 1,
                      is_active: true
                    });
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>නව කාණ්ඩයක්</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">අනුපිළිවෙල</th>
                      <th className="px-4 py-3">කාණ්ඩයේ නම</th>
                      <th className="px-4 py-3">ඉංග්‍රීසි නම</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categories.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-700">{cat.display_order}</td>
                        <td className="px-4 py-3 font-bold text-slate-900">{cat.name}</td>
                        <td className="px-4 py-3 text-slate-600">{cat.name_en || '-'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => onUpdateCategory(cat.id, { is_active: !cat.is_active })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                              cat.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {cat.is_active ? 'සක්‍රීයයි' : 'අක්‍රීයයි'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => {
                              const newName = prompt('නව නම:', cat.name);
                              if (newName) onUpdateCategory(cat.id, { name: newName });
                            }}
                            className="p-1 text-slate-600 hover:text-slate-900"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`${cat.name} කාණ්ඩය මකා දැමීමට අවශ්‍ය බව තහවුරු කරන්න?`)) {
                                onDeleteCategory(cat.id);
                              }
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. ALL ORDERS / RESERVATIONS (FULL CRUD & AUDIT INTEGRITY) */}
          {activeSection === 'orders' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">සියලුම ඇණවුම් සහ වෙන්කිරීම් (All Orders CRUD)</h3>
                  <p className="text-xs text-slate-500">Order ID, පාරිභෝගිකයා, තත්ත්වය වෙනස් කිරීම සහ මුදල් ලැබීම සටහන් කිරීම</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleExportCSV(reservations, 'FoodSavers_Orders')}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV වාර්තාව බාගන්න</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Order ID</th>
                      <th className="px-4 py-3">කෑම පැකේජය</th>
                      <th className="px-4 py-3">වෙළඳසැල</th>
                      <th className="px-4 py-3">පාරිභෝගිකයා</th>
                      <th className="px-4 py-3">මුදල (LKR)</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{res.order_number}</td>
                        <td className="px-4 py-3 font-semibold text-slate-900 max-w-[160px] truncate">{res.deal_title}</td>
                        <td className="px-4 py-3 text-emerald-700 font-medium">{res.store_name}</td>
                        <td className="px-4 py-3">
                          <span className="font-medium block">{res.customer_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{res.customer_phone}</span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">රු. {res.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            res.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                            res.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {res.status === 'completed' ? 'සම්පූර්ණයි' :
                             res.status === 'cancelled' ? 'අවලංගුයි' : 'වෙන්කර ඇත'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-1.5">
                          {res.status === 'reserved' && (
                            <>
                              <button
                                onClick={() => onUpdateReservation(res.id, { status: 'completed', payment_status: 'paid_at_store' })}
                                className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold cursor-pointer"
                              >
                                සම්පූර්ණයි
                              </button>
                              <button
                                onClick={() => onUpdateReservation(res.id, { status: 'cancelled' })}
                                className="px-2 py-1 bg-red-50 text-red-700 rounded text-[10px] font-semibold cursor-pointer"
                              >
                                අවලංගු කරන්න
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 7. VOUCHERS MANAGEMENT */}
          {activeSection === 'vouchers' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">වවුචර් කළමනාකරණය (Vouchers Management)</h3>
                  <p className="text-xs text-slate-500">QR කේත පරීක්ෂාව, හිමිකරුවන් සහ අවලංගු කිරීම්</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Order Number</th>
                      <th className="px-4 py-3">පාරිභෝගිකයා</th>
                      <th className="px-4 py-3">වෙළඳසැල</th>
                      <th className="px-4 py-3">කෑම පැකේජය</th>
                      <th className="px-4 py-3">මුදල</th>
                      <th className="px-4 py-3">තත්ත්වය</th>
                      <th className="px-4 py-3 text-right">ක්‍රියාමාර්ග</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {vouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{v.order_number}</td>
                        <td className="px-4 py-3">{v.customer_name} ({v.customer_phone})</td>
                        <td className="px-4 py-3 font-medium text-emerald-800">{v.store_name}</td>
                        <td className="px-4 py-3 max-w-[180px] truncate">{v.deal_title}</td>
                        <td className="px-4 py-3 font-mono font-bold">රු. {v.total_amount}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            v.is_redeemed ? 'bg-slate-100 text-slate-700' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {v.is_redeemed ? 'ලබාගෙන අවසන්' : 'වලංගුයි'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {!v.is_redeemed && (
                            <button
                              onClick={() => {
                                if (confirm('මෙම වවුචරය අවලංගු කිරීමට අවශ්‍යද?')) {
                                  onRevokeVoucher(v.id);
                                }
                              }}
                              className="px-2.5 py-1 text-red-600 hover:bg-red-50 rounded text-[11px] font-semibold cursor-pointer"
                            >
                              අවලංගු කරන්න
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 8. REVIEWS MANAGEMENT */}
          {activeSection === 'reviews' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">සමාලෝචන සහ ශ්‍රේණිගත කිරීම් (Reviews)</h3>
                <p className="text-xs text-slate-500">පාරිභෝගික අදහස් පරීක්ෂා කිරීම සහ අනුමත කිරීම</p>
              </div>

              <div className="p-5 space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900 text-xs font-bold">{rev.customer_name}</strong>
                        <span className="text-[11px] text-emerald-700 font-semibold">({rev.store_name})</span>
                        <span className="text-amber-500 font-bold text-xs">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                      <p className="text-[10px] text-slate-400">පැකේජය: {rev.deal_title}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {rev.status === 'published' ? (
                        <button
                          onClick={() => onUpdateReviewStatus(rev.id, 'hidden')}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-[11px] font-semibold cursor-pointer"
                        >
                          සඟවන්න
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateReviewStatus(rev.id, 'published')}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold cursor-pointer"
                        >
                          පළ කරන්න
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteReview(rev.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 9. NOTIFICATIONS MANAGEMENT */}
          {activeSection === 'notifications' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">දැනුම්දීම් සහ පද්ධති නිවේදන (Notifications)</h3>
                <p className="text-xs text-slate-500">පාරිභෝගිකයින් හෝ වෙළඳසැල් වෙත නිවේදන නිකුත් කරන්න</p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">නව නිවේදනයක් විකාශනය කරන්න</h4>
                <input
                  type="text"
                  placeholder="නිවේදනයේ මාතෘකාව..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <textarea
                  rows={2}
                  placeholder="පණිවිඩය ඇතුළත් කරන්න..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
                <button
                  type="button"
                  onClick={() => alert('නිවේදනය සාර්ථකව යොමු කරන ලදී.')}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs cursor-pointer"
                >
                  විකාශනය කරන්න
                </button>
              </div>
            </div>
          )}

          {/* 10. CITIES & LOCATIONS CRUD */}
          {activeSection === 'cities' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">නගර සහ ස්ථාන (Cities & Locations CRUD)</h3>
                  <p className="text-xs text-slate-500">ශ්‍රී ලංකාවේ ආවරණය වන නගර කළමනාකරණය</p>
                </div>
                <button
                  onClick={() => {
                    const name = prompt('නව නගරයේ නම (සිංහලෙන්):');
                    if (!name) return;
                    const nameEn = prompt('ඉංග්‍රීසි නම:') || name;
                    const province = prompt('පළාත:') || 'බස්නාහිර';
                    onAddCity({ name, name_en: nameEn, province, is_active: true });
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>නව නගරයක්</span>
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {cities.map((city) => (
                  <div key={city.id} className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 text-sm font-bold block">{city.name}</strong>
                      <span className="text-xs text-slate-500">{city.name_en} · {city.province}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateCity(city.id, { is_active: !city.is_active })}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          city.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {city.is_active ? 'සක්‍රීයයි' : 'අක්‍රීයයි'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`${city.name} නගරය මකා දැමීමට අවශ්‍යද?`)) onDeleteCity(city.id);
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 11. HOMEPAGE CMS (CHANGE CONTENT WITHOUT CODE) */}
          {activeSection === 'homepage' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">මුල් පිටුව කළමනාකරණය (Homepage CMS)</h3>
                <p className="text-xs text-slate-500">කෝඩ් වෙනස් නොකර වෙබ් අඩවියේ ප්‍රධාන පාඨ සහ තොරතුරු වෙනස් කරන්න</p>
              </div>

              <div className="space-y-4 max-w-2xl text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ප්‍රධාන සිරස්තලය (Hero Headline)</label>
                  <input
                    type="text"
                    value={settings.hero_headline}
                    onChange={(e) => onUpdateSettings({ hero_headline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ටැග්ලයින් එක (Tagline)</label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => onUpdateSettings({ tagline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">විස්තරය (Hero Description)</label>
                  <textarea
                    rows={3}
                    value={settings.hero_description}
                    onChange={(e) => onUpdateSettings({ hero_description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => alert('මුල් පිටුවේ පාඨ සාර්ථකව යාවත්කාලීන විය!')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                  >
                    වෙනස්කම් සුරකින්න
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 12. BANNERS CRUD */}
          {activeSection === 'banners' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">දැන්වීම් සහ ප්‍රවර්ධන බැනර් (Banners CRUD)</h3>
                  <p className="text-xs text-slate-500">මුල් පිටුවේ බැනර් පින්තූර සහ දැන්වීම් පාලනය</p>
                </div>
                <button
                  onClick={() => {
                    const title = prompt('බැනරයේ මාතෘකාව:');
                    if (!title) return;
                    const sub = prompt('උප මාතෘකාව:') || '';
                    onAddBanner({
                      title,
                      subtitle: sub,
                      image_url: '/src/assets/images/hero_sri_lanka_food_1794103809164.jpg',
                      is_active: true,
                      display_order: banners.length + 1
                    });
                  }}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>නව බැනරයක්</span>
                </button>
              </div>

              <div className="p-5 space-y-4">
                {banners.map((ban) => (
                  <div key={ban.id} className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
                    <img src={ban.image_url} alt="" className="w-full sm:w-48 h-24 rounded-lg object-cover" />
                    <div className="flex-1 text-xs">
                      <strong className="text-sm font-bold text-slate-900 block">{ban.title}</strong>
                      <p className="text-slate-500 mt-1">{ban.subtitle}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdateBanner(ban.id, { is_active: !ban.is_active })}
                        className={`text-[10px] px-2.5 py-1 rounded font-bold ${
                          ban.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {ban.is_active ? 'සක්‍රීයයි' : 'අක්‍රීයයි'}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('බැනරය මකා දැමීමට අවශ්‍යද?')) onDeleteBanner(ban.id);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 13. REPORTS & ANALYTICS */}
          {activeSection === 'reports' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">වාර්තා සහ විශ්ලේෂණ (Reports & Analytics)</h3>
                  <p className="text-xs text-slate-500">විකුණුම්, කඩ කාර්යසාධනය සහ පාරිසරික බලපෑම් දත්ත CSV ලෙස බාගන්න</p>
                </div>
                <button
                  onClick={() => handleExportCSV(reservations, 'FoodSavers_Complete_Report')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>සම්පූර්ණ වාර්තාව (CSV) බාගන්න</span>
                </button>
              </div>

              {/* Best Selling Stores Summary */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h4 className="font-bold text-slate-900 text-sm mb-4">ප්‍රමුඛතම වෙළඳසැල් කාර්යසාධනය</h4>
                <div className="space-y-3">
                  {stores.slice(0, 5).map((s) => {
                    const storeRes = reservations.filter(r => r.store_id === s.id);
                    const revenue = storeRes.filter(r => r.status === 'completed').reduce((acc, r) => acc + r.total_amount, 0);
                    return (
                      <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <strong className="text-slate-900 font-bold block">{s.name}</strong>
                          <span className="text-slate-500">{s.city} · ඇණවුම් {storeRes.length} ක්</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-bold text-emerald-700 text-sm">රු. {revenue.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400 block">එකතු කළ මුදල</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 14. SYSTEM SETTINGS */}
          {activeSection === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6 max-w-2xl text-xs">
              <div>
                <h3 className="font-bold text-slate-900 text-base">පද්ධති සැකසුම් (Platform Settings)</h3>
                <p className="text-slate-500">ආහාර සුරැකීමේ සූත්‍ර, සම්බන්ධීකරණ තොරතුරු සහ Demo Mode</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">ආධාරක දුරකථන අංකය</label>
                  <input
                    type="text"
                    value={settings.support_phone}
                    onChange={(e) => onUpdateSettings({ support_phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">ආධාරක ඊමේල් ලිපිනය</label>
                  <input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => onUpdateSettings({ support_email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">කාර්යාල ලිපිනය</label>
                  <input
                    type="text"
                    value={settings.contact_address}
                    onChange={(e) => onUpdateSettings({ contact_address: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">එක් පැකේජයකින් සුරැකෙන සාමාන්‍ය කිලෝග්‍රෑම් ගණන (Multiplier)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={settings.food_waste_saved_kg_multiplier}
                    onChange={(e) => onUpdateSettings({ food_waste_saved_kg_multiplier: parseFloat(e.target.value) || 1.25 })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => alert('සැකසුම් සාර්ථකව සුරකින ලදී!')}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    සුරකින්න
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 15. ADMIN ACCOUNTS */}
          {activeSection === 'admins' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">පරිපාලක ගිණුම් (Admin Accounts)</h3>
                  <p className="text-xs text-slate-500">පද්ධතියේ පාලන බලතල ඇති ගිණුම්</p>
                </div>
              </div>

              <div className="p-5 divide-y divide-slate-100 text-xs">
                {users.filter(u => u.role === 'admin').map((admin) => (
                  <div key={admin.id} className="py-3 flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 font-bold block">{admin.full_name}</strong>
                      <span className="text-slate-500">{admin.email} · {admin.phone}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      SUPER ADMIN
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 16. AUDIT LOGS (REAL TIMESTAMPS & DETAILS) */}
          {activeSection === 'audit' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">ක්‍රියාකාරකම් ඉතිහාසය (Audit Trail)</h3>
                  <p className="text-xs text-slate-500">පද්ධතියේ සිදුවූ සියලුම පරිපාලක සහ ඇණවුම් ක්‍රියාකාරකම් පිළිබඳ විස්තර</p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                  සටහන්: {auditLogs.length}
                </span>
              </div>

              <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-slate-50/80 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.action}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                          {log.entity}
                        </span>
                      </div>
                      <p className="text-slate-600">{log.details}</p>
                      <p className="text-[10px] text-slate-400">ක්‍රියාකරු: {log.user_email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono text-[11px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(log.timestamp).toLocaleTimeString('si-LK')}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {new Date(log.timestamp).toLocaleDateString('si-LK')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ADMIN STORE MODAL WITH FULL ADDRESS & PHOTO UPLOAD */}
      {storeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingStoreId ? 'වෙළඳසැල් විස්තර සංස්කරණය කරන්න' : 'නව වෙළඳසැලක් එක් කරන්න'}
              </h3>
              <button
                onClick={() => setStoreModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!storeFormName.trim() || !storeFormAddress.trim()) {
                  alert('කරුණාකර නම සහ ලිපිනය ඇතුළත් කරන්න.');
                  return;
                }
                if (editingStoreId) {
                  onUpdateStore(editingStoreId, {
                    name: storeFormName.trim(),
                    owner_name: storeFormOwner.trim(),
                    phone: storeFormPhone.trim(),
                    email: storeFormEmail.trim() || 'store@foodsavers.lk',
                    city: storeFormCity,
                    address: storeFormAddress.trim(),
                    store_type: storeFormType,
                    image_url: storeFormImage,
                  });
                } else {
                  onAddStore({
                    name: storeFormName.trim(),
                    owner_name: storeFormOwner.trim(),
                    phone: storeFormPhone.trim(),
                    email: storeFormEmail.trim() || 'store@foodsavers.lk',
                    city: storeFormCity,
                    address: storeFormAddress.trim(),
                    store_type: storeFormType,
                    image_url: storeFormImage,
                    status: 'approved',
                  });
                }
                setStoreModalOpen(false);
              }}
              className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs"
            >
              {/* Photo Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">වෙළඳසැලේ ඡායාරූපය (Photo Upload)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center bg-slate-50">
                  {storeFormImage && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-2 border border-slate-200">
                      <img src={storeFormImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-store-img-input"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingStoreImg(true);
                      const url = await uploadImage(file, 'store-images');
                      setStoreFormImage(url);
                      setIsUploadingStoreImg(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('admin-store-img-input')?.click()}
                    disabled={isUploadingStoreImg}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isUploadingStoreImg ? 'අප්ලෝඩ් වෙමින්...' : 'ඡායාරූපය Upload කරන්න'}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">වෙළඳසැලේ නම *</label>
                  <input
                    type="text"
                    required
                    value={storeFormName}
                    onChange={(e) => setStoreFormName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">හිමිකරුගේ නම</label>
                  <input
                    type="text"
                    value={storeFormOwner}
                    onChange={(e) => setStoreFormOwner(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">දුරකථන අංකය *</label>
                  <input
                    type="tel"
                    required
                    value={storeFormPhone}
                    onChange={(e) => setStoreFormPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ඊමේල්</label>
                  <input
                    type="email"
                    value={storeFormEmail}
                    onChange={(e) => setStoreFormEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">නගරය *</label>
                  <select
                    value={storeFormCity}
                    onChange={(e) => setStoreFormCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.name}>{c.name} ({c.name_en})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">වර්ගය *</label>
                  <select
                    value={storeFormType}
                    onChange={(e) => setStoreFormType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    <option value="bakery">බේකරි</option>
                    <option value="restaurant">අවන්හල් / හෝටල්</option>
                    <option value="supermarket">සුපර්මාර්කට්</option>
                    <option value="cafe">කැෆේ</option>
                    <option value="grocery">සිල්ලර</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">සම්පූර්ණ වීදි ලිපිනය (Address) *</label>
                <input
                  type="text"
                  required
                  placeholder="නො. 124, ගාලු පාර, කොල්ලුපිටිය, කොළඹ 03"
                  value={storeFormAddress}
                  onChange={(e) => setStoreFormAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setStoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  අවලංගු කරන්න
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingStoreId ? 'යාවත්කාලීන කරන්න' : 'සුරකින්න'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN FOOD DEAL MODAL WITH PHOTO UPLOAD */}
      {dealModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-base font-bold text-slate-900">
                {editingDealId ? 'කෑම පැකේජය සංස්කරණය කරන්න' : 'නව කෑම පැකේජයක් එක් කරන්න'}
              </h3>
              <button
                onClick={() => setDealModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const orig = parseFloat(dealFormOriginalPrice) || 1000;
                const disc = parseFloat(dealFormDiscountedPrice) || 400;
                const qty = parseInt(dealFormQty) || 1;
                const store = stores.find(s => s.id === dealFormStoreId) || stores[0];

                if (disc >= orig) {
                  alert('වට්ටම් කළ මිල මුල් මිලට වඩා අඩු විය යුතුය.');
                  return;
                }

                if (editingDealId) {
                  onUpdateDeal(editingDealId, {
                    title: dealFormTitle,
                    store_id: store.id,
                    store_name: store.name,
                    store_city: store.city,
                    store_address: store.address,
                    category_id: dealFormCatId,
                    description: dealFormDesc,
                    image_url: dealFormImage,
                    original_price: orig,
                    discounted_price: disc,
                    quantity_available: qty,
                    pickup_start: dealFormPickupStart,
                    pickup_end: dealFormPickupEnd,
                    pickup_date: dealFormPickupDate
                  });
                } else {
                  onAddDeal({
                    title: dealFormTitle,
                    store_id: store.id,
                    store_name: store.name,
                    store_city: store.city,
                    store_address: store.address,
                    category_id: dealFormCatId,
                    description: dealFormDesc || 'රසවත් හා නැවුම් ආහාර පැකේජයකි.',
                    image_url: dealFormImage,
                    original_price: orig,
                    discounted_price: disc,
                    quantity_available: qty,
                    quantity_total: qty,
                    pickup_start: dealFormPickupStart,
                    pickup_end: dealFormPickupEnd,
                    pickup_date: dealFormPickupDate,
                    status: 'published'
                  });
                }
                setDealModalOpen(false);
              }}
              className="p-6 space-y-4 max-h-[78vh] overflow-y-auto text-xs"
            >
              {/* Image Upload */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">කෑම පැකේජයේ ඡායාරූපය (Photo Upload) *</label>
                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-3 text-center bg-slate-50">
                  {dealFormImage && (
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden mb-2 border border-slate-200">
                      <img src={dealFormImage} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    id="admin-deal-img-input"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploadingDealImg(true);
                      const url = await uploadImage(file, 'food-images');
                      setDealFormImage(url);
                      setIsUploadingDealImg(false);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('admin-deal-img-input')?.click()}
                    disabled={isUploadingDealImg}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingDealImg ? 'අප්ලෝඩ් වෙමින්...' : 'ඡායාරූපය Upload කරන්න'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">ආහාර පැකේජයේ නම *</label>
                <input
                  type="text"
                  required
                  value={dealFormTitle}
                  onChange={(e) => setDealFormTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">වෙළඳසැල *</label>
                  <select
                    value={dealFormStoreId}
                    onChange={(e) => setDealFormStoreId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {stores.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">කාණ්ඩය *</label>
                  <select
                    value={dealFormCatId}
                    onChange={(e) => setDealFormCatId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">මුල් මිල (රු.) *</label>
                  <input
                    type="number"
                    required
                    value={dealFormOriginalPrice}
                    onChange={(e) => setDealFormOriginalPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">වට්ටම් මිල (රු.) *</label>
                  <input
                    type="number"
                    required
                    value={dealFormDiscountedPrice}
                    onChange={(e) => setDealFormDiscountedPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">තොග ප්‍රමාණය *</label>
                  <input
                    type="number"
                    required
                    value={dealFormQty}
                    onChange={(e) => setDealFormQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ආරම්භක වේලාව</label>
                  <input
                    type="time"
                    value={dealFormPickupStart}
                    onChange={(e) => setDealFormPickupStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">අවසන් වේලාව</label>
                  <input
                    type="time"
                    value={dealFormPickupEnd}
                    onChange={(e) => setDealFormPickupEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">දිනය</label>
                  <input
                    type="date"
                    value={dealFormPickupDate}
                    onChange={(e) => setDealFormPickupDate(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  {editingDealId ? 'යාවත්කාලීන කරන්න' : 'පළ කරන්න'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

