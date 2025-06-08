import passport from 'passport';
import { User } from '../models/user.mjs';
import { hashPassword, comparePassword } from '../utils/helpers.mjs';
import { getUserDetailsByRole } from '../services/authService.mjs';

export const login = (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json({ message: info?.message || 'Wrong email or password' });
        }
        req.logIn(user, async (err) => {
            if (err) {
                return next(err);
            }            
            try {
                // Get user details with role-specific data
                const userWithDetails = await getUserDetailsByRole(user);                
                return res.status(200).json({
                    message: 'Login Successfully',
                    user: userWithDetails
                });
            } catch (error) {
                console.error('Error getting user details:', error);
                // Fallback to basic user info without password
                const { password, ...userWithoutPassword } = user.toObject();
                return res.status(200).json({
                    message: 'Login Successfully',
                    user: userWithoutPassword
                });
            }
        });
    })(req, res, next);
};

export const getAuthStatus = async (req, res) => {
    console.log(req.user);
    if (req.user) {
        try {
            // Get user details with role-specific data
            const userWithDetails = await getUserDetailsByRole(req.user);
            return res.status(200).json(userWithDetails);
        } catch (error) {
            console.error('Error getting user details:', error);
            // Fallback to basic user info without password
            const { password, ...userWithoutPassword } = req.user.toObject();
            return res.status(200).json(userWithoutPassword);
        }
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