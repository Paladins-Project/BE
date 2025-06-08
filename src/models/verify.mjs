import mongoose from 'mongoose';

const verifySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true
  },
  createdDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: {
    type: Date,
    default: Date.now,
    expires: 600 // TTL: 10 phút (600 giây) - MongoDB sẽ tự động tạo index
  }
}, {
  timestamps: false // Không cần timestamps vì đã có createdDate
});

// Không cần tạo index thủ công cho expiryDate vì expires đã tự động tạo TTL index

export const Verify = mongoose.model("Verify", verifySchema); 