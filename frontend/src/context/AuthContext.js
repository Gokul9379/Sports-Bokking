// src/context/AuthContext.js
import React, { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export const AuthContext = createContext({
  user: null,
  token: null,
  logout: () => {},
  loginSuccess: () => {},
  loginUser: async () => {},
  registerUser: async () => {},
});

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  useEffect(() => {
    async function hydrate() {
      const t = localStorage.getItem("token");
      if (!t) {
        setLoading(false);
        return;
      }

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        const res = await api.get("/auth/me");
        const me = res?.data?.user ?? res?.data;
        setUser(me || null);
        setToken(t);
      } catch (err) {
        console.warn("Failed to fetch current user:", err?.response?.data || err.message || err);
        setUser(null);
        setToken(null);
        delete api.defaults.headers.common["Authorization"];
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    }
    hydrate();
  }, []);

  function loginSuccess({ token: newToken, user: newUser }) {
    if (newToken) {
      setToken(newToken);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      localStorage.setItem("token", newToken);
    }
    if (newUser) {
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  }

  async function loginUser(email, password) {
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      const tokenFromRes = res?.data?.token ?? res?.data?.accessToken;
      const userFromRes = res?.data?.user ?? res?.data;
      if (tokenFromRes) {
        setToken(tokenFromRes);
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromRes}`;
        localStorage.setItem("token", tokenFromRes);
      }
      if (userFromRes) {
        setUser(userFromRes);
        localStorage.setItem("user", JSON.stringify(userFromRes));
      }

      setLoading(false);
      return { ok: true, user: userFromRes, token: tokenFromRes };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  async function registerUser(payload) {
    setLoading(true);
    try {
      const res = await api.post("/auth/register", payload);
      const tokenFromRes = res?.data?.token ?? res?.data?.accessToken;
      const userFromRes = res?.data?.user ?? res?.data;

      if (tokenFromRes) {
        setToken(tokenFromRes);
        api.defaults.headers.common["Authorization"] = `Bearer ${tokenFromRes}`;
        localStorage.setItem("token", tokenFromRes);
      }
      if (userFromRes) {
        setUser(userFromRes);
        localStorage.setItem("user", JSON.stringify(userFromRes));
      }

      setLoading(false);
      return { ok: true, user: userFromRes, token: tokenFromRes };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  function logout(redirectTo = "/login") {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    try {
      navigate(redirectTo, { replace: true });
    } catch (e) {
      window.location.href = redirectTo;
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        logout,
        loginSuccess,
        loginUser,
        registerUser,
        setUser,
        setToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
