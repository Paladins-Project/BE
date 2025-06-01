import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        //const mongoURI = "mongodb://localhost:27017/ExpressJSBegin";
        const mongoURI = process.env.DBCONNECTIONSTRING;
        
        await mongoose.connect(mongoURI);
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
};

export default connectDB; 