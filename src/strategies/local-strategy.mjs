import passport from "passport";
import {Strategy} from "passport-local";
import {User} from '../models/user.mjs';
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
    console.log('=== SERIALIZE USER ===');
    console.log('User object:', user);
    console.log('User ID:', user.id);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('=== DESERIALIZE USER ===');
    console.log(`Deserialize ID: ${id}`);
    try{
        const findUser = await User.findById(id);
        if(!findUser) {
            console.log(`❌ User not found with ID: ${id}`);
            throw new Error('User not found');
        }
        console.log('✅ User found during deserialization:', findUser.email);
        done(null, findUser);
    }catch(err) {
        console.log('❌ Deserialize error:', err.message);
        done(err, null);
    }
});

export default passport.use(new Strategy({usernameField: "email"}, async (email, password, done) => {
    console.log('\n=== LOGIN ATTEMPT ===');
    console.log('📧 Email received:', email);
    console.log('🔑 Password received:', password ? '***' + password.slice(-2) : 'No password');
    
    try{
        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();
        console.log('📧 Normalized email:', normalizedEmail);
        
        // Search for user
        console.log('🔍 Searching user in database...');
        const findUser = await User.findOne({ email: normalizedEmail });
        
        if(!findUser) {
            console.log('❌ No user found with email:', normalizedEmail);
            
            // Let's also try to find all users for debugging
            const allUsers = await User.find({}, 'email');
            console.log('📋 All users in database:', allUsers.map(u => u.email));
            
            throw new Error('User not found');
        }
        
        console.log('✅ User found:', {
            id: findUser._id,
            email: findUser.email,
            role: findUser.role,
            isActive: findUser.isActive,
            isVerified: findUser.isVerified
        });
        
        // Check if user is active
        if (!findUser.isActive) {
            console.log('❌ User account is inactive');
            throw new Error('Account is inactive');
        }
        
        // Verify password
        console.log('🔐 Verifying password...');
        const isPasswordValid = await comparePassword(password, findUser.password);
        
        if (!isPasswordValid) {
            console.log('❌ Password verification failed');
            throw new Error('Wrong password');
        }
        
        console.log('✅ Password verified successfully');
        console.log('✅ Authentication successful for user:', findUser.email);
        
        done(null, findUser);
    }catch(error) {
        console.log('❌ Authentication error:', error.message);
        console.log('Error stack:', error.stack);
        done(error, null);
    } 
}));