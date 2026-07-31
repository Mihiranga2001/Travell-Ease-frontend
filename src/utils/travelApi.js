import axios from "axios";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export const API_ORIGIN = RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
export const API_BASE_URL = `${API_ORIGIN}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export function getStoredRole() {
  const user = getStoredUser();

  return normalizeRole(
    user?.role ||
      user?.userType ||
      localStorage.getItem("role") ||
      ""
  );
}

export function getStoredToken() {
  return localStorage.getItem("token") || "";
}

export function getAuthConfig() {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Please log in to continue");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function clearStoredAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.dispatchEvent(new Event("auth-changed"));
}

export function normalizeRole(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export function isTravelerRole(role) {
  const normalized = normalizeRole(role);

  return [
    "traveler",
    "traveller",
    "tourist",
    "customer",
    "user",
  ].includes(normalized);
}

export function getDisplayName(user) {
  if (!user) {
    return "Traveler";
  }

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    user.name ||
    user.fullName ||
    fullName ||
    user.username ||
    user.email ||
    "Traveler"
  );
}

export function getProfileImage(user) {
  return (
    user?.profilePhoto ||
    user?.profilePicture ||
    user?.profileImage ||
    user?.avatar ||
    user?.image ||
    ""
  );
}

export function getInitials(user) {
  const name = getDisplayName(user);
  const words = name.split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "T";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

export function getRoleLabel(role) {
  const normalized = normalizeRole(role);

  const labels = {
    admin: "Administrator",
    hotel_owner: "Hotel Owner",
    hotelowner: "Hotel Owner",
    vehicle_company: "Vehicle Company",
    vehicle_comapny: "Vehicle Company",
    travel_guide: "Travel Guide",
    guide: "Travel Guide",
    traveler: "Traveler",
    traveller: "Traveler",
    tourist: "Traveler",
    customer: "Traveler",
    user: "Traveler",
  };

  return labels[normalized] || "Traveler";
}

export function getDashboardPath(role) {
  const normalized = normalizeRole(role);

  if (normalized === "admin") {
    return "/admin";
  }

  if (["hotel_owner", "hotelowner"].includes(normalized)) {
    return "/hotel-owner";
  }

  if (["vehicle_company", "vehicle_comapny"].includes(normalized)) {
    return "/vehicle-company";
  }

  if (["travel_guide", "guide"].includes(normalized)) {
    return "/guide";
  }

  return "/my-bookings";
}

export function resolveAssetUrl(value, fallback = "") {
  const path = String(value || "")
    .trim()
    .replace(/\\/g, "/");

  if (!path) {
    return fallback;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:") ||
    path.startsWith("blob:")
  ) {
    return path;
  }

  if (path.startsWith("/uploads/")) {
    return `${API_ORIGIN}${path}`;
  }

  if (path.startsWith("uploads/")) {
    return `${API_ORIGIN}/${path}`;
  }

  if (path.startsWith("/")) {
    return path;
  }

  return `${API_ORIGIN}/${path}`;
}

export function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

export function extractList(response, keys = []) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.results)) {
    return data.results;
  }

  return [];
}

export function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "Rs. 0";
  }

  return `Rs. ${number.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value) {
  if (!value) {
    return "Not available";
  }

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

export function toDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function addDaysToDateInput(value, days) {
  const base = value ? new Date(`${value}T00:00:00`) : new Date();
  base.setDate(base.getDate() + days);
  return toDateInputValue(base);
}

export function getDateDifference(startValue, endValue) {
  if (!startValue || !endValue) {
    return 0;
  }

  const start = new Date(`${startValue}T00:00:00`);
  const end = new Date(`${endValue}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return 0;
  }

  return Math.ceil((end - start) / 86_400_000);
}
