// src/components/Footer.js
import React from "react";

export default function Footer() {
  const linkedIn = "https://www.linkedin.com/in/gokulp-/"; // your LinkedIn
  

  return (
    <footer className="bg-slate-900 text-slate-200 mt-12">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Sports Booking</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Full-stack court booking platform — multi-resource scheduling, dynamic pricing and realtime availability.
              Built for sports facilities and clubs.
            </p>

            <div className="mt-4 flex items-center gap-3">
              <a
                href={linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-sm"
                aria-label="Visit LinkedIn"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.12 8h4.72V24H.12zM9.5 8h4.52v2.16h.06c.63-1.2 2.17-2.46 4.46-2.46 4.77 0 5.65 3.14 5.65 7.22V24H19.8v-7.2c0-1.72-.03-3.93-2.4-3.93-2.4 0-2.77 1.88-2.77 3.82V24H9.5z"/>
                </svg>
                <span className="hidden sm:inline">Connect on LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Quick links</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li><a href="/courts" className="hover:underline">Courts</a></li>
              <li><a href="/my-bookings" className="hover:underline">My bookings</a></li>
              <li><a href="/admin" className="hover:underline">Admin dashboard</a></li>
              <li><a href="/contact" className="hover:underline">Contact / Support</a></li>
            </ul>
          </div>

          
          <div>
            <div className="text-sm text-slate-300 space-y-2">
            
              <div className="mt-3">
                <h5 className="text-sm font-semibold text-white mb-1">Follow</h5>
                <div className="flex gap-3">
                  <a href={linkedIn} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 rounded hover:bg-slate-800">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="M4.98 3.5C4.98 4.88 3.86 6 2.48 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.12 8h4.72V24H.12zM9.5 8h4.52v2.16h.06c.63-1.2 2.17-2.46 4.46-2.46 4.77 0 5.65 3.14 5.65 7.22V24H19.8v-7.2c0-1.72-.03-3.93-2.4-3.93-2.4 0-2.77 1.88-2.77 3.82V24H9.5z"/>
                    </svg>
                  </a>

                  <a 
  href="https://github.com/Gokul9379"
  target="_blank"
  rel="noopener noreferrer"
  aria-label="GitHub"
  className="p-2 rounded hover:bg-slate-800"
>
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C5.37 0 .001 5.37.001 12c0 5.3 3.438 9.8 8.205 11.387.6.111.82-.261.82-.58 
             0-.287-.01-1.04-.015-2.04-3.338.73-4.042-1.61-4.042-1.61-.547-1.387-1.335-1.757-1.335-1.757
             -1.09-.745.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 
             1.07 1.834 2.807 1.304 3.492.997.108-.777.42-1.305.763-1.605
             -2.665-.305-5.466-1.332-5.466-5.93 
             0-1.31.468-2.382 1.236-3.222-.123-.304-.536-1.527.117-3.183
             0 0 1.008-.322 3.3 1.23.957-.266 1.984-.399 3.003-.404 
             1.02.005 2.047.138 3.006.404 
             2.29-1.552 3.297-1.23 3.297-1.23 
             .655 1.656.243 2.879.12 3.183.77.84 1.235 1.912 1.235 3.222 
             0 4.61-2.803 5.622-5.475 5.92 
             .43.37.814 1.1.814 2.22 
             0 1.606-.015 2.9-.015 3.293 
             0 .32.216.697.825.578 
             C20.565 21.795 24 17.295 24 12 
             c0-6.63-5.37-12-12-12z"/>
  </svg>
</a>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-800 pt-6 text-sm text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} Sports Booking. All rights reserved.</div>
          <div>
            Built by <a className="text-sky-400 hover:underline" href={linkedIn} rel="noopener noreferrer">Gokul P</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
