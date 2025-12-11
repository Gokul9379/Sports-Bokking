// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sports_booking';

app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => { console.log(`${req.method} ${req.path}`); next(); });
}

app.get('/health', (req, res) => res.json({ ok: true }));

async function startServer() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected');

    // Load models
    require('./models/User');
    require('./models/Court');
    require('./models/Equipment');
    require('./models/Coach');
    require('./models/PricingRule');
    require('./models/Booking');

    // Mount routers
    const publicRouter = require('./routes/public');
    const authRouter = require('./routes/auth');
    const bookingsRouter = require('./routes/bookings');
    const adminRouter = require('./routes/admin');

    app.use('/', publicRouter);         // public endpoints: /courts etc
    app.use('/auth', authRouter);       // /auth/login /auth/register
    app.use('/bookings', bookingsRouter);
    app.use('/admin', adminRouter);

    // 404
    app.use((req, res) => res.status(404).json({ error: 'Not found' }));

    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  }
}

startServer();
