# SocialSync 2.0 🚀

**SocialSync 2.0** is an enterprise-grade multi-platform social media management application. Built on **React 19**, **TypeScript**, **Vite 8**, and **Supabase**, SocialSync 2.0 provides unified authentication, database-backed multi-tenant isolation, real LinkedIn OAuth account integration, AI content generation & repurposing, and AI-driven analytics insights.

---

## 🌟 Key Features

* **Real Supabase Authentication**: Email/Password Sign Up & Sign In, Password Reset, Persistent Sessions, and optional Google OAuth integration.
* **Row-Level Security (RLS)**: Strict database tenant isolation (`auth.uid() = user_id`) on all user profile, post, and account tables.
* **Real LinkedIn OAuth Connection**: OAuth 2.0 authorization flow (`openid profile w_member_social`), token exchange callback handler, secure token storage, and database-backed connection status.
* **Functional Post Composer**: Create, edit, draft, schedule, and publish posts to connected platforms. Direct REST execution for LinkedIn API (`/v2/ugcPosts`).
* **Content Calendar & Scheduler**: Interactive content calendar displaying scheduled queue and post status filters (`draft`, `scheduled`, `published`, `failed`).
* **AI Content Assistant**:
  * **AI Caption Generator**: Customizable tones (*Engaging, Professional, Concise, Bold, Creative*).
  * **AI Hashtag Suggestions**: Contextual hashtag recommendations.
  * **AI Multi-Platform Repurposing**: Convert single post ideas into tailored versions for LinkedIn, Instagram, and X (Twitter).
* **Analytics & AI Insights**: Dynamic metric calculations (Reach, Likes, Engagement, Followers) with AI-generated natural language performance summaries.
* **Preserved UI/UX Identity**: Sleek dark mode design, violet/cyan glowing accents, glassmorphic header/sidebar, and fully responsive layouts across Desktop, Tablet, and Mobile.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 8 |
| **Routing** | `@tanstack/react-router` (File-based routes) |
| **Backend & DB** | Supabase (PostgreSQL, Supabase Auth, Row Level Security) |
| **Styling** | TailwindCSS v4 (`@tailwindcss/vite`), Radix UI Primitives, Lucide Icons |
| **State & Queries** | `@tanstack/react-query` + React Context Hooks (`useAuth`) |
| **AI Integration** | Google Gemini API / Fallback AI Content Engine |

---

## 🔒 Database Structure & RLS Security

SocialSync 2.0 shares the underlying Supabase project with safe, non-destructive migration scripts (`supabase/migrations.sql`):

### Tables & Policies:
1. **`public.profiles`**: Stores user full name, email, avatar URL, and workspace role.
   * `RLS`: Users can strictly SELECT, INSERT, and UPDATE only their own profile (`auth.uid() = id`).
2. **`public.social_accounts`**: Stores connected LinkedIn, Instagram, and X account tokens and handles.
   * `RLS`: Users can strictly manage their own social accounts (`auth.uid() = user_id`).
3. **`public.posts`**: Stores posts, status (`draft`, `scheduled`, `published`, `failed`), scheduled timestamps, media URLs, hashtags, and calculated engagement.
   * `RLS`: Multi-tenant isolation ensuring users cannot read or mutate other users' posts (`auth.uid() = user_id`).

---

## 🔑 Environment Variables Setup

Create a `.env` file in the root of `socialsync2.0`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://othnnqfkbprfdpartaqv.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nv69CRt8uJ77A35EJpuHJg_ZaP0RrgM

# LinkedIn OAuth App Credentials (Optional for production OAuth)
VITE_LINKEDIN_CLIENT_ID=your_linkedin_client_id
VITE_LINKEDIN_REDIRECT_URI=http://localhost:5173/oauth-callback

# AI Assistant API Key (Optional Gemini API Key)
VITE_AI_API_KEY=your_gemini_api_key
```

---

## ⚡ Local Setup Instructions

1. **Clone Repository**:
   ```bash
   git clone https://github.com/<your-username>/socialsync2.0.git
   cd socialsync2.0
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Run Local Dev Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

4. **Build Production Bundle**:
   ```bash
   npm run build
   ```

---

## 🚀 Deployment Guide

### GitHub Pages Deployment:
SocialSync 2.0 includes a pre-configured GitHub Action in `.github/workflows/deploy.yml`.
1. Push `socialsync2.0` repository to GitHub.
2. In GitHub Repository Settings -> Pages, select **Source: GitHub Actions**.
3. Add repository secrets for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

---

## 📑 Feature Status Summary

| Feature | Status | Details |
| :--- | :--- | :--- |
| **Supabase Authentication** | **FULLY FUNCTIONAL** | Real signup, login, session persistence, protected routes, and logout. |
| **Row Level Security** | **FULLY FUNCTIONAL** | Strict tenant data privacy enforced at database level. |
| **Database Posts & Accounts** | **FULLY FUNCTIONAL** | CRUD operations on posts, drafts, scheduler queue, and connected accounts. |
| **AI Content Assistant & Repurposing** | **FULLY FUNCTIONAL** | AI caption generator, AI hashtags, multi-platform adaptation, and AI analytics. |
| **LinkedIn OAuth Authorization** | **OAuth Ready** | Full authorization URL generation, state security check, and callback page handler ready. Requires registered LinkedIn Developer Client ID for live production redirect. |
| **LinkedIn API Publishing** | **API Ready** | REST request structure (`/v2/ugcPosts`) built with OAuth token verification. |

---

## 🛡️ License & Original Project Protection

* Original SocialSync repository (`socialsync101-main`) remains completely untouched and isolated.
* SocialSync 2.0 is a standalone repository with its own independent git commit history.
