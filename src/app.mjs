import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.mjs';
import cors from 'cors';
import { errorHandler, notFoundHandler, jsonParsingErrorHandler, textPlainJsonHandler } from './middleware/errorHandler.mjs';
dotenv.config();

const app = express();

// Trust proxy when deployed (important for Render/Heroku)
app.set('trust proxy', 1);

// Enhanced CORS configuration
const allowedOrigins = [
  `http://localhost:${process.env.FE_PORT || 3000}`,
  `https://localhost:${process.env.FE_PORT || 3000}`,
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'https://localhost:3000'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
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
  optionsSuccessStatus: 200,
  preflightContinue: false
}));

// Additional CORS headers middleware for better compatibility
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({
    limit: '10mb'
}));

app.use(jsonParsingErrorHandler);

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
            secure: process.env.NODE_ENV === 'production',
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
        },
        store: mongoStore,
    }));

    app.use(passport.initialize());
    app.use(passport.session());
    
    const routes = await import('./routes/index.mjs');
    console.log('Loaded routes.default:', routes.default); // Debug log
    app.use(routes.default);

    app.use(notFoundHandler);
    app.use(errorHandler);
};

export default app;