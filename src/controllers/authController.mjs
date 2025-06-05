import passport from 'passport';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword } from '../utils/helpers.mjs';

export const login = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: 'Wrong username or password' });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            // Create user object without password
            const { password, ...userWithoutPassword } = user.toObject();
            return res.status(200).json({
                message: 'Login Successfully',
                user: userWithoutPassword
            });
        });
    })(req, res, next);
};

export const registerParent = async (req, res) => {
    try {
        const { username, password, fullName, dateOfBirth, gender, address, phoneNumber, email } = req.body;
        
        // Validate required fields
        if (!username || !password || !fullName || !dateOfBirth || !gender || !email || !phoneNumber) {
            return res.status(400).json({
                message: 'Missing required fields!'
            });
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Username or email already exists' 
            });
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Create user
        const userData = {
            username,
            password: hashedPassword,
            email,
            role: 'parent'
        };

        // Add optional fields if provided
        if (address) userData.address = address;
        if (phoneNumber) userData.phoneNumber = phoneNumber;

        const user = new User(userData);

        const savedUser = await user.save();

        // Create parent profile
        const parent = new Parent({
            userId: savedUser._id,
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            gender
        });

        await parent.save();

        res.status(201).json({ 
            message: 'Parent registered successfully',
            userId: savedUser._id,
            username: savedUser.username,
            role: savedUser.role
        });

    } catch (error) {
        console.error('Register parent error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
};

export const registerKid = async (req, res) => {
    try {
        const { username, password, fullName, dateOfBirth, gender, address, phoneNumber, email } = req.body;
        
        // Validate required fields
        if (!username || !password || !fullName || !dateOfBirth || !gender) {
            return res.status(400).json({ 
                message: 'Missing required fields!' 
            });
        }

        // Check if username already exists
        let existingUserQuery = { username };
        
        // If email is provided, also check for email uniqueness
        if (email) {
            existingUserQuery = { 
                $or: [{ username }, { email }] 
            };
        }

        const existingUser = await User.findOne(existingUserQuery);
        
        if (existingUser) {
            return res.status(400).json({ 
                message: email ? 'Username or email already exists' : 'Username already exists'
            });
        }

        // Hash password
        const hashedPassword = hashPassword(password);

        // Create user
        const userData = {
            username,
            password: hashedPassword,
            role: 'kid'
        };

        // Add optional fields if provided
        if (email) userData.email = email;
        if (address) userData.address = address;
        if (phoneNumber) userData.phoneNumber = phoneNumber;

        const user = new User(userData);
        const savedUser = await user.save();

        // Create kid profile
        const kidData = {
            userId: savedUser._id,
            fullName,
            dateOfBirth: new Date(dateOfBirth),
            gender
        };

        const kid = new Kid(kidData);
        await kid.save();

        res.status(201).json({ 
            message: 'Kid registered successfully',
            userId: savedUser._id,
            username: savedUser.username,
            role: savedUser.role
        });

    } catch (error) {
        console.error('Register kid error:', error);
        res.status(500).json({ 
            message: 'Registration failed',
            error: error.message 
        });
    }
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