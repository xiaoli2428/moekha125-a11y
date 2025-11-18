# Copilot Instructions for Onchainweb

## Purpose
This repository contains a React-based DeFi-style homepage for "Onchainweb" with a focus on accessibility (a11y). The project aims to provide an inclusive, accessible user interface for blockchain and DeFi interactions.

## Technology Stack
- **Framework**: React 18.2.0
- **Build Tool**: Vite 5.0.0
- **Styling**: Tailwind CSS 3.4.8
- **Language**: JavaScript (JSX)
- **Package Manager**: npm

## Build & Test Commands
- **Install dependencies**: `npm install`
- **Start dev server**: `npm run dev`
- **Build for production**: `npm run build`
- **Preview production build**: `npm run preview`

## Project Structure
- `src/` - Source files for React components
- `src/components/` - Reusable React components (Header, Footer, Hero, Features)
- `index.html` - Main HTML entry point
- Configuration files: `vite.config.js`, `tailwind.config.cjs`, `postcss.config.cjs`

## Coding Standards
- Use functional React components with hooks
- Follow JSX best practices
- Use Tailwind utility classes for styling
- Keep components modular and reusable
- Ensure all interactive elements are keyboard accessible
- Use semantic HTML elements

## Accessibility (a11y) Requirements
**This is a critical aspect of this project. All contributions must prioritize accessibility.**

- Use semantic HTML elements (`<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, etc.)
- Ensure all images have descriptive `alt` text
- Maintain proper heading hierarchy (h1, h2, h3, etc.)
- Provide ARIA labels for interactive elements when semantic HTML is insufficient
- Ensure keyboard navigation works for all interactive elements
- Use sufficient color contrast ratios (WCAG AA minimum: 4.5:1 for text)
- Add focus indicators for keyboard navigation
- Ensure form inputs have associated labels
- Make sure all functionality is available via keyboard
- Test with screen readers when possible

## Security Considerations
- Do not commit sensitive data (API keys, private keys, credentials)
- Validate all user inputs
- Use environment variables for configuration
- Be cautious with external dependencies
- Do not handle authentication code without explicit review

## DeFi Context
- The UI uses mock data for balances and markets currently
- Future integration may include wallet connections (MetaMask, WalletConnect)
- On-chain data and real price feeds may be added later
- Keep the design modular to accommodate future blockchain integrations

## Code Review Guidelines
- Verify accessibility compliance before submitting PRs
- Test keyboard navigation
- Check color contrast
- Ensure responsive design works across viewports
- Validate that changes don't break existing functionality
- Update documentation for any new components or features

## Persona
Assume users include both crypto-native users and newcomers to DeFi. Prioritize clarity, accessibility, and user-friendly interfaces over complex jargon or advanced features without explanation.
