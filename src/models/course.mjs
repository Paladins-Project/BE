import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  ageGroup: {
    type: String,
    enum: ['5-10', '10-15'],
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  isPremium: {
    type: Boolean,
    default: false,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export const Course = mongoose.model("Course", courseSchema); 