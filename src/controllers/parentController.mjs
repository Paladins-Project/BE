import passport from 'passport';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { hashPassword } from '../utils/helpers.mjs';

export const createParent = async (req, res) => {
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
