// routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const { sign } = require('../utils/jwt');

const router = express.Router();

function bad(req, res, errs) {
  return res.status(400).json({ errors: errs.array ? errs.array() : errs });
}

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 4 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return bad(req, res, errors);

    const { name, email, password, phone } = req.body;
    try {
      const exists = await User.findOne({ email });
      if (exists) return res.status(400).json({ error: 'Email already exists' });

      const u = new User({ name, email, password, phone });
      await u.save();

      res.json({ message: 'User registered successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

router.post('/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return bad(req, res, errors);

    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'User not found' });

      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ error: 'Invalid password' });

      const token = sign({ id: user._id, role: user.role });
      res.json({
        message: 'Login successful',
        token,
        user: { id: user._id, name: user.name, role: user.role, email: user.email }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

module.exports = router;
