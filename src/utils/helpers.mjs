import bcrypt from 'bcrypt';
import dotenv from "dotenv";
import sgMail from '@sendgrid/mail';
import mongoose from 'mongoose';
import { Transaction } from '../models/transaction.mjs';
import { Admin } from '../models/admin.mjs';
import { Teacher } from '../models/teacher.mjs';
import { Kid } from '../models/kid.mjs';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { Lesson } from '../models/lesson.mjs';
import { Test } from '../models/test.mjs';
import { validateObjectIdParam } from './validators.mjs';

dotenv.config();

const saltRounds = 10;
export const hashPassword = (passport) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    return bcrypt.hashSync(passport, salt);
}

export const comparePassword = (plain, hash) =>{
    return bcrypt.compare(plain, hash);
};

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, text, html) => {
    try {
        const msg = {
            to: to,
            from: {
                name: 'DailyMate',
                email: process.env.FROM_EMAIL
            },
            subject: subject,
            text: text,
            html: html,
        };

        await sgMail.send(msg);
        console.log('Email sent successfully to:', to);
        return { success: true, message: 'Email sent successfully' };
    } catch (error) {
        console.error('Error sending email:', error);
        if (error.response) {
            console.error('SendGrid error response:', error.response.body);
        }
        return { success: false, message: 'Failed to send email', error: error.message };
    }
};

export const sendVerificationEmail = async (email, verificationCode) => {
    const subject = 'Xác thực tài khoản DailyMate';
    const text = `Mã xác thực của bạn là: ${verificationCode}`;
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Xác thực tài khoản DailyMate</h2>
            <p>Chào bạn,</p>
            <p>Mã xác thực của bạn là:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; color: #333; margin: 20px 0;">
                ${verificationCode}
            </div>
            <p>Mã này sẽ hết hạn trong 10 phút.</p>
            <p>Trân trọng,<br>Đội ngũ DailyMate</p>
        </div>
    `;
    
    return await sendEmail(email, subject, text, html);
};

/**
 * Generate unique 6-digit order code by checking database
 * @returns {Promise<number>} Unique 6-digit order code
 */
export const generateUniqueOrderCode = async () => {
    let orderCode;
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
        orderCode = Math.floor(Math.random() * 900000) + 100000;        
        const existingTransaction = await Transaction.findOne({ orderCode });        
        if (!existingTransaction) {
            isUnique = true;
        } else {
            attempts++;
            // Add small delay to prevent rapid consecutive duplicates
            await new Promise(resolve => setTimeout(resolve, 10));
        }
    }
    if (!isUnique) {
        throw new Error('Failed to generate unique order code after maximum attempts');
    }
    return orderCode;
};

/**
 * Validate createdBy field by checking if the ID exists in Admin or Teacher collections
 * @param {string} createdBy - The ObjectId to validate
 * @returns {Promise<Object>} Validation result with isValid boolean and optional message
 */
export const validateCreatedBy = async (createdBy) => {
    if (!createdBy) {
        return { isValid: true }; // Optional field
    }
    // Check if createdBy is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(createdBy)) {
        return { 
            isValid: false, 
            message: 'Invalid createdBy format' 
        };
    }
    // Check if the ID exists in Admin or Teacher collections
    const [adminExists, teacherExists] = await Promise.all([
        Admin.findById(createdBy),
        Teacher.findById(createdBy)
    ]);
    if (!adminExists && !teacherExists) {
        return { 
            isValid: false, 
            message: 'Account not found. (Role must be teacher/admin)' 
        };
    }
    return { isValid: true };
};

/**
 * Check subscription status by kid ID for premium features
 * @param {string} kidId - The kid's ObjectId
 * @returns {Promise<Object>} Validation result with success, status, and message
 */
export const checkSubcriptionByKidId = async (kidId) => {
    try {
        // Validate kidId format
        const kidIdValidation = validateObjectIdParam(kidId, 'kid ID');
        if (!kidIdValidation.success) {
            return kidIdValidation;
        }
        // Find kid by ID
        const kid = await Kid.findById(kidId);
        if (!kid) {
            return {
                success: false,
                status: 404,
                message: 'Kid not found'
            };
        }
        // Get userId from kid
        const userId = kid.userId;
        // Find user with userId
        const user = await User.findById(userId);
        if (!user) {
            return {
                success: false,
                status: 404,
                message: 'User not found'
            };
        }
        // Check if user role is parent
        if (user.role !== 'parent') {
            return {
                success: false,
                status: 403,
                message: 'This course requires a parent account. Please contact your parent.'
            };
        }
        // Find parent with userId
        const parent = await Parent.findOne({ userId: userId });
        if (!parent) {
            return {
                success: false,
                status: 404,
                message: 'Parent profile not found'
            };
        }
        // Check subscription expiry
        const today = new Date();
        if (!parent.subscriptionExpiry || parent.subscriptionExpiry <= today) {
            return {
                success: false,
                status: 403,
                message: 'This course is only for premium members. Please upgrade your subscription.'
            };
        }
        // Valid premium subscription
        return {
            success: true
        };
    } catch (error) {
        console.error('Check subscription service error:', error);
        return {
            success: false,
            status: 500,
            message: 'Subscription check failed',
            error: error.message
        };
    }
};

export const checkLessonExist = async (lessonId) => {
    try {
        // Validate lessonId format
        const idValidation = validateObjectIdParam(lessonId, 'lesson ID');
        if (!idValidation.success) {
            return {
                success: false,
                message: idValidation.message
            };
        }
        // Check if lesson exists
        const lesson = await Lesson.findById(lessonId);
        if (!lesson) {
            return {
                success: false,
                message: 'Lesson not found'
            };
        }
        return { success: true };
    } catch (error) {
        console.error('Check lesson exist error:', error);
        return {
            success: false,
            message: 'Failed to check lesson existence',
            error: error.message
        };
    }
};

export const checkTestExist = async (testId) => {
    try {
        // Validate testId format
        const idValidation = validateObjectIdParam(testId, 'test ID');
        if (!idValidation.success) {
            return {
                success: false,
                message: idValidation.message
            };
        }
        // Check if test exists
        const test = await Test.findById(testId);
        if (!test) {
            return {
                success: false,
                message: 'Test not found'
            };
        }
        return { success: true };
    } catch (error) {
        console.error('Check test exist error:', error);
        return {
            success: false,
            message: 'Failed to check test existence',
            error: error.message
        };
    }
};

