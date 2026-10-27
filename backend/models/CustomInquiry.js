import mongoose from 'mongoose';

const customInquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    type: {
      type: String,
      enum: [
        'engagement-ring',
        'wedding-band',
        'anniversary-gift',
        'necklace',
        'earrings',
        'bracelet',
        'redesign',
        'other',
      ],
      required: true,
    },
    budget: {
      type: String,
      enum: ['under-500', '500-1000', '1000-2500', '2500-5000', '5000-plus', 'open'],
      required: true,
    },
    currency: {
      type: String,
      enum: ['USD', 'NGN', 'GBP'],
      default: 'USD',
    },
    vision: { type: String, required: true, trim: true },
    images: [{ url: String, alt: String }],
    timeline: {
      type: String,
      enum: ['within-6-weeks', 'within-3-months', 'no-rush', 'specific-date'],
      required: true,
    },
    preferredDate: { type: Date, default: null },
    status: {
      type: String,
      enum: ['new', 'in-review', 'quoted', 'won', 'lost'],
      default: 'new',
    },
    adminNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

const CustomInquiry = mongoose.model('CustomInquiry', customInquirySchema);
export default CustomInquiry;