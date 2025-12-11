// models/Booking.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const PricingBreakdownSchema = new Schema({
  basePrice: { type: Number, default: 0 },
  ruleAdjustments: [{
    ruleName: String,
    kind: String,
    value: Number,
    appliedAmount: Number
  }],
  equipmentFee: { type: Number, default: 0 },
  coachFee: { type: Number, default: 0 },
  total: { type: Number, required: true }
}, { _id: false });

const BookingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  court: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  resources: {
    equipment: [{
      equipmentId: { type: Schema.Types.ObjectId, ref: 'Equipment' },
      quantity: { type: Number, default: 0 }
    }],
    coach: { type: Schema.Types.ObjectId, ref: 'Coach' }
  },
  status: { type: String, enum: ['confirmed','cancelled','waitlist'], default: 'confirmed' },
  pricingBreakdown: { type: PricingBreakdownSchema, required: true }
}, { timestamps: true });

BookingSchema.index({ court: 1, startTime: 1, endTime: 1 });
BookingSchema.index({ 'resources.coach': 1, startTime: 1, endTime: 1 });

mongoose.model('Booking', BookingSchema);
module.exports = mongoose.model('Booking');
