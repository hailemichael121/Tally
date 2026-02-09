# Tally

Quiet weekly tracking for two people. Mobile-first soft UI with a minimal backend.

## Requirements

- Node.js 18+
- SQLite (bundled with Prisma)

## Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

```bash
cd frontend
npm install
npm run dev
```

## Deployment

- **Frontend**: Vercel, Netlify, or Cloudflare Pages using `npm run build` from `frontend`.
- **Backend**: Render, Fly.io, or Railway with `npm run build` then `npm start` in `backend`.
- **Database**: SQLite for simple hosting, upgrade to Postgres by changing `DATABASE_URL` and provider.

## Notes

- PIN is handled in the client for the shared lock feel.
- API enforces ownership on edit/delete while allowing both users to view entries.

