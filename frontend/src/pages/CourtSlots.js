// src/pages/CourtSlots.js
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";
import { formatINR } from "../utils/format";

const placeholder = "/images/stadium-placeholder.jpg";

function generateSlotsForToday() {
  const slots = [];
  const today = new Date();
  today.setMinutes(0,0,0,0);
  for (let h = 8; h < 21; h++) {
    const start = new Date(today);
    start.setHours(h);
    const end = new Date(start);
    end.setHours(h+1);
    slots.push({
      id: `${h}`,
      startISO: start.toISOString(),
      endISO: end.toISOString(),
      label: `${String(h).padStart(2,"0")}:00 - ${String(h+1).padStart(2,"0")}:00`,
      price: Math.floor(400 + Math.random()*700),
      booked: false
    });
  }
  return slots;
}

export default function CourtSlots() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const courtFromState = location.state?.court || null;

  const [court, setCourt] = useState(courtFromState);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        if (!court && id) {
          const res = await api.get(`/courts/${id}`);
          if (mounted) setCourt(res.data);
        }
        try {
          const res2 = await api.get(`/public/courts/${id}/slots`);
          if (mounted && Array.isArray(res2.data) && res2.data.length) {
            setSlots(res2.data);
          } else {
            setSlots(generateSlotsForToday());
          }
        } catch (e) {
          setSlots(generateSlotsForToday());
        }
      } catch (err) {
        setCourt(courtFromState || null);
        setSlots(generateSlotsForToday());
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => mounted = false;
  }, [id, courtFromState]);

  function quickBook(slot) {
    navigate(`/book/${court._id}`, { state: { slot, court } });
  }

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="rounded overflow-hidden shadow mb-6">
        <div className="relative h-60">
          <img src={court?.image || placeholder} alt={court?.name} className="object-cover w-full h-full filter brightness-75" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-3xl font-bold">{court?.name}</h1>
              <p className="mt-1">{court?.short}</p>
              <div className="mt-3 text-lg font-semibold">{formatINR(court?.basePrice)}</div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="font-semibold">Court details</h3>
              <ul className="mt-2 list-disc ml-5 text-sm text-slate-700">
                <li><strong>Type:</strong> {court?.type}</li>
                <li><strong>Dimensions:</strong> {court?.dims || "N/A"}</li>
                <li><strong>Rating:</strong> ★ {court?.rating ?? "—"}</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold">Facilities</h3>
              <p className="mt-2 text-sm text-slate-700">{court?.short || "Standard changing room, lighting and seating."}</p>
            </div>

            <div>
              <h3 className="font-semibold">Book quickly</h3>
              <p className="mt-2 text-sm text-slate-700">Choose a slot below and click Quick Book. You’ll be taken to the booking form.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-3">Available slots</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {slots.map((s) => (
            <div key={s.id} className={`p-3 rounded border ${s.booked ? 'opacity-60 bg-slate-50' : 'bg-white'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{s.label}</div>
                  <div className="text-sm text-slate-600 mt-1">Price: {formatINR(s.price ?? court?.basePrice)}</div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => quickBook(s)} disabled={s.booked}
                          className={`px-3 py-2 rounded ${s.booked ? 'bg-gray-300 text-gray-600' : 'bg-green-600 text-white'}`}>
                    Quick Book
                  </button>
                  <button onClick={() => navigate(`/book/${court._id}`, { state: { slot: s, court } })}
                          className="px-3 py-2 bg-blue-600 text-white rounded">View & Book</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
