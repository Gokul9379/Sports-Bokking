// models/PricingRule.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const TimeWindowSchema = new Schema({
  start: String, // "18:00"
  end: String // "21:00"
}, { _id: false });

const PricingRuleSchema = new Schema({
  name: { type: String, required: true },
  active: { type: Boolean, default: true },
  kind: { type: String, enum: ['multiplier','fixed'], default: 'multiplier' },
  value: { type: Number, required: true },
  scope: { type: String, default: 'all' }, // simple
  courtTypes: [String],
  courtIds: [Schema.Types.ObjectId],
  daysOfWeek: [Number],
  dateList: [Date],
  timeWindow: TimeWindowSchema,
  priority: { type: Number, default: 100 }
}, { timestamps: true });

mongoose.model('PricingRule', PricingRuleSchema);
module.exports = mongoose.model('PricingRule');
