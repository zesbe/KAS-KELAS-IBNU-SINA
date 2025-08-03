# Deployment Guide for Kas Kelas 1 Ibnu Sina

## Railway Deployment

### Prerequisites
- Railway account
- Supabase project
- Dripsender API key
- Pakasir payment gateway credentials

### Environment Variables

#### Frontend Service
Make sure to set these environment variables in Railway for the frontend service:

```
REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
REACT_APP_BACKEND_URL=https://kas-kelas-1-ibnu-sina-production.up.railway.app
REACT_APP_DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
REACT_APP_PAKASIR_API_KEY=u8e0CphRmRVuNwDyqnfNoeOwHa6U8pLg
REACT_APP_PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
REACT_APP_VAPID_PUBLIC_KEY=BFAPjbetPNme1WiSVIxcd-GUtq4uq76cAA2fkfHXh3ExCjNd0PYn...
```

#### Backend Service
Set these environment variables in Railway for the backend service:

```
PORT=3001
NODE_ENV=production
SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FRONTEND_URL=https://frontend-production-1c18.up.railway.app
DRIPSENDER_API_KEY=bab6ad18-2ebb-42d7-98a4-2bdc141db4aa
PAKASIR_SLUG=uang-kas-kelas-1-ibnu-sina
PAKASIR_BASE_URL=https://pakasir.zone.id
CRON_SECRET=j5AQ1j2xSahRLnVQAU059DmEl8AGLNdJ
REACT_APP_SUPABASE_URL=https://snrjuiwipgnbcxgggeiq.supabase.co
```

### Deployment Steps

1. **Fork/Clone the Repository**
   ```bash
   git clone <your-repo-url>
   cd kas-kelas-1-ibnu-sina
   ```

2. **Create Two Services in Railway**
   - Create a new project in Railway
   - Add two services: `frontend` and `backend`

3. **Configure Frontend Service**
   - Connect to GitHub repository
   - Set root directory to `/frontend`
   - Add all frontend environment variables
   - Railway will automatically detect and use the configuration

4. **Configure Backend Service**
   - Connect to GitHub repository
   - Set root directory to `/backend`
   - Add all backend environment variables
   - Railway will automatically detect and use the configuration

5. **Deploy**
   - Push to your repository
   - Railway will automatically build and deploy both services

### Troubleshooting

#### Environment Variables Not Loading
If you see "Missing required environment variables" error:
1. Check that all variables are set in Railway dashboard
2. Trigger a new deployment after setting variables
3. Check Railway build logs for any errors

#### Build Failures
1. Check that Node.js version is 18+
2. Ensure all dependencies are properly listed in package.json
3. Check build logs in Railway dashboard

#### CORS Issues
1. Ensure FRONTEND_URL is correctly set in backend
2. Check that backend URL in frontend includes https://

### Local Development

For local development, create `.env` files in both frontend and backend directories:

```bash
# Copy example files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env

# Edit the files with your values
```

Then run:
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm start
```