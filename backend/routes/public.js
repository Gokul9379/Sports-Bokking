// routes/public.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Court = mongoose.model('Court');
const Equipment = mongoose.model('Equipment');
const Coach = mongoose.model('Coach');

// GET /courts
router.get('/courts', async (req, res) => {
  try {
    const courts = await Court.find().lean();
    res.json(courts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /courts/:id
router.get('/courts/:id', async (req, res) => {
  try {
    const court = await Court.findById(req.params.id).lean();
    if (!court) return res.status(404).json({ error: 'Court not found' });
    res.json(court);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// public equipment list
router.get('/public/equipment', async (req, res) => {
  try {
    const equipments = await Equipment.find().lean();
    res.json(equipments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// public coaches list
router.get('/public/coaches', async (req, res) => {
  try {
    const coaches = await Coach.find().lean();
    res.json(coaches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
