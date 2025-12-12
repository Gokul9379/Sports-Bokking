// src/pages/Payment.js
import React, { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api"; // if you have an axios instance set up
import { AuthContext } from "../context/AuthContext";
import { formatINR } from "../utils/format";

export default function PaymentPage() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Expect booking payload passed via navigate("/payment", { state: { bookingPayload } })
  const bookingPayload = location.state?.bookingPayload;
  const total = bookingPayload?.pricingBreakdown?.total ?? 0;

  // UI state
  const [method, setMethod] = useState("card"); // 'card' | 'upi' | 'netbank' | 'wallet'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Card fields
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // UPI fields
  const [vpa, setVpa] = useState("");
  const [txnId, setTxnId] = useState(""); // for manual confirmation simulation

  // Netbank/wallet placeholder
  const [bank, setBank] = useState("");
  const [wallet, setWallet] = useState("");

  useEffect(() => {
    if (!bookingPayload) {
      // If no payload, redirect back to courts (safeguard)
      navigate("/courts", { replace: true });
      return;
    }
    // try to pre-populate some fields if user exists
    if (user?.name) setCardName(user.name);
  }, [bookingPayload, user, navigate]);

  function resetErrors() {
    setError("");
  }

  function validateCard() {
    if (!cardName || !cardNumber || !expiry || !cvv) {
      setError("Please fill all card fields.");
      return false;
    }
    if (!/^\d{12,19}$/.test(cardNumber.replace(/\s+/g, ""))) {
      setError("Card number looks invalid (mock validation).");
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError("Expiry should be in MM/YY format.");
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      setError("CVV looks invalid.");
      return false;
    }
    return true;
  }

  function validateUPI() {
    if (!vpa) {
      setError("Enter your UPI VPA (e.g. yourname@bank).");
      return false;
    }
    // fixed regex: allow letters/digits/dot/hyphen/underscore before @ and letters after
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(vpa)) {
      setError("UPI VPA looks invalid (mock validation).");
      return false;
    }
    return true;
  }

  /*
    Use either your api instance (if imported) or fallback to axios instance.
    If api is a pre-configured axios instance with baseURL + auth interceptors, preferred.
  */
  const http = (function () {
    if (api && typeof api.post === "function") {
      return api;
    }
    // fallback axios instance with baseURL from env
    return axios.create({ baseURL: process.env.REACT_APP_API_BASE || "" });
  })();

  /**
   * Create booking on server.
   * - paymentMeta is an object like { method: 'card', paid: true, details: {...} }
   * - navigates to /my-bookings on success
   */
  async function createBookingOnServer(paymentMeta = {}) {
    if (!bookingPayload) {
      setError("Missing booking data.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      // Prepare the request body - adapt shape to your backend if needed
      const body = {
        courtId: bookingPayload.court?._id || bookingPayload.courtId || bookingPayload.court,
        startTime: bookingPayload.startTime,
        endTime: bookingPayload.endTime,
        pricingBreakdown: bookingPayload.pricingBreakdown || {},
        // include user id if needed by server; many servers derive from token
        userId: bookingPayload.userId || user?.id || user?._id || null,
        payment: paymentMeta,
        meta: bookingPayload.meta || {}
      };

      // endpoint - change if your backend uses /api/bookings or similar
      const endpoint = "/bookings";

      // Prepare headers. If your imported `api` instance already handles auth, you don't need to add Authorization header.
      const headers = {
        "Content-Type": "application/json"
      };
      if (!api || typeof api.post !== "function") {
        // If using fallback axios (not the api instance) add bearer if available
        if (user?.token) {
          headers.Authorization = `Bearer ${user.token}`;
        }
      }
      // execute request
      const res = await http.post(endpoint, body, { headers });

      // Success statuses often 201 or 200
      if (res.status === 201 || res.status === 200) {
        setLoading(false);

        // Optionally: you can pass newly created booking to MyBookings via state
        // navigate('/my-bookings', { replace: true, state: { createdBooking: res.data } });

        // Or just navigate and let MyBookings fetch fresh data
        navigate("/my-bookings", { replace: true });
        return;
      }

      // unexpected response
      setLoading(false);
      setError("Booking failed: unexpected server response.");
      console.error("Unexpected booking response:", res);
    } catch (err) {
      setLoading(false);
      const body = err?.response?.data;
      const msg = body?.error || body?.message || err?.message || "Booking failed";
      setError(msg);
      console.error("Payment -> booking error:", err);
    }
  }

  // Simulate card payment
  async function handlePayCard() {
    resetErrors();
    if (!validateCard()) return;
    // Simulate tokenization delay
    setLoading(true);
    setTimeout(async () => {
      await createBookingOnServer({
        method: "card",
        paid: true,
        details: { cardName, last4: cardNumber.slice(-4) }
      });
    }, 900); // 0.9s simulated network
  }

  // Simulate UPI flow: show QR instruction + "I paid" confirm
  async function handlePayUPI() {
    resetErrors();
    if (!validateUPI()) return;
    // We'll rely on confirmUPIPayment for actual booking creation (user clicks "I have paid").
    setLoading(false);
  }

  // Called when user confirms they completed UPI payment (manual simulation)
  async function confirmUPIPayment() {
    resetErrors();
    // allow empty txnId; not strict here
    await createBookingOnServer({
      method: "upi",
      paid: true,
      details: { vpa, txnId }
    });
  }

  // Skip payment (book now without payment)
  async function handleSkip() {
    await createBookingOnServer({ method: "skipped", paid: false });
  }

  // Netbank/wallet placeholder handlers
  async function handleBankOrWalletPay() {
    setLoading(true);
    setTimeout(async () => {
      await createBookingOnServer({
        method: bank ? "netbank" : wallet ? "wallet" : "netbank",
        paid: true,
        details: { bank, wallet }
      });
    }, 800);
  }

  // --- Render helpers
  function renderMethodUI() {
    switch (method) {
      case "card":
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm text-slate-700">Name on card</span>
              <input value={cardName} onChange={e => setCardName(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Card holder name" />
            </label>

            <label className="block mb-3">
              <span className="text-sm text-slate-700">Card number</span>
              <input value={cardNumber} onChange={e => setCardNumber(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="1234 5678 9012 3456" />
            </label>

            <div className="flex gap-2">
              <label className="flex-1">
                <span className="text-sm text-slate-700">Expiry (MM/YY)</span>
                <input value={expiry} onChange={e => setExpiry(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="09/28" />
              </label>
              <label style={{ width: 120 }}>
                <span className="text-sm text-slate-700">CVV</span>
                <input value={cvv} onChange={e => setCvv(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="123" />
              </label>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={handlePayCard} disabled={loading} className="flex-1 bg-emerald-600 text-white rounded py-2">
                {loading ? "Processing..." : `Pay ${formatINR(total)} with Card`}
              </button>
              <button onClick={handleSkip} disabled={loading} className="flex-1 bg-gray-200 text-gray-800 rounded py-2">
                  Skip & Book
              </button>
            </div>
          </>
        );
      case "upi":
        return (
          <>
            <div className="mb-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 border rounded bg-white/80 text-center">
                  <div className="text-xs text-slate-600 mb-2">Scan QR (demo)</div>
                  <div className="w-36 h-36 bg-gray-200 inline-block rounded-md flex items-center justify-center">QR</div>
                </div>
                <div className="p-3">
                  <label className="block mb-2">
                    <span className="text-sm text-slate-700">UPI VPA</span>
                    <input value={vpa} onChange={e => setVpa(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="yourname@bank" />
                  </label>

                  <div className="mt-3">
                    <button onClick={() => handlePayUPI()} className="w-full bg-sky-600 text-white rounded py-2">Start UPI Payment (open app)</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <div className="text-xs text-slate-600">After you complete payment in your UPI app, enter transaction ID (optional) and click confirm.</div>
              <label className="block mt-2">
                <input value={txnId} onChange={e => setTxnId(e.target.value)} className="mt-1 w-full border rounded px-3 py-2" placeholder="Transaction ID (optional)" />
              </label>
              <div className="mt-3 flex gap-2">
                <button onClick={confirmUPIPayment} disabled={loading} className="flex-1 bg-emerald-600 text-white rounded py-2">
                  {loading ? "Confirming..." : `I have paid — Confirm`}
                </button>
                <button onClick={handleSkip} disabled={loading} className="flex-1 bg-gray-200 text-gray-800 rounded py-2">
                  Skip & Book
                </button>
              </div>
            </div>
          </>
        );

      case "netbank":
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm text-slate-700">Choose bank</span>
              <select value={bank} onChange={e => setBank(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                <option value="">Select a bank</option>
                <option value="HDFC">HDFC</option>
                <option value="SBI">SBI</option>
                <option value="ICICI">ICICI</option>
                <option value="AXIS">Axis</option>
              </select>
            </label>
            <div className="mt-3 flex gap-2">
              <button onClick={handleBankOrWalletPay} disabled={loading} className="flex-1 bg-emerald-600 text-white rounded py-2">
                {loading ? "Processing..." : `Pay ${formatINR(total)} via Netbanking`}
              </button>
              <button onClick={handleSkip} disabled={loading} className="flex-1 bg-gray-200 text-gray-800 rounded py-2">Skip & Book</button>
            </div>
          </>
        );

      case "wallet":
        return (
          <>
            <label className="block mb-3">
              <span className="text-sm text-slate-700">Choose wallet</span>
              <select value={wallet} onChange={e => setWallet(e.target.value)} className="mt-1 w-full border rounded px-3 py-2">
                <option value="">Select a wallet</option>
                <option value="PhonePe">PhonePe</option>
                <option value="Paytm">Paytm</option>
                <option value="GooglePay">Google Pay</option>
              </select>
            </label>
            <div className="mt-3 flex gap-2">
              <button onClick={handleBankOrWalletPay} disabled={loading} className="flex-1 bg-emerald-600 text-white rounded py-2">
                {loading ? "Processing..." : `Pay ${formatINR(total)} via Wallet`}
              </button>
              <button onClick={handleSkip} disabled={loading} className="flex-1 bg-gray-200 text-gray-800 rounded py-2">Skip & Book</button>
            </div>
          </>
        );

      default:
        return null;
    }
  }

  if (!bookingPayload) {
    return null; // redirect is handled in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">

          {/* Left: Payment choices & form */}
          <div className="bg-white rounded shadow p-6">
            <h2 className="text-xl font-semibold mb-3">Payment</h2>
            <p className="text-sm text-slate-600 mb-4">Choose a payment method and complete payment to confirm booking. (Demo only)</p>

            {/* Methods */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setMethod("card")} className={`px-3 py-2 rounded ${method === "card" ? "bg-slate-900 text-white" : "bg-white border"}`}>Card</button>
              <button onClick={() => setMethod("upi")} className={`px-3 py-2 rounded ${method === "upi" ? "bg-slate-900 text-white" : "bg-white border"}`}>UPI</button>
              <button onClick={() => setMethod("netbank")} className={`px-3 py-2 rounded ${method === "netbank" ? "bg-slate-900 text-white" : "bg-white border"}`}>Netbank</button>
              <button onClick={() => setMethod("wallet")} className={`px-3 py-2 rounded ${method === "wallet" ? "bg-slate-900 text-white" : "bg-white border"}`}>Wallet</button>
            </div>

            {error && <div className="mb-3 text-sm text-red-700 bg-red-50 p-3 rounded">{error}</div>}

            {/* Method-specific UI */}
            <div>
              {renderMethodUI()}
            </div>

            <div className="mt-4 text-xs text-slate-500">
              <p>Demo payment — for production, integrate with a real gateway (Razorpay / Stripe / PayPal) and verify server-side.</p>
            </div>
          </div>

          {/* Right: Order summary */}
          <aside className="bg-white rounded shadow p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                <img src={bookingPayload?.court?.image || "/images/stadium-placeholder.jpg"} alt="court" className="w-full h-full object-cover rounded" />
              </div>
              <div>
                <div className="text-sm text-slate-600">Booking for</div>
                <div className="font-semibold">{bookingPayload?.court?.name || bookingPayload?.courtId}</div>
                <div className="text-xs text-slate-500">Slot: {new Date(bookingPayload.startTime).toLocaleString()} — {new Date(bookingPayload.endTime).toLocaleTimeString()}</div>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between"><div className="text-sm">Base / after rules</div><div className="text-sm">{formatINR(bookingPayload.pricingBreakdown?.priceAfterRules ?? bookingPayload.pricingBreakdown?.basePrice ?? 0)}</div></div>
              <div className="flex justify-between mt-1"><div className="text-sm">Equipment</div><div className="text-sm">{formatINR(bookingPayload.pricingBreakdown?.equipmentFee ?? 0)}</div></div>
              <div className="flex justify-between mt-1"><div className="text-sm">Coach</div><div className="text-sm">{formatINR(bookingPayload.pricingBreakdown?.coachFee ?? 0)}</div></div>

              <div className="mt-4 border-t pt-3 flex justify-between items-center">
                <div className="font-bold text-lg">Total</div>
                <div className="font-bold text-2xl">{formatINR(bookingPayload.pricingBreakdown?.total ?? total)}</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-600">
              <div>Need help? Contact via LinkedIn — Gokul P</div>
            </div>

            <div className="mt-5">
              <button onClick={() => navigate(-1)} className="w-full text-sm py-2 rounded bg-gray-100">← Back to booking</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
