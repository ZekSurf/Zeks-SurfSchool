# Zek's Surf School - Project Overview

## 🏄‍♂️ Project Description

**Zek's Surf School** is a modern, responsive web application built for a surf school business that specializes in teaching surfing lessons. The website combines e-commerce functionality with educational content and an AI-powered chat system to provide a comprehensive digital experience for surf enthusiasts.

### Business Model
- Surf lesson booking system with personalized scheduling
- Multiple beach locations with detailed information
- Private and group lesson options
- E-commerce cart system with progressive discounts
- Educational blog content about surfing
- Staff portal for booking management
- Review collection system
- Push notification system for staff alerts

---

## 🛠️ Technical Stack

### Frontend Framework
- **Next.js 14.0.0** - React framework with SSR/SSG capabilities
- **TypeScript** - Type-safe development
- **React 18.2.0** - Component-based UI library

### Styling & UI
- **Tailwind CSS 3.3.0** - Utility-first CSS framework
- **Custom Design System** - Surf-themed color palette and typography
- **Framer Motion 10.16.0** - Animations and transitions
- **Lucide React 0.290.0** - Modern icon library
- **React Icons 5.5.0** - Additional icon set

### State Management
- **React Context API** - Cart state management
- **Local Storage** - Session persistence for chat and reviews

### Backend Integration
- **Supabase 2.50.0** - Database backend for booking and staff management
- **Stripe 18.2.1** - Payment processing and webhooks
- **Web Push 3.6.7** - Push notification service for staff alerts

### Additional Libraries
- **clsx & tailwind-merge** - Conditional styling utilities
- **UUID 9.0.0** - Unique identifier generation
- **Micro 10.0.1** - Lightweight webhook processing
- **@vercel/analytics 1.5.0** - Analytics integration

---

## 📁 Project Structure

```
Surf Site/
├── public/                      # Static assets
│   ├── images/                  # General images (surf photos, social icons)
│   ├── beaches/                 # Beach-specific images
│   ├── zeks-logo.png           # Brand logo assets
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker for push notifications
│   └── favicon.ico             # Site favicon
├── src/
│   ├── pages/                   # Next.js pages (routing)
│   │   ├── index.tsx           # Home page
│   │   ├── cart.tsx            # Shopping cart page
│   │   ├── checkout.tsx        # Checkout process
│   │   ├── chat.tsx            # Full-page chat interface
│   │   ├── confirmation.tsx    # Booking confirmation
│   │   ├── booking-details.tsx # Booking details page
│   │   ├── review.tsx          # Review collection page
│   │   ├── cache-demo.tsx      # Cache testing page
│   │   ├── privacy-policy.tsx  # Privacy policy
│   │   ├── terms-and-conditions.tsx # Terms and conditions
│   │   ├── refund-cancellation-policy.tsx # Refund policy
│   │   ├── admin-debug-portal-*.tsx # Admin debug portal
│   │   ├── staff-portal-*.tsx  # Staff portal with calendar
│   │   ├── blog/
│   │   │   └── [id].tsx        # Dynamic blog post pages
│   │   ├── api/                # API routes
│   │   │   ├── create-payment-intent.ts # Stripe payment creation
│   │   │   ├── test-supabase.ts # Database testing
│   │   │   ├── debug/          # Debug endpoints
│   │   │   │   ├── bookings.ts # Debug booking data
│   │   │   │   ├── push-config.ts # Push notification config
│   │   │   │   ├── test-cache.ts # Cache testing
│   │   │   │   └── test-push.ts # Push notification testing
│   │   │   ├── push/           # Push notification API
│   │   │   │   ├── send-notification.ts
│   │   │   │   ├── subscribe.ts
│   │   │   │   └── unsubscribe.ts
│   │   │   ├── staff/          # Staff management API
│   │   │   │   ├── get-pending-bookings.ts
│   │   │   │   ├── pin-management.ts
│   │   │   │   └── sync-bookings.ts
│   │   │   └── webhooks/
│   │   │       └── stripe.ts   # Stripe webhook handler
│   │   └── _app.tsx            # App configuration
│   ├── components/              # Reusable UI components
│   │   ├── Layout/             # Site layout components
│   │   │   ├── Layout.tsx      # Main layout wrapper
│   │   │   ├── Navbar.tsx      # Navigation header
│   │   │   ├── Footer.tsx      # Site footer
│   │   │   └── Header.tsx      # Page header component
│   │   ├── Home/               # Home page specific components
│   │   │   ├── Hero.tsx        # Hero section with CTA
│   │   │   ├── About.tsx       # About section
│   │   │   ├── Blog.tsx        # Blog preview section
│   │   │   ├── BookingSection.tsx # Main booking interface
│   │   │   ├── BeachDetailsModal.tsx # Beach information modal
│   │   │   ├── Certifications.tsx # Certifications display
│   │   │   └── WetsuitSizeGuide.tsx # Size guide modal
│   │   ├── Chat/               # AI chat system components
│   │   │   ├── ChatWidget.tsx  # Embedded chat widget
│   │   │   ├── FullPageChat.tsx # Full-screen chat interface
│   │   │   ├── ChatInput.tsx   # Message input component
│   │   │   ├── ChatMessage.tsx # Individual message display
│   │   │   ├── SurfbotButton.tsx # Chat trigger button
│   │   │   └── SurfBotThinking.tsx # Thinking indicator
│   │   ├── Cart/               # Shopping cart components
│   │   │   └── CartIcon.tsx    # Cart icon with item count
│   │   ├── Booking/            # Booking related components
│   │   │   ├── BookingDetails.tsx # Booking details display
│   │   │   └── WaiverAgreement.tsx # Waiver agreement
│   │   ├── Contact/            # Contact section components
│   │   │   └── ContactSection.tsx # Contact information
│   │   ├── Staff/              # Staff portal components
│   │   │   ├── BookingDetailsModal.tsx # Staff booking details
│   │   │   └── WeeklyCalendar.tsx # Weekly calendar view
│   │   ├── Payment/            # Payment components
│   │   │   └── StripePaymentForm.tsx # Stripe payment form
│   │   ├── SurfData/           # Surf condition components
│   │   │   └── SurfDataTester.tsx # Surf data testing
│   │   ├── ui/                 # Generic UI components
│   │   │   └── Button.tsx      # Button component
│   │   └── CacheDemo.tsx       # Cache demonstration component
│   ├── context/                # React Context providers
│   │   └── CartContext.tsx     # Shopping cart state management
│   ├── data/                   # Static data and content
│   │   └── blogPosts.ts        # Blog content data
│   ├── lib/                    # Utility libraries and services
│   │   ├── bookingCache.ts     # Booking cache service
│   │   ├── bookingService.ts   # Booking API service
│   │   ├── chatService.ts      # AI chat service integration
│   │   ├── pushNotificationService.ts # Push notification service
│   │   ├── reviewService.ts    # Review collection service
│   │   ├── staffService.ts     # Staff management service
│   │   ├── stripe.ts           # Stripe integration
│   │   ├── supabase.ts         # Supabase client and schemas
│   │   ├── supabaseCacheService.ts # Supabase cache service
│   │   └── supabaseStaffService.ts # Supabase staff service
│   ├── types/                  # TypeScript type definitions
│   │   ├── booking.ts          # Booking-related types
│   │   ├── chat.ts             # Chat-related type definitions
│   │   ├── gtag.d.ts           # Google Analytics types
│   │   └── review.ts           # Review system types
│   ├── assets/                 # Additional assets
│   │   └── images/             # Asset images
│   ├── utils/                  # Utility functions
│   └── styles/                 # Global styles
│       └── globals.css         # Global CSS with custom properties
├── tailwind.config.js          # Tailwind CSS configuration
├── next.config.js              # Next.js configuration
├── tsconfig.json               # TypeScript configuration
├── postcss.config.js           # PostCSS configuration
├── package.json                # Project dependencies
└── .gitignore                  # Git ignore rules
```

---

## 🎨 Design System

### Color Palette
The application uses a surf-themed color palette defined in both Tailwind config and CSS custom properties:

- **Primary**: `#D97706` (Sunset Orange) - Main brand color
- **Secondary**: `#FBBF24` (Sand Gold) - Accent color
- **Accent**: `#0EA5E9` (Ocean Teal) - Interactive elements
- **Neutral**: `#F3F4F6` (Seafoam) - Background and neutral elements
- **Success**: `#047857` (Palm Leaf) - Success states

### Typography
- **Primary Font**: Poppins (Google Fonts) - Clean, modern sans-serif
- **Font Weights**: 300, 400, 500, 600, 700
- **Responsive Typography**: Scales appropriately across device sizes

### Visual Theme
- Ocean and surf-inspired imagery
- Gradient backgrounds
- Modern, clean interface design
- Mobile-first responsive approach

---

## ⚡ Key Features

### 1. Interactive Booking System
**Location**: `src/components/Home/BookingSection.tsx` & `src/lib/bookingService.ts`
- **Beach Selection**: Multiple surf locations with detailed information
  - Doheny State Beach (33.459869, -117.686949)
  - T-Street (San Clemente) (33.416021, -117.619309)
  - San Onofre State Beach (33.372637, -117.565611)
- **Real-time Slot Fetching**: Webhook integration for live availability
- **Date & Time Picker**: Calendar-based scheduling with API integration
- **Dynamic Pricing**: Server-side pricing based on conditions and availability
- **Weather Integration**: Real-time conditions display from API
- **Availability Tracking**: Live open spots and booking status
- **Cache System**: Advanced caching for booking availability

### 2. AI-Powered Chat System
**Location**: `src/components/Chat/` & `src/lib/chatService.ts`
- **N8N Integration**: Connected to external AI workflow system
- **Session Management**: Persistent chat sessions using localStorage
- **Multiple Interfaces**: 
  - Embedded widget on homepage
  - Full-page chat interface
  - Mobile-optimized design
- **Smart Responses**: Context-aware surfing advice and booking assistance

### 3. E-commerce Cart System
**Location**: `src/context/CartContext.tsx`
- **Progressive Discounts**: 
  - 1st lesson: Full price
  - 2nd lesson: 15% off
  - 3rd+ lessons: 25% off
- **Booking for Others**: Option to book lessons for different people
- **Persistent State**: Cart contents maintained across sessions
- **Real-time Updates**: Dynamic pricing and item count

### 4. Educational Blog System
**Location**: `src/data/blogPosts.ts` & `src/pages/blog/[id].tsx`
- **Rich Content**: Structured blog posts with multiple content types
- **SEO-Friendly**: Dynamic routing with proper meta tags
- **Content Types**:
  - Paragraphs and headings
  - Bulleted lists
  - Pro tips and highlights
- **Topics Cover**:
  - Surf conditions and timing
  - Beginner techniques
  - Local surf spots
  - Ocean safety
  - Surf etiquette

### 5. Staff Portal & Management System
**Location**: `src/pages/staff-portal-*.tsx` & `src/lib/supabaseStaffService.ts`
- **Secure Access**: PIN-protected staff portal with obscure URL
- **Weekly Calendar**: Complete booking management interface with `WeeklyCalendar.tsx`
- **Real-time Sync**: Automatic booking synchronization with payments
- **Status Management**: Update lesson status (confirmed/completed/cancelled)
- **Customer Contact**: Direct access to customer phone/email
- **Database Integration**: Supabase backend for persistent data
- **Booking Details Modal**: Enhanced booking information display

### 6. Push Notification System
**Location**: `src/lib/pushNotificationService.ts` & `src/pages/api/push/`
- **Staff Alerts**: Real-time notifications for new bookings
- **Service Worker**: PWA integration with `sw.js`
- **Subscription Management**: Device subscription handling
- **Debug Tools**: Comprehensive debugging and testing tools

### 7. Review Collection System
**Location**: `src/pages/review.tsx` & `src/lib/reviewService.ts`
- **URL-based Form**: Pre-filled review forms via URL parameters
- **Star Ratings**: Multiple rating categories (overall, instructor, equipment, experience)
- **Data Validation**: Prevents duplicate submissions
- **Admin Management**: Review moderation through admin portal

### 8. Admin Debug Portal
**Location**: `src/pages/admin-debug-portal-*.tsx`
- **System Monitoring**: Cache statistics and system status
- **Data Management**: Export, clear, and inspect system data
- **API Testing**: Debug endpoints for testing integrations
- **Security**: Password-protected with brute force protection

### 9. Advanced Caching System
**Location**: `src/lib/bookingCache.ts` & `src/lib/supabaseCacheService.ts`
- **Multi-layer Caching**: Browser storage + Supabase database
- **Cache Invalidation**: Smart cache expiration strategies
- **Performance Optimization**: Reduced API calls and faster loading

---

## 🔧 Development Tools

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Environment Configuration
The application requires various environment variables for:
- Stripe payment processing
- Supabase database connection
- Push notification VAPID keys
- Admin passwords
- Webhook URLs

### Testing & Debugging
- Cache demo page for testing cache functionality
- Debug API endpoints for system monitoring
- Comprehensive logging and error handling
- Push notification testing tools

---

## 📱 Progressive Web App (PWA)

### PWA Features
- **Service Worker**: Background sync and offline support
- **Manifest**: App installation on mobile devices
- **Push Notifications**: Native notification support
- **Responsive Design**: Mobile-first approach

---

## 🔒 Security Features

### Authentication & Authorization
- PIN-protected staff portal
- Admin password protection with lockout
- Obscure URLs for sensitive areas
- Session-based authentication

### Data Protection
- Supabase Row Level Security (RLS)
- Secure environment variable handling
- Webhook signature verification
- Input validation and sanitization

---

## 🚀 Performance Optimizations

### Caching Strategy
- Multi-tier caching system
- Browser localStorage for quick access
- Database caching for persistence
- Automatic cache invalidation

### Code Optimization
- TypeScript for type safety
- Component-based architecture
- Lazy loading and code splitting
- Optimized image delivery

---

## 📊 Analytics & Monitoring

### Integrated Analytics
- Vercel Analytics for performance monitoring
- Custom event tracking
- Error logging and reporting
- System health monitoring

---

This comprehensive surf school application combines modern web technologies with practical business needs to create a full-featured booking and management system for surf instruction businesses. 