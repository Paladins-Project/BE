console.log('=== app.mjs: Starting imports ===');
import express from 'express';
console.log('=== app.mjs: express imported ===');
import cookieParser from 'cookie-parser';
console.log('=== app.mjs: cookieParser imported ===');
import session from 'express-session';
console.log('=== app.mjs: session imported ===');
import dotenv from 'dotenv';
console.log('=== app.mjs: dotenv imported ===');
import passport from './config/passport.mjs';
console.log('=== app.mjs: passport imported ===');
import cors from 'cors';
console.log('=== app.mjs: cors imported ===');
import { errorHandler, notFoundHandler, jsonParsingErrorHandler, textPlainJsonHandler } from './middleware/errorHandler.mjs';
console.log('=== app.mjs: errorHandler imported ===');
dotenv.config();

console.log('=== Starting app initialization ===');
const app = express();
console.log('=== Express app created ===');

// Debug environment variables (remove in production)
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('FE Port:', process.env.FE_PORT);

// Trust proxy when deployed (important for Render/Heroku)
console.log('=== Setting trust proxy ===');
app.set('trust proxy', 1);
console.log('=== Trust proxy set ===');

// Enhanced CORS configuration
console.log('=== Setting up CORS ===');
const allowedOrigins = [
  `http://localhost:${process.env.FE_PORT || 3000}`,
  `https://localhost:${process.env.FE_PORT || 3000}`,
  process.env.FRONTEND_URL,
  // Add development URLs if needed
  'http://localhost:3000',
  'https://localhost:3000'
].filter(Boolean); // Loại bỏ các giá trị undefined/null

console.log('Allowed CORS origins:', allowedOrigins);

console.log('=== Applying CORS middleware ===');
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers'
  ],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers choke on 204
  preflightContinue: false
}));
console.log('=== CORS middleware applied ===');

// Handle preflight requests explicitly
console.log('=== Setting up preflight CORS ===');
// Remove the problematic line: app.options('*', cors());
// Instead, handle preflight in the main CORS configuration
console.log('=== Preflight CORS handled in main CORS config ===');

// Basic middleware setup
console.log('=== Setting up JSON middleware ===');
app.use(express.json({
    limit: '10mb'
}));
console.log('=== JSON middleware applied ===');

// JSON parsing error handler
console.log('=== Setting up JSON parsing error handler ===');
app.use(jsonParsingErrorHandler);
console.log('=== JSON parsing error handler applied ===');

// Middleware to handle JSON sent with text/plain content-type
console.log('=== Setting up text/plain JSON handler ===');
app.use(textPlainJsonHandler);
console.log('=== Text/plain JSON handler applied ===');

console.log('=== Setting up cookie parser ===');
app.use(cookieParser(process.env.COOKIE_SECRET));
console.log('=== Cookie parser applied ===');

console.log('=== App middleware setup complete ===');

// Session configuration function (to be called after DB connection)
export const configureSession = async (mongoStore) => {
    console.log('=== Configuring session ===');
    
    app.use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 60000 * 60, // 1 hour
            secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
            httpOnly: true, // Prevent XSS attacks
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax' // Allow cross-site cookies in production
        },
        store: mongoStore,
    }));

    // Passport middleware (after session)
    console.log('=== Setting up passport ===');
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Routes (after session and passport setup)
    console.log('=== Loading routes ===');
    try {
        const routes = await import('./routes/index.mjs');
        console.log('Routes module loaded successfully');
        console.log('Routes default type:', typeof routes.default);
        console.log('Routes default:', routes.default);
        
        if (!routes.default) {
            console.error('ERROR: routes.default is undefined or null');
            throw new Error('Routes default is undefined');
        }
        
        console.log('=== Applying routes to app ===');
        app.use(routes.default);
        console.log('Routes applied successfully');
    } catch (error) {
        console.error('ERROR loading routes:', error);
        throw error;
    }

    // Error handling middleware (must be after routes)
    console.log('=== Setting up error handlers ===');
    app.use(notFoundHandler);
    app.use(errorHandler);
    console.log('=== App configuration complete ===');
};

console.log('=== App module setup complete ===');
export default app; 
