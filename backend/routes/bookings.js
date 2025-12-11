// routes/bookings.js
const express = require('express');
const { body, validationResult, param } = require('express-validator');
const mongoose = require('mongoose');
const Booking = mongoose.model('Booking');
const { createBooking } = require('../controllers/bookingController');
const { calculatePricing } = require('../utils/priceCalculator');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// GET /bookings/price?courtId=...&startTime=...&endTime=...
router.get('/price', async (req, res) => {
  try {
    const { courtId, startTime, endTime } = req.query;
    if (!courtId || !startTime || !endTime) return res.status(400).json({ error: 'Missing required query params' });
    const price = await calculatePricing({ courtId, startTime, endTime });
    res.json(price);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create booking
router.post('/',
  [
    body('userId').isMongoId(),
    body('courtId').isMongoId(),
    body('startTime').isISO8601(),
    body('endTime').isISO8601(),
    body('equipmentRequests').optional().isArray(),
    body('equipmentRequests.*.equipmentId').optional().isMongoId(),
    body('equipmentRequests.*.quantity').optional().isInt({ min: 0 }),
    body('coachId').optional().isMongoId()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { userId, courtId, startTime, endTime, equipmentRequests = [], coachId = null } = req.body;
      const booking = await createBooking({ userId, courtId, startTime, endTime, equipmentRequests, coachId });
      res.status(201).json({ message: 'Booking created successfully', booking });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);

// GET bookings for user (protected)
router.get('/user/:userId', requireAuth(), [param('userId').isMongoId()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const requester = req.user;
  const { userId } = req.params;
  if (!requester) return res.status(401).json({ error: 'Authentication required' });

  if (requester.role !== 'admin' && requester.id !== userId) return res.status(403).json({ error: 'Access denied' });

  try {
    const bookings = await Booking.find({ user: userId })
      .populate('court')
      .populate('resources.coach')
      .populate('resources.equipment.equipmentId')
      .sort({ startTime: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// cancel booking
router.delete('/:id', requireAuth(), [param('id').isMongoId()], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const requester = req.user;
  if (!requester) return res.status(401).json({ error: 'Authentication required' });

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });

    if (requester.role !== 'admin' && booking.user.toString() !== requester.id) return res.status(403).json({ error: 'Access denied' });

    booking.status = 'cancelled';
    await booking.save();
    res.json({ message: 'Booking cancelled', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
