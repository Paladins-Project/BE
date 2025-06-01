import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
    }
});

export const Admin = mongoose.model("Admin", adminSchema);
