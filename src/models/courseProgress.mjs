import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Test'
  },
  score: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  }
});

const lessonCompletedSchema = new mongoose.Schema({
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson'
  }
});

const courseProgressSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  kidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kid',
    required: true
  },
  status: {
    type: Boolean,
    default: false,
    required: true
  },
  testResults: [testResultSchema],
  lessonCompleted: [lessonCompletedSchema]
}, {
  timestamps: true
});

export const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema); 