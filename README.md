# Kas Kelas 1B - Expense Tracker Monorepo

Aplikasi manajemen kas kelas dengan fitur pembayaran online, WhatsApp gateway, dan tracking pengeluaran.

## Struktur Project

```
expense-tracker-monorepo/
├── frontend/          # React app (Create React App + TypeScript)
├── backend/           # Node.js API server (Express)
├── scripts/           # Utility scripts
└── supabase_*.sql    # Database schema files
```

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS
- Supabase Client
- React Router
- Lucide Icons
- PWA Support

### Backend
- Node.js + Express
- Supabase Admin SDK
- Bull (Message Queue)
- Node-Cron (Scheduled Tasks)
- Axios

### Database & Services
- Supabase (PostgreSQL)
- Dripsender (WhatsApp API)
- Pakasir (Payment Gateway)

## Setup Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0
- Supabase account
- Dripsender API key
- Pakasir account

### Installation

1. Clone repository
```bash
git clone <repository-url>
cd expense-tracker-monorepo
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables

Frontend:
```bash
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

Backend:
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

4. Setup database
- Create Supabase project
- Run SQL schema files in order:
  - `supabase_schema.sql`
  - `supabase_schema_broadcast.sql`
  - `supabase_schema_expenses.sql`
  - `supabase_schema_recurring.sql`

### Running Development

Start both frontend and backend:
```bash
# Terminal 1 - Frontend
npm run dev:frontend

# Terminal 2 - Backend
npm run dev:backend
```

Or using Docker:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Build & Deployment

### Build Commands

```bash
# Build frontend only
npm run build:frontend

# Build both (backend has no build step)
npm run build
```

### Deployment Options

1. **Railway** (Recommended)
   - Frontend and Backend deployed separately
   - See `railway.toml` and `nixpacks.toml`

2. **Vercel** (Frontend only)
   - See `vercel.json`
   - Backend needs separate hosting

3. **Docker**
   - Production: `docker-compose.yml`
   - Development: `docker-compose.dev.yml`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Features

- 📱 **Student Management** - Add and manage students
- 💰 **Payment Tracking** - Online payments via QRIS
- 📊 **Expense Management** - Track class expenses
- 📱 **WhatsApp Integration** - Automated payment reminders
- 📈 **Reports & Analytics** - Financial reports
- 🔔 **Push Notifications** - PWA support
- 👨‍👩‍👧 **Parent Portal** - Parents can view payment history

## Scripts

- `npm install` - Install all dependencies
- `npm run build` - Build frontend for production
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend dev server
- `npm run start:frontend` - Serve frontend build
- `npm run start:backend` - Start backend server

## Environment Variables

See `.env.example` files in each workspace for required variables.

## License

Private project - All rights reserved