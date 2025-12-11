// models/Court.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const CourtSchema = new Schema({
  name: { type: String, required: true },
  short: String,
  type: String, // "Indoor" / "Outdoor"
  active: { type: Boolean, default: true },
  basePrice: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  dims: String,
  image: String,
  metadata: Schema.Types.Mixed
}, { timestamps: true });

mongoose.model('Court', CourtSchema);
module.exports = mongoose.model('Court');
