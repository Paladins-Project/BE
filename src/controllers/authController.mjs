import passport from 'passport';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword, comparePassword } from '../utils/helpers.mjs';

export const login = (req, res, next) => {
    console.log('\n🚀 === LOGIN REQUEST START ===');
    console.log('📥 Request body:', {
        email: req.body.email,
        password: req.body.password ? '***' + req.body.password.slice(-2) : 'No password'
    });
    console.log('🌐 Request headers:', {
        'content-type': req.headers['content-type'],
        'user-agent': req.headers['user-agent']
    });
    console.log('🍪 Session ID:', req.sessionID);
    
    passport.authenticate("local", (err, user, info) => {
        console.log('\n📋 === PASSPORT AUTHENTICATE CALLBACK ===');
        console.log('❗ Error:', err ? err.message : 'No error');
        console.log('👤 User:', user ? { id: user._id, email: user.email } : 'No user');
        console.log('ℹ️ Info:', info);
        
        if (err) {
            console.log('❌ Authentication failed with error:', err.message);
            console.log('Error stack:', err.stack);
            return next(err);
        }
        if (!user) {
            console.log('❌ Authentication failed: No user returned');
            return res.status(401).json({ message: 'Account not found!!!' });
        }
        
        console.log('✅ Authentication successful, proceeding to login...');
        req.logIn(user, (err) => {
            if (err) {
                console.log('❌ Login failed:', err.message);
                return next(err);
            }
            console.log('✅ User logged in successfully');
            
            // Create user object without password
            const { password, ...userWithoutPassword } = user.toObject();
            console.log('📤 Sending response with user:', { id: userWithoutPassword._id, email: userWithoutPassword.email });
            
            return res.status(200).json({
                message: 'Login Successfully',
                user: userWithoutPassword
            });
        });
    })(req, res, next);
};

export const getAuthStatus = (req, res) => {
    console.log(req.user);
    if (req.user) {
        // Create user object without password
        const { password, ...userWithoutPassword } = req.user.toObject();
        return res.status(200).json(userWithoutPassword);
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

export const changePassword = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                message: 'Current password and new password are required' 
            });
        }

        // Find user in database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Validate new password
        // if (newPassword.length < 6) {
        //     return res.status(400).json({ 
        //         message: 'New password must be at least 6 characters long' 
        //     });
        // }

        // Hash new password and update
        const hashedNewPassword = hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ 
            message: 'Password changed successfully' 
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ 
            message: 'Internal server error' 
        });
    }
};

// export const discordAuth = passport.authenticate("discord");

// export const discordCallback = passport.authenticate("discord", {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }); 