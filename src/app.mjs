import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.mjs';
import cors from 'cors';

dotenv.config();
const app = express();

// Enable CORS for all origins
app.use(cors({
  origin: `http://localhost:${process.env.FE_PORT}`,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Basic middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware logging - thêm middleware này sau body parsing để có thể log request body
app.use((req, res, next) => {
    console.log('\n📍 === INCOMING REQUEST ===');
    console.log('🔗 Method:', req.method);
    console.log('🛣️ URL:', req.url);
    console.log('📡 Headers:', {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']?.substring(0, 50) + '...',
        'authorization': req.headers['authorization'] ? 'Present' : 'Not present'
    });
    
    if (req.url.includes('/auth')) {
        console.log('🔐 Auth endpoint accessed');
        console.log('📦 Request body:', req.body);
    }
    
    next();
});
app.use(cookieParser(process.env.COOKIE_SECRET));

// Session configuration function (to be called after DB connection)
export const configureSession = async (mongoStore) => {
    console.log('⚙️ === CONFIGURING SESSION ===');
    app.use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 60000 * 60
        },
        store: mongoStore,
    }));
    console.log('✅ Session configured');

    // Passport middleware (after session)
    app.use(passport.initialize());
    app.use(passport.session());
    console.log('✅ Passport initialized');
    
    // Routes (after session and passport setup)
    const routes = await import('./routes/index.mjs');
    app.use(routes.default);
    console.log('✅ Routes configured');
};

export default app; 
