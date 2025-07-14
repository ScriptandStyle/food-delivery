const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add an offer title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  code: {
    type: String,
    required: [true, 'Please add an offer code'],
    unique: true,
    trim: true,
    uppercase: true
  },
  discountType: {
    type: String,
    required: [true, 'Please specify discount type'],
    enum: ['percentage', 'fixed', 'free_item']
  },
  discountValue: {
    type: Number,
    required: [true, 'Please add a discount value']
  },
  minOrderValue: {
    type: Number,
    default: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null
  },
  applicableItems: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Food',
    default: []
  },
  isApplicableToAllItems: {
    type: Boolean,
    default: true
  },
  freeItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    default: null
  },
  startDate: {
    type: Date,
    required: [true, 'Please add a start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please add an end date']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageLimit: {
    type: Number,
    default: null
  },
  usageCount: {
    type: Number,
    default: 0
  },
  perUserLimit: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: 'default-offer.jpg'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create index for faster searching
offerSchema.index({ code: 1 });
offerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Offer', offerSchema);
