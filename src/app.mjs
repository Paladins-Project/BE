import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.mjs';
import cors from 'cors';
import { errorHandler, notFoundHandler, jsonParsingErrorHandler, textPlainJsonHandler } from './middleware/errorHandler.mjs';
dotenv.config();
const app = express();

// Debug environment variables (remove in production)
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('FE Port:', process.env.FE_PORT);

// Trust proxy when deployed (important for Render/Heroku)
app.set('trust proxy', 1);

// Enhanced CORS configuration
const allowedOrigins = [
  `http://localhost:${process.env.FE_PORT || 3000}`,
  `https://localhost:${process.env.FE_PORT || 3000}`,
  process.env.FRONTEND_URL,
  // Add development URLs if needed
  'http://localhost:3000',
  'https://localhost:3000'
].filter(Boolean); // Loại bỏ các giá trị undefined/null

console.log('Allowed CORS origins:', allowedOrigins);

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

// Handle preflight requests explicitly
app.options('*', cors());

// Basic middleware setup
app.use(express.json({
    limit: '10mb'
}));

// JSON parsing error handler
app.use(jsonParsingErrorHandler);

// Middleware to handle JSON sent with text/plain content-type
app.use(textPlainJsonHandler);

app.use(cookieParser(process.env.COOKIE_SECRET));

// Session configuration function (to be called after DB connection)
export const configureSession = async (mongoStore) => {
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
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Routes (after session and passport setup)
    const routes = await import('./routes/index.mjs');
    app.use(routes.default);

    // Error handling middleware (must be after routes)
    app.use(notFoundHandler);
    app.use(errorHandler);
};

export default app; 
