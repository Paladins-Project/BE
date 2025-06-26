import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true // Index for faster search by courseId
  },
  kidId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Kid',
    default: null
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    default: null
  },
  star: {
    type: Number,
    required: true,
    enum: [1, 2, 3, 4, 5]
  },
  content: {
    type: String
  }
}, {
  timestamps: true // This will automatically add createdAt and updatedAt
});

// Custom validation: only kidId OR parentId can be filled, not both
reviewSchema.pre('validate', function(next) {
  const hasKidId = this.kidId != null;
  const hasParentId = this.parentId != null;
  
  if (hasKidId && hasParentId) {
    return next(new Error('Only kidId or parentId can be filled, not both'));
  }
  
  if (!hasKidId && !hasParentId) {
    return next(new Error('Either kidId or parentId must be provided'));
  }
  
  next();
});

export const Review = mongoose.model("Review", reviewSchema); 