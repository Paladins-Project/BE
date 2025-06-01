import mongoose from "mongoose";

const kidSchema = new mongoose.Schema({
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
    points: {
        type: Number,
        default: 0
    },
    avatar: {
        type: String,
        default: ''
    },
    unlockedAvatars: {
        type: [String],
        default: []
    }
});

export const Kid = mongoose.model("Kid", kidSchema);
