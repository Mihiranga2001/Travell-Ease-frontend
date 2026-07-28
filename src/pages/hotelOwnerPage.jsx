import { useMemo, useState } from "react";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import {
  MdDashboard,
  MdMeetingRoom,
  MdOutlineRateReview,
  MdSettings,
} from "react-icons/md";
import { FiBarChart2, FiCalendar, FiLogOut, FiMenu, FiX } from "react-icons/fi";
import { FaHotel } from "react-icons/fa";

import HotelOwnerDashboardPage from "./hotelOwner/HotelOwnerDashboardPage";
import HotelOwnerMyHotelsPage from "./hotelOwner/HotelOwnerMyHotelsPage";
import HotelOwnerRoomsPage from "./hotelOwner/HotelOwnerRoomsPage";
import HotelOwnerBookingsPage from "./hotelOwner/HotelOwnerBookingsPage";
import HotelOwnerReviewsPage from "./hotelOwner/HotelOwnerReviewsPage";
import HotelOwnerReportsPage from "./hotelOwner/HotelOwnerReportsPage";
import HotelOwnerSettingsPage from "./hotelOwner/HotelOwnerSettingsPage";

const MENU_ITEMS = [
  { path: "/hotel-owner", label: "Dashboard", icon: <MdDashboard />, end: true },
  { path: "/hotel-owner/hotels", label: "My Hotels", icon: <FaHotel /> },
  { path: "/hotel-owner/bookings", label: "Bookings", icon: <FiCalendar /> },
  { path: "/hotel-owner/rooms", label: "Room Availability", icon: <MdMeetingRoom /> },
  { path: "/hotel-owner/reviews", label: "Reviews", icon: <MdOutlineRateReview /> },
  { path: "/hotel-owner/reports", label: "Reports", icon: <FiBarChart2 /> },
  { path: "/hotel-owner/settings", label: "Settings", icon: <MdSettings /> },
];

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function HotelOwnerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const loggedInUser = useMemo(readStoredUser, []);
  const role = loggedInUser?.role || localStorage.getItem("role") || "";

  if (role !== "hotel_owner" && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen w-full bg-accent">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-[15px] top-[15px] z-40 flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-accent text-white shadow-lg lg:hidden"
        aria-label="Open hotel owner menu"
      >
        <FiMenu />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close hotel owner menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 min-h-screen w-[250px] bg-accent text-primary transition-transform duration-300 lg:static ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[100px] w-full items-center justify-between border-b border-white/10 px-[12px]">
          <Link
            to="/hotel-owner"
            onClick={() => setSidebarOpen(false)}
            className="flex min-w-0 items-center gap-[8px]"
          >
            <img
              src="/logo.png"
              alt="Travel Ease logo"
              className="h-[50px] w-[115px] shrink-0 object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-white">Hotel Owner</h1>
              <p className="truncate text-xs text-white/70">
                {loggedInUser?.name || "Owner"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="text-white lg:hidden"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="flex w-full flex-col gap-[10px] px-[20px] py-[20px]">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex min-h-[42px] w-full items-center gap-[9px] rounded-lg px-[11px] transition ${
                  isActive
                    ? "bg-primary text-accent"
                    : "text-primary hover:bg-white/10"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button
            type="button"
            onClick={logout}
            className="flex min-h-[42px] w-full items-center gap-[9px] rounded-lg px-[11px] text-primary transition hover:bg-red-600 hover:text-white"
          >
            <FiLogOut />
            Logout
          </button>
        </nav>
      </aside>

      <main className="min-h-screen min-w-0 flex-1 overflow-y-auto bg-primary lg:rounded-3xl lg:border-[10px] lg:border-accent">
        <Routes>
          <Route index element={<HotelOwnerDashboardPage />} />
          <Route path="hotels" element={<HotelOwnerMyHotelsPage />} />
          <Route path="bookings" element={<HotelOwnerBookingsPage />} />
          <Route path="rooms" element={<HotelOwnerRoomsPage />} />
          <Route path="reviews" element={<HotelOwnerReviewsPage />} />
          <Route path="reports" element={<HotelOwnerReportsPage />} />
          <Route path="settings" element={<HotelOwnerSettingsPage />} />
          <Route path="*" element={<Navigate to="/hotel-owner" replace />} />
        </Routes>
      </main>
    </div>
  );
}
