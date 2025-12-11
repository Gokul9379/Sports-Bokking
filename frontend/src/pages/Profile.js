// frontend/src/pages/Profile.js
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: "", phone: "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setForm({ name: user.name || "", phone: user.phone || "" });
      setAvatarPreview(user.avatarUrl || user.image || null);
    }
  }, [user]);

  function onFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      // If backend supports avatar upload via multipart form
      if (avatarFile) {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("phone", form.phone);
        fd.append("avatar", avatarFile);
        const res = await api.put("/auth/me", fd, { headers: { "Content-Type": "multipart/form-data" } }).catch(() => null);
        if (res?.data) {
          setUser(res.data.user ?? res.data);
          alert("Profile saved");
          setSaving(false);
          return;
        }
      }

      // JSON fallback
      const res = await api.put("/auth/me", { name: form.name, phone: form.phone }).catch(() => null);
      if (res?.data) {
        const updated = res.data.user ?? res.data;
        setUser(updated);
        alert("Profile saved");
      } else {
        // local-only fallback
        const newUser = { ...(user || {}), name: form.name, phone: form.phone, avatarUrl: avatarPreview };
        setUser(newUser);
        localStorage.setItem("user", JSON.stringify(newUser));
        alert("Profile updated locally (server not available)");
      }
    } catch (err) {
      console.error("Save profile failed", err);
      alert("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800">My Profile</h1>
            <p className="text-sm text-slate-500 mt-1">Update your public details and avatar</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Avatar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border">
            <div className="flex flex-col items-center gap-4">
              <div className="w-36 h-36 rounded-full overflow-hidden border bg-gray-100 shadow-inner">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-slate-400">
                    {(user?.name || user?.email || "U").slice(0,2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="text-center">
                <div className="text-lg font-semibold text-slate-800">{user?.name || "Unnamed"}</div>
                <div className="text-sm text-slate-500">{user?.role === "admin" ? "Administrator" : "Member"}</div>
              </div>

              <label className="block w-full">
                <div className="text-xs text-slate-500 mb-2">Change avatar</div>
                <input type="file" accept="image/*" onChange={onFileChange} className="w-full text-sm" />
              </label>
              <div className="text-xs text-slate-400">PNG/JPG up to 2MB. (Server upload optional)</div>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleSave} className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Full name</label>
                  <input name="name" value={form.name} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-sky-200" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700">Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border px-4 py-2 focus:ring-2 focus:ring-sky-200" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Email (read-only)</label>
                <input value={user?.email || ""} readOnly className="mt-1 block w-full rounded-lg border bg-slate-50 px-4 py-2 text-slate-600" />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="submit" disabled={saving} className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg shadow">
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(user?.avatarUrl || null); setForm({ name: user?.name || "", phone: user?.phone || "" }); }}
                  className="px-4 py-2 border rounded-lg">Reset</button>
                <button type="button" onClick={() => navigate(-1)} className="ml-auto text-sm text-slate-500 hover:underline">Back</button>
              </div>

              <div className="mt-3 text-sm text-slate-500">
                
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
