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

// Middleware to handle JSON sent with text/plain content-type
app.use((req, res, next) => {
    if (req.headers['content-type'] === 'text/plain' && req.method === 'POST') {
        let data = '';
        req.on('data', chunk => {
            data += chunk;
        });
        req.on('end', () => {
            try {
                req.body = JSON.parse(data);
            } catch (error) {
                console.error('Error parsing JSON from text/plain:', error);
                req.body = {};
            }
            next();
        });
    } else {
        next();
    }
});

app.use(cookieParser(process.env.COOKIE_SECRET));

// Session configuration function (to be called after DB connection)
export const configureSession = async (mongoStore) => {
    app.use(session({
        secret: process.env.SESSION_SECRET,
        saveUninitialized: true,
        resave: false,
        cookie: {
            maxAge: 60000 * 60
        },
        store: mongoStore,
    }));

    // Passport middleware (after session)
    app.use(passport.initialize());
    app.use(passport.session());
    
    // Routes (after session and passport setup)
    const routes = await import('./routes/index.mjs');
    app.use(routes.default);
};

export default app; 
