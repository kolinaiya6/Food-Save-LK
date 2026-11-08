export type UserRole = 'customer' | 'merchant' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  city?: string;
  is_active: boolean;
  created_at: string;
}

export type StoreStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface Store {
  id: string;
  owner_id?: string;
  name: string;
  owner_name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  store_type: 'bakery' | 'restaurant' | 'supermarket' | 'cafe' | 'grocery' | 'hotel';
  image_url: string;
  status: StoreStatus;
  rating: number;
  total_reviews: number;
  opening_time?: string;
  closing_time?: string;
  created_at: string;
}

export interface FoodCategory {
  id: string;
  name: string; // Sinhala
  name_en?: string;
  icon: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
}

export type DealStatus = 'published' | 'paused' | 'sold_out' | 'expired' | 'archived';

export interface FoodDeal {
  id: string;
  store_id: string;
  store_name?: string;
  store_city?: string;
  store_address?: string;
  category_id: string;
  category_name?: string;
  title: string;
  description: string;
  image_url: string;
  original_price: number;
  discounted_price: number;
  discount_percentage: number;
  quantity_available: number;
  quantity_total: number;
  pickup_start: string; // e.g. "17:30"
  pickup_end: string;   // e.g. "20:00"
  pickup_date: string;  // e.g. "2026-11-08"
  allergens?: string;
  status: DealStatus;
  created_at: string;
}

export type ReservationStatus = 'reserved' | 'ready_for_pickup' | 'completed' | 'cancelled' | 'expired';
export type PaymentCollectionStatus = 'unpaid' | 'paid_at_store' | 'verified';

export interface Reservation {
  id: string;
  order_number: string; // e.g. "KS-2026-8942"
  deal_id: string;
  deal_title: string;
  deal_image?: string;
  store_id: string;
  store_name: string;
  store_address: string;
  store_phone: string;
  customer_id?: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  pickup_date: string;
  pickup_start: string;
  pickup_end: string;
  status: ReservationStatus;
  payment_status: PaymentCollectionStatus;
  collected_at?: string;
  collected_by_merchant?: string;
  notes?: string;
  created_at: string;
}

export interface Voucher {
  id: string;
  reservation_id: string;
  order_number: string;
  qr_data: string;
  customer_name: string;
  customer_phone: string;
  store_name: string;
  store_address: string;
  deal_title: string;
  quantity: number;
  total_amount: number;
  pickup_time_range: string;
  pickup_date: string;
  is_redeemed: boolean;
  redeemed_at?: string;
  created_at: string;
}

export interface StorePayment {
  id: string;
  reservation_id: string;
  store_id: string;
  store_name: string;
  amount: number;
  collected_by: string;
  collection_time: string;
  receipt_ref: string;
}

export interface Review {
  id: string;
  store_id: string;
  store_name: string;
  customer_name: string;
  deal_title: string;
  rating: number; // 1-5
  comment: string;
  status: 'published' | 'hidden' | 'flagged';
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_role: 'all' | 'customer' | 'merchant' | 'admin';
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  created_at: string;
  is_read?: boolean;
}

export interface HomepageBanner {
  id: string;
  title: string;
  subtitle: string;
  image_url: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
}

export interface CityLocation {
  id: string;
  name: string;
  name_en: string;
  province: string;
  is_active: boolean;
}

export interface AuditLog {
  id: string;
  user_email: string;
  action: string;
  entity: string;
  entity_id?: string;
  details: string;
  timestamp: string;
}

export interface PlatformSettings {
  site_title: string;
  tagline: string;
  hero_headline: string;
  hero_description: string;
  support_phone: string;
  support_email: string;
  contact_address: string;
  food_waste_saved_kg_multiplier: number;
  is_demo_mode: boolean;
}
