import mongoose from "mongoose";

const progressSchema = new mongoose.Schema({
    kidUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test',
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: ['not-started', 'in-progress', 'completed'],
        default: 'not-started'
    },
    score: {
        type: Number,
        default: 0
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    completedAt: {
        type: Date
    }
}, {
    timestamps: true
});

export const Progress = mongoose.model("Progress", progressSchema);
