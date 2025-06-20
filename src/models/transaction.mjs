import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  orderCode: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    default: 'Premium subscription upgrade'
  },
  paymentMethod: {
    type: String,
    default: 'PayOS'
  },
  status: {
    type: String,
    enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'],
    default: 'PENDING',
    index: true
  }
}, {
  timestamps: true
});

transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ orderCode: 1, status: 1 });

export const Transaction = mongoose.model("Transaction", transactionSchema); 