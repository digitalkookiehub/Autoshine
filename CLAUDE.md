# CLAUDE.md - Autoshine Studio Project Rules

> Project-specific rules Claude follows in every conversation. This file overrides defaults.

---

## Project Overview

**Product:** Autoshine Studio
**Type:** Premium React Native + Expo mobile app (iOS + Android)
**Description:** Luxury car detailing studio app — Tesla/Apple-level aesthetics, dark mode, glassmorphism UI
**Backend:** FastAPI + Python 3.11+
**Database:** PostgreSQL + SQLAlchemy (async) + Alembic

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native + Expo SDK (latest) |
| Language | TypeScript (strict mode, zero `any`) |
| Navigation | React Navigation v6 (Stack + BottomTab + Drawer) |
| Styling | NativeWind v4 (Tailwind for React Native) |
| Animations | React Native Reanimated v3 |
| State | Zustand |
| Gestures | React Native Gesture Handler |
| Effects | Expo Blur, React Native Linear Gradient, React Native Skia |
| Backend | FastAPI + Python 3.11+ |
| ORM | SQLAlchemy (async) + Alembic |
| Validation | Pydantic v2 |
| Auth | Phone OTP (Twilio) + Google OAuth + Apple Sign In + JWT |
| Push | Expo Push Notifications |
| Storage | Cloudinary (photos) |
| SMS | Twilio |

---

## Project Structure

```
autoshine-studio/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── service.py
│   │   │   ├── booking.py
│   │   │   ├── membership.py
│   │   │   ├── review.py
│   │   │   ├── gallery.py
│   │   │   └── notification.py
│   │   ├── schemas/
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── services.py
│   │   │   ├── bookings.py
│   │   │   ├── garage.py
│   │   │   ├── memberships.py
│   │   │   ├── reviews.py
│   │   │   ├── gallery.py
│   │   │   ├── notifications.py
│   │   │   └── admin.py
│   │   ├── services/
│   │   ├── auth/
│   │   └── utils/
│   ├── alembic/
│   ├── tests/
│   └── requirements.txt
├── mobile/
│   ├── src/
│   │   ├── app/                  # Entry + navigation
│   │   │   ├── index.tsx
│   │   │   └── navigation/
│   │   │       ├── RootNavigator.tsx
│   │   │       ├── AuthNavigator.tsx
│   │   │       ├── CustomerNavigator.tsx
│   │   │       └── AdminNavigator.tsx
│   │   ├── screens/              # One folder per module
│   │   │   ├── onboarding/
│   │   │   ├── auth/
│   │   │   ├── home/
│   │   │   ├── services/
│   │   │   ├── booking/
│   │   │   ├── garage/
│   │   │   ├── gallery/
│   │   │   ├── membership/
│   │   │   ├── profile/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ui/               # Design system primitives
│   │   │   │   ├── GlassCard.tsx
│   │   │   │   ├── PremiumButton.tsx
│   │   │   │   ├── GradientText.tsx
│   │   │   │   ├── SkeletonLoader.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   └── AnimatedHeader.tsx
│   │   │   ├── booking/
│   │   │   ├── service/
│   │   │   └── shared/
│   │   ├── store/                # Zustand stores
│   │   │   ├── authStore.ts
│   │   │   ├── bookingStore.ts
│   │   │   └── garageStore.ts
│   │   ├── hooks/                # Custom hooks
│   │   ├── services/             # API client functions
│   │   │   ├── api.ts            # Axios instance
│   │   │   ├── auth.service.ts
│   │   │   ├── booking.service.ts
│   │   │   └── service.service.ts
│   │   ├── theme/                # Design tokens
│   │   │   ├── colors.ts
│   │   │   ├── typography.ts
│   │   │   └── spacing.ts
│   │   └── types/                # TypeScript interfaces
│   ├── app.json
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
├── skills/
├── agents/
├── PRPs/
└── .claude/commands/
```

---

## Design System Rules

### Colors (ALWAYS use these tokens, never hardcode hex)
```typescript
// theme/colors.ts
export const colors = {
  bg: {
    primary:   '#0A0A0A',
    secondary: '#141414',
    surface:   '#1C1C1C',
    glass:     'rgba(255,255,255,0.05)',
  },
  accent: {
    blue:  '#00D4FF',
    glow:  'rgba(0,212,255,0.15)',
    gold:  '#C9A84C',
  },
  text: {
    primary:   '#FFFFFF',
    secondary: '#A0A0A0',
    muted:     '#555555',
  },
  status: {
    success: '#00E676',
    warning: '#FFB300',
    error:   '#FF1744',
    info:    '#00D4FF',
  },
}
```

### NativeWind Class Conventions
```typescript
// Glass card background
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"

// Primary CTA button
className="bg-[#00D4FF] rounded-2xl py-4 items-center"

// Premium text gradient — use LinearGradient wrapper
// Screen background
className="flex-1 bg-[#0A0A0A]"
```

### Animation Rules
- Use `useSharedValue` + `useAnimatedStyle` from Reanimated for all animations
- Spring animations for UX transitions (stiffness: 200, damping: 20)
- Timing animations for fades (duration: 300ms, easing: Easing.out)
- Always wrap list items in `Animated.View` for entrance animations
- Never use `setTimeout` for animations — use Reanimated callbacks

---

## Code Standards

### Python (Backend)
```python
# ALWAYS use type hints
async def get_booking(db: AsyncSession, booking_id: int) -> Booking:
    pass

# ALWAYS use async endpoints
@router.get("/bookings/{id}")
async def get_booking(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BookingResponse:
    pass
```

### TypeScript (Mobile)
```typescript
// ALWAYS define interfaces — NO any types
interface Booking {
  id: number;
  serviceId: number;
  status: BookingStatus;
  totalPrice: number;
}

// ALWAYS type async functions
const fetchBooking = async (id: number): Promise<Booking> => { ... };

// ALWAYS type Zustand stores
interface AuthStore {
  user: User | null;
  token: string | null;
  setUser: (user: User) => void;
}
```

---

## Forbidden Patterns

### Backend
- `print()` → use `logging`
- Plain passwords → use bcrypt
- Hardcoded secrets → use env vars
- `SELECT *` → specify columns
- Sync SQLAlchemy in async endpoints

### Mobile / TypeScript
- `any` type → always type explicitly
- `console.log` in production code
- Inline `style={{}}` → use NativeWind className
- `StyleSheet.create` for colors → use design tokens
- Direct `fetch()` → use the `api.ts` Axios instance
- Hardcoded color values → use `colors` token object

---

## API Conventions

- All endpoints prefixed with `/api/v1/`
- Resources use plural nouns: `/bookings`, `/services`, `/vehicles`
- Admin endpoints under `/api/v1/admin/`
- HTTP status codes:
  - 200 OK, 201 Created, 204 No Content
  - 400 Bad Request (validation), 401 Unauthorized, 403 Forbidden
  - 404 Not Found, 409 Conflict, 429 Too Many Requests

---

## Authentication

### JWT Config
- Access token: 30 minutes, HS256
- Refresh token: 7 days, stored in DB
- OTP: 6-digit numeric, 10-minute TTL, single-use
- Rate limit: 3 OTPs per phone per hour

### Roles
- `customer` — default on signup
- `admin` — set by superadmin only
- `staff` — created by admin

---

## Module Rules

### Booking Module
- A booking can only be cancelled if >24 hours before the slot
- Slot `booked_count` increments atomically on booking creation
- `total_price` is calculated at booking time, not re-fetched
- Status transitions: `pending → confirmed → in_progress → completed`
- `cancelled` is a terminal state (no re-activation)

### Membership Module
- Membership discount applies automatically at booking creation
- Free washes tracked per calendar month, reset on 1st
- `platinum` members always get next available priority slot

### Reviews Module
- Review can only be submitted for a `completed` booking
- One review per booking (unique constraint on `booking_id`)
- `is_published` defaults to `true` (admin can unpublish)

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/autoshine

# Auth
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Twilio (SMS OTP)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# Mobile (Expo)
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Development Commands

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload --port 8000

# Mobile
cd mobile
npm install
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android

# Tests
pytest backend/tests -v --cov=app
cd mobile && npx tsc --noEmit

# Linting
ruff check backend/
cd mobile && npm run lint

# EAS Build (production)
eas build --platform all
```

---

## Skills Reference

| Task | Skill |
|------|-------|
| Database models | skills/DATABASE.md |
| FastAPI backend | skills/BACKEND.md |
| React Native UI | skills/FRONTEND.md |
| Testing | skills/TESTING.md |
| Docker + EAS | skills/DEPLOYMENT.md |

---

## Agent Coordination

| Agent | Responsibility |
|-------|----------------|
| DATABASE-AGENT | All SQLAlchemy models + Alembic migrations |
| BACKEND-AGENT | FastAPI routers, services, auth, Twilio, Cloudinary |
| FRONTEND-AGENT | All 40+ React Native screens, design system, navigation |
| DEVOPS-AGENT | Docker, Expo EAS config, CI/CD |
| TEST-AGENT | Pytest backend + React Native Testing Library |
| REVIEW-AGENT | Security, performance, App Store compliance |
