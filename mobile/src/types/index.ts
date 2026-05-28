export type UserRole = 'customer' | 'admin' | 'staff';
export type MembershipTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface User {
  id: number;
  phone_number: string | null;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  loyalty_points: number;
  referral_code: string;
  membership_tier: MembershipTier;
  expo_push_token: string | null;
  created_at: string;
}

export interface UserVehicle {
  id: number;
  user_id: number;
  make: string;
  model: string;
  year: number | null;
  color: string | null;
  license_plate: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface ServiceCategory {
  id: number;
  name: string;
  icon_name: string | null;
  display_order: number;
  is_active: boolean;
}

export interface ServiceAddon {
  id: number;
  service_id: number;
  name: string;
  description: string | null;
  price: string;
  is_active: boolean;
}

export interface Service {
  id: number;
  category_id: number | null;
  name: string;
  tagline: string | null;
  description: string | null;
  price: string;
  duration_minutes: number;
  image_url: string | null;
  benefits: string[] | null;
  rating_avg: number;
  review_count: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  category?: ServiceCategory;
  addons?: ServiceAddon[];
}

export interface TimeSlot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  capacity: number;
  booked_count: number;
  is_blocked: boolean;
  is_available: boolean;
}

export interface Booking {
  id: number;
  user_id: number;
  service_id: number;
  vehicle_id: number | null;
  slot_id: number;
  addon_ids: number[] | null;
  status: BookingStatus;
  pickup_required: boolean;
  pickup_address: string | null;
  notes: string | null;
  total_price: string;
  discount_amount: string;
  payment_status: PaymentStatus;
  created_at: string;
  updated_at: string;
  service?: Service;
  vehicle?: UserVehicle;
  slot?: TimeSlot;
}

export interface BookingStatusHistoryItem {
  id: number;
  booking_id: number;
  status: BookingStatus;
  note: string | null;
  timestamp: string;
}

export interface Review {
  id: number;
  booking_id: number;
  user_id: number;
  service_id: number;
  rating: number;
  comment: string | null;
  photos: string[] | null;
  is_published: boolean;
  created_at: string;
  user?: User;
}

export interface MembershipPlan {
  id: number;
  name: string;
  tier: string;
  price: string;
  benefits: string[] | null;
  discount_percent: number;
  priority_booking: boolean;
  is_active: boolean;
}

export interface UserMembership {
  id: number;
  user_id: number;
  plan_id: number;
  status: string;
  started_at: string;
  expires_at: string | null;
  plan?: MembershipPlan;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  points: number;
  description: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: number;
  service_id: number | null;
  before_url: string | null;
  after_url: string | null;
  video_url: string | null;
  caption: string | null;
  tags: string[] | null;
  is_featured: boolean;
  likes_count: number;
  created_at: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}
