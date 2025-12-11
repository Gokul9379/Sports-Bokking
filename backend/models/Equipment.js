// models/Equipment.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const EquipmentSchema = new Schema({
  name: { type: String, required: true },
  sku: String,
  totalCount: { type: Number, default: 0 },
  active: { type: Boolean, default: true },
  pricePerUnit: { type: Number, default: 0 }
}, { timestamps: true });

mongoose.model('Equipment', EquipmentSchema);
module.exports = mongoose.model('Equipment');
