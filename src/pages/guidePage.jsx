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

/*
  Do not import GuideDashboardPage or GuideProfilePage
  until those files are created.
*/

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
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("user")) ||
        null
      );
    } catch {
      return null;
    }
  }, []);

  const role = String(
    loggedInUser?.role ||
      localStorage.getItem("role") ||
      ""
  ).toLowerCase();

  const allowedRoles = [
    "guide",
    "travel_guide",
    "admin",
  ];

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login", {
      replace: true,
    });
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
        aria-label="Open travel guide menu"
      >
        <FiMenu />
      </button>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          onClick={closeSidebar}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          aria-label="Close travel guide menu"
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

              <p className="max-w-[95px] truncate text-xs text-white/70">
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
              <span className="text-lg">
                {item.icon}
              </span>

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
            element={
              <TemporaryPage
                title="Guide Dashboard"
                description="View your profile status, bookings, availability, ratings, and earnings."
                icon={<MdDashboard />}
              />
            }
          />

          <Route
            path="profile"
            element={
              <TemporaryPage
                title="My Profile"
                description="Manage your languages, experience, specialties, daily price, and profile information."
                icon={<FiUser />}
              />
            }
          />

          <Route
            path="bookings"
            element={
              <TemporaryPage
                title="Bookings"
                description="Customer travel guide bookings will be displayed and managed here."
                icon={<FiCalendar />}
              />
            }
          />

          <Route
            path="availability"
            element={
              <TemporaryPage
                title="Availability"
                description="Update your availability status and available working dates here."
                icon={<MdWorkOutline />}
              />
            }
          />

          <Route
            path="languages"
            element={
              <TemporaryPage
                title="Languages & Skills"
                description="Manage your spoken languages, specialties, and travel guide skills here."
                icon={<FaLanguage />}
              />
            }
          />

          <Route
            path="reviews"
            element={
              <TemporaryPage
                title="Reviews"
                description="Customer ratings and reviews for your travel guide services will appear here."
                icon={<MdOutlineRateReview />}
              />
            }
          />

          <Route
            path="earnings"
            element={
              <TemporaryPage
                title="Earnings"
                description="View your travel guide booking income and payment information here."
                icon={<FaMoneyBillWave />}
              />
            }
          />

          <Route
            path="reports"
            element={
              <TemporaryPage
                title="Reports"
                description="Travel guide booking, income, rating, and performance reports will be displayed here."
                icon={<FiBarChart2 />}
              />
            }
          />

          <Route
            path="settings"
            element={
              <TemporaryPage
                title="Settings"
                description="Manage travel guide account and notification settings here."
                icon={<MdSettings />}
              />
            }
          />

          <Route
            path="*"
            element={
              <Navigate to="/guide" replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function TemporaryPage({
  title,
  description,
  icon,
}) {
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

function getUserName(user) {
  if (!user) {
    return "Guide";
  }

  if (user.name) {
    return user.name;
  }

  const fullName = [
    user.firstName,
    user.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    user.username ||
    user.email ||
    "Guide"
  );
}