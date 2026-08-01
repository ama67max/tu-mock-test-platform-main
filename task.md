Implementation Plan - PWA-Enhanced Dark Theme Mock Test Platform
Problem Statement
Redesign all 15 page components in the TU Mock Test Platform with a cohesive dark theme design system and full PWA capabilities. The platform needs to support offline exam taking, maintain visual consistency through design principles (60-30-10 color theory, 8pt grid, typography system), and provide both dark and light theme options for accessibility.

Requirements
Design System
Color Palette: Black (60% dominant) + Silver (30% secondary) + White (10% accent)
Use subtle black-to-dark-gray gradients for depth
Include various tints/shades for visual variety
Typography: 4 font sizes based on 8pt grid (16px, 24px, 32px, 40px)
2 weights: semi-bold (600) and regular (400)
Maintain Inter font family
Spacing: 8pt grid for major layout, flexible micro-spacing for components
Theme Toggle: User preference for dark/light modes with localStorage persistence
PWA Features (Full Offline Capability)
Service Worker: Cache static assets, API responses, and exam data
Offline Exam Taking: Local storage of questions with background sync
Auto-caching Strategy: Store 5 most recently accessed exams
Installability: Web app manifest with proper icons and metadata
Graceful Degradation: Core features work when PWA unsupported
Pages to Redesign (15 total)
Public Pages: HomePage, LoginPage, RegisterPage Student Pages: DashboardPage, ExamListPage, ExamPage, ResultPage, LeaderboardPage Admin Pages: AdminDashboard, AdminUsers, AdminExams, AdminQuestions, AdminAnalytics Unified Design: Same design system across all pages

Background
Current Stack
React 18 + Vite 5 + Tailwind CSS 3.4
React Router DOM v6, Zustand, lucide-react, recharts
No existing PWA setup
Light theme with neutral grays currently
Key Technical Context
Modular component structure with reusable primitives
Custom hooks for auth, exam state, timer
Centralized API layer for backend communication
Tailwind configured with custom utilities
Proposed Solution
Design System
Color System (60-30-10):

Dark: 60% Black (#000, #0a0a0a, #141414, #1e1e1e) + 30% Silver (#c0c0c0, #808080, #505050) + 10% White (#fff, #f5f5f5)
Light: 60% White (#fff, #fafafa, #f5f5f5) + 30% Silver (#808080, #d3d3d3) + 10% Black (#000, #1a1a1a)
Typography: Display (40px), Heading (32px), Subheading (24px), Body (16px) - semi-bold/regular

Spacing: 8pt grid (8, 16, 24, 32, 40, 48, 64, 80px)

PWA Architecture
vite-plugin-pwa with Workbox strategies
IndexedDB for exam storage (5 most recent with LRU eviction)
Background Sync for offline submissions
Custom SW Strategy for exam caching
Task Breakdown
Task 1: Design System Foundation - Tailwind Configuration
Update Tailwind config with black-silver-white color scales, typography utilities (16px, 24px, 32px, 40px), 8pt spacing scale, dark mode setup, gradient utilities, and font weights.

Demo: Tailwind classes generate properly, dark mode toggle works, custom utilities available.

Task 2: Global Styles and Theme Provider
Create ThemeContext/Provider, useTheme hook, update globals.css with CSS custom properties for both themes, add dark mode variables and gradient backgrounds.

Demo: Theme toggle switches colors instantly, preference persists across sessions, gradients provide visual depth.

Task 3: Core Component Library - Redesigned Primitives
Rebuild Button, Card, Input, Badge, LoadingSpinner with new color scheme, gradients, proper spacing (8pt), and theme variants.

Demo: All components render in both themes, gradient depth visible, consistent spacing, accessible contrast.

Task 4: Layout Components - Header, Navigation, Theme Toggle
Redesign StudentLayout and AdminLayout with dark theme header, create ThemeToggle component, add offline status indicator, implement responsive navigation.

Demo: Consistent header across pages, theme toggle works, mobile navigation functional, offline badge appears when disconnected.

Task 5: PWA Setup - Vite Plugin and Manifest
Install vite-plugin-pwa, create manifest.json, generate icons, configure Workbox strategies, add PWA meta tags, create install prompt handler.

Demo: Lighthouse PWA audit passes, app installable, service worker registers, offline page loads.

Task 6: IndexedDB Manager for Offline Exam Storage
Create IndexedDB layer with schemas (exams, questions, answers, syncQueue), implement CRUD operations, build exam cache with LRU eviction (5 most recent), answer persistence.

Demo: Exam data cached in IndexedDB, LRU eviction works, answers persist offline, sync queue stores submissions.

Task 7: Offline Detection and Sync Status UI
Build useOnlineStatus hook, create OfflineIndicator and SyncStatus components, add connectivity toast notifications, implement sync progress feedback.

Demo: Offline badge appears when disconnected, sync status shows during queue processing, toast notifications on connectivity change.

Task 8: Exam Caching Service Worker Strategy
Implement custom Workbox strategy for exam caching, track recent exams in localStorage, prefetch exam resources, background sync for submissions, cache versioning.

Demo: Exams auto-cache on access, oldest removed when 6th accessed, offline exam loads from cache, submissions queue and sync automatically.

Task 9: Redesign Public Pages (HomePage, LoginPage, RegisterPage)
Apply design system to public pages with gradient hero (40px display text), form cards with silver borders (24px padding), theme toggle, responsive layouts.

Demo: Dark hero with gradient, readable typography, themed forms, responsive on all devices.

Task 10: Redesign Student Dashboard Page
Rebuild DashboardPage with gradient stat cards, themed charts, offline-aware states, proper spacing (24px card padding, 32px sections).

Demo: Gradient cards with white text, dark-themed charts, offline indicator when disconnected, cached stats visible.

Task 11: Redesign Exam Pages (ExamListPage, ExamPage, ResultPage)
Update exam pages with offline-first loading, gradient cards, cached exam badges, offline answer persistence, themed timer (40px), result visualization.

Demo: Exam list shows cache status, complete exam offline, timer persists, answers save locally, results sync when online.

Task 12: Redesign Leaderboard Page
Update LeaderboardPage with themed table, rank badges (gold/silver/bronze), user highlight, cached data display, proper typography.

Demo: Dark themed table, distinct rank badges, user row highlighted, offline cached data visible.

Task 13: Redesign Admin Pages (AdminDashboard, AdminUsers, AdminExams, AdminQuestions, AdminAnalytics)
Apply unified design to all admin pages with gradient cards, silver bordered tables, dark form inputs, themed charts, consistent spacing.

Demo: Consistent dark theme across admin, readable tables, functional forms, themed analytics, unified with student pages.

Task 14: Enhanced Offline Experience - Queue Management UI
Build SyncQueuePanel slide-out component showing pending operations, manual retry, progress indicators, queue clearing, timestamps.

Demo: Panel shows queued items, manual retry works, items sync on reconnect, success feedback shown.

Task 15: Performance Optimization and Final PWA Audit
Add code splitting with React.lazy(), optimize Workbox precaching, implement lazy loading, run Lighthouse audit, test cross-browser/device.

Demo: Lighthouse scores green (Performance >90, PWA 100, Accessibility >90), code-split chunks load, offline functional, installs on all platforms.