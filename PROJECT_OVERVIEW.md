# Zek's Surf School - Project Overview

## 🏄‍♂️ Project Description

**Zek's Surf School** is a modern, responsive web application built for a surf school business that specializes in teaching surfing lessons. The website combines e-commerce functionality with educational content and an AI-powered chat system to provide a comprehensive digital experience for surf enthusiasts.

### Business Model
- Surf lesson booking system with personalized scheduling
- Multiple beach locations with detailed information
- Private and group lesson options
- E-commerce cart system with progressive discounts
- Educational blog content about surfing

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
- **Local Storage** - Session persistence for chat

### Backend Integration
- **Supabase 2.50.0** - Database backend for booking and staff management
- **Stripe 18.2.1** - Payment processing and webhooks
- **Web Push 3.6.7** - Push notification service for staff alerts

### Additional Libraries
- **clsx & tailwind-merge** - Conditional styling utilities
- **UUID 9.0.0** - Unique identifier generation
- **Micro 10.0.1** - Lightweight webhook processing

---

## 📁 Project Structure

```
Surf Site/
├── public/                      # Static assets
│   ├── images/                  # General images (surf photos, social icons)
│   ├── beaches/                 # Beach-specific images
│   ├── zeks-logo.png           # Brand logo assets
│   └── favicon.ico             # Site favicon
├── src/
│   ├── pages/                   # Next.js pages (routing)
│   │   ├── index.tsx           # Home page
│   │   ├── cart.tsx            # Shopping cart page
│   │   ├── checkout.tsx        # Checkout process
│   │   ├── chat.tsx            # Full-page chat interface
│   │   ├── confirmation.tsx    # Booking confirmation
│   │   ├── booking-details.tsx # Booking details page
│   │   ├── testing.tsx         # Development testing page
│   │   ├── blog/
│   │   │   └── [id].tsx        # Dynamic blog post pages
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
│   │   │   └── WetsuitSizeGuide.tsx # Size guide modal
│   │   ├── Chat/               # AI chat system components
│   │   │   ├── ChatWidget.tsx  # Embedded chat widget
│   │   │   ├── FullPageChat.tsx # Full-screen chat interface
│   │   │   ├── ChatInput.tsx   # Message input component
│   │   │   ├── ChatMessage.tsx # Individual message display
│   │   │   └── SurfbotButton.tsx # Chat trigger button
│   │   ├── Cart/               # Shopping cart components
│   │   │   └── CartIcon.tsx    # Cart icon with item count
│   │   ├── Booking/            # Booking related components
│   │   │   └── BookingDetails.tsx # Booking details display
│   │   ├── Contact/            # Contact section components
│   │   │   └── ContactSection.tsx # Contact information
│   │   ├── SurfData/           # Surf condition components
│   │   └── ui/                 # Generic UI components
│   ├── context/                # React Context providers
│   │   └── CartContext.tsx     # Shopping cart state management
│   ├── data/                   # Static data and content
│   │   └── blogPosts.ts        # Blog content data
│   ├── lib/                    # Utility libraries and services
│   │   └── chatService.ts      # AI chat service integration
│   ├── types/                  # TypeScript type definitions
│   │   └── chat.ts             # Chat-related type definitions
│   ├── utils/                  # Utility functions
│   ├── assets/                 # Additional assets
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
- **Weekly Calendar**: Complete booking management interface
- **Real-time Sync**: Automatic booking synchronization with payments
- **Status Management**: Update lesson status (confirmed/completed/cancelled)
- **Customer Contact**: Direct access to customer phone/email
- **Database Integration**: Supabase backend for persistent data

### 6. Push Notification System
**Location**: `src/lib/pushNotificationService.ts` & `src/pages/api/push/`
- **Staff Alerts**: Real-time notifications for new bookings
- **iOS PWA Support**: Add-to-home-screen functionality
- **Subscription Management**: Device registration and cleanup
- **VAPID Authentication**: Secure push notification delivery
- **Service Worker**: Background notification handling

### 7. Review Collection System
**Location**: `src/pages/review.tsx` & `src/lib/reviewService.ts`
- **URL-based Forms**: Pre-filled review forms from email links
- **Multi-rating System**: Overall, instructor, equipment, experience ratings
- **Admin Moderation**: Review approval workflow in admin panel
- **Data Export**: JSON export for review management
- **Duplicate Prevention**: Payment ID-based duplicate checking

### 8. Admin Debug Portal
**Location**: `src/pages/admin-debug-portal-*.tsx`
- **System Monitoring**: Cache, API, and storage inspection
- **Review Management**: Approve, reject, and manage customer reviews
- **Staff Management**: PIN creation and staff portal administration
- **Data Export**: Complete system data export capabilities
- **Performance Metrics**: Real-time system statistics

### 9. Payment Integration
**Location**: `src/pages/api/webhooks/stripe.ts` & Stripe APIs
- **Stripe Integration**: Secure payment processing with webhooks
- **Automatic Booking**: Payment completion triggers booking creation
- **Metadata Storage**: Complete booking details in payment metadata
- **N8N Webhooks**: Integration with external automation systems
- **Tax Calculation**: Automatic tax computation (8% rate)

### 10. Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Breakpoint System**: Custom responsive utilities
- **Touch-Friendly**: Mobile-optimized interactions
- **Performance**: Optimized images and lazy loading

---

## 🚀 Technical Implementation Details

### Next.js Configuration
```javascript
// next.config.js
{
  reactStrictMode: true,
  swcMinify: true,
  images: { unoptimized: true }
}
```

### State Management Architecture
- **Cart Context**: Centralized shopping cart state with automatic discount calculation
- **Local Storage**: Chat session persistence and user preferences
- **Component State**: Local UI state management with React hooks

### API Integration
- **N8N Webhook**: External AI chat service integration
- **Booking Webhook**: Real-time slot availability API
- **Environment Variables**: Secure API endpoint configuration
- **Error Handling**: Robust error management with fallback responses
- **Coordinate Mapping**: Beach location coordinates for API requests

### Performance Optimizations
- **Image Optimization**: Next.js Image component with responsive sizing
- **Code Splitting**: Automatic route-based code splitting
- **CSS Optimization**: Tailwind CSS purging and minification
- **Bundle Analysis**: Optimized build output

---

## 🎯 User Experience Flow

### 1. Landing Experience
1. **Hero Section**: Compelling call-to-action with surf imagery
2. **Chat Widget**: Immediate access to AI assistance
3. **Quick Booking**: Streamlined lesson booking process

### 2. Booking Journey
1. **Beach Selection**: Choose from featured surf locations
2. **Schedule Planning**: Pick date, time, and lesson type
3. **Cart Management**: Add multiple lessons with automatic discounts
4. **Checkout Process**: Complete booking with contact information
5. **Confirmation**: Booking details and next steps

### 3. Learning Resources
1. **Blog Discovery**: Featured blog posts on homepage
2. **Educational Content**: Comprehensive surfing guides
3. **Safety Information**: Ocean safety and surf etiquette
4. **Local Knowledge**: Insider tips for SoCal surf spots

---

## 🔧 Development Workflow

### Environment Setup
```bash
npm install          # Install dependencies
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
```

### Development Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Next.js recommended configuration
- **Code Organization**: Feature-based component structure
- **Responsive Development**: Mobile-first approach

### Asset Management
- **Public Assets**: Static files in `/public` directory
- **Image Organization**: Categorized by type (beaches, general images)
- **Icon Libraries**: Lucide React and React Icons for consistency

---

## 🌊 Business Logic

### Pricing Strategy
- **Base Pricing**: Dynamic pricing per lesson type
- **Volume Discounts**: Encourages multiple bookings
- **Private Lesson Premium**: Higher pricing for personalized instruction

### Content Strategy
- **Educational Focus**: Builds trust and authority
- **Local Expertise**: Showcases knowledge of SoCal surf scene
- **Safety Emphasis**: Responsible surfing education

### User Engagement
- **AI Chat Assistant**: 24/7 availability for questions
- **Rich Content**: Multiple content formats for different learning styles
- **Social Proof**: Authentic imagery and local knowledge

---

## 🚦 Current Status & Notes

### Completed Features
✅ Responsive design system
✅ Complete booking workflow
✅ AI chat integration
✅ Shopping cart with discounts
✅ Educational blog system
✅ Beach information system
✅ Staff portal with PIN authentication
✅ Push notification system for staff alerts
✅ Review collection and management system
✅ Admin debug portal with comprehensive tools
✅ Stripe payment integration with webhooks
✅ Supabase database backend
✅ PWA functionality for iOS devices

### Technical Considerations
- **Image Optimization**: Some large image files could be optimized
- **SEO**: Meta tags implemented, could be enhanced
- **Accessibility**: Basic accessibility, could be improved
- **Testing**: Manual testing implemented, automated tests could be added

### Deployment Ready
The application is production-ready with:
- Optimized build configuration
- Environment variable support
- Responsive design across all devices
- Error handling and fallbacks

---

## 📞 Contact & Business Information

**Zek's Surf School** - Learn to Surf with Confidence
- Specializes in beginner-friendly surf instruction
- Multiple Southern California beach locations
- Personal and group lesson options
- Equipment rental and safety education

This project represents a complete digital solution for a modern surf school business, combining e-commerce functionality, educational content, and AI-powered customer service in a beautifully designed, responsive web application. 