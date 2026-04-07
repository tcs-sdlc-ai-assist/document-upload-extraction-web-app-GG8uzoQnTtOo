# Deployment Guide

This guide covers deploying **Docupex** to [Vercel](https://vercel.com), including configuration, environment variables, custom domains, and troubleshooting.

---

## Prerequisites

- A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
- The Docupex repository pushed to GitHub, GitLab, or Bitbucket
- Node.js 18+ installed locally for testing builds before deployment

---

## Project Build Configuration

Docupex uses Vite as its build tool. The relevant build settings are:

| Setting          | Value              |
| ---------------- | ------------------ |
| Build Command    | `tsc --noEmit && vite build` |
| Output Directory | `dist`             |
| Install Command  | `npm install`      |
| Node Version     | 18.x or 20.x      |

---

## Vercel Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Import Project**
   - Log in to [vercel.com](https://vercel.com)
   - Click **"Add New…"** → **"Project"**
   - Select your Git provider and authorize access if prompted
   - Choose the **docupex** repository

2. **Configure Build Settings**
   - **Framework Preset**: Select `Vite`
   - **Build Command**: `tsc --noEmit && vite build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **Set Environment Variables**
   - Add the required environment variables (see [Environment Variables](#environment-variables) below)

4. **Deploy**
   - Click **"Deploy"**
   - Vercel will install dependencies, run the build, and deploy the application
   - Once complete, you will receive a deployment URL (e.g., `https://docupex-xxxx.vercel.app`)

### Option 2: Deploy via Vercel CLI

1. **Install the Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Log in to Vercel**

   ```bash
   vercel login
   ```

3. **Deploy from the project root**

   ```bash
   vercel
   ```

   Follow the interactive prompts:
   - **Set up and deploy?** → Yes
   - **Which scope?** → Select your account or team
   - **Link to existing project?** → No (for first deployment)
   - **Project name?** → `docupex` (or your preferred name)
   - **Directory?** → `./`
   - **Override settings?** → No (Vercel auto-detects Vite)

4. **Deploy to production**

   ```bash
   vercel --prod
   ```

---

## SPA Configuration (`vercel.json`)

Docupex is a single-page application using React Router for client-side routing. The `vercel.json` file at the project root ensures all routes are handled by `index.html`:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This configuration:
- Catches all incoming requests regardless of the URL path
- Rewrites them to serve `index.html`
- Allows React Router to handle routing on the client side
- Prevents 404 errors when users navigate directly to routes like `/upload` or `/history`

> **Note:** This file is already included in the repository. No additional configuration is needed.

---

## Environment Variables

Docupex uses Vite environment variables prefixed with `VITE_`. These must be configured in Vercel for the application to work correctly.

### Required Variables

| Variable               | Description                          | Default Value | Example   |
| ---------------------- | ------------------------------------ | ------------- | --------- |
| `VITE_APP_NAME`        | Application display name             | `DocuPex`     | `DocuPex` |
| `VITE_MAX_FILE_SIZE_MB`| Maximum upload file size in megabytes | `10`          | `10`      |

### Setting Environment Variables in Vercel

#### Via Dashboard

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_APP_NAME`
   - **Value**: `DocuPex`
   - **Environments**: Select `Production`, `Preview`, and `Development` as needed
4. Click **Save**
5. **Redeploy** the project for changes to take effect

#### Via CLI

```bash
vercel env add VITE_APP_NAME
# Enter the value when prompted: DocuPex
# Select environments: Production, Preview, Development

vercel env add VITE_MAX_FILE_SIZE_MB
# Enter the value when prompted: 10
```

After adding environment variables via CLI, trigger a new deployment:

```bash
vercel --prod
```

### Important Notes on Environment Variables

- Vite embeds environment variables at **build time**, not runtime. After changing a variable, you must **redeploy** for the change to take effect.
- Only variables prefixed with `VITE_` are exposed to the client-side code. Never put secrets in `VITE_` variables.
- The `.env.example` file in the repository documents all available variables for reference.

---

## Custom Domain Configuration

### Adding a Custom Domain

1. Go to your project in the Vercel dashboard
2. Navigate to **Settings** → **Domains**
3. Enter your custom domain (e.g., `docupex.example.com`)
4. Click **Add**

### DNS Configuration

Vercel will provide DNS records to configure with your domain registrar:

**For apex domains** (e.g., `example.com`):
- Type: `A`
- Value: `76.76.21.21`

**For subdomains** (e.g., `docupex.example.com`):
- Type: `CNAME`
- Value: `cname.vercel-dns.com`

### SSL/HTTPS

Vercel automatically provisions and renews SSL certificates for custom domains. No additional configuration is required. HTTPS is enforced by default.

### Verifying Domain Configuration

After updating DNS records, verification may take a few minutes to several hours depending on DNS propagation. You can check the status in the Vercel dashboard under **Settings** → **Domains**.

---

## Preview Deployments

Vercel automatically creates preview deployments for every pull request:

- Each PR gets a unique URL (e.g., `https://docupex-git-feature-branch.vercel.app`)
- Preview deployments use the **Preview** environment variables
- Merging to the main branch triggers a **Production** deployment

This workflow enables testing changes before they go live without any additional configuration.

---

## Troubleshooting

### Build Failures

#### `tsc: command not found`

TypeScript is a dev dependency and should be available during the build. Ensure `typescript` is listed in `devDependencies` in `package.json`. Vercel installs both `dependencies` and `devDependencies` by default.

#### TypeScript compilation errors

Run the build locally before deploying to catch type errors early:

```bash
npm run build
```

Fix any reported type errors, commit, and push to trigger a new deployment.

#### `Module not found` errors

- Verify all import paths match the actual file structure
- Check that path aliases (`@/*`) are configured in both `tsconfig.json` and `vite.config.ts`
- Ensure all dependencies are listed in `package.json`

### Runtime Issues

#### Blank page after deployment

- Open the browser developer console and check for JavaScript errors
- Verify that environment variables are set correctly in Vercel
- Ensure `vercel.json` is present in the repository root with the SPA rewrite rule

#### 404 errors on page refresh

This indicates the SPA rewrite is not working. Verify:

1. `vercel.json` exists in the repository root
2. The rewrite rule is correctly configured:
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. Redeploy after adding or modifying `vercel.json`

#### Environment variables not working

- Confirm variables are prefixed with `VITE_`
- Confirm variables are set for the correct environment (Production/Preview/Development)
- **Redeploy** after changing environment variables — Vite embeds them at build time

#### PDF extraction not working

The PDF.js library (`pdfjs-dist`) requires its worker file to be available. Vite handles this automatically during the build. If PDF extraction fails in production:

- Check the browser console for worker-related errors
- Ensure `pdfjs-dist` is listed in `dependencies` (not `devDependencies`) in `package.json`

### Performance Issues

#### Large bundle size

Analyze the bundle to identify large dependencies:

```bash
npx vite-bundle-visualizer
```

#### Slow initial load

- Verify that Vite's code splitting is working (check the `dist/assets` directory for multiple JS chunks)
- Consider lazy-loading routes if the bundle grows significantly

### Checking Deployment Logs

1. Go to your project in the Vercel dashboard
2. Click on the specific deployment
3. View **Build Logs** for build-time issues
4. View **Runtime Logs** (Functions tab) for server-side issues

For client-side errors, Docupex logs errors to `localStorage` under the key `docupex_error_logs`. Open the browser console and run:

```javascript
JSON.parse(localStorage.getItem('docupex_error_logs'))
```

---

## Redeployment

To trigger a new deployment:

- **Automatic**: Push a commit to the main branch
- **Manual (Dashboard)**: Go to Deployments → click the three-dot menu on the latest deployment → **Redeploy**
- **Manual (CLI)**: Run `vercel --prod`

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html#vercel)
- [React Router Documentation](https://reactrouter.com/)