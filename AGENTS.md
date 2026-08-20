# SocialSync Developer Guidelines

SocialSync is a modern social media management platform built with React, TanStack Router, TanStack Query, Vite, Tailwind CSS v4, and Supabase.

## Tech Stack & Architecture
- **Framework**: React 19 + TanStack Router (File-based routing under `src/routes/`)
- **State & Data**: TanStack Query v5 + `@supabase/supabase-js`
- **Styling**: Tailwind CSS v4 + Radix UI + Lucide Icons + Sonner Toasts
- **Build System**: Vite 8 + TypeScript

## Environment Setup
Configuration is strictly managed via environment variables:
- `VITE_SUPABASE_URL`: Supabase project endpoint
- `VITE_SUPABASE_ANON_KEY`: Supabase publishable anonymous API key

