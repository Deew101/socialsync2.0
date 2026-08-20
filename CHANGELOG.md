# Changelog — SocialSync Conversion Audit

All notable changes made during the conversion from Lovable export to standard production-ready React + Vite application are documented below.

---

## [1.0.0] - 2026-07-23

### 🗑️ Removed Proprietary Lovable Artifacts
- **Removed `.lovable/` folder**: Deleted `project.json` containing internal Lovable telemetry data.
- **Removed `src/lib/lovable-error-reporting.ts`**: Removed editor telemetry reporting wrapper function `reportLovableError`.
- **Cleaned `src/routes/__root.tsx`**: Stripped out `reportLovableError` import and `useEffect` error boundary reporting hooks.
- **Cleaned `bunfig.toml`**: Removed `minimumReleaseAgeExcludes` entries for proprietary `@lovable.dev/*` packages.
- **Cleaned `AGENTS.md`**: Removed Lovable prompt headers and replaced with standard developer instructions.

### ⚙️ Build System & Dependency Standardizations
- **Package Renaming**: Renamed package from `"tanstack_start_ts"` to `"socialsync101"`.
- **Open-Source Vite Config**: Replaced `@lovable.dev/vite-tanstack-config` in `vite.config.ts` with standard open-source plugins:
  - `@tanstack/router-plugin/vite`
  - `@vitejs/plugin-react`
  - `@tailwindcss/vite`
  - `vite-tsconfig-paths`
- **Removed `@lovable.dev/vite-tanstack-config`**: Removed proprietary package from `devDependencies` in `package.json`.

### ⚡ Supabase Backend Integration
- **Added `@supabase/supabase-js`**: Installed official Supabase JavaScript SDK.
- **Created `src/lib/supabase.ts`**: Created clean Supabase client instance reading directly from environment variables.
- **Created `.env`**: Configured project environment with live Supabase project URL and publishable key provided by user.
- **Created `.env.example`**: Provided standard environment template for setup.
- **Updated `.gitignore`**: Added `.env`, `.env.*`, and `.lovable` to `.gitignore`.

### 🚀 CI/CD & Deployment
- **Created `.github/workflows/deploy.yml`**: Configured GitHub Actions workflow for automated building and deployment to GitHub Pages.

### 📖 Documentation & Repository Setup
- **Created `README.md`**: Added comprehensive documentation including project overview, tech stack, installation, environment setup, local development, and GitHub Pages deployment instructions.
- **Created `CHANGELOG.md`**: Comprehensive audit log of all changes.
