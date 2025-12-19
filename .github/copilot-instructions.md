# Copilot Instructions for Onchainweb

**Onchainweb** is a minimal React + Vite + Tailwind CSS DeFi starter showcasing an accessibility-first web3 interface with mock data.

## Tech Stack

- React 18.2.0 + Vite 5.0.0 + Tailwind CSS 3.4.8
- No state management, routing, or backend (yet)

## Architecture

- **Component Tree**: `App.jsx` renders `Header`, `Hero`, `Features`, `Footer` in a flexbox layout (`min-h-screen flex flex-col`)
- **Styling System**: Tailwind utilities + custom extensions in `tailwind.config.cjs` (primary: `#6EE7B7`, accent: `#7C3AED`) + radial gradient background in `index.css`
- **Data Flow**: Currently static mock data (see `Hero.jsx` balance cards, `Features.jsx` items array). No state management yet.
- **Entry Point**: `main.jsx` → `App.jsx` → component tree

## Development Workflow

```bash
npm run dev    # Vite dev server on :5173
npm run build  # Production build
npm run preview # Preview production build
```

**No test infrastructure exists.** All components are functional (no class components).

## Critical Patterns

### Styling Convention
- **Dark theme baseline**: `bg-gray-900 text-white` (body) with radial gradients in `index.css`
- **Custom opacity utilities**: `.bg-white/3` and `.bg-white/2` defined in `index.css` (not standard Tailwind)
- **Gradient pattern**: Purple-to-indigo gradients (`from-purple-600 to-indigo-500`) used consistently across CTAs and brand elements
- **Responsive breakpoint**: Mobile-first with `md:` prefix (768px+)

Example from `Header.jsx`:
```jsx
<button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg text-sm font-semibold shadow-md hover:opacity-95">
```

### Component Structure
Each component exports a default function with inline JSX (no separate templates). See `Features.jsx` for data-driven rendering pattern:
```jsx
const items = [/* mock data */]
export default function Features() {
  return <section>{items.map(it => <div key={it.title}>...)}</section>
}
```

### Accessibility Considerations
- **Current state**: Semantic HTML used (`<header>`, `<nav>`, `<main>`, `<footer>`), but no ARIA labels or keyboard nav improvements yet
- **When adding interactivity**: 
  - Buttons without visible text need `aria-label`
  - Navigation links need proper focus styles (currently only `hover:text-white`)
  - Modal/drawer components need `role`, `aria-modal`, focus trapping

Example missing a11y pattern to add:
```jsx
// Current (Header.jsx)
<button className="...">Connect</button>

// Should be (for icon-only buttons)
<button aria-label="Connect wallet" className="...">Connect</button>
```

## When Adding Features

- **New components**: Place in `src/components/`, export default function, import in `App.jsx`
- **Mock data**: Define as const arrays/objects at top of component file (see `Features.jsx` items)
- **Future web3 integration points**: 
  - Wallet connection → `Header.jsx` "Connect" button
  - Balance display → `Hero.jsx` balance cards (currently `• • • •`)
  - Real price feeds → `Hero.jsx` TVL/Volume metrics
- **Preserve**: Gradient aesthetic, minimal dependency footprint (no state libs yet), dark theme

## Key Files

- `src/App.jsx` - Main layout container
- `src/components/Header.jsx` - Navigation with Connect/Launch buttons
- `src/components/Hero.jsx` - Hero with balance preview and CTAs
- `src/components/Features.jsx` - 8-item grid of feature cards
- `src/index.css` - Custom gradients and opacity utilities
- `tailwind.config.cjs` - Extended color palette and gradients

## Constraints

- Keep bundle minimal (no heavy libs without discussion)
- All data is mock (no real on-chain calls)
- No backend/API endpoints exist
- Vite config is default (no custom plugins or aliases)
