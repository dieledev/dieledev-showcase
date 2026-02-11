# dieledev showcase

A project showcase website built with Next.js 14, TypeScript, and Tailwind CSS. Features a public homepage with search/filter, project detail pages, and a protected admin dashboard for managing projects.

## Quick Start

```bash
# Install dependencies
npm install

# Set your admin token
cp .env.example .env.local
# Edit .env.local and set ADMIN_TOKEN

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site.
Open [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Local JSON storage** (`data/projects.json`)

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage (public)
│   ├── p/[slug]/page.tsx     # Project detail (public)
│   ├── admin/page.tsx        # Admin dashboard (protected)
│   └── api/
│       ├── auth/verify/      # Token verification
│       └── projects/         # CRUD endpoints
├── components/               # React components
└── lib/                      # Types, storage, validation
data/
└── projects.json             # Project data (JSON file)
```

## Authentication

Admin routes are protected by the `ADMIN_TOKEN` environment variable. API calls require the `X-Admin-Token` header.

## API

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/projects` | No | List all projects |
| GET | `/api/projects/[slug]` | No | Get single project |
| POST | `/api/projects` | Yes | Create project |
| PUT | `/api/projects/[slug]` | Yes | Update project |
| DELETE | `/api/projects/[slug]` | Yes | Delete project |
| POST | `/api/auth/verify` | Yes | Verify admin token |
