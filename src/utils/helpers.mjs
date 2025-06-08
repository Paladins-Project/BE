import bcrypt from 'bcrypt';
const saltRounds = 10;
export const hashPassword = (passport) => {
    const salt = bcrypt.genSaltSync(saltRounds);
    console.log(salt);
    return bcrypt.hashSync(passport, salt);
}

export const comparePassword = (plain, hash) =>{
    return bcrypt.compare(plain, hash);
};

