// frontend/src/pages/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const navigate = useNavigate();

  function validate() {
    if (!name || !email || !password) return "Name, email and password are required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email.";
    if (password.length < 4) return "Password must be at least 4 characters.";
    if (password !== confirm) return "Passwords do not match.";
    return null;
  }

  async function handleRegister(e) {
    e.preventDefault();
    setErr("");
    const v = validate();
    if (v) return setErr(v);

    setLoading(true);
    try {
      // adjust endpoint according to backend: '/auth/register'
      await api.post("/auth/register", { name, email, password, phone });
      // success -> navigate to login and show toast
      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (e) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || "Registration failed";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1">Create account</h1>
          <p className="text-sm text-slate-500 mb-6">Register a new user for Sports Booking</p>

          {err && <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">{err}</div>}

          <form onSubmit={handleRegister} className="space-y-4">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full border rounded px-3 py-2" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border rounded px-3 py-2" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone (optional)" className="w-full border rounded px-3 py-2" />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border rounded px-3 py-2" />
            <input value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirm Password" type="password" className="w-full border rounded px-3 py-2" />

            <button type="submit" disabled={loading} className="w-full bg-sky-600 text-white rounded py-2 text-sm font-semibold">
              {loading ? "Creating..." : "Create account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Already have an account?</span>{" "}
            <button onClick={() => navigate("/login")} className="font-medium text-sky-600 hover:underline">Sign in</button>
          </div>
        </div>
      </div>
    </div>
  );
}
