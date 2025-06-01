import passport from 'passport';
// import '../strategies/discord-strategy.mjs';
import '../strategies/local-strategy.mjs';

// Passport session setup
// Comment out để tránh xung đột với định nghĩa trong local-strategy.mjs
/*
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
*/

export default passport; 