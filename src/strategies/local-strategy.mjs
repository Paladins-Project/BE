import passport from "passport";
import {Strategy} from "passport-local";
import {User} from '../models/user.mjs';
import { comparePassword } from "../utils/helpers.mjs";

passport.serializeUser((user, done) => {
    console.log('Serialize user');
    console.log(user);
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    console.log('Deserialize user');
    console.log(`deserialize id: ${id}`);
    try{
        const findUser = await User.findById(id);
        if(!findUser) {
            throw new Error('User not found');
        }
        done(null, findUser);
    }catch(err) {
        done(err, null);
    }
});

export default passport.use(new Strategy({usernameField: "email"}, async (email, password, done) => {
    try{
        const findUser = await User.findOne({ email });
        if(!findUser) {
            return done(null, false, { message: 'Wrong email or password' });
        }
        const isPasswordValid = await comparePassword(password, findUser.password);
            if (!isPasswordValid) {
                return done(null, false, { message: 'Wrong email or password' });
            }
        done(null, findUser);
    }catch(error) {
        done(error, null);
    } 
}));