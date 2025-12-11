// frontend/src/pages/Login.js
import React, { useState, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../images/logo-white.png"; // ensure this file exists

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { loginUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/courts";

  function validate() {
    if (!email) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(email)) return "Email looks invalid.";
    if (!password) return "Password is required.";
    if (password.length < 4) return "Password must be >= 4 characters.";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    const v = validate();
    if (v) return setErrorMsg(v);

    setLoading(true);
    try {
      // Use the context helper (it POSTs /auth/login and sets local state)
      const result = await loginUser(email, password);
      // loginUser returns { ok: true, user, token } on success (per AuthContext)
      if (result?.ok) {
        navigate(from, { replace: true });
      } else {
        // Fallback, though loginUser should throw on errors
        setErrorMsg("Login failed - please try again.");
      }
    } catch (err) {
      // AuthContext throws the axios error; extract a friendly message
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (typeof err === "string" ? err : err?.message) ||
        "Login failed";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white/95 backdrop-blur-sm shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-center mt-6">
          <img
            src={logo}
            alt="Sports Booking Logo"
            className="w-20 h-20 object-contain drop-shadow-md"
          />
        </div>

        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mb-1 text-center">
            Welcome back
          </h1>
          <p className="text-sm text-slate-500 mb-6 text-center">
            Sign in to continue to Sports Booking
          </p>

          {errorMsg && (
            <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 p-3 rounded">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 block w-full rounded-md border px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                required
                autoComplete="username"
              />
            </label>

            <label className="block relative">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="mt-1 block w-full rounded-md border px-3 py-2 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-300"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-9 text-sm text-slate-500"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center space-x-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <Link to="/forgot" className="text-sm text-sky-600 hover:underline">
                Forgot?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex justify-center items-center gap-2 rounded-md bg-sky-600 text-white px-4 py-2 text-sm font-semibold hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">New here?</span>{" "}
            <Link to="/register" className="font-medium text-sky-600 hover:underline">
              Create an account
            </Link>
          </div>

         
        </div>
      </div>
    </div>
  );
}
