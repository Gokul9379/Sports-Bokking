// src/pages/BookingForm.js
import React, { useEffect, useState, useContext } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { formatINR } from "../utils/format";

// Use public image path (no bundler import). Put stadium-placeholder.jpg in public/images/
const placeholder = (process.env.PUBLIC_URL || "") + "/images/stadium-placeholder.jpg";

export default function BookingForm() {
  const { courtId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const incomingSlot = location.state?.slot || null;
  const courtFromState = location.state?.court || null;

  // fixed slot fallback
  const [slotState] = useState(() => {
    if (incomingSlot) return incomingSlot;
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setMinutes(0, 0, 0, 0);
    if (now.getMinutes() > 0 || now.getSeconds() > 0) nextHour.setHours(now.getHours() + 1);
    const end = new Date(nextHour);
    end.setHours(end.getHours() + 1);
    return {
      startISO: nextHour.toISOString(),
      endISO: end.toISOString(),
      label: `${String(nextHour.getHours()).padStart(2, "0")}:00 - ${String(end.getHours()).padStart(2, "0")}:00`,
    };
  });

  const activeSlot = incomingSlot || slotState;

  const [court, setCourt] = useState(courtFromState);
  const [equipments, setEquipments] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState([]); // [{ equipmentId, quantity }]
  const [selectedCoach, setSelectedCoach] = useState("");
  const [pricePreview, setPricePreview] = useState(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const [equipmentFee, setEquipmentFee] = useState(0);
  const [coachFee, setCoachFee] = useState(0);
  const [grandTotal, setGrandTotal] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadCourt() {
      if (!court && courtId) {
        try {
          const res = await api.get(`/courts/${courtId}`);
          if (mounted) setCourt(res.data);
        } catch (e) {
          // ignore
        }
      }
    }
    loadCourt();
    return () => {
      mounted = false;
    };
  }, [court, courtId]);

  useEffect(() => {
    api
      .get("/public/equipment")
      .then((r) => setEquipments(r.data))
      .catch(() => setEquipments([]));
    api
      .get("/public/coaches")
      .then((r) => setCoaches(r.data))
      .catch(() => setCoaches([]));
  }, []);

  useEffect(() => {
    if (!selectedEquipment || !selectedEquipment.length) {
      setEquipmentFee(0);
      return;
    }
    const fee = selectedEquipment.reduce((sum, sel) => {
      const eq = equipments.find((e) => e._id === sel.equipmentId);
      if (!eq) return sum;
      const price = Number(eq.pricePerUnit || eq.price || 0);
      const qty = Number(sel.quantity || 1);
      return sum + price * qty;
    }, 0);
    setEquipmentFee(fee);
  }, [selectedEquipment, equipments]);

  useEffect(() => {
    if (!selectedCoach) {
      setCoachFee(0);
      return;
    }
    const coach = coaches.find((c) => c._id === selectedCoach);
    const rate = Number(coach?.hourlyRate || coach?.rate || 0);
    setCoachFee(rate);
  }, [selectedCoach, coaches]);

  useEffect(() => {
    const base = Number(pricePreview?.priceAfterRules ?? pricePreview?.basePrice ?? court?.basePrice ?? 0);
    const total = base + Number(equipmentFee || 0) + Number(coachFee || 0);
    setGrandTotal(total);
  }, [pricePreview, equipmentFee, coachFee, court]);

  useEffect(() => {
    if (!activeSlot || !courtId) return;
    fetchPrice();
    // eslint-disable-next-line
  }, [activeSlot, selectedEquipment, selectedCoach, courtId]);

  async function fetchPrice() {
    setLoadingPrice(true);
    try {
      const qs = `?courtId=${courtId}&startTime=${encodeURIComponent(activeSlot.startISO)}&endTime=${encodeURIComponent(
        activeSlot.endISO
      )}`;
      const res = await api.get(`/bookings/price${qs}`);
      setPricePreview(res.data);
    } catch (err) {
      setPricePreview({ basePrice: court?.basePrice ?? 0, priceAfterRules: court?.basePrice ?? 0, ruleAdjustments: [] });
    } finally {
      setLoadingPrice(false);
    }
  }

  function toggleEquipment(eq) {
    const exists = selectedEquipment.find((e) => e.equipmentId === eq._id);
    if (exists) {
      setSelectedEquipment(selectedEquipment.filter((e) => e.equipmentId !== eq._id));
    } else {
      setSelectedEquipment([...selectedEquipment, { equipmentId: eq._id, quantity: 1 }]);
    }
  }

  // submitBooking now uses the backend shape: equipmentRequests + coachId
  // inside BookingForm.js - replace existing submitBooking with this
// inside BookingForm.js (replace your existing submitBooking)
async function submitBooking() {
  if (!user) {
    navigate("/login", { state: { from: window.location.pathname } });
    return;
  }

  // Build equipmentRequests array (as backend expects)
  const equipmentArray = Array.isArray(selectedEquipment)
    ? selectedEquipment.map(s => ({ equipmentId: s.equipmentId, quantity: Number(s.quantity || 1) }))
    : [];

  // Only include coachId if one is selected (do NOT send null)
  const coachIdToSend = selectedCoach ? selectedCoach : undefined;

  // Pricing (you may send pricingBreakdown to DB but backend validation doesn't require it;
  // keep it as optional metadata if you want - but backend route validators will ignore unknown fields)
  const baseForPayload = Number(pricePreview?.basePrice ?? court?.basePrice ?? 0);
  const priceAfterRules = Number(pricePreview?.priceAfterRules ?? pricePreview?.basePrice ?? court?.basePrice ?? 0);

  const calcTotal = Number.isFinite(Number(grandTotal))
    ? Number(grandTotal)
    : Number(baseForPayload) + Number(equipmentFee || 0) + Number(coachFee || 0);

  const bookingMeta = {
    pricingBreakdown: {
      basePrice: baseForPayload,
      priceAfterRules,
      ruleAdjustments: Array.isArray(pricePreview?.ruleAdjustments) ? pricePreview.ruleAdjustments : [],
      equipmentFee: Number(equipmentFee || 0),
      coachFee: Number(coachFee || 0),
      total: Number(calcTotal || 0)
    }
  };

  // Build the payload that backend expects
  const payloadForBackend = {
    userId: user.id || user._id,
    courtId,
    startTime: activeSlot.startISO,
    endTime: activeSlot.endISO,
    equipmentRequests: equipmentArray,
    // only include coachId if set
    ...(coachIdToSend ? { coachId: coachIdToSend } : {}),
    // keep pricing meta to store for record (optional)
    ...bookingMeta
  };

  // Navigate to payment page with prepared payload
  navigate("/payment", { state: { bookingPayload: payloadForBackend } });
}



  return (
    <div className="min-h-screen bg-gray-50">
      <div
        style={{
          backgroundImage: `url(${court?.image || placeholder})`,
          filter: "blur(6px)",
          minHeight: 220,
          opacity: 0.25,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="max-w-3xl mx-auto -mt-28 relative z-10 p-6">
        <div className="bg-white rounded shadow p-6">
          <button onClick={() => navigate(-1)} className="text-sm text-sky-600 mb-3">
            ← Back
          </button>
          <h2 className="text-2xl font-semibold">{court?.name || "Court"}</h2>
          <div className="text-sm text-slate-600 mb-3">Slot: {activeSlot?.label}</div>

          <div className="grid gap-4">
            <div className="p-3 rounded border">
              <h3 className="font-semibold mb-2">Equipment</h3>
              <div className="grid grid-cols-2 gap-2">
                {equipments.map((eq) => (
                  <label
                    key={eq._id}
                    className={`p-2 border rounded ${selectedEquipment.find((s) => s.equipmentId === eq._id) ? "bg-gray-100" : ""}`}
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={!!selectedEquipment.find((s) => s.equipmentId === eq._id)}
                      onChange={() => toggleEquipment(eq)}
                    />
                    {eq.name} (+{formatINR(eq.pricePerUnit || eq.price || 0)})
                  </label>
                ))}
              </div>
            </div>

            <div className="p-3 rounded border">
              <h3 className="font-semibold mb-2">Coach (optional)</h3>
              <select className="w-full border p-2" value={selectedCoach} onChange={(e) => setSelectedCoach(e.target.value)}>
                <option value="">No coach</option>
                {coaches.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} - {formatINR(c.hourlyRate || c.rate || 0)}/hr
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 rounded border bg-gray-50">
              <h3 className="font-semibold mb-2">Price preview</h3>
              {loadingPrice ? (
                <div>Loading price...</div>
              ) : pricePreview ? (
                <div>
                  <div>Base: {formatINR(pricePreview.basePrice)}</div>
                  <div>After rules: {formatINR(pricePreview.priceAfterRules ?? pricePreview.basePrice)}</div>
                  {pricePreview.ruleAdjustments?.length > 0 && (
                    <ul className="mt-2 text-sm">
                      {pricePreview.ruleAdjustments.map((r, i) => (
                        <li key={i}>
                          {r.ruleName}: {formatINR(r.appliedAmount)}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div>No preview available</div>
              )}
            </div>

            <div className="p-3 rounded border">
              <h3 className="font-semibold mb-2">Summary</h3>
              <div className="flex justify-between">
                <div>After rules</div>
                <div>{formatINR(pricePreview?.priceAfterRules ?? court?.basePrice)}</div>
              </div>
              <div className="flex justify-between">
                <div>Equipment</div>
                <div>{formatINR(equipmentFee)}</div>
              </div>
              <div className="flex justify-between">
                <div>Coach</div>
                <div>{formatINR(coachFee)}</div>
              </div>
              <div className="mt-2 border-t pt-2 flex justify-between font-bold text-lg">
                <div>Total</div>
                <div>{formatINR(grandTotal)}</div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={submitBooking} disabled={loadingSubmit} className="bg-green-600 text-white px-4 py-2 rounded">
                {loadingSubmit ? "Booking..." : "Confirm Booking"}
              </button>
              <button onClick={() => navigate("/courts")} className="bg-gray-200 px-4 py-2 rounded">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
