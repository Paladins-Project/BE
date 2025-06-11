import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  questionText: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-blank', 'matching', 'ordering'],
    required: true
  },
  options: [{
    type: String
  }],
  correctAnswer: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  explanation: {
    type: String
  },
  points: {
    type: Number,
    default: 10
  },
  imageUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  videoUrl: {
    type: String
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
    required: true
  },
  description: {
    type: String
  },
  timeLimit: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 0
  },
  attempts: {
    type: Number,
    default: 0
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, {
  timestamps: true
});

export const Test = mongoose.model("Test", testSchema); 