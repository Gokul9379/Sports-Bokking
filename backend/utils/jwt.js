// utils/jwt.js
const jwt = require('jsonwebtoken');
const secret = process.env.JWT_SECRET || 'dev-secret';

function sign(payload, opts = { expiresIn: '7d' }) {
  return jwt.sign(payload, secret, opts);
}

function verify(token) {
  return jwt.verify(token, secret);
}

module.exports = { sign, verify };
