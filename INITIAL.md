# INITIAL.md - Autoshine Studio Product Definition

> A complete React Native + Expo mobile app for a luxury car detailing studio — App Store + Google Play ready with premium Tesla/Apple-level aesthetics.

---

## PRODUCT

### Name
Autoshine Studio

### Description
Autoshine Studio is a premium mobile app that connects luxury car detailing studios with high-value customers. The app delivers a Tesla-meets-Apple booking experience — customers manage their vehicle garage, book premium detailing services, track real-time job status, and unlock membership plans. Studio owners get a powerful admin dashboard to manage bookings, revenue, staff, and customer analytics — all with dark-mode cinematic UI.

### Target User
- **Customers:** Premium/luxury car owners, SUV owners, car enthusiasts, busy professionals
- **Studio Admins/Owners:** Car detailing studio owners managing daily operations from mobile
- **Staff:** Detailing technicians viewing assigned jobs and updating status

### Type
- [x] Mobile App (iOS + Android via Expo, publishable to App Store + Google Play)

---

## TECH STACK

### Mobile Frontend
- [x] React Native + Expo SDK (latest)
- [x] TypeScript (strict mode)
- [x] React Navigation v6 (Stack + Bottom Tab + Drawer)
- [x] NativeWind v4 (Tailwind CSS for React Native)
- [x] React Native Reanimated v3 (smooth animations)
- [x] Zustand (lightweight state management)
- [x] React Native Gesture Handler
- [x] Expo Blur (glassmorphism effects)
- [x] React Native Linear Gradient
- [x] React Native Skia (particle/glow effects)

### Backend
- [x] FastAPI + Python 3.11+
- [x] SQLAlchemy (async) + Alembic
- [x] Pydantic v2

### Database
- [x] PostgreSQL

### Authentication
- [x] Phone number OTP/SMS (Twilio)
- [x] Google OAuth (social login)
- [x] Apple Sign In (Expo AppleAuthentication)
- [x] JWT tokens (access 30min + refresh 7d)
- [x] Role-based access: customer / admin / staff

### External Services
- [x] Twilio — SMS OTP
- [x] Expo Push Notifications — booking alerts
- [x] Cloudinary — before/after photo storage
- [x] Firebase (optional fallback for real-time chat)
- [x] WhatsApp Business API — customer communication
- [x] Google Maps SDK — GPS pickup/drop tracking

### Payments (Post-MVP)
- [ ] Stripe — subscriptions + one-time payments

---

## DESIGN SYSTEM

### Theme
- **Mode:** Dark mode primary (matte black base)
- **Inspiration:** Tesla app + Porsche app + Apple Store

### Color Tokens
```
Background:
  bg-primary:    #0A0A0A  (deep matte black)
  bg-secondary:  #141414  (card background)
  bg-surface:    #1C1C1C  (elevated surface)
  bg-glass:      rgba(255,255,255,0.05)  (glassmorphism)

Accent:
  accent-blue:   #00D4FF  (electric blue — primary CTA)
  accent-glow:   rgba(0,212,255,0.15)  (glow effect)
  accent-gold:   #C9A84C  (premium tier highlights)

Text:
  text-primary:  #FFFFFF
  text-secondary: #A0A0A0
  text-muted:    #555555

Status:
  success:  #00E676
  warning:  #FFB300
  error:    #FF1744
  info:     #00D4FF
```

### Typography
```
Font Family: Inter (primary) + SF Pro Display (iOS) / Roboto (Android)

Sizes:
  display:  32px / bold     (hero headlines)
  h1:       28px / bold     (screen titles)
  h2:       22px / semibold (section headers)
  h3:       18px / semibold (card titles)
  body:     16px / regular  (body text)
  caption:  13px / regular  (metadata)
  label:    11px / medium   (tags/chips)
```

---

## MODULES

### Module 1: Splash + Onboarding

**Screens:**
- SplashScreen — Animated logo with particle glow, luxury loading animation
- Onboarding1 — "Detailing Redefined" — full-bleed hero with before/after reveal
- Onboarding2 — "Ceramic Shield" — animated coating protection visualization
- Onboarding3 — "Membership Perks" — Silver/Gold/Platinum plan teaser cards
- Onboarding4 — "Book in 30 Seconds" — animated booking flow preview

---

### Module 2: Authentication

**Description:** Multi-method auth with premium card-based social login UI.

**Models:**
```
User:
  id, phone_number, email, full_name, avatar_url,
  role (ENUM: customer/admin/staff), is_active,
  expo_push_token, loyalty_points, referral_code,
  referred_by_id (FK self), membership_tier (ENUM: none/silver/gold/platinum),
  created_at, updated_at

OTPCode:
  id, phone_number, code (6-digit), expires_at (10min), is_used, created_at

OAuthAccount:
  id, user_id (FK), provider (google/apple), provider_user_id,
  access_token, created_at
```

**API Endpoints:**
- POST /auth/send-otp — Rate-limited OTP (max 3/hour/phone)
- POST /auth/verify-otp — Verify OTP, return JWT pair
- POST /auth/google — Google OAuth token exchange
- POST /auth/apple — Apple Sign In token exchange
- POST /auth/refresh — Refresh access token
- POST /auth/logout — Revoke refresh token
- GET /auth/me — Current user profile
- PUT /auth/me — Update profile + push token

**Mobile Screens:**
- LoginScreen — Three auth options: Phone OTP card, Google card, Apple card (dark glass cards)
- PhoneInputScreen — Animated phone input with country flag picker
- OTPVerifyScreen — 6-digit OTP input with auto-submit + countdown timer
- ProfileSetupScreen — Name + avatar upload (shown once after first login)

---

### Module 3: Home Dashboard (Customer)

**Description:** The conversion engine. Premium hero, quick book, before/after gallery, featured services, and membership upsell.

**API Endpoints:**
- GET /home — Aggregated: banner, featured services, offers, testimonials
- GET /home/offers — Active promotions and discount codes
- GET /gallery/featured — Featured before/after transformations

**Mobile Screens:**
- HomeScreen — Scrollable feed:
  1. Hero banner (animated gradient + "Book Now" CTA)
  2. Vehicle status card (next appointment, loyalty points)
  3. Active offers strip (horizontal scroll)
  4. Before/After carousel (swipe comparison slider)
  5. Featured services grid (premium service cards)
  6. Membership plans teaser (Silver/Gold/Platinum)
  7. Customer testimonials carousel
  8. "Refer & Earn" banner

---

### Module 4: Services Catalog

**Description:** Premium card-based service browser with HD visuals, ratings, and instant booking CTA.

**Models:**
```
ServiceCategory:
  id, name, icon_name, display_order, is_active

Service:
  id, category_id (FK), name, tagline, description,
  price (decimal), duration_minutes, image_url,
  benefits (JSON array), rating_avg, review_count,
  is_featured, is_active, display_order, created_at

ServiceAddon:
  id, service_id (FK), name, price, is_active
```

**API Endpoints:**
- GET /services — All active services (with category filter)
- GET /services/featured — Homepage featured services
- GET /services/{id} — Service detail + addons + reviews
- POST /services — Create (admin)
- PUT /services/{id} — Update (admin)
- DELETE /services/{id} — Deactivate (admin)

**Mobile Screens:**
- ServicesScreen — Category tabs + service cards with glass effect, price badge, rating stars
- ServiceDetailScreen — Full-bleed image, benefits list, duration, add-ons, reviews section, sticky "Book Now" button
- AdminServicesScreen — Admin service management list
- AdminServiceFormScreen — Create/edit service with image upload

---

### Module 5: Booking Flow

**Description:** Seamless 4-step premium booking UX with animations between each step.

**Models:**
```
TimeSlot:
  id, date, start_time, end_time, capacity, booked_count,
  is_blocked, notes, created_at

Booking:
  id, user_id (FK), service_id (FK), vehicle_id (FK),
  slot_id (FK), addon_ids (JSON array),
  status (ENUM: pending/confirmed/in_progress/completed/cancelled),
  pickup_required (bool), pickup_address, pickup_lat, pickup_lng,
  notes, total_price, promo_code_id (FK), discount_amount,
  payment_status (ENUM: pending/paid/refunded),
  created_at, updated_at

BookingStatusHistory:
  id, booking_id (FK), status, changed_by_id (FK), note, timestamp

BookingPhoto:
  id, booking_id (FK), photo_url, type (before/after),
  uploaded_by_id, created_at

PromoCode:
  id, code, discount_type (percent/fixed), discount_value,
  max_uses, uses_count, expires_at, is_active
```

**API Endpoints:**
- GET /slots?date={date}&service_id={id} — Available slots
- POST /bookings — Create booking with promo code validation
- GET /bookings — User's bookings (paginated, filterable by status)
- GET /bookings/{id} — Booking details + status history
- POST /bookings/{id}/cancel — Cancel booking
- POST /bookings/{id}/photos — Upload before/after photos
- GET /bookings/{id}/track — Real-time status + staff location (if pickup)
- GET /admin/bookings — All bookings with filters (admin)
- PUT /admin/bookings/{id}/status — Update status (admin)
- POST /admin/slots/generate — Bulk generate slots

**Mobile Screens:**
- BookingStep1Screen — Select vehicle (or add new)
- BookingStep2Screen — Select date (custom calendar) + time slot chips
- BookingStep3Screen — Add-ons + pickup/drop toggle + notes + promo code
- BookingStep4Screen — Order summary with animated price breakdown
- BookingConfirmScreen — Success animation (confetti/glow) + booking reference
- BookingsListScreen — Upcoming + history tabs with status badges
- BookingDetailScreen — Full details, real-time status timeline, photo viewer
- BookingTrackScreen — GPS map view for pickup/drop tracking

---

### Module 6: Vehicle Garage

**Description:** Users manage their car collection with service history, health scores, and reminders.

**Models:**
```
UserVehicle:
  id, user_id (FK), make, model, year, color,
  license_plate, image_url, notes, created_at

ServiceReminder:
  id, vehicle_id (FK), reminder_type, due_date, is_sent
```

**API Endpoints:**
- GET /garage — User's vehicles
- POST /garage — Add vehicle
- PUT /garage/{id} — Update vehicle
- DELETE /garage/{id} — Remove vehicle
- GET /garage/{id}/history — Service history for vehicle
- GET /garage/{id}/reminders — Upcoming service reminders

**Mobile Screens:**
- GarageScreen — Horizontal swipeable vehicle cards with premium car imagery
- VehicleDetailScreen — Vehicle history, next service due, past bookings
- AddVehicleScreen — Form with make/model picker + color selector

---

### Module 7: Before & After Gallery

**Description:** Cinematic Instagram-style gallery of detailing transformations to build trust and desire.

**Models:**
```
GalleryItem:
  id, service_id (FK), before_url, after_url, video_url,
  caption, tags (JSON), is_featured, likes_count, created_at
```

**API Endpoints:**
- GET /gallery — All gallery items (paginated)
- GET /gallery/featured — Featured for homepage
- POST /gallery — Upload transformation (admin)
- POST /gallery/{id}/like — Like a transformation

**Mobile Screens:**
- GalleryScreen — Full-screen swipe gallery with before/after comparison slider
- GalleryItemScreen — Expanded view with video support, likes, share

---

### Module 8: Membership Plans

**Description:** Subscription tiers with premium benefits, priority booking, and loyalty perks.

**Models:**
```
MembershipPlan:
  id, name (silver/gold/platinum), price_monthly, price_yearly,
  benefits (JSON), free_washes_per_month, discount_percent,
  priority_booking (bool), is_active

UserMembership:
  id, user_id (FK), plan_id (FK), status (active/cancelled/expired),
  start_date, end_date, stripe_subscription_id, created_at

LoyaltyTransaction:
  id, user_id (FK), points, type (earned/redeemed/bonus),
  description, booking_id (FK), created_at
```

**API Endpoints:**
- GET /memberships/plans — Available plans with benefits
- POST /memberships/subscribe — Subscribe to plan (Stripe, post-MVP)
- GET /memberships/my — User's current membership
- PUT /memberships/cancel — Cancel membership
- GET /loyalty — User's points balance + history

**Mobile Screens:**
- MembershipScreen — Visual plan comparison cards (Silver/Gold/Platinum) with benefits and CTA
- MembershipDetailScreen — Current plan, renewal date, included washes
- LoyaltyScreen — Points balance, earn history, redeem options

---

### Module 9: Notifications

**Models:**
```
Notification:
  id, user_id (FK), type, title, body, data (JSON),
  is_read, sent_at, created_at
```

**Triggers:**
- Booking confirmed → customer push
- 24h reminder → customer push
- Booking status changed → customer push
- New booking received → admin push
- Membership renewal due → customer push
- Review request (after completed) → customer push

**API Endpoints:**
- GET /notifications — User's notification list
- PUT /notifications/{id}/read — Mark as read
- PUT /notifications/read-all — Mark all read

**Mobile Screens:**
- NotificationsScreen — Grouped by date, unread indicators, type icons

---

### Module 10: Reviews & Ratings

**Models:**
```
Review:
  id, booking_id (FK, unique), user_id (FK), service_id (FK),
  rating (1-5), comment, photos (JSON), is_published, created_at
```

**API Endpoints:**
- POST /reviews — Submit review (completed bookings only)
- GET /services/{id}/reviews — Service reviews (paginated)
- GET /admin/reviews — All reviews with moderation controls

**Mobile Screens:**
- ReviewFormScreen — Star rating + comment + photo upload
- ServiceReviewsScreen — Reviews with star distribution chart

---

### Module 11: Profile & Wallet

**Mobile Screens:**
- ProfileScreen — Avatar, name, membership badge, loyalty points, settings shortcuts
- WalletScreen — Balance, transaction history, top-up (post-MVP)
- ReferralScreen — Unique code, share button, referral count + earnings

**API Endpoints:**
- GET /profile/referrals — Referral stats + list
- POST /profile/referrals/share — Generate shareable link

---

### Module 12: Admin Dashboard

**Description:** Complete business management interface for studio owners on mobile.

**API Endpoints:**
- GET /admin/dashboard — Today's stats: bookings, revenue, pending count
- GET /admin/bookings/today — Today's schedule
- GET /admin/analytics?range={7d|30d|90d} — Revenue + booking trends
- GET /admin/customers — All customers (search/filter)
- GET /admin/customers/{id} — Customer detail + history
- GET /admin/staff — Staff list
- POST /admin/staff — Create staff account
- GET /admin/settings — Studio settings
- PUT /admin/settings — Update hours, contact, branding

**Mobile Screens:**
- AdminDashboardScreen — Stat cards + today's job queue + quick actions
- AdminBookingsScreen — Filterable booking list with status badges
- AdminBookingDetailScreen — Update status, view photos, customer info
- AdminScheduleScreen — Calendar day/week view
- AdminCustomersScreen — Search customers, view profiles
- AdminAnalyticsScreen — Revenue charts, service popularity, busy hours
- AdminSettingsScreen — Studio config, working hours, staff management

---

### Module 13: In-App Support & Chat

**Description:** WhatsApp integration + basic in-app chat for customer support.

**Mobile Screens:**
- SupportScreen — WhatsApp deep link + FAQ accordion + contact options
- ChatScreen — Real-time chat with support (Firebase/WebSocket, post-MVP)

---

## MVP SCOPE

### Must Have (MVP)
- [x] Splash + onboarding (3 screens)
- [x] Phone OTP login + Google login + profile setup
- [x] Home dashboard with hero, featured services, offers
- [x] Services catalog with premium card UI
- [x] Full booking flow (service → slot → vehicle → confirm)
- [x] Vehicle garage (add/view vehicles)
- [x] My bookings list + detail screen
- [x] Admin: booking management + status updates
- [x] Admin: service CRUD
- [x] Push notifications for booking lifecycle

### Nice to Have (Post-MVP)
- [ ] Before/after gallery with comparison slider
- [ ] Membership + subscription system (Stripe)
- [ ] Loyalty points + rewards
- [ ] Referral program
- [ ] GPS pickup/drop tracking
- [ ] AI detailing recommendations
- [ ] Damage detection photo upload + analysis
- [ ] WhatsApp Business integration
- [ ] In-app chat support
- [ ] Admin analytics charts
- [ ] Staff management

---

## ACCEPTANCE CRITERIA

### Auth
- [ ] Customer can sign in via phone OTP (6-digit, 10min expiry)
- [ ] Customer can sign in via Google OAuth
- [ ] New user completes profile setup on first login
- [ ] Admin role cannot be self-assigned

### Home + Services
- [ ] Hero banner loads with gradient animation
- [ ] Featured services show price, duration, rating
- [ ] Before/after carousel is swipeable

### Booking
- [ ] Customer completes booking in under 4 taps
- [ ] Only available slots are shown
- [ ] Booking confirmation shows animated success screen
- [ ] Customer can cancel if >24h before appointment

### Admin
- [ ] Admin sees today's bookings on dashboard
- [ ] Admin can update booking status with note
- [ ] Admin can create/edit/deactivate services

### Design Quality
- [ ] Dark mode consistent across all screens
- [ ] Animations are 60fps
- [ ] Glassmorphism cards render correctly on iOS + Android
- [ ] App passes App Store + Google Play review requirements
- [ ] TypeScript strict mode zero errors
- [ ] Expo build produces valid .ipa and .apk

---

## SPECIAL REQUIREMENTS

### Security
- [x] OTP single-use, expires in 10 minutes
- [x] Rate limiting: 3 OTP requests/phone/hour
- [x] JWT HS256 signed tokens
- [x] Role-based endpoint guards
- [x] Pydantic v2 input validation

### Performance
- [x] FlatList virtualization for all lists
- [x] Image lazy loading + caching (expo-image)
- [x] Skeleton loading states for all data-fetching screens
- [x] Optimistic UI updates for booking actions

### Mobile UX
- [x] Haptic feedback on key actions (booking confirm, OTP submit)
- [x] Gesture-based interactions (swipe to cancel, pinch gallery)
- [x] Deep linking: autoshine://booking/{id}
- [x] Offline cache for services and past bookings

---

## AGENTS

| Agent | Role | Works On |
|-------|------|----------|
| DATABASE-AGENT | Creates all models + Alembic migrations | All PostgreSQL models |
| BACKEND-AGENT | Builds FastAPI endpoints + auth + services | All module backends |
| FRONTEND-AGENT | Creates all React Native screens + navigation + design system | All 40+ screens |
| DEVOPS-AGENT | Docker, env config, Expo EAS build pipeline | Infrastructure |
| TEST-AGENT | Unit + integration tests | All code |
| REVIEW-AGENT | Security + code quality + performance audit | All code |

---

# READY?

```bash
/generate-prp INITIAL.md
```

Then:

```bash
/execute-prp PRPs/autoshine-studio-prp.md
```
