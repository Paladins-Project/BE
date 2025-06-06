import passport from 'passport';
import { User } from '../models/user.mjs';
import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { hashPassword } from '../utils/helpers.mjs';

export const createKid = async (req, res) => {
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