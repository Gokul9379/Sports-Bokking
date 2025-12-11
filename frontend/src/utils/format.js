// src/utils/format.js
export function formatINR(value) {
  if (value === null || value === undefined || isNaN(Number(value))) return "₹0";
  const amount = Number(value);
  return amount.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
}
