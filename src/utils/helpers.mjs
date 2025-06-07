import bcrypt from 'bcrypt';
const saltRounds = 10;

export const hashPassword = (passport) => {
    console.log('🔐 Hashing password...');
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log('🧂 Salt generated:', salt);
    const hashedPassword = bcrypt.hashSync(passport, salt);
    console.log('✅ Password hashed successfully');
    return hashedPassword;
}

export const comparePassword = async (plain, hash) => {
    console.log('🔍 === PASSWORD COMPARISON ===');
    console.log('🔑 Plain password length:', plain ? plain.length : 0);
    console.log('🔒 Hash provided:', hash ? 'Yes' : 'No');
    console.log('🔒 Hash length:', hash ? hash.length : 0);
    
    try {
        const result = await bcrypt.compare(plain, hash);
        console.log('🎯 Password comparison result:', result);
        return result;
    } catch (error) {
        console.log('❌ Password comparison error:', error.message);
        return false;
    }
};