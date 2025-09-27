# 🛍️ E‑Commerce Frontend (Next.js App Router)

Production‑ready Next.js 15 (App Router) storefront with TypeScript, Tailwind, i18n, theming, and RTK Query data layer. Supports two modes:

1. Real backend mode (Django REST API at `NEXT_PUBLIC_API_BASE_URL`)
2. Mock mode (in‑memory data for local UX / rapid prototyping)

> The backend register/login endpoints are currently returning 500 (server issue). Frontend gracefully surfaces this. Once backend responds with JSON (201/400) no frontend changes are required.

## ✨ Features

### 🌐 **Internationalization (i18n)**
- **Multi-language Support**: English, Spanish, and French
- **Dynamic Language Switching**: Seamless language changes with preserved navigation
- **Localized Content**: All UI elements, messages, and content translated
- **RTL Support Ready**: Architecture prepared for right-to-left languages

### 🌙 **Dark Mode & Theming**
- **System Theme Detection**: Automatically follows user's system preference
- **Manual Theme Toggle**: Users can switch between light and dark modes
- **Smooth Transitions**: Elegant theme switching animations
- **Consistent Design System**: Unified color palette and component styling

### 🎨 **Modern Design System**
- **Inspired by Figma Design**: Professional UI/UX following modern design principles
- **Component Library**: Reusable UI components with variants
- **Responsive Design**: Mobile-first approach with seamless desktop experience
- **Accessibility**: WCAG compliant with proper contrast ratios and keyboard navigation

### 🛒 **Commerce Layer**
- **Auth (email + password)**: With JWT (SimpleJWT expected). Auto-login after successful register (when backend returns tokens or user object).
- **Products & Categories**: Normalization layer maps backend fields (e.g. `stock` → `stock_quantity`).
- **Cart (Mock / Local)**: Fully functional in mock mode; ready for API wiring.
- **Orders (Mock)**: Client-side only until backend endpoints are available.
- **Retry + Error Normalization**: Distinguishes network vs HTML 500 vs JSON validation errors.

## 🚀 Tech Stack

- **Framework**: Next.js 15 (App Router / Turbopack)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **State Management**: Redux Toolkit + RTK Query
- **Internationalization**: next-intl
- **Theming**: next-themes
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **UI Components**: Custom component library with variants

## 📁 Project Structure (abridged)

```
src/
├── app/
│   ├── [locale]/              # i18n routes (fallback to default)
│   ├── auth/                  # Auth pages (login/register)
│   ├── products/              # Product listing + details
│   ├── categories/            # Category listing + details
│   ├── cart/                  # Cart page (mock data persistence per session)
│   ├── orders/                # Mock order history
│   ├── globals.css            # Global styles and design tokens
│   └── layout.tsx             # Root layout
├── components/
│   ├── layout/                # Layout components
│   ├── providers/             # Context providers
│   └── ui/                    # Reusable UI components
├── lib/
│   ├── features/              # Redux slices
│   ├── api.ts                 # RTK Query API definition
│   ├── store.ts               # Redux store configuration
│   ├── hooks.ts               # Typed Redux hooks
│   └── utils.ts               # Utility functions
├── messages/                  # Translation files
│   ├── en.json                # English translations
│   ├── es.json                # Spanish translations
│   └── fr.json                # French translations
└── config/                    # Configuration files
```

## 🎨 Design System

### Color Palette
- **Primary**: Blue gradient with purple accents
- **Secondary**: Muted tones for subtle elements
- **Destructive**: Red for error states and dangerous actions
- **Success**: Green for positive feedback
- **Warning**: Yellow/orange for attention

### Typography
- **Font Family**: Geist Sans (primary), Geist Mono (code)
- **Scale**: Responsive typography with proper hierarchy
- **Weights**: Light, Regular, Medium, Semibold, Bold

### Components
- **Cards**: Elevated surfaces with hover effects
- **Buttons**: Multiple variants (primary, secondary, outline, ghost)
- **Forms**: Consistent input styling with validation states
- **Navigation**: Sticky header with backdrop blur
- **Modals**: Smooth overlay animations

## 🌍 Internationalization

### Supported Languages
- **English (en)**: Default language
- **Spanish (es)**: Complete translation
- **French (fr)**: Complete translation

### Adding New Languages
1. Create new translation file in `messages/[locale].json`
2. Add locale to `src/i18n.ts` locales array
3. Update middleware configuration
4. Add language option to `LanguageSwitcher` component

### Translation Structure
```json
{
  "common": { /* Shared translations */ },
  "navigation": { /* Navigation items */ },
  "auth": { /* Authentication forms */ },
  "products": { /* Product-related text */ },
  "cart": { /* Shopping cart */ },
  "checkout": { /* Checkout process */ },
  "orders": { /* Order management */ }
}
```

## 🌙 Dark Mode Implementation

### Theme System
- **CSS Variables**: Dynamic color system with HSL values
- **System Preference**: Automatically detects user's OS theme
- **Manual Override**: Users can toggle between light/dark modes
- **Persistence**: Theme preference saved in localStorage

### Color Tokens
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... more tokens */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... dark theme tokens */
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables** (create `.env.local`):
```bash
# Base backend URL (no trailing slash)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Use mock data (true/false)
NEXT_PUBLIC_USE_MOCKS=true

# Route all API calls via internal proxy (avoids CORS): /api/proxy/... (recommended if backend lacks CORS headers)
NEXT_PUBLIC_USE_API_PROXY=false

# Optional verbose API logging (console)
NEXT_PUBLIC_LOG_API=false

# (Server-side only) expose /api/backend-ping in non-dev
# ENABLE_BACKEND_PING=true
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables
| Variable | Scope | Description | Default |
|----------|-------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | client | Backend base (no trailing slash) | `http://localhost:8000` |
| `NEXT_PUBLIC_USE_MOCKS` | client | Use in-memory mock data | `false` |
| `NEXT_PUBLIC_USE_API_PROXY` | client | Force same-origin proxy `/api/proxy` | `false` |
| `NEXT_PUBLIC_LOG_API` | client | Enable verbose API request/error logs | `false` |
| `ENABLE_BACKEND_PING` | server | Allow `/api/backend-ping` in prod/staging | *(unset)* |

### Theme Configuration
The theme system is configured in `src/components/providers/ThemeProvider.tsx`:
- `attribute="class"`: Uses CSS classes for theme switching
- `defaultTheme="system"`: Follows system preference by default
- `enableSystem`: Enables system theme detection
- `disableTransitionOnChange`: Prevents flash during theme changes

### Internationalization Configuration
- **Default Locale**: English (en)
- **Supported Locales**: en, es, fr
- **Fallback**: Falls back to default locale for missing translations
- **Routing**: All routes are prefixed with locale (e.g., `/en/products`)

## 🔐 Proxy Strategy

When `NEXT_PUBLIC_USE_API_PROXY=true`, the RTK Query base URL becomes `/api/proxy/api/v1`. The edge/server route forwards to `$NEXT_PUBLIC_API_BASE_URL/api/v1/...`, rewriting redirects and following limited hops. This avoids CORS issues and hides backend host from the browser network panel.

Disable the proxy only if the backend adds proper CORS headers (e.g. via `django-cors-headers`).

## 🧱 Error Handling

`src/lib/errors.ts` normalizes:
- Network / DNS vs CORS / generic fetch failures
- HTML 500 pages mislabelled as JSON (reported as “unexpected (non‑JSON) response”)
- Field validation arrays → user friendly labels
- Known auth error messages → friendly text

Retries: transient `FETCH_ERROR` gets exponential backoff (2 attempts).

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- **Touch-friendly**: Optimized for touch interactions
- **Hamburger Menu**: Collapsible navigation for mobile
- **Swipe Gestures**: Natural mobile interactions
- **Fast Loading**: Optimized for mobile networks

## 🎯 Performance

### Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component with lazy loading
- **Bundle Analysis**: Optimized bundle size
- **Caching**: RTK Query caching for API responses
- **Prefetching**: Intelligent link prefetching

> Run `npx next build && npx next start` then Lighthouse locally for real metrics; sample scores not included to avoid misleading claims.

## 🧪 Testing (Add as Needed)

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Testing Strategy
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API integration and user flows
- **E2E Tests**: Complete user journey testing
- **Accessibility Tests**: WCAG compliance verification

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start
```

### Environment Setup Checklist
1. `NEXT_PUBLIC_API_BASE_URL` points to production backend (HTTPS)
2. Decide: enable proxy (`NEXT_PUBLIC_USE_API_PROXY=true`) or configure backend CORS
3. Set `NEXT_PUBLIC_USE_MOCKS=false`
4. Leave `NEXT_PUBLIC_LOG_API=false` (enable temporarily for debugging only)
5. Optional: enable monitoring / analytics (not bundled)

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative with great CI/CD
- **Docker**: Containerized deployment option

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Code Standards
- **ESLint**: Enforced code quality
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict type checking
- **Conventional Commits**: Standardized commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Design Inspiration**: [Figma E-Commerce Design](https://www.figma.com/design/EF22R2VzB2PpoPHGUMvWtZ/Full-E-Commerce-Website-UI-UX-Design--Community-?m=auto&is-community-duplicate=1&fuid=1398641016667259433)
- **Icons**: Lucide React
- **Fonts**: Vercel Geist Font Family
- **UI Patterns**: Modern e-commerce best practices

---

**Built with ❤️ using Next.js, TypeScript, Tailwind, RTK Query, and modern web tooling.**