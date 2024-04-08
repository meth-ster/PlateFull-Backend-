const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('Current directory:', __dirname);
console.log('Env file path:', path.join(__dirname, '../.env'));
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const foodRoutes = require('./routes/foods');
const mealRoutes = require('./routes/meals');
const childRoutes = require('./routes/children');
const gamificationRoutes = require('./routes/gamification');
const learningRoutes = require('./routes/learning');
const reportingRoutes = require('./routes/reporting');
const uploadRoutes = require('./routes/upload');

const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));

// Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// Additional CORS headers middleware
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Static files
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Set CORS headers explicitly for this endpoint
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Credentials', true);
  
  res.status(200).json({
    success: true,
    message: 'Plateful API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: 'enabled',
    allowedOrigins: process.env.NODE_ENV === 'production' ? 'restricted' : 'all origins allowed',
    currentOrigin: req.headers.origin || 'unknown'
  });
});

// CORS test endpoint
app.get('/api/cors-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS is working properly',
    cors: {
      enabled: true,
      mode: process.env.NODE_ENV === 'production' ? 'restricted' : 'open',
      allowedOrigins: process.env.NODE_ENV === 'production' ? 'restricted' : 'all origins allowed',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
    },
    request: {
      origin: req.headers.origin,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      headers: req.headers
    },
    server: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// Image upload test endpoint (for testing CORS with POST requests)
app.post('/api/cors-image-test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORS POST request successful - image uploads will work',
    cors: {
      enabled: true,
      mode: process.env.NODE_ENV === 'production' ? 'restricted' : 'open',
      allowedOrigins: process.env.NODE_ENV === 'production' ? 'restricted' : 'all origins allowed',
      credentials: true
    },
    request: {
      origin: req.headers.origin,
      method: req.method,
      contentType: req.get('Content-Type'),
      contentLength: req.get('Content-Length'),
      hasBody: !!req.body
    },
    server: {
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/children', childRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/reporting', reportingRoutes);
app.use('/api/upload', uploadRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Plateful API Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});



// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app; 