// controllers/bookingController.js
const mongoose = require('mongoose');
const Booking = mongoose.model('Booking');
const Equipment = mongoose.model('Equipment');
const Coach = mongoose.model('Coach');
const { calculatePricing } = require('../utils/priceCalculator');

async function isEquipmentAvailable(equipmentRequests = [], startTime, endTime, session = null) {
  if (!equipmentRequests || equipmentRequests.length === 0) return true;

  for (const req of equipmentRequests) {
    const eqId = req.equipmentId;
    const qty = Number(req.quantity || 0);
    if (qty <= 0) continue;

    const objectId = new mongoose.Types.ObjectId(eqId);

    // aggregate booked quantities overlapping
    const agg = await Booking.aggregate([
      { $match: {
          status: 'confirmed',
          startTime: { $lt: new Date(endTime) },
          endTime: { $gt: new Date(startTime) },
          'resources.equipment.equipmentId': objectId
      }},
      { $unwind: '$resources.equipment' },
      { $match: { 'resources.equipment.equipmentId': objectId } },
      { $group: { _id: null, used: { $sum: '$resources.equipment.quantity' } } }
    ]).session ? await Booking.aggregate([/*same*/]) : agg; // avoid session problems

    const used = agg.length ? agg[0].used : 0;
    const equipment = await Equipment.findById(eqId).session(session);
    if (!equipment) throw new Error('Equipment not found: ' + eqId);
    const available = (equipment.totalCount || 0) - used;
    if (available < qty) return false;
  }
  return true;
}

async function createBooking({ userId, courtId, startTime, endTime, equipmentRequests = [], coachId = null }) {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();

    // check court overlap
    const courtTaken = await Booking.findOne({
      court: courtId,
      status: 'confirmed',
      startTime: { $lt: new Date(endTime) },
      endTime: { $gt: new Date(startTime) }
    }).session(session);
    if (courtTaken) throw new Error('Court not available for selected time');

    // coach overlap
    if (coachId) {
      const coachTaken = await Booking.findOne({
        'resources.coach': coachId,
        status: 'confirmed',
        startTime: { $lt: new Date(endTime) },
        endTime: { $gt: new Date(startTime) }
      }).session(session);
      if (coachTaken) throw new Error('Coach not available for selected time');
    }

    // equipment availability check
    const okEquip = await isEquipmentAvailable(equipmentRequests, startTime, endTime, session);
    if (!okEquip) throw new Error('Requested equipment not available');

    // pricing
    const pricing = await calculatePricing({ courtId, startTime, endTime });

    // compute equipment fee
    let equipmentFee = 0;
    for (const req of equipmentRequests) {
      const eq = await Equipment.findById(req.equipmentId).session(session);
      if (!eq) throw new Error('Equipment not found: ' + req.equipmentId);
      equipmentFee += (Number(eq.pricePerUnit || 0) * Number(req.quantity || 0));
    }

    // coach fee
    let coachFee = 0;
    if (coachId) {
      const coach = await Coach.findById(coachId).session(session);
      const durHours = Math.max(1, (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      coachFee = (Number(coach.hourlyRate || 0) * durHours);
    }

    const total = +(Number(pricing.priceAfterRules || pricing.basePrice || 0) + equipmentFee + coachFee).toFixed(2);

    const bookingDoc = new Booking({
      user: userId,
      court: courtId,
      startTime,
      endTime,
      resources: {
        equipment: equipmentRequests,
        coach: coachId
      },
      status: 'confirmed',
      pricingBreakdown: {
        basePrice: pricing.basePrice,
        ruleAdjustments: pricing.ruleAdjustments || [],
        equipmentFee,
        coachFee,
        total
      }
    });

    await bookingDoc.save({ session });

    await session.commitTransaction();
    session.endSession();
    return bookingDoc;
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
}

module.exports = { createBooking };
