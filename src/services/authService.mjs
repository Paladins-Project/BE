import { Parent } from '../models/parent.mjs';
import { Kid } from '../models/kid.mjs';
import { Teacher } from '../models/teacher.mjs';
import { Admin } from '../models/admin.mjs';

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