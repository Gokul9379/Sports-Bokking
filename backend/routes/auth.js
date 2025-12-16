// routes/auth.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { sign } = require('../utils/jwt');

const router = express.Router();

function bad(res, errs) {
  return res.status(400).json({
    errors: errs.array ? errs.array() : errs
  });
}

// ================= REGISTER =================
router.post(
  '/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 4 }).withMessage('Password too short'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return bad(res, errors);

    const { name, email, password, phone } = req.body;

    try {
      const exists = await User.findOne({ email });
      if (exists) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      const user = new User({
        name,
        email,
        password,
        phone
      });

      await user.save();

      return res.status(201).json({
        message: 'User registered successfully'
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

// ================= LOGIN =================
router.post(
  '/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return bad(res, errors);

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid password' });
      }

      const token = sign({
        id: user._id,
        role: user.role
      });

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
