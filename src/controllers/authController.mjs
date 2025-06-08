import passport from 'passport';
import { User } from '../models/user.mjs';
import { hashPassword, comparePassword } from '../utils/helpers.mjs';
import { getUserDetailsByRole, sendEmailAsync, receiveEmailAsync, forgotPasswordAsync } from '../services/authService.mjs';

export const login = (req, res, next) => {
    passport.authenticate("local", async (err, user, info) => {
        if (err) {
            console.error('Passport authentication error:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Authentication error occurred' 
            });
        }
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: info?.message || 'Wrong email or password' 
            });
        }
        req.logIn(user, async (err) => {
            if (err) {
                console.error('Login error:', err);
                return res.status(500).json({ 
                    success: false,
                    message: 'Login failed' 
                });
            }            
            try {
                // Get user details with role-specific data
                const userWithDetails = await getUserDetailsByRole(user);                
                return res.status(200).json({
                    success: true,
                    message: 'Login Successfully',
                    user: userWithDetails
                });
            } catch (error) {
                console.error('Error getting user details:', error);
                // Fallback to basic user info without password
                const { password, ...userWithoutPassword } = user.toObject();
                return res.status(200).json({
                    success: true,
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
            return res.status(200).json({
                success: true,
                user: userWithDetails
            });
        } catch (error) {
            console.error('Error getting user details:', error);
            // Fallback to basic user info without password
            const { password, ...userWithoutPassword } = req.user.toObject();
            return res.status(200).json({
                success: true,
                user: userWithoutPassword
            });
        }
    }
    return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
    });
};

export const logout = (req, res) => {
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'Unauthorized' 
        });
    }
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ 
                success: false,
                message: 'Logout failed' 
            });
        }
        res.status(200).json({ 
            success: true,
            message: 'Logout successfully' 
        });
    });
};

export const changePassword = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const { currentPassword, newPassword } = req.body;

        // Validate input
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                success: false,
                message: 'Current password and new password are required' 
            });
        }

        // Find user in database
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(400).json({ 
                success: false,
                message: 'Current password is incorrect' 
            });
        }
        // Validate new password
        // if (newPassword.length < 6) {
        //     return res.status(400).json({ 
        //         success: false,
        //         message: 'New password must be at least 6 characters long' 
        //     });
        // }

        // Hash new password and update
        const hashedNewPassword = hashPassword(newPassword);
        user.password = hashedNewPassword;
        await user.save();

        return res.status(200).json({ 
            success: true,
            message: 'Password changed successfully' 
        });

    } catch (error) {
        console.error('Error changing password:', error);
        return res.status(500).json({ 
            success: false,
            message: 'Internal server error' 
        });
    }
};

/**
 * Send verification email endpoint
 */
export const sendVerificationEmail = async (req, res) => {
    try {
        const { email, forgotPassword = false } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const result = await sendEmailAsync(email, forgotPassword);
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }

    } catch (error) {
        console.error('Error in sendVerificationEmail controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Verify email endpoint
 */
export const verifyEmail = async (req, res) => {
    try {
        const { email, verifyCode } = req.body;

        if (!email || !verifyCode) {
            return res.status(400).json({
                success: false,
                message: 'Email and verification code are required'
            });
        }

        const result = await receiveEmailAsync(email, verifyCode);
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }

    } catch (error) {
        console.error('Error in verifyEmail controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Forgot password endpoint
 */
export const forgotPassword = async (req, res) => {
    try {
        const { email, verifyCode, newPassword } = req.body;

        if (!email || !verifyCode || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Email, verification code and new password are required'
            });
        }

        const result = await forgotPasswordAsync(email, verifyCode, newPassword);
        
        if (result.success) {
            return res.status(200).json(result);
        } else {
            return res.status(400).json(result);
        }

    } catch (error) {
        console.error('Error in forgotPassword controller:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

// export const discordAuth = passport.authenticate("discord");

// export const discordCallback = passport.authenticate("discord", {
//     successRedirect: '/',
//     failureRedirect: '/login'
// }); 