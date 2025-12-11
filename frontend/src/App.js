// frontend/src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Courts from "./pages/Courts";
import Register from "./pages/Register";
import CourtSlots from "./pages/CourtSlots";
import BookingForm from "./pages/BookingForm";
import MyBookings from "./pages/MyBookings";
import AdminDashboard from "./pages/admin/AdminDashboard";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Footer from "./components/Footer";
import PaymentPage from "./pages/Payment";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* Courts list - change to protected if you want it behind login */}
        <Route path="/courts" element={
          <ProtectedRoute>
            <Courts />
          </ProtectedRoute>
        } />
        <Route path="/courts/:id" element={
          <ProtectedRoute>
            <CourtSlots />
          </ProtectedRoute>
        } />
        <Route path="/book/:courtId" element={
          <ProtectedRoute>
            <BookingForm />
          </ProtectedRoute>
        } />
        <Route path="/payment" element={
  <ProtectedRoute>
    <PaymentPage />
  </ProtectedRoute>
} />
       <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
<Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<Login />} />
      </Routes>
       <Footer />
    </>
  );
}

export default App;
