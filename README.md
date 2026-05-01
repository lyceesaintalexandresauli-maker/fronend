# School Frontend (React)

Responsive React frontend connected to `school-backend`.

## Setup

1. Copy env values:
   - copy `.env.example` to `.env`
2. Install deps:
   - `npm install`
3. Run dev server:
   - `npm run dev`

## API Integration

- Base URL: `VITE_API_BASE_URL`
- Assets URL: `VITE_ASSETS_BASE_URL`
- Old site assets are copied to `public/assets` and loaded with the same paths (`/assets/...`).

The app uses:

- Dynamic navigation from `/api/site/bootstrap`
- Content pages from `/api/content/:page`
- Public modules: events, announcements, staff, contact
- Staff login with 2FA (`/api/auth/login` + `/api/auth/2fa/verify`)
- Admin dashboard CRUD for events, announcements, content, students
