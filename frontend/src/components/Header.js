// frontend/src/components/Header.js
import React, { useContext, useRef, useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../images/logo-white.png"; // keep your existing logo file here

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function onDocClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function handleLogout() {
    if (typeof logout === "function") logout();
    else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  }

  function initials(name = "") {
    const parts = (name || "").trim().split(/\s+/);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  return (
    <header className="bg-slate-900 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <img src={logo} alt="Sports Booking" className="w-10 h-10 object-contain" />
              <span className="font-semibold text-lg tracking-tight">Sports Booking</span>
            </Link>
          </div>

          {/* Middle nav (hidden on small screens) */}
          <nav className="hidden md:flex items-center gap-4">
            <NavLink to="/courts" className={({isActive}) => "px-3 py-2 rounded-md text-sm hover:bg-slate-800 " + (isActive ? "bg-slate-800" : "")}>Courts</NavLink>
            <NavLink to="/my-bookings" className={({isActive}) => "px-3 py-2 rounded-md text-sm hover:bg-slate-800 " + (isActive ? "bg-slate-800" : "")}>My Bookings</NavLink>
            {user?.role === "admin" && <NavLink to="/admin" className={({isActive}) => "px-3 py-2 rounded-md text-sm hover:bg-slate-800 " + (isActive ? "bg-slate-800" : "")}>Admin</NavLink>}
          </nav>

          {/* Right: user area */}
          <div className="flex items-center gap-3">
            {!user ? (
              <>
                <Link to="/login" className="px-3 py-2 rounded-md text-sm bg-slate-800 hover:bg-slate-700">Login</Link>
                <Link to="/register" className="px-3 py-2 rounded-md text-sm border border-slate-700 hover:bg-slate-800">Sign up</Link>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  aria-haspopup="true"
                  aria-expanded={open}
                  onClick={() => setOpen(s => !s)}
                  className="flex items-center gap-3 p-1 rounded-md hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                >
                  {/* avatar */}
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-sm font-semibold">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name || user.email} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span>{initials(user?.name || user?.email)}</span>
                    )}
                  </div>

                  {/* on wider screens show name */}
                  <div className="hidden sm:flex flex-col items-start text-sm text-left">
                    <span className="font-medium leading-4">{user.name || user.email}</span>
                    <span className="text-xs text-slate-300">{user.role === "admin" ? "Admin" : "Member"}</span>
                  </div>

                  {/* caret */}
                  <svg className={`w-4 h-4 ml-1 transform ${open ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                {/* Dropdown */}
                {open && (
                  <div role="menu" className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="p-3 border-b">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-lg font-semibold text-slate-700">
                          {initials(user?.name || user?.email)}
                        </div>
                        <div className="text-sm">
                          <div className="font-semibold">{user.name || user.email}</div>
                          <div className="text-xs text-slate-500 truncate">{user.email}</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <Link to="/profile" onClick={() => setOpen(false)} className="block px-3 py-2 rounded hover:bg-slate-50 text-sm">My Profile</Link>
                      <Link to="/my-bookings" onClick={() => setOpen(false)} className="block px-3 py-2 rounded hover:bg-slate-50 text-sm">My Bookings</Link>
                      <Link to="/settings" onClick={() => setOpen(false)} className="block px-3 py-2 rounded hover:bg-slate-50 text-sm">Settings</Link>
                    </div>

                    <div className="border-t p-3">
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded bg-rose-600 text-white hover:bg-rose-500">Logout</button>
                    </div>

                    <div className="text-xs text-slate-400 p-2 border-t">
                      <div>Signed in as <strong>{user.email}</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
