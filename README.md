# Tally

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

Create the two users once (from the UI or API):

```bash
curl -X POST http://localhost:4000/users \
  -H "Content-Type: application/json" \
  -d '[
    {"id":"yihun","name":"Yihun","loveName":"Shebeto","track":"females"},
    {"id":"tekta","name":"Tekta","loveName":"Shefafit","track":"males"}
  ]'
```

## Configuration

- Frontend API base URL: set `VITE_API_URL` in `frontend/.env`.
- Cloudinary upload: set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` in `backend/.env`.

## Deployment

- **Frontend**: Vercel, Netlify, or Cloudflare Pages using `npm run build` from `frontend`.
- **Backend**: Render, Fly.io, or Railway with `npm run build` then `npm start` in `backend`.
- **Database**: SQLite for simple hosting, upgrade to Postgres by changing `DATABASE_URL` and provider.