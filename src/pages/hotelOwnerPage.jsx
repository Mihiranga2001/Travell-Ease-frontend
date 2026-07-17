import {
  MdDashboard,
  MdMeetingRoom,
  MdOutlineRateReview,
  MdSettings,
} from "react-icons/md";
import {
  FiBarChart2,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { FaHotel } from "react-icons/fa";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useMemo, useState } from "react";
import HotelOwnerDashboardPage from "./hotelOwner/hotelOwnerDashboardPage";
import HotelOwnerMyHotelsPage from "./hotelOwner/hotelOwnerMyHotelsPage";
import HotelOwnerRoomsPage from "./hotelOwner/hotelOwnerRoomsPage";

const MENU_ITEMS = [
  {
    path: "/hotel-owner",
    label: "Dashboard",
    icon: <MdDashboard />,
    end: true,
  },
  {
    path: "/hotel-owner/hotels",
    label: "My Hotels",
    icon: <FaHotel />,
  },
  {
    path: "/hotel-owner/bookings",
    label: "Bookings",
    icon: <FiCalendar />,
  },
  {
    path: "/hotel-owner/rooms",
    label: "Room Availability",
    icon: <MdMeetingRoom />,
  },
  {
    path: "/hotel-owner/reviews",
    label: "Reviews",
    icon: <MdOutlineRateReview />,
  },
  {
    path: "/hotel-owner/reports",
    label: "Reports",
    icon: <FiBarChart2 />,
  },
  {
    path: "/hotel-owner/settings",
    label: "Settings",
    icon: <MdSettings />,
  },
];

export default function HotelOwnerPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const role =
    loggedInUser?.role ||
    localStorage.getItem("role") ||
    "";

  if (role !== "hotel_owner" && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", { replace: true });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  return (
    <div className="w-full min-h-screen bg-accent flex">
      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-[15px] left-[15px] z-40 lg:hidden w-[42px] h-[42px] rounded-lg bg-accent text-white flex items-center justify-center shadow-lg"
        aria-label="Open hotel owner menu"
      >
        <FiMenu />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close hotel owner menu"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 w-[250px] min-h-screen bg-accent text-primary transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="w-full h-[100px] px-[10px] flex items-center justify-between border-b border-white/10">
          <Link
            to="/hotel-owner"
            onClick={closeSidebar}
            className="flex items-center gap-[8px]"
          >
            <img
              src="/logo.png"
              alt="Travel Ease logo"
              className="h-[50px] w-[120px] object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-white">
                Hotel Owner
              </h1>

              <p className="max-w-[95px] truncate text-xs text-white/70">
                {loggedInUser?.name || "Owner"}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
            className="lg:hidden text-white"
            aria-label="Close menu"
          >
            <FiX />
          </button>
        </div>

        <nav className="w-full text-primary flex flex-col gap-[10px] px-[20px] py-[20px]">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `w-full flex items-center min-h-[38px] gap-[8px] px-[10px] rounded-lg transition ${
                  isActive
                    ? "bg-primary text-accent"
                    : "text-primary hover:bg-white/10"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}

          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center min-h-[38px] gap-[8px] px-[10px] rounded-lg text-primary hover:bg-red-600 hover:text-white transition"
          >
            <FiLogOut />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 min-h-screen bg-primary lg:border-[10px] lg:rounded-3xl lg:border-accent overflow-y-auto">
        <Routes>
          <Route
            index
            element={<HotelOwnerDashboardPage />}
          />

          <Route
            path="hotels"
            element={
              <HotelOwnerMyHotelsPage />}
          />

          <Route
            path="bookings"
            element={
              <TemporaryPage
                title="Bookings"
                description="HotelOwnerBookingPage.jsx will be connected here."
                icon={<FiCalendar />}
              />
            }
          />

          <Route
            path="rooms"
            element={
              <HotelOwnerRoomsPage />}
          />

          <Route
            path="reviews"
            element={
              <TemporaryPage
                title="Reviews"
                description="Hotel reviews will be added here."
                icon={<MdOutlineRateReview />}
              />
            }
          />

          <Route
            path="reports"
            element={
              <TemporaryPage
                title="Reports"
                description="Hotel reports will be added here."
                icon={<FiBarChart2 />}
              />
            }
          />

          <Route
            path="settings"
            element={
              <TemporaryPage
                title="Settings"
                description="Hotel owner settings will be added here."
                icon={<MdSettings />}
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/hotel-owner" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function TemporaryPage({ title, description, icon }) {
  return (
    <div className="w-full min-h-screen p-[25px] pt-[75px] lg:pt-[25px] text-gray-800">
      <div className="mb-[25px]">
        <h1 className="text-3xl font-bold text-accent">
          {title}
        </h1>

        <p className="text-gray-500 mt-[5px]">
          {description}
        </p>
      </div>

      <div className="min-h-[430px] bg-white border border-gray-200 rounded-2xl shadow-md p-[25px] flex flex-col items-center justify-center text-center">
        <div className="w-[80px] h-[80px] rounded-full bg-accent text-white text-4xl flex items-center justify-center mb-[20px]">
          {icon}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-[10px]">
          {title}
        </h2>

        <p className="max-w-[680px] text-gray-500 leading-7">
          {description}
        </p>
      </div>
    </div>
  );
}