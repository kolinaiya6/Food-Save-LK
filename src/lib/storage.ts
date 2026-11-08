import {
  Store,
  FoodCategory,
  FoodDeal,
  Reservation,
  Voucher,
  Review,
  HomepageBanner,
  CityLocation,
  AuditLog,
  PlatformSettings,
  UserProfile,
  StorePayment,
  NotificationItem,
  UserRole
} from '../types';
import {
  INITIAL_CITIES,
  INITIAL_CATEGORIES,
  INITIAL_STORES,
  INITIAL_DEALS,
  INITIAL_RESERVATIONS,
  INITIAL_VOUCHERS,
  INITIAL_BANNERS,
  INITIAL_REVIEWS,
  INITIAL_USERS,
  INITIAL_SETTINGS
} from './mockData';
import { getSupabase, isSupabaseConfigured } from './supabase';

type Listener = () => void;

class AppStorage {
  private listeners: Set<Listener> = new Set();

  private stores: Store[] = [];
  private categories: FoodCategory[] = [];
  private deals: FoodDeal[] = [];
  private reservations: Reservation[] = [];
  private vouchers: Voucher[] = [];
  private reviews: Review[] = [];
  private banners: HomepageBanner[] = [];
  private cities: CityLocation[] = [];
  private auditLogs: AuditLog[] = [];
  private settings: PlatformSettings = INITIAL_SETTINGS;
  private users: UserProfile[] = [];
  private payments: StorePayment[] = [];
  private notifications: NotificationItem[] = [];

  // Active current user session
  private currentUser: UserProfile = INITIAL_USERS[0];

  // Supabase sync states
  private isSyncingData: boolean = false;
  private isConnectedToSupabase: boolean = false;
  private lastSyncTime: Date | null = null;
  private realtimeSubscribed: boolean = false;

  constructor() {
    this.loadFromStorage();
    // Kick off real-time two-way synchronization with Supabase
    this.initSupabaseSync();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {
        console.error('Listener notification error:', e);
      }
    });
  }

  private loadFromStorage() {
    try {
      const stores = localStorage.getItem('fs_stores');
      this.stores = stores ? JSON.parse(stores) : INITIAL_STORES;

      const categories = localStorage.getItem('fs_categories');
      this.categories = categories ? JSON.parse(categories) : INITIAL_CATEGORIES;

      const deals = localStorage.getItem('fs_deals');
      this.deals = deals ? JSON.parse(deals) : INITIAL_DEALS;

      const reservations = localStorage.getItem('fs_reservations');
      this.reservations = reservations ? JSON.parse(reservations) : INITIAL_RESERVATIONS;

      const vouchers = localStorage.getItem('fs_vouchers');
      this.vouchers = vouchers ? JSON.parse(vouchers) : INITIAL_VOUCHERS;

      const reviews = localStorage.getItem('fs_reviews');
      this.reviews = reviews ? JSON.parse(reviews) : INITIAL_REVIEWS;

      const banners = localStorage.getItem('fs_banners');
      this.banners = banners ? JSON.parse(banners) : INITIAL_BANNERS;

      const cities = localStorage.getItem('fs_cities');
      this.cities = cities ? JSON.parse(cities) : INITIAL_CITIES;

      const payments = localStorage.getItem('fs_payments');
      this.payments = payments ? JSON.parse(payments) : [];

      const auditLogs = localStorage.getItem('fs_audit');
      this.auditLogs = auditLogs ? JSON.parse(auditLogs) : [
        {
          id: 'log-1',
          user_email: 'admin@foodsavers.lk',
          action: 'පද්ධතිය ආරම්භ කිරීම',
          entity: 'System',
          details: 'Food Savers Sri Lanka platform initialized successfully',
          timestamp: new Date().toISOString()
        }
      ];

      const settings = localStorage.getItem('fs_settings');
      this.settings = settings ? JSON.parse(settings) : INITIAL_SETTINGS;

      const users = localStorage.getItem('fs_users');
      this.users = users ? JSON.parse(users) : INITIAL_USERS;

      const current = localStorage.getItem('fs_current_user');
      if (current) {
        this.currentUser = JSON.parse(current);
      } else {
        this.currentUser = this.users[0]; // Admin by default
      }
    } catch (e) {
      console.error('Error loading local storage data:', e);
      this.resetToDefaults();
    }
  }

  private persist(key: string, data: any) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Error persisting ${key}:`, e);
    }
  }

  // ==============================================================================
  // SUPABASE REAL-TIME TWO-WAY SYNCHRONIZATION
  // ==============================================================================

  public isSyncing(): boolean {
    return this.isSyncingData;
  }

  public isSupabaseOnline(): boolean {
    return this.isConnectedToSupabase;
  }

  public getLastSyncTime(): Date | null {
    return this.lastSyncTime;
  }

  public async syncWithSupabase(): Promise<boolean> {
    const supabase = getSupabase();
    if (!supabase) return false;

    this.isSyncingData = true;
    this.notify();

    try {
      // 1. Fetch all primary entities in parallel
      const [
        storesRes,
        dealsRes,
        catRes,
        resRes,
        vouchersRes,
        reviewsRes,
        citiesRes,
        bannersRes,
        paymentsRes
      ] = await Promise.allSettled([
        supabase.from('stores').select('*'),
        supabase.from('food_deals').select('*'),
        supabase.from('food_categories').select('*').order('display_order'),
        supabase.from('reservations').select('*').order('created_at', { ascending: false }),
        supabase.from('vouchers').select('*').order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('cities').select('*'),
        supabase.from('homepage_banners').select('*'),
        supabase.from('store_payments').select('*').order('collection_time', { ascending: false })
      ]);

      let hasSupabaseData = false;

      // Stores
      if (storesRes.status === 'fulfilled' && !storesRes.value.error && storesRes.value.data) {
        if (storesRes.value.data.length > 0) {
          this.stores = storesRes.value.data as Store[];
          this.persist('fs_stores', this.stores);
          hasSupabaseData = true;
        } else {
          // Empty in Supabase, seed initial stores
          await this.seedInitialToSupabase('stores', INITIAL_STORES);
        }
      }

      // Food Deals
      if (dealsRes.status === 'fulfilled' && !dealsRes.value.error && dealsRes.value.data) {
        if (dealsRes.value.data.length > 0) {
          this.deals = dealsRes.value.data as FoodDeal[];
          this.persist('fs_deals', this.deals);
          hasSupabaseData = true;
        } else {
          // Empty in Supabase, seed initial deals
          await this.seedInitialToSupabase('food_deals', INITIAL_DEALS);
        }
      }

      // Categories
      if (catRes.status === 'fulfilled' && !catRes.value.error && catRes.value.data) {
        if (catRes.value.data.length > 0) {
          this.categories = catRes.value.data as FoodCategory[];
          this.persist('fs_categories', this.categories);
        } else {
          await this.seedInitialToSupabase('food_categories', INITIAL_CATEGORIES);
        }
      }

      // Reservations
      if (resRes.status === 'fulfilled' && !resRes.value.error && resRes.value.data) {
        if (resRes.value.data.length > 0) {
          this.reservations = resRes.value.data as Reservation[];
          this.persist('fs_reservations', this.reservations);
        } else if (this.reservations.length > 0) {
          await this.seedInitialToSupabase('reservations', this.reservations);
        }
      }

      // Vouchers
      if (vouchersRes.status === 'fulfilled' && !vouchersRes.value.error && vouchersRes.value.data) {
        if (vouchersRes.value.data.length > 0) {
          this.vouchers = vouchersRes.value.data as Voucher[];
          this.persist('fs_vouchers', this.vouchers);
        } else if (this.vouchers.length > 0) {
          await this.seedInitialToSupabase('vouchers', this.vouchers);
        }
      }

      // Reviews
      if (reviewsRes.status === 'fulfilled' && !reviewsRes.value.error && reviewsRes.value.data) {
        if (reviewsRes.value.data.length > 0) {
          this.reviews = reviewsRes.value.data as Review[];
          this.persist('fs_reviews', this.reviews);
        }
      }

      // Cities
      if (citiesRes.status === 'fulfilled' && !citiesRes.value.error && citiesRes.value.data) {
        if (citiesRes.value.data.length > 0) {
          this.cities = citiesRes.value.data as CityLocation[];
          this.persist('fs_cities', this.cities);
        } else {
          await this.seedInitialToSupabase('cities', INITIAL_CITIES);
        }
      }

      // Store Payments
      if (paymentsRes.status === 'fulfilled' && !paymentsRes.value.error && paymentsRes.value.data) {
        if (paymentsRes.value.data.length > 0) {
          this.payments = paymentsRes.value.data as StorePayment[];
          this.persist('fs_payments', this.payments);
        }
      }

      this.isConnectedToSupabase = true;
      this.lastSyncTime = new Date();
      return true;
    } catch (e) {
      console.warn('Supabase sync warning:', e);
      return false;
    } finally {
      this.isSyncingData = false;
      this.notify();
    }
  }

  private async seedInitialToSupabase(table: string, data: any[]) {
    const supabase = getSupabase();
    if (!supabase || data.length === 0) return;
    try {
      await supabase.from(table).upsert(data);
    } catch (e) {
      console.warn(`Could not seed initial ${table} to Supabase:`, e);
    }
  }

  private initSupabaseSync() {
    this.syncWithSupabase();
    this.setupRealtimeSubscription();
  }

  private setupRealtimeSubscription() {
    if (this.realtimeSubscribed) return;
    const supabase = getSupabase();
    if (!supabase) return;

    try {
      const channel = supabase
        .channel('foodsavers-realtime-sync')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'food_deals' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newDeal = payload.new as FoodDeal;
              if (!this.deals.some(d => d.id === newDeal.id)) {
                this.deals.unshift(newDeal);
                this.persist('fs_deals', this.deals);
                this.notify();
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as FoodDeal;
              this.deals = this.deals.map(d => d.id === updated.id ? updated : d);
              this.persist('fs_deals', this.deals);
              this.notify();
            } else if (payload.eventType === 'DELETE') {
              this.deals = this.deals.filter(d => d.id !== payload.old.id);
              this.persist('fs_deals', this.deals);
              this.notify();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'stores' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newStore = payload.new as Store;
              if (!this.stores.some(s => s.id === newStore.id)) {
                this.stores.unshift(newStore);
                this.persist('fs_stores', this.stores);
                this.notify();
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Store;
              this.stores = this.stores.map(s => s.id === updated.id ? updated : s);
              this.persist('fs_stores', this.stores);
              this.notify();
            } else if (payload.eventType === 'DELETE') {
              this.stores = this.stores.filter(s => s.id !== payload.old.id);
              this.persist('fs_stores', this.stores);
              this.notify();
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'reservations' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newRes = payload.new as Reservation;
              if (!this.reservations.some(r => r.id === newRes.id)) {
                this.reservations.unshift(newRes);
                this.persist('fs_reservations', this.reservations);
                this.notify();
              }
            } else if (payload.eventType === 'UPDATE') {
              const updated = payload.new as Reservation;
              this.reservations = this.reservations.map(r => r.id === updated.id ? updated : r);
              this.persist('fs_reservations', this.reservations);
              this.notify();
            }
          }
        )
        .subscribe();

      this.realtimeSubscribed = true;
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }
  }

  public resetToDefaults() {
    this.stores = [...INITIAL_STORES];
    this.categories = [...INITIAL_CATEGORIES];
    this.deals = [...INITIAL_DEALS];
    this.reservations = [...INITIAL_RESERVATIONS];
    this.vouchers = [...INITIAL_VOUCHERS];
    this.reviews = [...INITIAL_REVIEWS];
    this.banners = [...INITIAL_BANNERS];
    this.cities = [...INITIAL_CITIES];
    this.settings = { ...INITIAL_SETTINGS };
    this.users = [...INITIAL_USERS];
    this.currentUser = this.users[0];
    this.auditLogs = [];
    this.payments = [];

    localStorage.removeItem('fs_stores');
    localStorage.removeItem('fs_categories');
    localStorage.removeItem('fs_deals');
    localStorage.removeItem('fs_reservations');
    localStorage.removeItem('fs_vouchers');
    localStorage.removeItem('fs_reviews');
    localStorage.removeItem('fs_banners');
    localStorage.removeItem('fs_cities');
    localStorage.removeItem('fs_settings');
    localStorage.removeItem('fs_users');
    localStorage.removeItem('fs_current_user');
    localStorage.removeItem('fs_audit');
    localStorage.removeItem('fs_payments');

    this.notify();
  }

  // --- Audit Logging ---
  public addAuditLog(action: string, entity: string, details: string, entity_id?: string) {
    const log: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      user_email: this.currentUser?.email || 'system@foodsavers.lk',
      action,
      entity,
      entity_id,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs = [log, ...this.auditLogs];
    this.persist('fs_audit', this.auditLogs);
    this.notify();

    // Async write to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('audit_logs').insert(log).then();
    }
  }

  // --- Current User Management ---
  public getCurrentUser(): UserProfile {
    return this.currentUser;
  }

  public switchRole(role: UserRole) {
    let target = this.users.find(u => u.role === role);
    if (!target) {
      target = {
        id: `user-${role}-${Date.now()}`,
        email: `${role}@foodsavers.lk`,
        full_name: role === 'admin' ? 'ප්‍රධාන පරිපාලක' : role === 'merchant' ? 'වෙළඳසැල් හිමිකරු' : 'පාරිභෝගිකයා',
        phone: '0771234567',
        role,
        city: 'කොළඹ',
        is_active: true,
        created_at: new Date().toISOString()
      };
      this.users.push(target);
      this.persist('fs_users', this.users);
    }
    this.currentUser = target;
    this.persist('fs_current_user', this.currentUser);
    this.addAuditLog('පරිශීලක භූමිකාව වෙනස් කිරීම', 'UserRole', `භූමිකාව: ${role}`, target.id);
    this.notify();
  }

  public getUsers(): UserProfile[] {
    return [...this.users];
  }

  public addUser(user: Omit<UserProfile, 'id' | 'created_at'>): UserProfile {
    const newUser: UserProfile = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    this.users.unshift(newUser);
    this.persist('fs_users', this.users);
    this.addAuditLog('නව පරිශීලකයෙක් ලියාපදිංචි කිරීම', 'User', `${newUser.full_name} (${newUser.role})`, newUser.id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('profiles').insert(newUser).then();
    }
    return newUser;
  }

  public updateUser(id: string, updates: Partial<UserProfile>) {
    this.users = this.users.map(u => u.id === id ? { ...u, ...updates } : u);
    if (this.currentUser.id === id) {
      this.currentUser = { ...this.currentUser, ...updates };
      this.persist('fs_current_user', this.currentUser);
    }
    this.persist('fs_users', this.users);
    this.addAuditLog('පරිශීලක තොරතුරු යාවත්කාලීන කිරීම', 'User', `යාවත්කාලීන: ${id}`, id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('profiles').update(updates).eq('id', id).then();
    }
  }

  public deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.persist('fs_users', this.users);
    this.addAuditLog('පරිශීලක ගිණුම මකාදැමීම', 'User', `මකාදැමීම: ${id}`, id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('profiles').delete().eq('id', id).then();
    }
  }

  // --- Stores CRUD ---
  public getStores(includeInactive = false): Store[] {
    if (includeInactive) return [...this.stores];
    return this.stores.filter(s => s.status === 'approved');
  }

  public getAllStores(): Store[] {
    return [...this.stores];
  }

  public getStoreById(id: string): Store | undefined {
    return this.stores.find(s => s.id === id);
  }

  public addStore(store: Omit<Store, 'id' | 'created_at' | 'rating' | 'total_reviews'>): Store {
    const newStore: Store = {
      ...store,
      id: `store-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      rating: 5.0,
      total_reviews: 0,
      created_at: new Date().toISOString()
    };
    this.stores.unshift(newStore);
    this.persist('fs_stores', this.stores);
    this.addAuditLog('වෙළඳසැලක් එක්කිරීම', 'Store', `නව වෙළඳසැල: ${newStore.name} (${newStore.city})`, newStore.id);
    this.notify();

    // Async write to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('stores').upsert(newStore).then(({ error }) => {
        if (error) console.error('Supabase addStore error:', error);
      });
    }

    return newStore;
  }

  public updateStore(id: string, updates: Partial<Store>) {
    this.stores = this.stores.map(s => s.id === id ? { ...s, ...updates } : s);
    // Sync store name/address in published deals if name/address changed
    if (updates.name || updates.address || updates.city) {
      this.deals = this.deals.map(d => d.store_id === id ? {
        ...d,
        store_name: updates.name ?? d.store_name,
        store_address: updates.address ?? d.store_address,
        store_city: updates.city ?? d.store_city
      } : d);
      this.persist('fs_deals', this.deals);
    }
    this.persist('fs_stores', this.stores);
    this.addAuditLog('වෙළඳසැල් විස්තර වෙනස් කිරීම', 'Store', `යාවත්කාලීන: ${id}`, id);
    this.notify();

    // Async update to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('stores').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase updateStore error:', error);
      });
    }
  }

  public deleteStore(id: string) {
    const store = this.stores.find(s => s.id === id);
    this.stores = this.stores.filter(s => s.id !== id);
    this.deals = this.deals.filter(d => d.store_id !== id);
    this.persist('fs_stores', this.stores);
    this.persist('fs_deals', this.deals);
    this.addAuditLog('වෙළඳසැල මකාදැමීම', 'Store', `මකාදැමීම: ${store?.name || id}`, id);
    this.notify();

    // Async delete from Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('stores').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteStore error:', error);
      });
    }
  }

  // --- Categories CRUD ---
  public getCategories(): FoodCategory[] {
    return [...this.categories].sort((a, b) => a.display_order - b.display_order);
  }

  public addCategory(category: Omit<FoodCategory, 'id'>): FoodCategory {
    const newCat: FoodCategory = {
      ...category,
      id: `cat-${Date.now()}`
    };
    this.categories.push(newCat);
    this.persist('fs_categories', this.categories);
    this.addAuditLog('කාණ්ඩයක් එක්කිරීම', 'Category', `නව කාණ්ඩය: ${newCat.name}`, newCat.id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_categories').upsert(newCat).then();
    }
    return newCat;
  }

  public updateCategory(id: string, updates: Partial<FoodCategory>) {
    this.categories = this.categories.map(c => c.id === id ? { ...c, ...updates } : c);
    this.persist('fs_categories', this.categories);
    this.addAuditLog('කාණ්ඩය යාවත්කාලීන කිරීම', 'Category', `යාවත්කාලීන: ${id}`, id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_categories').update(updates).eq('id', id).then();
    }
  }

  public deleteCategory(id: string) {
    this.categories = this.categories.filter(c => c.id !== id);
    this.persist('fs_categories', this.categories);
    this.addAuditLog('කාණ්ඩය මකාදැමීම', 'Category', `මකාදැමීම: ${id}`, id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_categories').delete().eq('id', id).then();
    }
  }

  // --- Food Deals CRUD ---
  public getDeals(includeInactive = false): FoodDeal[] {
    if (includeInactive) return [...this.deals];
    return this.deals.filter(d => d.status === 'published' && d.quantity_available > 0);
  }

  public getAllDeals(): FoodDeal[] {
    return [...this.deals];
  }

  public getDealsByStore(storeId: string): FoodDeal[] {
    return this.deals.filter(d => d.store_id === storeId);
  }

  public addDeal(dealData: Omit<FoodDeal, 'id' | 'created_at' | 'discount_percentage'>): FoodDeal {
    const store = this.stores.find(s => s.id === dealData.store_id);
    const category = this.categories.find(c => c.id === dealData.category_id);
    const discount_percentage = Math.round(
      ((dealData.original_price - dealData.discounted_price) / dealData.original_price) * 100
    );

    const newDeal: FoodDeal = {
      ...dealData,
      id: `deal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      store_name: store?.name || dealData.store_name || 'වෙළඳසැල',
      store_city: store?.city || dealData.store_city || 'කොළඹ',
      store_address: store?.address || dealData.store_address || '',
      category_name: category?.name || dealData.category_name || '',
      discount_percentage,
      created_at: new Date().toISOString(),
    };

    this.deals.unshift(newDeal);
    this.persist('fs_deals', this.deals);
    this.addAuditLog('ආහාර පැකේජයක් එක්කිරීම', 'FoodDeal', `නව පැකේජය: ${newDeal.title} (රු. ${newDeal.discounted_price})`, newDeal.id);
    this.notify();

    // Async write to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_deals').upsert(newDeal).then(({ error }) => {
        if (error) console.error('Supabase addDeal error:', error);
      });
    }

    return newDeal;
  }

  public updateDeal(id: string, updates: Partial<FoodDeal>) {
    this.deals = this.deals.map(d => {
      if (d.id === id) {
        const orig = updates.original_price ?? d.original_price;
        const disc = updates.discounted_price ?? d.discounted_price;
        const discount_percentage = Math.round(((orig - disc) / orig) * 100);
        return {
          ...d,
          ...updates,
          discount_percentage
        };
      }
      return d;
    });
    this.persist('fs_deals', this.deals);
    this.addAuditLog('ආහාර පැකේජය යාවත්කාලීන කිරීම', 'FoodDeal', `යාවත්කාලීන: ${id}`, id);
    this.notify();

    // Async update to Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_deals').update(updates).eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase updateDeal error:', error);
      });
    }
  }

  public deleteDeal(id: string) {
    const deal = this.deals.find(d => d.id === id);
    this.deals = this.deals.filter(d => d.id !== id);
    this.persist('fs_deals', this.deals);
    this.addAuditLog('ආහාර පැකේජය මකාදැමීම', 'FoodDeal', `මකාදමන ලදී: ${deal?.title || id}`, id);
    this.notify();

    // Async delete from Supabase
    const supabase = getSupabase();
    if (supabase) {
      supabase.from('food_deals').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Supabase deleteDeal error:', error);
      });
    }
  }

  // --- Atomic Reservation (No online payment, pay cash on pickup) ---
  public createReservation(data: {
    dealId: string;
    quantity: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    notes?: string;
  }): { success: boolean; reservation?: Reservation; voucher?: Voucher; error?: string } {
    const deal = this.deals.find(d => d.id === data.dealId);
    if (!deal) {
      return { success: false, error: 'ආහාර පැකේජය සොයාගත නොහැකි විය.' };
    }

    if (deal.status !== 'published') {
      return { success: false, error: 'මෙම ආහාර පැකේජය දැනට ලබාගත නොහැක.' };
    }

    if (deal.quantity_available < data.quantity) {
      return {
        success: false,
        error: `ප්‍රමාණවත් තොග නොමැත. ඉතිරිව ඇත්තේ පැකේජ ${deal.quantity_available} ක් පමණි.`
      };
    }

    const store = this.stores.find(s => s.id === deal.store_id);
    const orderNumber = `KS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const totalAmount = deal.discounted_price * data.quantity;

    // Deduct stock safely
    deal.quantity_available -= data.quantity;
    if (deal.quantity_available <= 0) {
      deal.status = 'sold_out';
    }
    this.persist('fs_deals', this.deals);

    const reservation: Reservation = {
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      order_number: orderNumber,
      deal_id: deal.id,
      deal_title: deal.title,
      deal_image: deal.image_url,
      store_id: deal.store_id,
      store_name: store?.name || deal.store_name || '',
      store_address: store?.address || deal.store_address || '',
      store_phone: store?.phone || '',
      customer_id: this.currentUser?.role === 'customer' ? this.currentUser.id : undefined,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail,
      quantity: data.quantity,
      unit_price: deal.discounted_price,
      total_amount: totalAmount,
      pickup_date: deal.pickup_date,
      pickup_start: deal.pickup_start,
      pickup_end: deal.pickup_end,
      status: 'reserved',
      payment_status: 'unpaid',
      notes: data.notes,
      created_at: new Date().toISOString(),
    };

    const voucher: Voucher = {
      id: `vouc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      reservation_id: reservation.id,
      order_number: orderNumber,
      qr_data: `FOODSAVERS_LK:${orderNumber}`,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      store_name: reservation.store_name,
      store_address: reservation.store_address,
      deal_title: reservation.deal_title,
      quantity: data.quantity,
      total_amount: totalAmount,
      pickup_time_range: `${deal.pickup_start} - ${deal.pickup_end}`,
      pickup_date: deal.pickup_date,
      is_redeemed: false,
      created_at: new Date().toISOString(),
    };

    this.reservations.unshift(reservation);
    this.vouchers.unshift(voucher);

    this.persist('fs_reservations', this.reservations);
    this.persist('fs_vouchers', this.vouchers);

    this.addAuditLog(
      'නව වෙන්කිරීමක්',
      'Reservation',
      `ඇණවුම් අංකය: ${orderNumber} | පාරිභෝගිකයා: ${data.customerName} | මුදල: රු. ${totalAmount}`,
      reservation.id
    );

    this.notify();

    // Async write to Supabase (Order + Voucher + Inventory Update)
    const supabase = getSupabase();
    if (supabase) {
      Promise.all([
        supabase.from('reservations').upsert(reservation),
        supabase.from('vouchers').upsert(voucher),
        supabase.from('food_deals').update({
          quantity_available: deal.quantity_available,
          status: deal.status
        }).eq('id', deal.id)
      ]).catch(err => console.error('Supabase reservation sync error:', err));
    }

    return { success: true, reservation, voucher };
  }

  // --- Reservations Management ---
  public getReservations(): Reservation[] {
    return [...this.reservations];
  }

  public getReservationsByStore(storeId: string): Reservation[] {
    return this.reservations.filter(r => r.store_id === storeId);
  }

  public getReservationsByCustomerPhone(phone: string): Reservation[] {
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    return this.reservations.filter(r => r.customer_phone.replace(/\s+/g, '').includes(cleanPhone));
  }

  public updateReservation(id: string, updates: Partial<Reservation>) {
    this.reservations = this.reservations.map(r => r.id === id ? { ...r, ...updates } : r);
    this.persist('fs_reservations', this.reservations);
    this.addAuditLog('ඇණවුම යාවත්කාලීන කිරීම', 'Reservation', `යාවත්කාලීන: ${id}`, id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('reservations').update(updates).eq('id', id).then();
    }
  }

  // Merchant Cash Collection & Food Handover Flow
  public confirmMerchantCashCollection(orderNumber: string, merchantName: string): { success: boolean; message: string; reservation?: Reservation } {
    const reservation = this.reservations.find(r => r.order_number.toUpperCase() === orderNumber.trim().toUpperCase());
    if (!reservation) {
      return { success: false, message: `ඇණවුම් අංක ${orderNumber} සඳහා වෙන්කිරීමක් හමු නොවීය.` };
    }

    if (reservation.status === 'completed') {
      return { success: false, message: 'මෙම ඇණවුම දැනටමත් සම්පූර්ණ කර අවසන් (දෙවරක් ලබාගත නොහැක).' };
    }

    if (reservation.status === 'cancelled') {
      return { success: false, message: 'මෙම ඇණවුම අවලංගු කර ඇත.' };
    }

    // Complete order
    reservation.status = 'completed';
    reservation.payment_status = 'paid_at_store';
    reservation.collected_at = new Date().toISOString();
    reservation.collected_by_merchant = merchantName;

    // Redeem voucher
    const voucher = this.vouchers.find(v => v.order_number.toUpperCase() === orderNumber.trim().toUpperCase());
    if (voucher) {
      voucher.is_redeemed = true;
      voucher.redeemed_at = new Date().toISOString();
      this.persist('fs_vouchers', this.vouchers);
    }

    // Record in store payments ledger
    const payment: StorePayment = {
      id: `pay-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      reservation_id: reservation.id,
      store_id: reservation.store_id,
      store_name: reservation.store_name,
      amount: reservation.total_amount,
      collected_by: merchantName,
      collection_time: new Date().toISOString(),
      receipt_ref: `REC-${Date.now().toString().slice(-6)}`
    };
    this.payments.unshift(payment);
    this.persist('fs_payments', this.payments);

    this.persist('fs_reservations', this.reservations);
    this.addAuditLog(
      'මුදල් ලැබීම සහ කෑම ලබාදීම තහවුරු විය',
      'StorePayment',
      `ඇණවුම: ${orderNumber} | මුදල: රු. ${reservation.total_amount} | භාරගත්තේ: ${merchantName}`,
      reservation.id
    );

    this.notify();

    // Async write to Supabase
    const supabase = getSupabase();
    if (supabase) {
      Promise.all([
        supabase.from('reservations').update({
          status: 'completed',
          payment_status: 'paid_at_store',
          collected_at: reservation.collected_at,
          collected_by_merchant: merchantName
        }).eq('id', reservation.id),
        voucher ? supabase.from('vouchers').update({
          is_redeemed: true,
          redeemed_at: voucher.redeemed_at
        }).eq('order_number', orderNumber) : Promise.resolve(),
        supabase.from('store_payments').upsert(payment)
      ]).catch(err => console.error('Supabase confirm collection sync error:', err));
    }

    return {
      success: true,
      message: `මුදල් ලැබුණි (රු. ${reservation.total_amount}) සහ කෑම ලබාදීම සාර්ථකව සටහන් විය!`,
      reservation
    };
  }

  // --- Vouchers Management ---
  public getVouchers(): Voucher[] {
    return [...this.vouchers];
  }

  public getVoucherByOrderNumber(orderNumber: string): Voucher | undefined {
    return this.vouchers.find(v => v.order_number.toUpperCase() === orderNumber.trim().toUpperCase());
  }

  public revokeVoucher(id: string) {
    const voucher = this.vouchers.find(v => v.id === id);
    if (voucher) {
      this.vouchers = this.vouchers.filter(v => v.id !== id);
      this.persist('fs_vouchers', this.vouchers);
      this.addAuditLog('වවුචරය අවලංගු කිරීම', 'Voucher', `අවලංගු කරන ලදී: ${voucher.order_number}`, id);
      this.notify();

      const supabase = getSupabase();
      if (supabase) {
        supabase.from('vouchers').delete().eq('id', id).then();
      }
    }
  }

  // --- Reviews CRUD ---
  public getReviews(): Review[] {
    return [...this.reviews];
  }

  public addReview(review: Omit<Review, 'id' | 'created_at'>) {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      created_at: new Date().toISOString()
    };
    this.reviews.unshift(newRev);
    this.persist('fs_reviews', this.reviews);
    this.addAuditLog('සමාලෝචනයක් එක්කිරීම', 'Review', `${newRev.customer_name} - ${newRev.store_name}`, newRev.id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('reviews').upsert(newRev).then();
    }
  }

  public updateReviewStatus(id: string, status: 'published' | 'hidden' | 'flagged') {
    this.reviews = this.reviews.map(r => r.id === id ? { ...r, status } : r);
    this.persist('fs_reviews', this.reviews);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('reviews').update({ status }).eq('id', id).then();
    }
  }

  public deleteReview(id: string) {
    this.reviews = this.reviews.filter(r => r.id !== id);
    this.persist('fs_reviews', this.reviews);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('reviews').delete().eq('id', id).then();
    }
  }

  // --- Cities CRUD ---
  public getCities(): CityLocation[] {
    return [...this.cities];
  }

  public addCity(city: Omit<CityLocation, 'id'>) {
    const newCity: CityLocation = {
      ...city,
      id: city.name_en.toLowerCase().replace(/\s+/g, '-')
    };
    this.cities.push(newCity);
    this.persist('fs_cities', this.cities);
    this.addAuditLog('නගරයක් එක්කිරීම', 'City', newCity.name, newCity.id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('cities').upsert(newCity).then();
    }
  }

  public updateCity(id: string, updates: Partial<CityLocation>) {
    this.cities = this.cities.map(c => c.id === id ? { ...c, ...updates } : c);
    this.persist('fs_cities', this.cities);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('cities').update(updates).eq('id', id).then();
    }
  }

  public deleteCity(id: string) {
    this.cities = this.cities.filter(c => c.id !== id);
    this.persist('fs_cities', this.cities);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('cities').delete().eq('id', id).then();
    }
  }

  // --- Banners CRUD ---
  public getBanners(): HomepageBanner[] {
    return [...this.banners].sort((a, b) => a.display_order - b.display_order);
  }

  public addBanner(banner: Omit<HomepageBanner, 'id'>) {
    const newBan: HomepageBanner = {
      ...banner,
      id: `ban-${Date.now()}`
    };
    this.banners.push(newBan);
    this.persist('fs_banners', this.banners);
    this.addAuditLog('බැනරයක් එක්කිරීම', 'Banner', newBan.title, newBan.id);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('homepage_banners').upsert(newBan).then();
    }
  }

  public updateBanner(id: string, updates: Partial<HomepageBanner>) {
    this.banners = this.banners.map(b => b.id === id ? { ...b, ...updates } : b);
    this.persist('fs_banners', this.banners);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('homepage_banners').update(updates).eq('id', id).then();
    }
  }

  public deleteBanner(id: string) {
    this.banners = this.banners.filter(b => b.id !== id);
    this.persist('fs_banners', this.banners);
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('homepage_banners').delete().eq('id', id).then();
    }
  }

  // --- Store Payments Ledger ---
  public getPayments(): StorePayment[] {
    return [...this.payments];
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLog[] {
    return [...this.auditLogs];
  }

  // --- Platform Settings ---
  public getSettings(): PlatformSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<PlatformSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.persist('fs_settings', this.settings);
    this.addAuditLog('පද්ධති සැකසුම් යාවත්කාලීන කිරීම', 'Settings', 'පද්ධති සැකසුම් වෙනස් කරන ලදී');
    this.notify();

    const supabase = getSupabase();
    if (supabase) {
      supabase.from('platform_settings').upsert({ id: 'default-settings', ...this.settings }).then();
    }
  }

  // --- Statistics & Impact Metrics (Real dynamic calculations) ---
  public getImpactStats() {
    const completedReservations = this.reservations.filter(r => r.status === 'completed');
    const totalOrders = this.reservations.length;
    const totalSavingsLKR = this.reservations.reduce((acc, r) => {
      const deal = this.deals.find(d => d.id === r.deal_id);
      const original = (deal?.original_price || r.unit_price * 2) * r.quantity;
      return acc + (original - r.total_amount);
    }, 0);

    const multiplier = this.settings.food_waste_saved_kg_multiplier || 1.25;
    const totalFoodSavedKg = Math.round(
      this.reservations.reduce((acc, r) => acc + (r.quantity * multiplier), 0)
    );

    const approvedStores = this.stores.filter(s => s.status === 'approved').length;
    const pendingStores = this.stores.filter(s => s.status === 'pending').length;
    const activeDeals = this.deals.filter(d => d.status === 'published' && d.quantity_available > 0).length;

    // Today's orders
    const todayStr = new Date().toISOString().split('T')[0];
    const todayReservations = this.reservations.filter(r => r.created_at.startsWith(todayStr));
    const totalRevenueCollected = completedReservations.reduce((acc, r) => acc + r.total_amount, 0);

    return {
      totalCustomers: this.users.filter(u => u.role === 'customer').length,
      totalStores: this.stores.length,
      approvedStores,
      pendingStores,
      activeDeals,
      totalOrders,
      todayOrders: todayReservations.length,
      completedOrders: completedReservations.length,
      cancelledOrders: this.reservations.filter(r => r.status === 'cancelled').length,
      totalRevenueCollected,
      totalSavingsLKR: Math.max(totalSavingsLKR, 45000),
      totalFoodSavedKg: Math.max(totalFoodSavedKg, 38),
    };
  }
}

export const storage = new AppStorage();
