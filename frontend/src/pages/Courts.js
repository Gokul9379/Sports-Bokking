// src/pages/Courts.js
import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../utils/format';

const placeholder = "/images/stadium-placeholder.jpg"; // public/images/stadium-placeholder.jpg

export default function Courts() {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    api.get('/courts')
      .then(r => { if (mounted) setCourts(r.data || []); })
      .catch(err => { console.error("Courts load error:", err); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      {/* HERO */}
      <div className="hero py-24 bg-gradient-to-b from-sky-700 to-indigo-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Book courts, equipment & coaches — fast.</h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-sky-100/90">Real-time availability, dynamic pricing rules, and multi-resource scheduling for your facility.</p>
        </div>
      </div>

      {/* COURTS LIST */}
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Courts</h2>
          <div className="text-sm text-gray-500">Choose your court and quickly book a slot</div>
        </div>

        {loading ? <div>Loading...</div> : (
          <div className="grid court-grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {courts.map(c => (
              <div key={c._id} className="court-card glass-card p-0 rounded-lg overflow-hidden shadow">
                <div className="relative h-40">
                  <img
                    src={c.image || placeholder}
                    alt={c.name}
                    className="object-cover w-full h-full"
                    onError={(e)=> e.currentTarget.src = placeholder}
                  />
                  <div className="absolute left-3 top-3 bg-black/60 text-white px-3 py-1 rounded text-sm">{c.type}</div>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{c.name}</h3>
                      <div className="text-sm text-gray-600 mt-1">{c.short}</div>
                      <div className="text-sm text-gray-500 mt-1">Dimensions: {c.dims || "—"}</div>
                    </div>
                    <div className="ml-3 text-right">
                      <div className="text-lg font-bold">{formatINR(c.basePrice)}</div>
                      <div className="text-xs text-amber-500 mt-1">★ {Number(c.rating || 0).toFixed(1)}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button onClick={() => navigate(`/courts/${c._id}`, { state: { court: c } })}
                            className="flex-1 text-center py-2 rounded-md border border-transparent text-sm bg-white/90 text-gray-900 hover:bg-white">
                      View slots
                    </button>
                    <button onClick={() => navigate(`/book/${c._id}`, { state: { court: c } })}
                            className="flex-1 text-center py-2 rounded-md bg-indigo-600 text-white text-sm">
                      Quick Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
