require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const rateLimit = require('express-rate-limit');

// Import routes
const webhookRoutes = require('./routes/webhook');
const broadcastRoutes = require('./routes/broadcast');
const cronRoutes = require('./routes/cron');
const healthRoutes = require('./routes/health');
const authTestRoutes = require('./routes/auth-test');

// Import queue processor
require('./services/messageQueue');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // In production, you should specify exact origins
    const allowedOrigins = [
      'http://localhost:3000',
      process.env.FRONTEND_URL,
      'https://kas-kelas-1b-production.up.railway.app',
      'https://kas-kelas-1b.up.railway.app'
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/api/', limiter);

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Make supabase available to routes
app.locals.supabase = supabase;

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/cron', cronRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/auth-test', authTestRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kas Kelas 1B Backend Server',
    version: '1.0.0',
    endpoints: {
      webhook: {
        pakasir: 'POST /api/webhook/pakasir'
      },
      broadcast: {
        send: 'POST /api/broadcast/send',
        status: 'GET /api/broadcast/status/:jobId',
        history: 'GET /api/broadcast/history'
      },
      cron: {
        daily: 'POST /api/cron/daily',
        status: 'GET /api/cron/status'
      },
      health: 'GET /health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});