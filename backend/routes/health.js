const express = require('express');
const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const supabase = req.app.locals.supabase;
    
    // Test database connection
    const { error } = await supabase
      .from('students')
      .select('count')
      .limit(1);
    
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: error ? 'DOWN' : 'UP',
        redis: 'N/A' // Will be updated when Redis is configured
      }
    };
    
    // Check Redis if configured
    if (process.env.REDIS_HOST) {
      try {
        const { messageQueue } = require('../services/messageQueue');
        if (messageQueue && await messageQueue.isReady()) {
          health.services.redis = 'UP';
        } else {
          health.services.redis = 'DOWN';
        }
      } catch (err) {
        health.services.redis = 'DOWN';
      }
    }
    
    const statusCode = health.services.database === 'UP' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

module.exports = router;