import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  videoUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  imageUrl: {
    type: String
  },
  duration: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId
  }
}, {
  timestamps: true
});

export const Lesson = mongoose.model("Lesson", lessonSchema); 