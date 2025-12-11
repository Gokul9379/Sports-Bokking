// utils/priceCalculator.js
const mongoose = require('mongoose');
const PricingRule = mongoose.model('PricingRule');
const Court = mongoose.model('Court');

function timeToMinutes(t) {
  const [hh, mm] = (t || '00:00').split(':').map(s => parseInt(s, 10));
  return hh * 60 + (mm || 0);
}

async function calculatePricing({ courtId, startTime, endTime }) {
  if (!courtId) throw new Error('courtId required');
  const court = await Court.findById(courtId).lean();
  if (!court) throw new Error('Court not found');

  const base = Number(court.basePrice || 0);

  // simple rules: fetch active rules, then apply ones that match scope/time
  const rules = await PricingRule.find({ active: true }).sort({ priority: -1 }).lean();

  const start = new Date(startTime);
  const startMins = start.getUTCHours() * 60 + start.getUTCMinutes();

  let price = base;
  const adjustments = [];

  for (const r of rules) {
    // scope checks (simple)
    if (r.courtTypes && r.courtTypes.length && !r.courtTypes.includes(court.type)) continue;
    if (r.courtIds && r.courtIds.length && !r.courtIds.map(String).includes(String(courtId))) continue;

    // time window check
    let applies = true;
    if (r.timeWindow && r.timeWindow.start && r.timeWindow.end) {
      const ws = timeToMinutes(r.timeWindow.start);
      const we = timeToMinutes(r.timeWindow.end);
      // handle wrap-around not needed now
      applies = startMins >= ws && startMins < we;
    }

    if (!applies) continue;

    let appliedAmount = 0;
    if (r.kind === 'multiplier') {
      appliedAmount = price * (r.value - 1);
      price = price * r.value;
    } else {
      // fixed add
      appliedAmount = r.value;
      price = price + r.value;
    }

    adjustments.push({
      ruleName: r.name || 'rule',
      kind: r.kind,
      value: r.value,
      appliedAmount
    });
  }

  return {
    basePrice: base,
    priceAfterRules: +price.toFixed(2),
    ruleAdjustments: adjustments
  };
}

module.exports = { calculatePricing };
