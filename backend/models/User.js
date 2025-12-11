// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: String,
  password: { type: String }, // hashed
  role: { type: String, enum: ['user','admin'], default: 'user' }
}, { timestamps: true });

UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (!this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function(plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

mongoose.model('User', UserSchema);
module.exports = mongoose.model('User');
