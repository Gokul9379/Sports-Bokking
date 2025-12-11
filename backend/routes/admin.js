// routes/admin.js
const express = require('express');
const mongoose = require('mongoose');
const requireAuth = require('../middleware/auth');

const router = express.Router();
const Court = mongoose.model('Court');

// Example protected admin route
router.post('/courts', requireAuth(), async (req, res) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ error: 'admin required' });
  try {
    const c = new Court(req.body);
    await c.save();
    res.json(c);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
