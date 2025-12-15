# Deployment guide

This project is a static React + Vite site. The production output lives in `dist/` after running `npm run build`. Use the steps below to publish a production build to common hosts.

## 1) Build locally

```bash
npm install
npm run build
```

## 2) Deploy options

### Netlify
1. Install the Netlify CLI if you want to deploy from the terminal:
   ```bash
   npm install -g netlify-cli
   ```
2. The included `netlify.toml` already configures the build command, publish directory, cache headers for `/assets`, and baseline security headers.
3. Deploy:
   ```bash
   netlify deploy --prod
   ```
   When prompted for the publish directory, choose `dist/`.

### Vercel
1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Run the deploy command from the project root. Vercel will detect Vite automatically and use `dist/`:
   ```bash
   vercel --prod
   ```

### GitHub Pages (static export)
1. Build the site locally:
   ```bash
   npm run build
   ```
2. Publish the `dist/` folder with your preferred approach, such as the [`gh-pages`](https://www.npmjs.com/package/gh-pages) package or a GitHub Action that uploads `dist/` to the `gh-pages` branch.

## 3) Post-deploy checks
- Load the deployed URL in an incognito/private window and verify wallet connect UI text and states.
- Confirm security headers are present (CSP, HSTS, X-Frame-Options, etc.). The provided `netlify.toml` sets these when deployed on Netlify.
- Validate the build on production URLs with Lighthouse and basic keyboard navigation.
