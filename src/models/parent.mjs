import mongoose from "mongoose";

const parentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
    },
    dateOfBirth: {
        type: Date,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    }
});

export const Parent = mongoose.model("Parent", parentSchema);

