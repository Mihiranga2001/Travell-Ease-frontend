import {
  MdDashboard,
  MdDirectionsCar,
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
import { FaCar, FaClipboardList } from "react-icons/fa";
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useMemo, useState } from "react";

const MENU_ITEMS = [
  {
    path: "/vehicles",
    label: "Dashboard",
    icon: <MdDashboard />,
    end: true,
  },
  {
    path: "/vehicles/my-vehicles",
    label: "My Vehicles",
    icon: <FaCar />,
  },
  {
    path: "/vehicles/bookings",
    label: "Bookings",
    icon: <FiCalendar />,
  },
  {
    path: "/vehicles/requests",
    label: "Rental Requests",
    icon: <FaClipboardList />,
  },
  {
    path: "/vehicles/reviews",
    label: "Reviews",
    icon: <MdOutlineRateReview />,
  },
  {
    path: "/vehicles/reports",
    label: "Reports",
    icon: <FiBarChart2 />,
  },
  {
    path: "/vehicles/settings",
    label: "Settings",
    icon: <MdSettings />,
  },
];

export default function VehicleCompanyPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const loggedInUser = useMemo(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  }, []);

  const token = localStorage.getItem("token");

  const role = String(
    loggedInUser?.role || localStorage.getItem("role") || ""
  )
    .trim()
    .toLowerCase();

  if (!token || !loggedInUser) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "vehicle_company" && role !== "admin") {
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

  const companyDisplayName =
    loggedInUser?.companyName ||
    loggedInUser?.businessName ||
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
          onClick={closeSidebar}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close vehicle company menu"
        />
      )}

      <aside
        className={
          "fixed left-0 top-0 z-50 min-h-screen w-[250px] bg-accent text-primary transition-transform duration-300 lg:static " +
          (sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0")
        }
      >
        <div className="flex h-[100px] w-full items-center justify-between border-b border-white/10 px-[10px]">
          <Link
            to="/vehicles"
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
                Vehicle Company
              </h1>
              <p className="max-w-[95px] truncate text-xs text-white/70">
                {companyDisplayName}
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={closeSidebar}
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
              onClick={closeSidebar}
              className={({ isActive }) =>
                "flex min-h-[38px] w-full items-center gap-[8px] rounded-lg px-[10px] transition " +
                (isActive
                  ? "bg-primary text-accent"
                  : "text-primary hover:bg-white/10")
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
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
          <Route
            index
            element={
              <VehicleCompanyDashboardPage
                companyName={companyDisplayName}
              />
            }
          />

          <Route
            path="my-vehicles"
            element={<VehicleCompanyMyVehiclesPage />}
          />

          <Route
            path="bookings"
            element={
              <TemporaryPage
                title="Bookings"
                description="Vehicle booking management will be connected here."
                icon={<FiCalendar />}
              />
            }
          />

          <Route
            path="requests"
            element={
              <TemporaryPage
                title="Rental Requests"
                description="New vehicle rental requests will be reviewed here."
                icon={<FaClipboardList />}
              />
            }
          />

          <Route
            path="reviews"
            element={
              <TemporaryPage
                title="Reviews"
                description="Customer reviews for your vehicles will be displayed here."
                icon={<MdOutlineRateReview />}
              />
            }
          />

          <Route
            path="reports"
            element={
              <TemporaryPage
                title="Reports"
                description="Vehicle usage, revenue, and booking reports will be displayed here."
                icon={<FiBarChart2 />}
              />
            }
          />

          <Route
            path="settings"
            element={
              <TemporaryPage
                title="Settings"
                description="Vehicle company account settings will be added here."
                icon={<MdSettings />}
              />
            }
          />

          <Route
            path="*"
            element={<Navigate to="/vehicles" replace />}
          />
        </Routes>
      </main>
    </div>
  );
}

function VehicleCompanyDashboardPage({ companyName }) {
  return (
    <div className="min-h-screen w-full p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px]">
        <h1 className="text-3xl font-bold text-accent">
          Vehicle Company Dashboard
        </h1>
        <p className="mt-[5px] text-gray-500">
          Welcome, {companyName}. Manage your vehicles and rental activities
          here.
        </p>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <DashboardCard
          title="Total Vehicles"
          value="0"
          icon={<FaCar />}
          color="bg-blue-600"
        />
        <DashboardCard
          title="Approved Vehicles"
          value="0"
          icon={<MdDirectionsCar />}
          color="bg-green-600"
        />
        <DashboardCard
          title="Pending Approval"
          value="0"
          icon={<FaClipboardList />}
          color="bg-orange"
        />
        <DashboardCard
          title="Bookings"
          value="0"
          icon={<FiCalendar />}
          color="bg-purple-600"
        />
      </div>

      <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
        <div className="mb-[20px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-accent text-4xl text-white">
          <FaCar />
        </div>

        <h2 className="mb-[10px] text-2xl font-bold text-gray-800">
          Manage Your Vehicle Business
        </h2>

        <p className="max-w-[680px] leading-7 text-gray-500">
          Add vehicles, update vehicle details, manage availability, and check
          administrator approval status.
        </p>

        <Link
          to="/vehicles/my-vehicles"
          className="mt-[20px] rounded-lg bg-accent px-[20px] py-[10px] font-semibold text-white transition hover:opacity-90"
        >
          Manage My Vehicles
        </Link>
      </div>
    </div>
  );
}

function VehicleCompanyMyVehiclesPage() {
  return (
    <div className="min-h-screen w-full p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px]">
        <h1 className="text-3xl font-bold text-accent">My Vehicles</h1>
        <p className="mt-[5px] text-gray-500">
          Add and manage vehicles belonging to your company.
        </p>
      </div>

      <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
        <div className="mb-[20px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-accent text-4xl text-white">
          <FaCar />
        </div>

        <h2 className="mb-[10px] text-2xl font-bold text-gray-800">
          Vehicle Management
        </h2>

        <p className="max-w-[700px] leading-7 text-gray-500">
          Your vehicle form and vehicle list can be connected on this page.
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-[6px] text-3xl font-bold text-gray-800">
          {value}
        </h2>
      </div>

      <div
        className={
          color +
          " flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white"
        }
      >
        {icon}
      </div>
    </div>
  );
}

function TemporaryPage({ title, description, icon }) {
  return (
    <div className="min-h-screen w-full p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px]">
        <h1 className="text-3xl font-bold text-accent">{title}</h1>
        <p className="mt-[5px] text-gray-500">{description}</p>
      </div>

      <div className="flex min-h-[430px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
        <div className="mb-[20px] flex h-[80px] w-[80px] items-center justify-center rounded-full bg-accent text-4xl text-white">
          {icon}
        </div>

        <h2 className="mb-[10px] text-2xl font-bold text-gray-800">
          {title}
        </h2>

        <p className="max-w-[680px] leading-7 text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
}