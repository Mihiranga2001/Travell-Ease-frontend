import axios from "axios";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export const API_URL = RAW_API_URL.replace(/\/$/, "").endsWith("/api")
  ? RAW_API_URL.replace(/\/$/, "")
  : `${RAW_API_URL.replace(/\/$/, "")}/api`;

export function getAuthConfig() {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in again");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
}

export function getApiErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallbackMessage
  );
}

export function getLoggedInUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export function extractObject(responseData, keys = []) {
  if (!responseData || typeof responseData !== "object") {
    return responseData || null;
  }

  for (const key of keys) {
    if (responseData[key]) {
      return responseData[key];
    }
  }

  return responseData;
}

export function extractList(responseData, keys = []) {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  for (const key of keys) {
    if (Array.isArray(responseData?.[key])) {
      return responseData[key];
    }
  }

  return [];
}

export function textArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

export function commaTextToArray(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .filter(
      (item, index, values) =>
        values.findIndex(
          (candidate) =>
            candidate.toLowerCase() === item.toLowerCase()
        ) === index
    );
}

export function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  });
}

export function formatDate(value) {
  const date = new Date(value);

  if (!value || Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) {
    return "Dates not available";
  }

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export function getGuideName(guide) {
  const user = guide?.userId;

  if (user && typeof user === "object") {
    if (user.name) {
      return user.name;
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return (
      fullName ||
      user.username ||
      user.email ||
      "Travel Guide"
    );
  }

  return "Travel Guide";
}

export function getTravelerName(item) {
  const traveler = item?.travelerId || item?.traveler;

  if (traveler && typeof traveler === "object") {
    return (
      traveler.name ||
      [traveler.firstName, traveler.lastName]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      traveler.email ||
      "Traveler"
    );
  }

  return item?.travelerName || "Traveler";
}

export function safeRating(value) {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
}

export { axios };
