const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const customerSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    company: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active',
    },
    notes: [noteSchema],
    // AI-generated fields (cached so we don't re-call the AI on every page load)
    aiSummary: { type: String, default: '' },
    aiFollowUp: { type: String, default: '' },
    aiSentiment: {
      label: { type: String, enum: ['Positive', 'Neutral', 'Negative', ''], default: '' },
      confidence: { type: Number, default: 0 },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Text index to support fast search across name, email, and company
customerSchema.index({ fullName: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Customer', customerSchema);
