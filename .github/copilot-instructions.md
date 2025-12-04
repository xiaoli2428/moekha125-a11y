# Onchainweb - AI Coding Instructions

**Onchainweb** is a minimal React + Vite + Tailwind CSS starter for a DeFi-style homepage with mock data only.

## Architecture
- Flat component structure in `src/components/` (Header, Hero, Features, Footer in App.jsx)
- Presentational components with inline const arrays for data (e.g., `items` in Features.jsx)
- No state management, props, or TypeScript
- Entry point: `src/main.jsx` renders `<App />` into `#root` div in `index.html`

## Development Workflow
- `npm run dev`: Vite dev server (default port 5173)
- `npm run build`: Build to dist/
- `npm run preview`: Preview build
- `npm run postbuild`: Deploy to GitHub Pages via gh-pages
- No linting/testing/hooks configured

## Code Patterns
- **Components**: Default exports, PascalCase files (e.g., `Features.jsx`)
- **Data**: Inline const arrays mapped in JSX (e.g., `items.map((it) => ...)`)
- **Styling**: 
  - Tailwind utility classes throughout
  - Custom body gradients in `index.css`: `radial-gradient` overlays on `#0b1020` base
  - Custom opacity utilities: `.bg-white/3` (3%), `.bg-white/2` (2%) defined in index.css
  - Gradient containers: `bg-gradient-to-br from-purple-600 to-indigo-500`
  - Button gradients: `bg-gradient-to-r from-purple-600 to-indigo-500`
- **Icons**: Inline SVG elements with `stroke="currentColor"` or `stroke="white"` in gradient containers
- **Sections**: Use `<section id="..." className="py-12 px-6 md:px-12">` with anchor-linked IDs (e.g., `#app`, `#markets`)
- **Responsive**: Mobile-first with `md:` (768px+) and `lg:` (1024px+) breakpoints
- **Mock data**: Use "• • • •" placeholder pattern for TVL/volume displays
- **State (future)**: useState/useEffect for API fetches, local to components

## Component Structure
- **Header**: Logo, nav links (hidden on mobile), Connect + Launch App buttons
- **Hero**: 2-column grid (text + card mockup), badge, CTA buttons, stats cards
- **Features**: 4-column grid (responsive to 2/1 cols), card items with icon, title, desc, button
- **Footer**: Standard footer content

## Common Tasks
- **Add features**: Append to `items` array in `Features.jsx` with `{title, desc}` shape
- **New sections**: Create component in `src/components/`, import in `App.jsx`, wrap in `<section id="..." className="py-12 px-6 md:px-12">`
- **Colors**: Stick to purple-600, indigo-500, white/opacity for consistency
- **Buttons**: Use `px-4 py-2 rounded-lg` for standard, `px-5 py-3 rounded-lg` for prominent CTAs
- **Hover effects**: `hover:scale-[1.02] transition` for cards, `hover:opacity-95` for buttons

## Restrictions
- No subdirs in `src/components/`
- No real blockchain APIs or wallet integration (mock data only)
- No routing, state management libraries, or TypeScript
- Keep all data inline (no separate data files)

## File Organization
- `/src/main.jsx`: React render entry
- `/src/App.jsx`: Main layout (header, main, footer)
- `/src/index.css`: Tailwind imports + custom body gradient + utility classes
- `/src/components/*.jsx`: Individual UI components
- `/index.html`: HTML shell with `#root` div
- `/vite.config.js`: Vite config with React plugin
- `/tailwind.config.cjs`: Tailwind config (default)
- `/postcss.config.cjs`: PostCSS config (default)

## Future Backend Integration
- **API Endpoint**: `GET /api/trading/levels?feature={ai_arbitrage|binary_options}`
- **Response Schema**: `{ feature: string, levels: [{level: number, profitPercentage: number, minCapital: number, duration: string, riskLevel: string}] }`
- **Frontend Pattern**: Fetch in `useEffect`, store in `useState`, map to JSX
- **Example**: Replace `items` const in Features.jsx with API-fetched data