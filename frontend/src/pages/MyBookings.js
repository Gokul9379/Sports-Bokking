// src/pages/MyBookings.js
import React, { useEffect, useState, useContext } from "react";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import { formatINR } from "../utils/format";
// If you placed a placeholder under public/images:
const placeholder = "/images/stadium-placeholder.jpg";

export default function MyBookings() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        if (!user?.id && !user?._id) {
          setBookings([]);
          setLoading(false);
          return;
        }
        const userId = user.id || user._id;
        const res = await api.get(`/bookings/user/${userId}`);
        if (mounted) setBookings(res.data || []);
      } catch (err) {
        console.error("Failed to load bookings", err);
        setError(err?.response?.data?.error || err.message || "Failed to load");
        if (mounted) setBookings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => (mounted = false);
  }, [user]);

  // build a simple HTML receipt and trigger download
  function downloadReceipt(booking) {
    const court = booking.court || {};
    const equipList = (booking.resources?.equipment || []).map(e => {
      const name = e.equipmentId?.name || e.equipmentId || "Equipment";
      return `<li>${name} × ${e.quantity || 1}</li>`;
    }).join("");

    const coachInfo = booking.resources?.coach
      ? (booking.resources.coach.name || booking.resources.coach)
      : "No coach";

    const price = booking.pricingBreakdown || {};
    const createdAt = new Date(booking.createdAt).toLocaleString();
    const start = new Date(booking.startTime).toLocaleString();
    const end = new Date(booking.endTime).toLocaleString();

    const imgSrc = court.image ? (court.image.startsWith('/') ? court.image : court.image) : placeholder;

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8"/>
        <title>Receipt - ${booking._id}</title>
        <style>
          body{font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial; padding:20px; color:#111}
          .wrap{max-width:700px;margin:0 auto;border:1px solid #eee;padding:20px;border-radius:8px;}
          header{display:flex;gap:16px;align-items:center}
          header img{width:120px;height:80px;object-fit:cover;border-radius:6px;border:1px solid #ddd}
          header .title{font-size:1.25rem;font-weight:700;color:#0b3954}
          .meta{margin-top:12px;color:#444;font-size:0.95rem}
          .section{margin-top:18px}
          .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          table{width:100%;border-collapse:collapse;margin-top:8px}
          table th, table td{padding:8px;text-align:left;border-bottom:1px solid #eee}
          .total{font-size:1.1rem;font-weight:700;margin-top:12px}
          footer{margin-top:22px;color:#777;font-size:0.85rem}
        </style>
      </head>
      <body>
        <div class="wrap">
          <header>
            <img src="${imgSrc}" alt="Court image" />
            <div>
              <div class="title">${court.name || "Court"}</div>
              <div class="meta">${court.short || court.type || ""}</div>
              <div class="meta">Booking: ${start} → ${end}</div>
            </div>
          </header>

          <div class="section">
            <strong>Booked by:</strong> ${booking.user?.name || booking.user || "User"}<br/>
            <strong>Created:</strong> ${createdAt}<br/>
            <strong>Booking ID:</strong> ${booking._id}
          </div>

          <div class="section grid">
            <div>
              <strong>Pricing</strong>
              <table>
                <tbody>
                  <tr><th>Base</th><td>${formatINR(price.basePrice || 0)}</td></tr>
                  <tr><th>After rules</th><td>${formatINR(price.priceAfterRules ?? price.basePrice ?? 0)}</td></tr>
                  <tr><th>Equipment</th><td>${formatINR(price.equipmentFee || 0)}</td></tr>
                  <tr><th>Coach</th><td>${formatINR(price.coachFee || 0)}</td></tr>
                  <tr><th>Total</th><td class="total">${formatINR(price.total ?? price.priceAfterRules ?? price.basePrice ?? 0)}</td></tr>
                </tbody>
              </table>
            </div>

            <div>
              <strong>Resources</strong>
              <div style="margin-top:8px">
                <strong>Coach:</strong> ${coachInfo || "No coach"}<br/>
                <strong>Equipment:</strong>
                <ul>${equipList || "<li>None</li>"}</ul>
              </div>
            </div>
          </div>

          <footer>
            Thank you for booking with us. Visit again!
          </footer>
        </div>
      </body>
      </html>
    `.trim();

    // create blob and trigger download
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${booking._id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function cancelBooking(bookingId) {
    if (!window.confirm("Cancel this booking?")) return;
    setActionLoading(bookingId);

    // optimistic remove
    const prev = bookings;
    setBookings(bs => bs.filter(b => b._id !== bookingId));

    try {
      await api.delete(`/bookings/${bookingId}`);
      // success, backend returns cancelled booking
    } catch (err) {
      // revert on failure and show error
      setBookings(prev);
      alert(err?.response?.data?.error || err.message || "Failed to cancel");
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) return <div className="p-6">Loading your bookings…</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>

      {bookings.length === 0 && <div className="bg-white p-6 rounded shadow">No bookings found.</div>}

      <div className="grid gap-4">
        {bookings.map(b => {
          const court = b.court || {};
          const img = court.image ? (court.image.startsWith('/') ? court.image : court.image) : placeholder;
          return (
            <div key={b._id} className="bg-white p-4 rounded shadow flex gap-4 items-start">
              <img src={img} alt={court.name || "court"} style={{ width: 140, height: 90, objectFit: "cover", borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{court.name || "Court"}</div>
                    <div className="text-sm text-gray-600">{court.type || ""} • {court.dims || ""}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-gray-500">{new Date(b.startTime).toLocaleString()}</div>
                    <div className="text-lg font-bold mt-1">{formatINR(b.pricingBreakdown?.total ?? b.pricingBreakdown?.priceAfterRules ?? court.basePrice ?? 0)}</div>
                  </div>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => downloadReceipt(b)}
                    className="px-3 py-2 rounded bg-sky-600 text-white text-sm"
                  >
                    Download Receipt
                  </button>

                  <button
                    onClick={() => cancelBooking(b._id)}
                    disabled={actionLoading === b._id}
                    className="px-3 py-2 rounded bg-gray-100 text-sm"
                  >
                    {actionLoading === b._id ? "Cancelling…" : "Cancel booking"}
                  </button>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
