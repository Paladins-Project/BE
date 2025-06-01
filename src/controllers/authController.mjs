import passport from 'passport';

export const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Authentication failed' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.status(200).json(user);
        });
    })(req, res, next);
};

export const getAuthStatus = (req, res) => {
    console.log(req.user);
    if (req.user) {
        return res.status(200).json(req.user);
    }
    return res.status(401).json({ message: 'Unauthorized' });
};

export const logout = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: 'Logout failed' });
        }
        res.status(200).json({ message: 'Logout successfully' });
    });
};

// export const discordAuth = passport.authenticate("discord");

// export const discordCallback = passport.authenticate("discord", {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }); 