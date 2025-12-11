// frontend/src/pages/Settings.js
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

function ConfirmModal({ open, title, message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel}></div>
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md z-10">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded bg-gray-100">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-rose-600 text-white">Yes, delete</button>
        </div>
      </div>
    </div>
  );
}

export default function Settings() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", newPw: "", confirm: "" });
  const [changing, setChanging] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  async function handlePasswordChange(e) {
    e.preventDefault();
    if (!pwForm.current || !pwForm.newPw) return alert("Fill both fields");
    if (pwForm.newPw !== pwForm.confirm) return alert("New passwords do not match");
    setChanging(true);
    try {
      // call backend if available
      const res = await api.post("/auth/change-password", { currentPassword: pwForm.current, newPassword: pwForm.newPw }).catch(() => null);
      if (res?.data) {
        alert("Password changed. Please login again.");
        logout();
      } else {
        alert("Password change endpoint not available in demo.");
      }
    } catch (err) {
      console.error("Change password error", err);
      alert(err?.response?.data?.error || "Failed to change password");
    } finally {
      setChanging(false);
    }
  }

  function handleDeleteAccount() {
    setModalOpen(true);
  }

  async function confirmDelete() {
    setModalOpen(false);
    // Implement server delete if you want. Here we simulate and logout.
    try {
      const res = await api.delete("/auth/me").catch(() => null);
      if (res?.data) {
        alert("Account deleted");
        logout();
        return;
      }
      // fallback simulation
      alert("Account deletion endpoint not available. Simulating deletion and logging out.");
      logout();
    } catch (err) {
      console.error("Delete account error", err);
      alert("Failed to delete account");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <ConfirmModal
        open={modalOpen}
        title="Delete your account?"
        message="This will permanently remove your account and all data. This action cannot be undone."
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmDelete}
      />

      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage account preferences and security</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Preferences</h2>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                  <div>
                    <div className="font-medium">Notifications</div>
                    <div className="text-xs text-slate-500">Receive booking updates and offers</div>
                  </div>
                  <input type="checkbox" checked={notifications} onChange={e => setNotifications(e.target.checked)} />
                </label>

                <label className="flex items-center justify-between p-3 rounded-lg border hover:bg-slate-50">
                  <div>
                    <div className="font-medium">Dark mode</div>
                    <div className="text-xs text-slate-500">Enable darker UI theme (demo)</div>
                  </div>
                  <input type="checkbox" checked={darkMode} onChange={e => setDarkMode(e.target.checked)} />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h2 className="text-lg font-semibold mb-3">Security</h2>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <input type="password" placeholder="Current password" value={pwForm.current}
                  onChange={e => setPwForm({ ...pwForm, current: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2" />
                <input type="password" placeholder="New password" value={pwForm.newPw}
                  onChange={e => setPwForm({ ...pwForm, newPw: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2" />
                <input type="password" placeholder="Confirm new password" value={pwForm.confirm}
                  onChange={e => setPwForm({ ...pwForm, confirm: e.target.value })}
                  className="w-full rounded-lg border px-4 py-2" />
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={changing} className="bg-sky-600 text-white px-4 py-2 rounded-lg">
                    {changing ? "Saving..." : "Change password"}
                  </button>
                  <button type="button" onClick={() => setPwForm({ current: "", newPw: "", confirm: "" })} className="px-4 py-2 border rounded-lg">Reset</button>
                </div>
              </form>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border shadow-sm">
              <h3 className="font-semibold mb-2">Account</h3>
              <div className="text-sm text-slate-600 mb-3">Signed in as</div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-slate-500">{user?.email}</div>

              <div className="mt-4 space-y-2">
                <button onClick={() => navigate("/profile")} className="w-full text-left px-3 py-2 rounded-lg border hover:bg-slate-50">Edit profile</button>
                <button onClick={handleDeleteAccount} className="w-full text-left px-3 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-500">Delete account</button>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border shadow-sm text-sm">
              <h4 className="font-semibold mb-2">Support</h4>
              <p className="text-slate-600">If you need help, contact support@demo.example (demo) or check the docs.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
