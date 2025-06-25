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
    required: true,
    index: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
    //ref: 'Teacher, Admin'
  },
  isPublished: {
    type: Boolean,
    default: false,
    index: true
  }
}, {
  timestamps: true
});

// Add compound index for better aggregation performance
courseSchema.index({ _id: 1, isPublished: 1 });

export const Course = mongoose.model("Course", courseSchema); 