const { createClient } = require('@supabase/supabase-js');

// Create Supabase client for auth verification
const supabaseAuth = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware to verify JWT token from Supabase
const verifyToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided. Please include Authorization header with Bearer token.' 
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    // Verify token with Supabase
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification failed:', error?.message);
      return res.status(401).json({ 
        success: false,
        error: 'Invalid or expired token' 
      });
    }
    
    // Check if user is active (you can add more checks here)
    if (!user.email_confirmed_at) {
      return res.status(403).json({ 
        success: false,
        error: 'Email not verified' 
      });
    }
    
    // Attach user to request object for use in routes
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role || 'user',
      metadata: user.user_metadata
    };
    
    // Continue to next middleware or route handler
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error during authentication' 
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  // First verify token
  await verifyToken(req, res, () => {
    // Check if user has admin role
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({ 
        success: false,
        error: 'Admin access required' 
      });
    }
  });
};

// Optional: Middleware for optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // No token provided, continue without user
    req.user = null;
    return next();
  }
  
  // If token provided, verify it
  await verifyToken(req, res, next);
};

module.exports = {
  verifyToken,
  requireAdmin,
  optionalAuth
};