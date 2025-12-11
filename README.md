# Onchainweb — Home page (minimal)

This is a minimal React + Vite + Tailwind starter that reproduces a DeFi-style homepage inspired by the screenshot and ddefi3.com. Project name: Onchainweb.

**Live URL:** [www.onchainweb.com](https://www.onchainweb.com/)

## Quick start

1. **Install dependencies:**
    ```bash
    npm install
    ```

2. **Run dev server:**
    ```bash
    npm run dev
    ```
    Opens on `http://localhost:5173`

3. **Build for production:**
    ```bash
    npm run build
    ```
    Output: `dist/` folder

4. **Preview production build:**
    ```bash
    npm run preview
    ```
    Opens on `http://localhost:4173`

## Deployment

After running `npm run build`, the `dist/` folder contains the production-ready static files. Deploy to any static hosting service:

- **Netlify**: Drag & drop `dist/` folder or connect GitHub repo
- **Vercel**: Import project and it auto-detects Vite
- **GitHub Pages**: Use `gh-pages` package or GitHub Actions
- **Other**: Any static hosting (S3, Cloudflare Pages, etc.)

## Public Release

- **Status:** Released for public demo & use
- **Deployment Target:** [Vercel](https://vercel.com/)
- **Current Deployment:** Live and passing checks as of latest [GitHub Actions](https://github.com/xiaoli2428/moekha125-a11y/actions?query=branch%3Amain) build ([Vercel notification workflow run - Success](https://github.com/xiaoli2428/moekha125-a11y/actions/runs/20069889984))

This project is now publicly accessible, with the static production build deployed on Vercel. If you require the current preview or status, see the [latest deployments](https://github.com/xiaoli2428/moekha125-a11y/actions?query=branch%3Amain) tab.

Security & privacy: No private API keys or wallet integrations are present in this release. When adding integrations, use .env and follow best practices.

## Notes

- The UI uses mock data for balances and markets. Real price feeds, on-chain data, and wallet connect (MetaMask, WalletConnect, wagmi) can be integrated on request.
- Project uses ESM ("type": "module" in package.json)
- Vite 6.x for optimal performance and security
- Dependencies should be audited regularly; this repository enables Dependabot (see .github/dependabot.yml). Run `npm audit` locally and review Dependabot PRs to keep dependencies secure.
