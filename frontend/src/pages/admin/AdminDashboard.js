import React from 'react';

export default function AdminDashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Quick Actions</h3>
          <ul className="mt-2 text-sm text-gray-700">
            <li>- Add equipment</li>
            <li>- Add coach</li>
            <li>- Add pricing rule</li>
            <li>- View bookings</li>
          </ul>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Status</h3>
          <p className="mt-2 text-sm text-gray-600">Backend connected and admin endpoints ready.</p>
        </div>
      </div>
    </div>
  );
}
