# Project Structure - Kas Kelas 1B

This project is organized into two main directories:

## Directory Structure

```
.
├── frontend/               # React frontend application
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   ├── .env.example       # Environment variables example
│   ├── Dockerfile         # Production Docker config
│   └── Dockerfile.dev     # Development Docker config
│
├── backend/               # Node.js backend application
│   ├── api/               # API endpoints (webhooks, cron jobs)
│   ├── routes/            # Express routes
│   ├── services/          # Business logic services
│   ├── server.js          # Main server file
│   ├── package.json       # Backend dependencies
│   ├── .env.example       # Environment variables example
│   ├── Dockerfile         # Production Docker config
│   └── Dockerfile.dev     # Development Docker config
│
├── scripts/               # Utility scripts
│   └── generate-vapid-keys.js
│
├── docker-compose.yml     # Production Docker Compose
├── docker-compose.dev.yml # Development Docker Compose
│
└── Documentation files:
    ├── SETUP_AUTH.md
    ├── SETUP_KEYS.md
    ├── VERCEL_ENV_SETUP.md
    └── supabase_schema_*.sql

```

## Getting Started

### Prerequisites
- Node.js 18+
- Docker and Docker Compose (optional)
- Redis (for message queue)

### Local Development

1. **Frontend Setup:**
   ```bash
   cd frontend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm start
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your configuration
   npm install
   npm run dev
   ```

### Docker Development

```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
# Edit both .env files with your configuration

# Start all services
docker-compose -f docker-compose.dev.yml up
```

### Production Deployment

```bash
# Build and run production containers
docker-compose up -d
```

## Environment Variables

See `.env.example` files in both frontend and backend directories for required environment variables.

## Key Features

- **Frontend**: React-based UI for managing class funds
- **Backend**: Express server with WhatsApp integration and payment gateway
- **Database**: Supabase (PostgreSQL)
- **Message Queue**: Redis + Bull for async processing
- **Integrations**: Dripsender (WhatsApp), Pakasir (Payment Gateway)