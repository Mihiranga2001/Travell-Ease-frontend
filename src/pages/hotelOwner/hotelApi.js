import axios from "axios";

function normalizeApiUrl(value) {
  const fallback = "http://localhost:3000/api";
  const raw = String(value || fallback).trim().replace(/\/$/, "");

  return /\/api$/i.test(raw) ? raw : `${raw}/api`;
}

export const API_URL = normalizeApiUrl(
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL
);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

export function extractHotels(response) {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.hotels || data?.data || [];
}

export function extractBookings(response) {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.bookings || data?.data || [];
}

export function extractReviews(response) {
  const data = response?.data ?? response;
  return Array.isArray(data) ? data : data?.reviews || data?.data || [];
}

export function resolveAssetUrl(value, fallback = "/hotel-placeholder.jpg") {
  const text = String(value || "").trim();

  if (!text) {
    return fallback;
  }

  if (
    text.startsWith("http://") ||
    text.startsWith("https://") ||
    text.startsWith("data:") ||
    text.startsWith("blob:")
  ) {
    return text;
  }

  const backendOrigin = API_URL.replace(/\/api\/?$/, "");
  return text.startsWith("/")
    ? `${backendOrigin}${text}`
    : `${backendOrigin}/${text}`;
}

export function getHotelApprovalStatus(hotel) {
  if (["pending", "approved", "rejected"].includes(hotel?.approvalStatus)) {
    return hotel.approvalStatus;
  }

  return hotel?.isApproved === true ? "approved" : "pending";
}

export function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
