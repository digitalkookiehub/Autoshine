# PRP: Autoshine Studio

> Implementation blueprint for parallel agent execution — luxury car detailing mobile app

---

## METADATA

| Field | Value |
|-------|-------|
| **Product** | Autoshine Studio |
| **Type** | Mobile App (iOS + Android via Expo) |
| **Version** | 1.0 |
| **Created** | 2026-05-23 |
| **Complexity** | High |
| **Agents** | 6 (DATABASE, BACKEND, FRONTEND, DEVOPS, TEST, REVIEW) |
| **Phases** | 3 |

---

## PRODUCT OVERVIEW

**Description:** A premium React Native + Expo mobile app for luxury car detailing studios. Customers book detailing services, manage their vehicle garage, track job status, and unlock membership perks. Studio owners manage their full business — bookings, services, customers, and analytics — from a single mobile app with Tesla/Apple-level dark mode aesthetics.

**Value Proposition:** Replaces WhatsApp/phone bookings with a branded premium app that increases customer trust, drives repeat bookings via memberships and loyalty points, and gives studio owners real-time business visibility.

**Design Vision:** Dark mode primary (#0A0A0A), Electric Blue accent (#00D4FF), glassmorphism cards, Reanimated 60fps animations. Every screen feels like a luxury automotive brand app.

**MVP Scope:**
- [ ] Splash screen + 4-screen onboarding flow
- [ ] Phone OTP login + Google OAuth + Apple Sign In
- [ ] Premium home dashboard (hero banner, featured services, offers)
- [ ] Services catalog with pricing, duration, ratings
- [ ] 4-step booking flow (vehicle → date/slot → add-ons → confirm)
- [ ] Vehicle garage (add/manage vehicles)
- [ ] My bookings (upcoming + history + detail)
- [ ] Admin: booking management + status updates
- [ ] Admin: service CRUD
- [ ] Push notifications for booking lifecycle

---

## TECH STACK

| Layer | Technology | Skill Reference |
|-------|------------|-----------------|
| Mobile | React Native + Expo SDK (latest) | skills/FRONTEND.md |
| Language | TypeScript (strict, zero `any`) | skills/FRONTEND.md |
| Navigation | React Navigation v6 (Stack + BottomTab) | skills/FRONTEND.md |
| Styling | NativeWind v4 (Tailwind for RN) | skills/FRONTEND.md |
| Animations | React Native Reanimated v3 | skills/FRONTEND.md |
| State | Zustand + AsyncStorage persistence | skills/FRONTEND.md |
| Effects | Expo Blur + React Native Linear Gradient | skills/FRONTEND.md |
| Backend | FastAPI + Python 3.11+ | skills/BACKEND.md |
| ORM | SQLAlchemy (async) + Alembic | skills/DATABASE.md |
| Validation | Pydantic v2 | skills/BACKEND.md |
| Auth | Phone OTP (Twilio) + Google + Apple + JWT | skills/BACKEND.md |
| Push | Expo Push Notifications | skills/BACKEND.md |
| Storage | Cloudinary (photos) | skills/BACKEND.md |
| Testing | pytest + React Native Testing Library | skills/TESTING.md |
| Infra | Docker + Expo EAS | skills/DEPLOYMENT.md |

---

## DATABASE MODELS

### User Model
```
id, phone_number (unique), email (optional), full_name, avatar_url,
role (ENUM: customer/admin/staff), is_active (bool, default True),
expo_push_token, loyalty_points (int, default 0),
referral_code (unique, auto-generated), referred_by_id (FK self, nullable),
membership_tier (ENUM: none/silver/gold/platinum, default none),
created_at, updated_at
```

### OTPCode Model
```
id, phone_number, code (6-char string), expires_at (10min TTL),
is_used (bool, default False), created_at
Index: (phone_number, is_used)
```

### OAuthAccount Model
```
id, user_id (FK → User), provider (ENUM: google/apple),
provider_user_id, access_token, created_at
Unique: (provider, provider_user_id)
```

### RefreshToken Model
```
id, user_id (FK → User), token (unique), expires_at, revoked (bool), created_at
```

### UserVehicle Model
```
id, user_id (FK → User), make, model, year (int), color,
license_plate, image_url (nullable), notes (nullable), created_at
```

### ServiceReminder Model
```
id, vehicle_id (FK → UserVehicle), reminder_type, due_date, is_sent (bool)
```

### ServiceCategory Model
```
id, name, icon_name, display_order (int), is_active (bool)
```

### Service Model
```
id, category_id (FK → ServiceCategory), name, tagline, description,
price (Numeric 10,2), duration_minutes (int), image_url,
benefits (JSON array of strings), rating_avg (Float, default 0.0),
review_count (int, default 0), is_featured (bool), is_active (bool),
display_order (int), created_at
```

### ServiceAddon Model
```
id, service_id (FK → Service), name, price (Numeric 10,2), is_active (bool)
```

### TimeSlot Model
```
id, date (Date), start_time (Time), end_time (Time),
capacity (int, default 1), booked_count (int, default 0),
is_blocked (bool, default False), notes (nullable), created_at
Index: (date, is_blocked)
```

### Booking Model
```
id, user_id (FK → User), service_id (FK → Service),
vehicle_id (FK → UserVehicle, nullable), slot_id (FK → TimeSlot),
addon_ids (JSON array of ints),
status (ENUM: pending/confirmed/in_progress/completed/cancelled, default pending),
pickup_required (bool, default False),
pickup_address (nullable), pickup_lat (Float, nullable), pickup_lng (Float, nullable),
notes (nullable), total_price (Numeric 10,2), discount_amount (Numeric 10,2, default 0),
promo_code_id (FK → PromoCode, nullable),
payment_status (ENUM: pending/paid/refunded, default pending),
created_at, updated_at
```

### BookingStatusHistory Model
```
id, booking_id (FK → Booking), status (ENUM), changed_by_id (FK → User),
note (nullable), timestamp (DateTime)
```

### BookingPhoto Model
```
id, booking_id (FK → Booking), photo_url, type (ENUM: before/after),
uploaded_by_id (FK → User), created_at
```

### PromoCode Model
```
id, code (unique), discount_type (ENUM: percent/fixed), discount_value (Numeric 10,2),
max_uses (int, nullable), uses_count (int, default 0),
expires_at (DateTime, nullable), is_active (bool)
```

### GalleryItem Model
```
id, service_id (FK → Service, nullable), before_url, after_url,
video_url (nullable), caption, tags (JSON array), is_featured (bool),
likes_count (int, default 0), created_at
```

### MembershipPlan Model
```
id, name (ENUM: silver/gold/platinum), price_monthly (Numeric 10,2),
price_yearly (Numeric 10,2), benefits (JSON array), free_washes_per_month (int),
discount_percent (int), priority_booking (bool), is_active (bool)
```

### UserMembership Model
```
id, user_id (FK → User, unique), plan_id (FK → MembershipPlan),
status (ENUM: active/cancelled/expired), start_date, end_date,
stripe_subscription_id (nullable), created_at
```

### LoyaltyTransaction Model
```
id, user_id (FK → User), points (int), type (ENUM: earned/redeemed/bonus),
description, booking_id (FK → Booking, nullable), created_at
```

### Review Model
```
id, booking_id (FK → Booking, unique), user_id (FK → User),
service_id (FK → Service), rating (int, 1-5),
comment (nullable), photos (JSON array, nullable),
is_published (bool, default True), created_at
```

### Notification Model
```
id, user_id (FK → User), type (string), title, body,
data (JSON, nullable), is_read (bool, default False),
sent_at (DateTime, nullable), created_at
```

**Total Models: 21**

---

## MODULES

### Module 1: Authentication
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/send-otp | None | Send OTP (rate-limited: 3/hr/phone) |
| POST | /api/v1/auth/verify-otp | None | Verify OTP, return JWT pair |
| POST | /api/v1/auth/google | None | Google OAuth token exchange |
| POST | /api/v1/auth/apple | None | Apple Sign In token exchange |
| POST | /api/v1/auth/refresh | None | Refresh access token |
| POST | /api/v1/auth/logout | JWT | Revoke refresh token |
| GET | /api/v1/auth/me | JWT | Get current user profile |
| PUT | /api/v1/auth/me | JWT | Update profile + push token |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| SplashScreen | screens/onboarding/SplashScreen.tsx | Animated logo, particle glow |
| OnboardingScreen | screens/onboarding/OnboardingScreen.tsx | 4-slide swipeable onboarding |
| LoginScreen | screens/auth/LoginScreen.tsx | 3 auth option cards (OTP/Google/Apple) |
| PhoneInputScreen | screens/auth/PhoneInputScreen.tsx | Phone number + country picker |
| OTPVerifyScreen | screens/auth/OTPVerifyScreen.tsx | 6-digit OTP + countdown timer |
| ProfileSetupScreen | screens/auth/ProfileSetupScreen.tsx | Name + avatar (first login only) |

**Business Rules:**
- OTP expires in 10 minutes, single-use
- Rate limit: 3 OTP requests per phone per hour (429 response after)
- New user is created automatically on first successful OTP verify
- `role` defaults to `customer`, never settable via API
- Push token updated on each login via PUT /auth/me

---

### Module 2: Home Dashboard (Customer)
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/home | JWT | Aggregated: banner, featured services, offers |
| GET | /api/v1/home/offers | JWT | Active promotions |
| GET | /api/v1/gallery/featured | JWT | Featured before/after items (limit 6) |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| HomeScreen | screens/home/HomeScreen.tsx | Scrollable feed with 8 sections |

**Home Screen Sections (in order):**
1. AnimatedHeroBanner — gradient + "Book Now" CTA
2. VehicleStatusCard — next appointment + loyalty points (GlassCard)
3. ActiveOffersStrip — horizontal scroll of promo cards
4. BeforeAfterCarousel — swipe comparison slider (6 items)
5. FeaturedServicesGrid — 2-column premium service cards
6. MembershipPlanTeaser — Silver/Gold/Platinum quick preview
7. TestimonialsCarousel — customer review quotes
8. ReferralBanner — "Refer & Earn" CTA

---

### Module 3: Services Catalog
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/services | JWT | All active services (category filter, search) |
| GET | /api/v1/services/featured | JWT | Featured services for home |
| GET | /api/v1/services/{id} | JWT | Service detail + addons + recent reviews |
| POST | /api/v1/services | JWT (admin) | Create service |
| PUT | /api/v1/services/{id} | JWT (admin) | Update service |
| DELETE | /api/v1/services/{id} | JWT (admin) | Deactivate service (soft delete) |
| GET | /api/v1/categories | JWT | List service categories |
| POST | /api/v1/categories | JWT (admin) | Create category |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| ServicesScreen | screens/services/ServicesScreen.tsx | Category tabs + service cards grid |
| ServiceDetailScreen | screens/services/ServiceDetailScreen.tsx | Full-bleed image, benefits, add-ons, reviews, sticky Book CTA |
| AdminServicesScreen | screens/admin/AdminServicesScreen.tsx | Admin: list with edit/add/deactivate |
| AdminServiceFormScreen | screens/admin/AdminServiceFormScreen.tsx | Create/edit service form |

**Service Card includes:** HD image, name, tagline, price badge, duration chip, rating stars, "Book" button

---

### Module 4: Booking Flow
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/slots | JWT | Available slots for date + service |
| POST | /api/v1/bookings | JWT | Create booking (promo code validation) |
| GET | /api/v1/bookings | JWT | User's bookings (paginated, status filter) |
| GET | /api/v1/bookings/{id} | JWT | Booking details + status history |
| POST | /api/v1/bookings/{id}/cancel | JWT | Cancel booking (>24h rule enforced) |
| POST | /api/v1/bookings/{id}/photos | JWT | Upload before/after photo (Cloudinary) |
| GET | /api/v1/bookings/{id}/photos | JWT | List booking photos |
| GET | /api/v1/bookings/{id}/track | JWT | Real-time status + estimated time |
| GET | /api/v1/admin/bookings | JWT (admin) | All bookings (date/status filter) |
| PUT | /api/v1/admin/bookings/{id}/status | JWT (admin) | Update status + create history entry |
| POST | /api/v1/admin/slots/generate | JWT (admin) | Bulk generate slots for date range |
| DELETE | /api/v1/admin/slots/{id} | JWT (admin) | Block/delete a slot |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| BookingStep1Screen | screens/booking/BookingStep1Screen.tsx | Select/add vehicle |
| BookingStep2Screen | screens/booking/BookingStep2Screen.tsx | Custom calendar + time slot chips |
| BookingStep3Screen | screens/booking/BookingStep3Screen.tsx | Add-ons + pickup toggle + promo code |
| BookingStep4Screen | screens/booking/BookingStep4Screen.tsx | Order summary + animated price breakdown |
| BookingConfirmScreen | screens/booking/BookingConfirmScreen.tsx | Success animation + booking reference |
| BookingsListScreen | screens/booking/BookingsListScreen.tsx | Upcoming + history tabs |
| BookingDetailScreen | screens/booking/BookingDetailScreen.tsx | Full details, status timeline, photos |
| AdminBookingListScreen | screens/admin/AdminBookingListScreen.tsx | Filterable booking list |
| AdminBookingDetailScreen | screens/admin/AdminBookingDetailScreen.tsx | Update status, customer info |
| AdminScheduleScreen | screens/admin/AdminScheduleScreen.tsx | Day/week calendar view |

**Business Rules:**
- Cancellation only allowed if slot start_time > now + 24 hours
- Slot `booked_count` incremented atomically (use SELECT FOR UPDATE)
- `total_price` computed at booking time = service.price + sum(addon prices) - discount
- Each status change creates a `BookingStatusHistory` record
- Pickup option available only if studio has pickup configured in settings

---

### Module 5: Vehicle Garage
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/garage | JWT | User's vehicles |
| POST | /api/v1/garage | JWT | Add vehicle |
| PUT | /api/v1/garage/{id} | JWT | Update vehicle |
| DELETE | /api/v1/garage/{id} | JWT | Remove vehicle |
| GET | /api/v1/garage/{id}/history | JWT | Service history for vehicle |
| GET | /api/v1/garage/{id}/reminders | JWT | Upcoming reminders |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| GarageScreen | screens/garage/GarageScreen.tsx | Horizontal swipeable vehicle cards |
| VehicleDetailScreen | screens/garage/VehicleDetailScreen.tsx | History, next service, past bookings |
| AddVehicleScreen | screens/garage/AddVehicleScreen.tsx | Make/model picker + color selector |

---

### Module 6: Before & After Gallery
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/gallery | JWT | All gallery items (paginated) |
| GET | /api/v1/gallery/featured | JWT | Featured items for home carousel |
| POST | /api/v1/gallery | JWT (admin) | Upload transformation |
| POST | /api/v1/gallery/{id}/like | JWT | Like a transformation |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| GalleryScreen | screens/gallery/GalleryScreen.tsx | Full-screen swipe gallery + comparison slider |
| GalleryItemScreen | screens/gallery/GalleryItemScreen.tsx | Expanded view, video, likes, share |

**Comparison Slider:** Custom React Native component using Gesture Handler PanGestureHandler with a vertical divider line. Left = before, right = after. Smooth 60fps drag interaction.

---

### Module 7: Membership Plans
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/memberships/plans | JWT | Available plans with benefits |
| POST | /api/v1/memberships/subscribe | JWT | Subscribe to plan (Stripe, post-MVP stub) |
| GET | /api/v1/memberships/my | JWT | User's current membership |
| PUT | /api/v1/memberships/cancel | JWT | Cancel membership |
| GET | /api/v1/loyalty | JWT | Points balance + transaction history |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| MembershipScreen | screens/membership/MembershipScreen.tsx | Visual plan comparison cards |
| MembershipDetailScreen | screens/membership/MembershipDetailScreen.tsx | Current plan, renewal, included washes |
| LoyaltyScreen | screens/membership/LoyaltyScreen.tsx | Points balance, earn history, redeem |

**Plans:**
- Silver: Basic monthly membership, 2 free washes, 5% discount
- Gold: Priority booking, 4 free washes, 10% discount, free interior check
- Platinum: Top priority, 8 free washes, 15% discount, all perks

---

### Module 8: Reviews & Ratings
**Agents:** DATABASE-AGENT + BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/reviews | JWT | Submit review (completed bookings only) |
| GET | /api/v1/services/{id}/reviews | JWT | Service reviews (paginated) |
| GET | /api/v1/admin/reviews | JWT (admin) | All reviews with moderation |
| PUT | /api/v1/admin/reviews/{id} | JWT (admin) | Publish/unpublish review |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| ReviewFormScreen | screens/reviews/ReviewFormScreen.tsx | Star rating + comment + optional photos |
| ServiceReviewsScreen | screens/reviews/ServiceReviewsScreen.tsx | Reviews with star distribution chart |

**Business Rules:**
- Review only allowed for bookings with `status = completed`
- One review per booking (unique constraint)
- After review submitted, trigger service `rating_avg` and `review_count` update

---

### Module 9: Notifications
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/notifications | JWT | User's notifications (paginated) |
| PUT | /api/v1/notifications/{id}/read | JWT | Mark one as read |
| PUT | /api/v1/notifications/read-all | JWT | Mark all as read |

**Notification Triggers (internal service calls):**
- Booking created → customer: "Booking Pending" + admin: "New Booking"
- Booking confirmed → customer: "Booking Confirmed + Time"
- 24h before slot → customer: "Reminder Tomorrow"
- Status → in_progress → customer: "Your car is being detailed"
- Status → completed → customer: "Done! Leave a review"
- Membership renewal 3 days → customer: "Membership expiring soon"

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| NotificationsScreen | screens/notifications/NotificationsScreen.tsx | Grouped by date, unread badge |

---

### Module 10: Profile & Wallet
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/profile/referrals | JWT | Referral stats + list |
| POST | /api/v1/profile/referrals/share | JWT | Generate shareable link |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| ProfileScreen | screens/profile/ProfileScreen.tsx | Avatar, membership badge, loyalty, settings |
| WalletScreen | screens/profile/WalletScreen.tsx | Balance, transaction history (post-MVP stub) |
| ReferralScreen | screens/profile/ReferralScreen.tsx | Unique code, share, count + earnings |

---

### Module 11: Admin Dashboard
**Agents:** BACKEND-AGENT + FRONTEND-AGENT

**Backend Endpoints:**
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/v1/admin/dashboard | JWT (admin) | Today stats: bookings, revenue, pending |
| GET | /api/v1/admin/bookings/today | JWT (admin) | Today's full schedule |
| GET | /api/v1/admin/analytics | JWT (admin) | Revenue + booking trends (?range=7d/30d/90d) |
| GET | /api/v1/admin/customers | JWT (admin) | All customers (search/filter) |
| GET | /api/v1/admin/customers/{id} | JWT (admin) | Customer detail + stats |
| GET | /api/v1/admin/customers/{id}/bookings | JWT (admin) | Customer booking history |
| GET | /api/v1/admin/staff | JWT (admin) | Staff accounts |
| POST | /api/v1/admin/staff | JWT (admin) | Create staff account |
| GET | /api/v1/admin/settings | JWT (admin) | Studio settings |
| PUT | /api/v1/admin/settings | JWT (admin) | Update hours, contact, branding |

**Mobile Screens:**
| Screen | File | Description |
|--------|------|-------------|
| AdminDashboardScreen | screens/admin/AdminDashboardScreen.tsx | Stat cards + today's queue + quick actions |
| AdminBookingListScreen | screens/admin/AdminBookingListScreen.tsx | Filterable booking list |
| AdminBookingDetailScreen | screens/admin/AdminBookingDetailScreen.tsx | Update status, view photos |
| AdminScheduleScreen | screens/admin/AdminScheduleScreen.tsx | Calendar day/week view |
| AdminCustomersScreen | screens/admin/AdminCustomersScreen.tsx | Search customers by name/phone |
| AdminCustomerDetailScreen | screens/admin/AdminCustomerDetailScreen.tsx | Customer profile + history |
| AdminAnalyticsScreen | screens/admin/AdminAnalyticsScreen.tsx | Revenue charts, service popularity |
| AdminSettingsScreen | screens/admin/AdminSettingsScreen.tsx | Studio config, hours, staff |

---

## REUSABLE COMPONENTS (Design System)

All agents building UI must use or contribute to this component library:

```
mobile/src/components/ui/
├── GlassCard.tsx           ← BlurView + bg-white/5 + border-white/10
├── PremiumButton.tsx       ← Blue CTA + spring animation + haptic
├── GradientText.tsx        ← LinearGradient text wrapper
├── SkeletonLoader.tsx      ← Animated shimmer skeleton
├── StatusBadge.tsx         ← Colored pill for booking status
├── AnimatedHeader.tsx      ← Collapsible scroll-aware header
├── ServiceCard.tsx         ← HD image + price + rating + Book CTA
├── BookingCard.tsx         ← Status badge + date + service + actions
├── VehicleCard.tsx         ← Car thumbnail + make/model/year
├── ComparisonSlider.tsx    ← Before/after gesture-based slider
├── StarRating.tsx          ← Interactive + display star component
├── ProgressStepper.tsx     ← 4-step booking progress indicator
└── MembershipCard.tsx      ← Tier card with gradient + benefits
```

**Color tokens** are centralized in `theme/colors.ts` — never hardcode hex values in components.

---

## PHASE EXECUTION PLAN

### Phase 1: Foundation (4 agents in parallel)

**DATABASE-AGENT tasks:**
- Create `backend/` project structure
- Write all 21 SQLAlchemy async models in `backend/app/models/`
- Create `backend/app/database.py` (async engine + session factory)
- Write all Alembic migrations
- Create `backend/app/models/__init__.py` with all exports

**BACKEND-AGENT tasks:**
- Create FastAPI project structure: `main.py`, `config.py`, `dependencies.py`
- Write `backend/requirements.txt`
- Write `.env.example` with all required variables
- Implement auth utilities: JWT encode/decode, password hashing, OTP generation
- Write Twilio SMS service stub

**FRONTEND-AGENT tasks:**
- Initialize Expo project: `npx create-expo-app mobile --template blank-typescript`
- Install all dependencies (NativeWind, Reanimated, React Navigation, Zustand, etc.)
- Set up NativeWind: `tailwind.config.js`, `babel.config.js`
- Create design system: `theme/colors.ts`, `theme/typography.ts`, `theme/spacing.ts`
- Build all 13 reusable UI components in `components/ui/`
- Set up `services/api.ts` (Axios instance with interceptors)
- Create all Zustand stores: `authStore.ts`, `bookingStore.ts`, `garageStore.ts`
- Build `RootNavigator.tsx` with auth flow routing

**DEVOPS-AGENT tasks:**
- Create `docker-compose.yml` (postgres + backend)
- Create `backend/Dockerfile`
- Create `eas.json` for Expo EAS Build (development + production profiles)
- Write `app.json` with correct Expo config (bundle IDs, permissions, icons)
- Create GitHub Actions CI: lint + test on PR

**Validation Gate 1:**
```bash
# Backend
cd backend && pip install -r requirements.txt
alembic upgrade head

# Mobile
cd mobile && npm install
npx expo doctor

# Docker
docker-compose config
docker-compose up -d db
```

---

### Phase 2: Module Implementation (backend + frontend pairs)

Execute module pairs in parallel where there are no cross-module dependencies:

**Batch A (no dependencies, run in parallel):**
- Auth Module: BACKEND-AGENT (OTP + JWT + OAuth) + FRONTEND-AGENT (6 auth screens)
- Services Module: BACKEND-AGENT (8 service endpoints) + FRONTEND-AGENT (4 service screens)
- Vehicle Garage Module: BACKEND-AGENT (6 garage endpoints) + FRONTEND-AGENT (3 garage screens)

**Batch B (depends on Auth being complete):**
- Home Dashboard: BACKEND-AGENT (3 home endpoints) + FRONTEND-AGENT (1 home screen, 8 sections)
- Booking Flow: BACKEND-AGENT (12 booking endpoints) + FRONTEND-AGENT (10 booking screens)

**Batch C (depends on Booking being complete):**
- Reviews: BACKEND-AGENT (4 review endpoints) + FRONTEND-AGENT (2 review screens)
- Notifications: BACKEND-AGENT (3 notif endpoints + push service) + FRONTEND-AGENT (1 notif screen)

**Batch D (run in parallel, no blocking deps):**
- Gallery: BACKEND-AGENT (4 gallery endpoints) + FRONTEND-AGENT (2 gallery screens)
- Membership: BACKEND-AGENT (5 membership endpoints) + FRONTEND-AGENT (3 membership screens)
- Profile: BACKEND-AGENT (2 profile endpoints) + FRONTEND-AGENT (3 profile screens)
- Admin Dashboard: BACKEND-AGENT (10 admin endpoints) + FRONTEND-AGENT (8 admin screens)

**Validation Gate 2:**
```bash
# Backend
ruff check backend/
mypy backend/app --ignore-missing-imports

# Mobile
cd mobile && npx tsc --noEmit
npm run lint
```

---

### Phase 3: Quality (3 agents in parallel)

**TEST-AGENT tasks:**
- Backend: pytest tests for all 61 endpoints (auth, services, bookings, admin)
- Backend: Test OTP rate limiting, booking cancellation rules, slot atomic increment
- Backend: Test role-based access control (customer vs admin endpoints)
- Mobile: React Native Testing Library tests for all screen render + interactions
- Mobile: Test booking flow state machine (all 4 steps + confirmation)
- Target: 70%+ backend coverage, critical path screens covered

**REVIEW-AGENT tasks:**
- Security audit: OTP brute-force protection, JWT verification, admin endpoint guards
- Performance: Verify FlatList virtualization on all list screens
- Performance: Check for N+1 queries in booking + admin endpoints
- App Store compliance: Verify all required permissions declared, no private APIs
- Code consistency: Design token usage (no hardcoded hex), no `any` types

**DEVOPS-AGENT tasks:**
- Verify `docker-compose up -d` builds and starts successfully
- Run `alembic upgrade head` on clean DB
- Verify Expo build config: `eas build --platform all --local` (dry run)
- Check all `.env.example` variables are documented

**Final Validation:**
```bash
# Full test suite
cd backend && pytest --cov=app --cov-report=term-missing --cov-fail-under=70
cd mobile && npx tsc --noEmit && npm run lint

# Docker build
docker-compose build && docker-compose up -d
curl http://localhost:8000/health

# Expo prebuild check
cd mobile && npx expo prebuild --clean
```

---

## ENVIRONMENT VARIABLES

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/autoshine

# Auth
SECRET_KEY=your-secret-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# Google OAuth
GOOGLE_CLIENT_ID=xxxxxxxxxxxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxxxxxxxxx

# Cloudinary (Photo uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=xxxxxxxxxxxxxxx
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Expo Push Notifications
EXPO_ACCESS_TOKEN=xxxxxx (for Expo push API)

# Mobile (Expo)
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=xxxxxxxxxxxxxx.apps.googleusercontent.com
```

---

## VALIDATION GATES SUMMARY

| Gate | When | Commands |
|------|------|----------|
| Gate 1 | After Phase 1 | `pip install`, `alembic upgrade head`, `npm install`, `expo doctor`, `docker-compose config` |
| Gate 2 | After Phase 2 | `ruff check`, `mypy`, `tsc --noEmit`, `npm run lint` |
| Gate 3 | After Phase 3 | `pytest --cov-fail-under=70`, full docker-compose up, health check |

---

## AGENT DISPATCH TEMPLATES

### DATABASE-AGENT dispatch
```yaml
TO: DATABASE-AGENT
TASK: Create all 21 SQLAlchemy async models + Alembic migrations
CONTEXT:
  - Read: skills/DATABASE.md
  - Read: PRPs/autoshine-studio-prp.md (DATABASE MODELS section)
  - Follow: async SQLAlchemy patterns
OUTPUTS:
  - backend/app/models/ (21 model files)
  - backend/app/models/__init__.py
  - backend/app/database.py
  - alembic/versions/001_initial_schema.py
VALIDATION:
  - alembic upgrade head (no errors)
  - alembic check (no pending migrations)
```

### BACKEND-AGENT dispatch
```yaml
TO: BACKEND-AGENT
TASK: Build all 61 FastAPI endpoints across 11 modules
CONTEXT:
  - Read: skills/BACKEND.md
  - Read: PRPs/autoshine-studio-prp.md (MODULES section)
  - Requires: DATABASE-AGENT output (models)
OUTPUTS:
  - backend/app/routers/ (11 router files)
  - backend/app/services/ (11 service files)
  - backend/app/schemas/ (Pydantic v2 schemas)
  - backend/app/auth/ (JWT + OTP + OAuth)
VALIDATION:
  - ruff check backend/
  - uvicorn app.main:app (starts without error)
  - curl localhost:8000/health → 200
```

### FRONTEND-AGENT dispatch
```yaml
TO: FRONTEND-AGENT
TASK: Build all 42 React Native screens + design system + navigation
CONTEXT:
  - Read: skills/FRONTEND.md
  - Read: PRPs/autoshine-studio-prp.md (MODULES + COMPONENTS sections)
  - Read: CLAUDE.md (design system tokens, NativeWind classes)
  - Requires: BACKEND-AGENT API contracts
OUTPUTS:
  - mobile/src/screens/ (42 screen files, organized by module)
  - mobile/src/components/ui/ (13 design system components)
  - mobile/src/app/navigation/ (4 navigator files)
  - mobile/src/store/ (3 Zustand stores)
  - mobile/src/services/ (API service functions)
  - mobile/src/theme/ (color + typography tokens)
DESIGN RULES:
  - Dark mode: bg-[#0A0A0A] base, bg-[#141414] cards
  - Accent: bg-[#00D4FF] for CTAs, text-[#00D4FF] for links
  - All cards use GlassCard component (BlurView + bg-white/5)
  - All list screens use FlatList (never ScrollView for lists)
  - All animations via Reanimated (never Animated from RN core)
  - Haptic feedback on: booking confirm, OTP submit, cancel actions
VALIDATION:
  - npx tsc --noEmit (zero TypeScript errors)
  - npm run lint (zero ESLint errors)
  - npx expo prebuild (no prebuild errors)
```

---

## SUMMARY

| Metric | Count |
|--------|-------|
| Database Models | 21 |
| API Endpoints | 61 |
| Mobile Screens | 42 |
| UI Components | 13 |
| Zustand Stores | 3 |
| Navigation Stacks | 4 |
| Execution Phases | 3 |
| Parallel Agent Batches | 4 (within Phase 2) |

---

## NEXT STEP

```bash
/execute-prp PRPs/autoshine-studio-prp.md
```
