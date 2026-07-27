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
  MdOutlineRateReview,
  MdSettings,
  MdWorkOutline,
} from "react-icons/md";
import {
  FiBarChart2,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiUser,
  FiX,
} from "react-icons/fi";
import {
  FaLanguage,
  FaMoneyBillWave,
} from "react-icons/fa";

import GuideDashboardPage from "./guide/guideDashboardPage";
import GuideProfilePage from "./guide/guideProfilePage";
import GuideBookingsPage from "./guide/guideBookingsPage";
import GuideAvailabilityPage from "./guide/guideAvailabilityPage";
import GuideLanguagesPage from "./guide/guideLanguagesPage";
import GuideReviewsPage from "./guide/guideReviewsPage";
import GuideEarningsPage from "./guide/guideEarningsPage";
import GuideReportsPage from "./guide/guideReportsPage";
import GuideSettingsPage from "./guide/guideSettingsPage";

const MENU_ITEMS = [
  {
    path: "/guide",
    label: "Dashboard",
    icon: <MdDashboard />,
    end: true,
  },
  {
    path: "/guide/profile",
    label: "My Profile",
    icon: <FiUser />,
  },
  {
    path: "/guide/bookings",
    label: "Bookings",
    icon: <FiCalendar />,
  },
  {
    path: "/guide/availability",
    label: "Availability",
    icon: <MdWorkOutline />,
  },
  {
    path: "/guide/languages",
    label: "Languages & Skills",
    icon: <FaLanguage />,
  },
  {
    path: "/guide/reviews",
    label: "Reviews",
    icon: <MdOutlineRateReview />,
  },
  {
    path: "/guide/earnings",
    label: "Earnings",
    icon: <FaMoneyBillWave />,
  },
  {
    path: "/guide/reports",
    label: "Reports",
    icon: <FiBarChart2 />,
  },
  {
    path: "/guide/settings",
    label: "Settings",
    icon: <MdSettings />,
  },
];

export default function GuidePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const role = String(
    loggedInUser?.role ||
      localStorage.getItem("role") ||
      ""
  ).toLowerCase();

  if (!["guide", "travel_guide", "admin"].includes(role)) {
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
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed top-[15px] left-[15px] z-40 lg:hidden w-[42px] h-[42px] rounded-lg bg-accent text-white flex items-center justify-center shadow-lg"
        aria-label="Open travel guide menu"
      >
        <FiMenu />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close travel guide menu"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-50 w-[250px] min-h-screen bg-accent text-primary transition-transform duration-300 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="w-full h-[125px] px-[10px] flex items-center justify-between border-b border-white/10">
          <Link
            to="/guide"
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
                Travel Guide
              </h1>

              <p className="max-w-[100px] truncate text-xs text-white/70">
                {getUserName(loggedInUser)}
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

      <main className="flex-1 min-w-0 min-h-screen bg-primary lg:border-[10px] lg:rounded-3xl lg:border-accent overflow-y-auto">
        <Routes>
          <Route index element={<GuideDashboardPage />} />
          <Route path="profile" element={<GuideProfilePage />} />
          <Route path="bookings" element={<GuideBookingsPage />} />
          <Route path="availability" element={<GuideAvailabilityPage />} />
          <Route path="languages" element={<GuideLanguagesPage />} />
          <Route path="reviews" element={<GuideReviewsPage />} />
          <Route path="earnings" element={<GuideEarningsPage />} />
          <Route path="reports" element={<GuideReportsPage />} />
          <Route path="settings" element={<GuideSettingsPage />} />
          <Route path="*" element={<Navigate to="/guide" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function getUserName(user) {
  if (!user) {
    return "Guide";
  }

  if (user.name) {
    return user.name;
  }

  return (
    [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    user.username ||
    user.email ||
    "Guide"
  );
}
