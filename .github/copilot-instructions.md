# Onchainweb - AI Coding Instructions

**Onchainweb** is a minimal React + Vite + Tailwind CSS starter for a DeFi-style homepage. Mock data only - no blockchain integration yet.

## Architecture

**Component Structure**: Flat hierarchy in `src/components/` - no nesting, no context providers, no state management library.
- `App.jsx`: Simple composition container (`<Header/>`, `<Hero/>`, `<Features/>`, `<Footer/>`)
  - Wrapped in `min-h-screen flex flex-col` for full-height layout
  - `<main>` gets `flex-1` to push footer down
- All components are presentational with hardcoded data (see `items` array in `Features.jsx`)
- No prop drilling - each component is self-contained
- Component naming: PascalCase files matching default export name

**Data Pattern**: Inline const arrays at top of component file
```jsx
const items = [
  { title: 'AI arbitrage', desc: 'Automated cross-pair arbitrage strategies.' },
  { title: 'Binary options', desc: 'Options trading with clear payouts.' }
  // ... more items
]
```
Then map in JSX: `{items.map((it) => <div key={it.title}>...)}`

**Styling Pattern**: Tailwind-first with custom utilities in `index.css`
- Background: Radial gradients defined in body styles (not Tailwind config)
  - Dark base: `#0b1020` with layered purple/indigo radial gradients
  - Font: Inter with fallbacks to system UI fonts
- Custom opacity classes: `.bg-white/3`, `.bg-white/2` (defined in CSS, not standard Tailwind)
- Theme colors in `tailwind.config.cjs`: `primary` (#6EE7B7), `accent` (#7C3AED) - but rarely used in practice
- Gradient pattern: `from-purple-600 to-indigo-500` for CTAs and icons
- Spacing: Consistent `py-6 px-6 md:px-12` for horizontal page padding

## Development Workflow

```bash
npm run dev    # Vite dev server (port 5173)
npm run build  # Production build to dist/
npm run preview # Preview built app
```

**No linting, no testing, no pre-commit hooks** - keep it minimal. Build output goes to `dist/` (gitignored).

## Code Conventions

**Components**:
- Default exports only (`export default function ComponentName()`)
- No prop types, no TypeScript - pure JavaScript JSX
- Inline data structures (see `items` array pattern in `Features.jsx`)

**State Management** (when needed for dynamic features):
- Use React's built-in `useState` and `useEffect` hooks - no external libraries
- Pattern for API data fetching:
  ```jsx
  import React, { useState, useEffect } from 'react'
  
  export default function TradingLevels() {
    const [levels, setLevels] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    
    useEffect(() => {
      fetch('/api/trading/levels?feature=ai_arbitrage')
        .then(res => {
          if (!res.ok) throw new Error(`Failed to fetch: ${res.status} ${res.statusText} (${res.url})`)
          return res.json()
        })
        .then(data => {
          setLevels(data.levels)
          setLoading(false)
        })
        .catch(err => {
          setError(err.message)
          setLoading(false)
        })
    }, []) // Empty dependency array - fetch once on mount
    
    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>
    
    return (
      <div>
        {levels.map(level => (
          <LevelCard key={level.level} level={level} />
        ))}
      </div>
    )
  }
  ```
- Keep state local to components - no global state management unless absolutely necessary
- Use destructuring for cleaner state updates: `const [data, setData] = useState(initialValue)`

**Styling Specifics**:
- **Icons**: Inline SVGs with `stroke="currentColor"` or `stroke="white"`, typically 20x20 or 24x24 viewBox
  - Example: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="..." stroke="white" strokeWidth="1.2" /></svg>`
  - Icon containers: `w-10 h-10 rounded-md bg-gradient-to-br from-purple-600 to-indigo-500`
- **Cards**: `bg-white/3` with `rounded-xl` or `rounded-lg`, often with `hover:scale-[1.02] transition`
  - Nested cards use `bg-gradient-to-b from-white/5 to-white/2` for depth
- **Buttons**: 
  - Primary CTA: `bg-gradient-to-r from-purple-600 to-indigo-500 rounded-lg font-semibold shadow-md`
  - Secondary: `border border-white/10 rounded-lg hover:bg-white/3`
  - Always include `type="button"` on non-submit buttons
- **Responsive**: 
  - Mobile-first: Base styles for mobile, `md:` prefix for desktop (768px+)
  - Navigation: `hidden md:flex` pattern for desktop-only nav
  - Grids: `grid-cols-1 md:grid-cols-2` or `sm:grid-cols-2 lg:grid-cols-4`
  - Text: `text-4xl md:text-5xl` for responsive heading sizes

**Accessibility Notes** (currently minimal):
- Semantic HTML: `<header>`, `<nav>`, `<main>`, `<section>`, `<footer>` used correctly
- Button type attributes present (`type="button"`)
- Missing: No ARIA labels on icon-only buttons, no keyboard focus indicators beyond browser defaults
- When adding interactions, include `aria-label` for icon buttons and ensure keyboard nav works

## Common Tasks

**Adding a new feature card**: 
1. Open `Features.jsx`
2. Add object to `items` array: `{ title: 'Feature Name', desc: 'Short description.' }`
3. Icon SVG is shared across all cards - modify inline SVG in the map function if needed

**Creating new sections**: 
1. Create new component file in `src/components/`
2. Follow `Hero.jsx` structure:
   - Wrap in `<section id="unique-id" className="py-12 px-6 md:px-12">`
   - Use `max-w-6xl mx-auto` container for content centering
   - Responsive grid: `grid grid-cols-1 md:grid-cols-2 gap-8`
3. Add gradient accents with positioned divs using `bg-gradient-to-br` and `blur-3xl`
4. Import and add to `App.jsx` in the `<main>` section

**Updating colors**: 
- Modify inline Tailwind classes (common theme: purple-600, indigo-500, gray-300)
- Tailwind config colors (`primary`, `accent`) exist but aren't consistently used - prefer inline classes
- For background gradients, edit body styles in `index.css`

**Adding mock data**: 
- Hardcode directly in component (e.g., `Hero.jsx` shows placeholder "• • • •" for TVL/Volume)
- Keep data intentionally vague - this is a visual mockup, not functional

**Modifying layout spacing**:
- Page padding: `py-6 px-6 md:px-12` (vertical 1.5rem, horizontal 1.5rem mobile / 3rem desktop)
- Section spacing: `py-12` or `py-16` for vertical section padding
- Card padding: `p-4`, `p-5`, or `p-6` depending on card size
- Gaps: `gap-3`, `gap-6`, or `gap-8` for flex/grid spacing

## What NOT to Do

- Don't add state management - components are static displays
- Don't integrate real blockchain APIs - this is a mockup
- Don't add routing - it's a single-page layout with anchor links
- Don't create subdirectories in `components/` - keep flat structure
- Don't add TypeScript or type checking - project is deliberately untyped

## Future Extensions

If adding wallet connect or chain integration: Install `wagmi`, `viem`, or web3 libraries separately - no deps exist yet. Mock data should be replaced, not augmented.

**Backend Integration Requirements**:
- **AI Arbitrage & Binary Options**: Level configurations (profit %, capital, trading duration) must be backend-controllable
  - Design data structures to receive level configs via API
  - Example API response structure:
    ```json
    {
      "feature": "ai_arbitrage",
      "levels": [
        { "level": 1, "profitPercentage": 5.2, "minCapital": 1000, "duration": "24h", "riskLevel": "low" },
        { "level": 2, "profitPercentage": 8.5, "minCapital": 5000, "duration": "12h", "riskLevel": "medium" },
        { "level": 3, "profitPercentage": 12.0, "minCapital": 10000, "duration": "6h", "riskLevel": "high" }
      ]
    }
    ```
  - **Frontend Guidelines**:
    - Create reusable components that accept level data as props (e.g., `<LevelCard level={levelData} />`)
    - Use `.map()` to render dynamic level lists from API data
    - Store level configs in component state or context after fetching
    - Display loading states while fetching level data
    - Example component pattern:
      ```jsx
      const [levels, setLevels] = useState([])
      useEffect(() => {
        fetch('/api/trading/levels?feature=ai_arbitrage')
          .then(res => {
            if (!res.ok) throw new Error('Failed to fetch')
            return res.json()
          })
          .then(data => setLevels(data.levels))
      }, [])
      ```
  - **Backend Design Considerations**:
    - Expose REST endpoints: `GET /api/trading/levels?feature={ai_arbitrage|binary_options}`
    - Support admin endpoints to update level configs: `PUT /api/admin/trading/levels`
    - Store level configurations in database, not hardcoded in backend
    - Return consistent JSON structure across both trading features
    - Include validation for profit percentage ranges, capital minimums, duration formats
