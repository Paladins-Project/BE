import mongoose from "mongoose";

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    linkVideo: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
        enum: ['basic', 'intermediate', 'advanced']
    },
    ageGroup: {
        type: String,
        required: true,
        enum: ['3-5', '6-9', '10-12', '13+']
    },
    testId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Test'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

export const Lesson = mongoose.model("Lesson", lessonSchema);
