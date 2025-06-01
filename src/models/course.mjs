import mongoose from "mongoose";

const courseSchema = new mongoose.Schema({
    courseName: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    courseDescription: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    courseLink: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
    courseImage: {
        type: mongoose.Schema.Types.String,
        required: true,
    },
}, {
    timestamps: true
});

export const Course = mongoose.model("Course", courseSchema);