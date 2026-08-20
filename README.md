# SocialSync

**SocialSync** is a unified social media management platform for scheduling, publishing, and analyzing posts across Instagram, X (Twitter), and LinkedIn from a single dashboard.

---

## Features

- **Unified Dashboard**: View metrics, upcoming posts, and social channels in real-time.
- **Post Composer**: Craft multi-channel posts with live preview and scheduling.
- **Analytics & History**: Track performance metrics across connected accounts.
- **Media Library**: Manage media assets for scheduled posts.
- **Supabase Integration**: Authentication and database management powered by Supabase.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Backend & Auth**: [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or bun

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Deew101/socialsync101.git
   cd socialsync101
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

   In `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-key
   ```

4. Start the Development Server:
   ```bash
   npm run dev
   ```

5. Build for Production:
   ```bash
   npm run build
   ```

---

## Deployment (GitHub Pages)

This project includes a pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`).

### Setup GitHub Pages:
1. Go to your repository on GitHub: `https://github.com/Deew101/socialsync101`
2. Go to **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
3. Add repository secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Go to **Settings** $\rightarrow$ **Pages**, set **Source** to **GitHub Actions**.
5. Push to `main` branch. The deployment workflow will run automatically.

---

## Supabase Redirect Configuration

In your Supabase Dashboard:
1. Navigate to **Authentication** $\rightarrow$ **URL Configuration**.
2. Set **Site URL** to your GitHub Pages URL:
   `https://deew101.github.io/socialsync101/`
3. Add **Redirect URLs**:
   `https://deew101.github.io/socialsync101/*`
