import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String
  },
  specializations: [{
    type: String
  }],
  bio: {
    type: String
  },
  coursesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true
});

export const Teacher = mongoose.model("Teacher", teacherSchema);