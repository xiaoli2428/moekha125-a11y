# Copilot Instructions for moekha125-a11y

## Project Overview

This is **Onchainweb**, a minimal React + Vite + Tailwind CSS starter project for a DeFi-style homepage with a focus on accessibility (a11y). The project showcases a modern web3/DeFi interface with mock data for balances and markets.

## Tech Stack

- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.4.8
- **Language**: JavaScript (JSX)

## Project Structure

```
moekha125-a11y/
├── src/
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # Application entry point
│   ├── index.css                  # Global styles and Tailwind imports
│   └── components/
│       ├── Header.jsx             # Navigation header
│       ├── Hero.jsx               # Hero section with balances
│       ├── Features.jsx           # Features/markets section
│       └── Footer.jsx             # Footer component
├── index.html.txt                 # HTML entry point
├── package.json.txt               # Dependencies and scripts
├── vite.config.js.txt            # Vite configuration
├── tailwind.config.cjs.txt       # Tailwind configuration
└── postcss.config.cjs.txt        # PostCSS configuration
```

**Note**: Files currently have `.txt` extensions in the repository.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (typically runs on http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Code Style and Conventions

### React Components
- Use functional components with hooks
- Keep components focused and single-purpose
- Place reusable components in `src/components/`

### Styling
- Use Tailwind CSS utility classes for styling
- Follow mobile-first responsive design principles
- Maintain consistent spacing using Tailwind's spacing scale
- Primary color scheme: Dark theme (gray-900 background, white text)

### Accessibility (a11y) Guidelines

**Critical**: This project emphasizes accessibility. Always follow these principles:

1. **Semantic HTML**
   - Use appropriate HTML5 semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`, etc.)
   - Use heading hierarchy correctly (h1, h2, h3, etc.)

2. **ARIA Attributes**
   - Add `aria-label` to interactive elements without visible text
   - Use `aria-describedby` for additional context
   - Include `role` attributes where semantic HTML isn't sufficient

3. **Keyboard Navigation**
   - Ensure all interactive elements are keyboard accessible
   - Maintain logical tab order
   - Add focus styles (visible focus indicators)

4. **Color Contrast**
   - Maintain WCAG AA standard (4.5:1 for normal text, 3:1 for large text)
   - Don't rely solely on color to convey information

5. **Alternative Text**
   - Provide descriptive `alt` text for images
   - Use empty `alt=""` for decorative images

6. **Form Accessibility**
   - Associate labels with form controls
   - Provide clear error messages
   - Include helpful placeholder text

## Best Practices for Tasks

### Ideal Tasks for Copilot
- Add new React components
- Implement new features in the DeFi interface
- Fix bugs in existing components
- Improve accessibility of existing UI elements
- Add responsive design improvements
- Update styling with Tailwind classes
- Refactor components for better maintainability
- Add documentation

### Important Notes
- When making changes, preserve existing accessibility features
- Test components for keyboard navigation
- Ensure color contrast meets WCAG standards
- Keep bundle size minimal (this is a lightweight starter)
- Mock data is used for balances and markets (no real on-chain integration yet)

## Future Integration Possibilities

The project is designed to support future enhancements:
- Real price feeds integration
- On-chain data connections
- Wallet connect functionality (MetaMask, WalletConnect, wagmi)
- Additional DeFi features (lending, staking, etc.)

## Testing Guidelines

Currently, there is no test infrastructure in place. When adding tests:
- Use testing libraries consistent with React ecosystem (e.g., React Testing Library, Vitest)
- Focus on accessibility testing (e.g., check ARIA attributes, keyboard navigation)
- Test component rendering and user interactions
- Consider adding accessibility auditing tools (e.g., axe-core, jest-axe)

## Security Considerations

- Never commit sensitive data (API keys, private keys, credentials)
- Sanitize user inputs if adding form functionality
- Follow secure coding practices for any future wallet integrations
- Be cautious with external dependencies and regularly update them

## Additional Context

This project was created as an accessibility-focused DeFi interface starter. When working on issues:
- Always prioritize accessibility in your solutions
- Keep the minimal nature of the starter intact
- Document any new patterns or components you add
- Consider screen reader compatibility for new features
