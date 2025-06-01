import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        match: [/^[0-9]{10,11}$/, 'Please enter a valid phone number']
    }
});

export const Teacher = mongoose.model("Teacher", teacherSchema);
