import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        unique: true,
        sparse: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    role: {
        type: String,
        required: true,
        enum: ['parent', 'kid', 'teacher', 'admin']
    },
    address: {
        type: String,
        required: false,
    },
    phoneNumber: {
        type: String,
        required: false,
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    }
});

export const User = mongoose.model("User", userSchema);