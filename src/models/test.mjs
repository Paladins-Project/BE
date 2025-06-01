import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'true-false', 'open-ended']
    },
    options: {
        type: [String],
        default: []
    },
    correctAnswer: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    points: {
        type: Number,
        required: true
    }
});

const testSchema = new mongoose.Schema({
    lessonId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lesson',
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    questions: {
        type: [questionSchema],
        required: true
    },
    totalPoints: {
        type: Number,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const Test = mongoose.model("Test", testSchema);
