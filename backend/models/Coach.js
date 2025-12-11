// models/Coach.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CoachSchema = new Schema({
  name: { type: String, required: true },
  experienceYears: { type: Number, default: 0 },
  hourlyRate: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  notes: String
}, { timestamps: true });

mongoose.model('Coach', CoachSchema);
module.exports = mongoose.model('Coach');
