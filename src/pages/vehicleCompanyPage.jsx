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
  MdEventAvailable,
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
import { FaCar } from "react-icons/fa";

import VehicleCompanyDashboardPage from "./vehicleCompany/vehicleCompanyDashboardPage";
import VehicleCompanyMyVehiclePage from "./vehicleCompany/vehicleCompanyMyVehiclePage";
import VehicleCompanyBookingsPage from "./vehicleCompany/vehicleCompanyBookingsPage";
import VehicleCompanyVehicleAvailabilityPage from "./vehicleCompany/vehicleCompanyVehicleAvailabilityPage";
import VehicleCompanyReviewsPage from "./vehicleCompany/vehicleCompanyReviewsPage";
import VehicleCompanyReportsPage from "./vehicleCompany/vehicleCompanyReportsPage";
import VehicleCompanySettingsPage from "./vehicleCompany/vehicleCompanySettingsPage";

const MENU_ITEMS = [
  {
    path: "/vehicle-company",
    label: "Dashboard",
    icon: <MdDashboard />,
    end: true,
  },
  {
    path: "/vehicle-company/vehicles",
    label: "My Vehicles",
    icon: <FaCar />,
  },
  {
    path: "/vehicle-company/bookings",
    label: "Bookings",
    icon: <FiCalendar />,
  },
  {
    path: "/vehicle-company/availability",
    label: "Vehicle Availability",
    icon: <MdEventAvailable />,
  },
  {
    path: "/vehicle-company/reviews",
    label: "Reviews",
    icon: <MdOutlineRateReview />,
  },
  {
    path: "/vehicle-company/reports",
    label: "Reports",
    icon: <FiBarChart2 />,
  },
  {
    path: "/vehicle-company/settings",
    label: "Settings",
    icon: <MdSettings />,
  },
];

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export default function VehicleCompanyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const role = normalizeRole(
    loggedInUser?.role || localStorage.getItem("role") || ""
  );

  if (
    role !== "vehicle_company" &&
    role !== "vehicle_comapny" &&
    role !== "admin"
  ) {
    return <Navigate to="/" replace />;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  }

  const companyDisplayName =
    loggedInUser?.companyName ||
    loggedInUser?.name ||
    "Vehicle Company";

  return (
    <div className="flex min-h-screen w-full bg-accent">
      <button
        type="button"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-[15px] top-[15px] z-40 flex h-[42px] w-[42px] items-center justify-center rounded-lg bg-accent text-white shadow-lg lg:hidden"
        aria-label="Open vehicle company menu"
      >
        <FiMenu />
      </button>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close vehicle company menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 min-h-screen w-[250px] bg-accent text-primary transition-transform duration-300 lg:static ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex h-[100px] w-full items-center justify-between border-b border-white/10 px-[10px]">
          <Link
            to="/vehicle-company"
            onClick={() => setSidebarOpen(false)}
            className="flex min-w-0 items-center gap-[8px]"
          >
            <img
              src="/logo.png"
              alt="Travel Ease logo"
              className="h-[50px] w-[110px] shrink-0 object-contain"
            />

            <div className="min-w-0">
              <h1 className="whitespace-nowrap text-base font-bold text-white">
                Vehicle Company
              </h1>
              <p className="max-w-[105px] truncate text-xs text-white/70">
                {companyDisplayName}
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

        <nav className="flex w-full flex-col gap-[10px] px-[20px] py-[20px] text-primary">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex min-h-[38px] w-full items-center gap-[8px] rounded-lg px-[10px] transition ${
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
            className="flex min-h-[38px] w-full items-center gap-[8px] rounded-lg px-[10px] text-primary transition hover:bg-red-600 hover:text-white"
          >
            <FiLogOut />
            Logout
          </button>
        </nav>
      </aside>

      <main className="min-h-screen min-w-0 flex-1 overflow-y-auto bg-primary lg:rounded-3xl lg:border-[10px] lg:border-accent">
        <Routes>
          <Route index element={<VehicleCompanyDashboardPage />} />
          <Route path="vehicles" element={<VehicleCompanyMyVehiclePage />} />
          <Route path="bookings" element={<VehicleCompanyBookingsPage />} />
          <Route
            path="availability"
            element={<VehicleCompanyVehicleAvailabilityPage />}
          />
          <Route path="reviews" element={<VehicleCompanyReviewsPage />} />
          <Route path="reports" element={<VehicleCompanyReportsPage />} />
          <Route path="settings" element={<VehicleCompanySettingsPage />} />
          <Route path="*" element={<Navigate to="/vehicle-company" replace />} />
        </Routes>
      </main>
    </div>
  );
}
