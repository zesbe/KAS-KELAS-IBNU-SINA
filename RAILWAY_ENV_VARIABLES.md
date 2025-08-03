# Railway Environment Variables Quick Reference

## Backend Service Variables

Copy paste these to Railway Backend Service → Variables tab:

```
NODE_ENV=production
PORT=3001
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_SERVICE_KEY=
DRIPSENDER_API_KEY=
PAKASIR_SLUG=
PAKASIR_BASE_URL=https://pakasir.com
FRONTEND_URL=
CRON_SECRET=
REDIS_HOST=
REDIS_PORT=
REDIS_PASSWORD=
```

## Frontend Service Variables

Copy paste these to Railway Frontend Service → Variables tab:

```
REACT_APP_SUPABASE_URL=
REACT_APP_SUPABASE_ANON_KEY=
REACT_APP_BACKEND_URL=
REACT_APP_DRIPSENDER_API_KEY=
REACT_APP_PAKASIR_SLUG=
REACT_APP_PAKASIR_API_KEY=
REACT_APP_VAPID_PUBLIC_KEY=
```

## Notes:
- Fill in the empty values with your actual API keys
- FRONTEND_URL should be your frontend Railway domain (e.g., https://kas-frontend.up.railway.app)
- REACT_APP_BACKEND_URL should be your backend Railway domain (e.g., https://kas-backend.up.railway.app)
- CRON_SECRET should be a long random string for security
- Redis variables are optional - leave empty if not using Redis