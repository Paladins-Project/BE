import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { Teacher } from '../models/teacher.mjs';
import { Admin } from '../models/admin.mjs';
import { User } from '../models/user.mjs';
import { Verify } from '../models/verify.mjs';
import { sendVerificationEmail } from '../utils/helpers.mjs';
import { hashPassword } from '../utils/helpers.mjs';

/**
 * Get user details based on their role
 * @param {Object} user - User object from database
 * @returns {Object} User object with role-specific data
 */
export const getUserDetailsByRole = async (user) => {
    const { password, ...userWithoutPassword } = user.toObject();
    
    try {
        let roleSpecificData = null;        
        switch (user.role) {
            case 'parent':
                roleSpecificData = await Parent.findOne({ userId: user._id });
                break;
            case 'kid':
                roleSpecificData = await Kid.findOne({ userId: user._id }).populate('achievements');
                break;
            case 'teacher':
                roleSpecificData = await Teacher.findOne({ userId: user._id }).populate('coursesCreated');
                break;
            case 'admin':
                roleSpecificData = await Admin.findOne({ userId: user._id });
                break;
            default:
                break;
        }        
        return {
            ...userWithoutPassword,
            roleData: roleSpecificData
        };
    } catch (error) {
        console.error('Error fetching role-specific data:', error);
        return userWithoutPassword;
    }
}; 

/**
 * Send verification email with 6-digit code
 * @param {string} email - User email address
 * @param {boolean} forgotPassword - Whether this is for forgot password or email verification
 * @returns {Object} Response object with success status and message
 */
export const sendEmailAsync = async (email, forgotPassword) => {
    try {
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format'
            };
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return {
                success: false,
                message: 'Email not found in system'
            };
        }

        // If not forgot password, check verification status
        if (!forgotPassword && user.isVerified) {
            return {
                success: false,
                message: 'Account is already verified'
            };
        }

        // Generate 6-digit random code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Delete any existing verification codes for this email
        await Verify.deleteMany({ email });

        // Create new verification record with TTL
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + 10); // 10 minutes from now

        const verifyRecord = new Verify({
            email,
            code: verifyCode,
            expiryDate
        });

        await verifyRecord.save();

        // Send verification email
        const emailResult = await sendVerificationEmail(email, verifyCode);
        
        if (emailResult.success) {
            const message = forgotPassword 
                ? 'Password reset code has been sent to your email'
                : 'Verification code has been sent to your email';
            return {
                success: true,
                message
            };
        } else {
            return {
                success: false,
                message: 'Failed to send verification email'
            };
        }

    } catch (error) {
        console.error('Error in sendEmailAsync:', error);
        return {
            success: false,
            message: 'An error occurred while sending verification email'
        };
    }
};

/**
 * Verify email with provided code
 * @param {string} email - User email address
 * @param {string} verifyCode - 6-digit verification code
 * @returns {Object} Response object with success status and message
 */
export const receiveEmailAsync = async (email, verifyCode) => {
    try {
        // Validate input
        if (!email || !verifyCode) {
            return {
                success: false,
                message: 'Email and verification code are required'
            };
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format'
            };
        }
        // Validate code format (6 digits)
        if (!/^\d{6}$/.test(verifyCode)) {
            return {
                success: false,
                message: 'Verification code must be 6 digits'
            };
        }

        // Find verification record
        const verifyRecord = await Verify.findOne({ email, code: verifyCode });
        
        if (!verifyRecord) {
            return {
                success: false,
                message: 'Invalid verification code or code has expired'
            };
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }

        // Update user verification status
        user.isVerified = true;
        await user.save();

        // Delete verification record after successful verification
        await Verify.deleteOne({ _id: verifyRecord._id });

        return {
            success: true,
            message: 'Email verification successful'
        };

    } catch (error) {
        console.error('Error in receiveEmailAsync:', error);
        return {
            success: false,
            message: 'An error occurred while verifying email'
        };
    }
}; 

/**
 * Reset password with verification code
 * @param {string} email - User email address
 * @param {string} verifyCode - 6-digit verification code
 * @param {string} newPassword - New password
 * @returns {Object} Response object with success status and message
 */
export const forgotPasswordAsync = async (email, verifyCode, newPassword) => {
    try {
        // Validate input
        if (!email || !verifyCode || !newPassword) {
            return {
                success: false,
                message: 'Email, verification code and new password are required'
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return {
                success: false,
                message: 'Invalid email format'
            };
        }

        // Validate code format (6 digits)
        if (!/^\d{6}$/.test(verifyCode)) {
            return {
                success: false,
                message: 'Verification code must be 6 digits'
            };
        }

        // Find verification record
        const verifyRecord = await Verify.findOne({ email, code: verifyCode });
        
        if (!verifyRecord) {
            return {
                success: false,
                message: 'Invalid verification code or code has expired'
            };
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return {
                success: false,
                message: 'User not found'
            };
        }
        
        // Hash new password and update
        user.password = hashPassword(newPassword);
        await user.save();

        // Delete verification record after successful password reset
        await Verify.deleteOne({ _id: verifyRecord._id });

        return {
            success: true,
            message: 'Password reset successful'
        };

    } catch (error) {
        console.error('Error in forgotPasswordAsync:', error);
        return {
            success: false,
            message: 'An error occurred while resetting password'
        };
    }
}; 