import {
  MdDashboard,
  MdOutlineRateReview,
  MdOutlinePendingActions,
  MdSettings,
} from "react-icons/md";

import {
  FiUsers,
  FiMapPin,
  FiImage,
  FiBarChart2,
} from "react-icons/fi";

import {
  FaHotel,
  FaCar,
  FaUserTie,
  FaRobot,
} from "react-icons/fa";

import { LuClipboardList } from "react-icons/lu";
import {
  NavLink,
  Route,
  Routes,
} from "react-router-dom";

import AdminDashboardPage from "./admin/adminDashboardPage";
import AdminUsersPage from "./admin/adminUsersPage";
import AdminTouristPlacesPage from "./admin/adminTouristPlacesPage";
import AdminHotelsPage from "./admin/adminHotelsPage";
import AdminVehiclesPage from "./admin/adminVehiclesPage";
import AdminTravelGuidesPage from "./admin/adminTravelGuidesPage";
import AdminBookingsPage from "./admin/adminBookingsPage";
import AdminMediaApprovalPage from "./admin/adminMediaApprovalPage";
import AdminReviewsPage from "./admin/adminReviewsPage";
import AdminApprovalsPage from "./admin/adminApprovalsPage";
import AdminAIMonitoringPage from "./admin/adminAIMonitoringPage";
import AdminReportsPage from "./admin/adminReportsPage";
import AdminSettingsPage from "./admin/adminSettingsPage";

export default function AdminPage() {
  const linkClass = ({ isActive }) =>
    `w-full flex items-center min-h-[42px] gap-[10px] px-[12px] py-[8px] rounded-lg transition ${
      isActive
        ? "bg-primary text-accent font-semibold"
        : "text-primary hover:bg-primary/20"
    }`;

  return (
    <div className="w-full min-h-screen bg-accent flex">
      {/* Sidebar */}
      <aside className="w-[250px] min-w-[250px] bg-accent min-h-screen">
        <div className="w-full h-[100px] gap-[10px] px-[15px] flex items-center text-primary">
          <img
            src="/logo.png"
            alt="Application logo"
            className="h-[50px] w-[140px] object-contain"
          />

          <h1 className="text-2xl font-bold">Admin</h1>
        </div>

        <nav className="w-full text-lg flex flex-col gap-[5px] px-[15px] pb-[25px]">
          <NavLink
            to="/admin"
            end
            className={linkClass}
          >
            <MdDashboard />
            Dashboard
          </NavLink>

          <NavLink
            to="/admin/users"
            className={linkClass}
          >
            <FiUsers />
            Users
          </NavLink>

          <NavLink
            to="/admin/places"
            className={linkClass}
          >
            <FiMapPin />
            Tourist Places
          </NavLink>

          <NavLink
            to="/admin/hotels"
            className={linkClass}
          >
            <FaHotel />
            Hotels
          </NavLink>

          <NavLink
            to="/admin/vehicles"
            className={linkClass}
          >
            <FaCar />
            Vehicles
          </NavLink>

          <NavLink
            to="/admin/travel-guides"
            className={linkClass}
          >
            <FaUserTie />
            Travel Guides
          </NavLink>

          <NavLink
            to="/admin/bookings"
            className={linkClass}
          >
            <LuClipboardList />
            Bookings
          </NavLink>

          <NavLink
            to="/admin/media"
            className={linkClass}
          >
            <FiImage />
            Media Approval
          </NavLink>

          <NavLink
            to="/admin/reviews"
            className={linkClass}
          >
            <MdOutlineRateReview />
            Reviews
          </NavLink>

          <NavLink
            to="/admin/approvals"
            className={linkClass}
          >
            <MdOutlinePendingActions />
            Approvals
          </NavLink>

          <NavLink
            to="/admin/ai-monitoring"
            className={linkClass}
          >
            <FaRobot />
            AI Monitoring
          </NavLink>

          <NavLink
            to="/admin/reports"
            className={linkClass}
          >
            <FiBarChart2 />
            Reports
          </NavLink>

          <NavLink
            to="/admin/settings"
            className={linkClass}
          >
            <MdSettings />
            Settings
          </NavLink>
        </nav>
      </aside>

      {/* Page content */}
      <main className="flex-1 min-w-0 min-h-screen bg-primary border-[10px] rounded-3xl border-accent overflow-hidden">
        <Routes>
          <Route
            index
            element={<AdminDashboardPage />}
          />

          <Route
            path="users"
            element={<AdminUsersPage />}
          />

          <Route
            path="places"
            element={<AdminTouristPlacesPage />}
          />

          <Route
            path="hotels"
            element={<AdminHotelsPage />}
          />

          <Route
            path="vehicles"
            element={<AdminVehiclesPage />}
          />

          <Route
            path="travel-guides"
            element={<AdminTravelGuidesPage />}
          />

          <Route
            path="bookings"
            element={<AdminBookingsPage />}
          />

          <Route
            path="media"
            element={<AdminMediaApprovalPage />}
          />

          <Route
            path="reviews"
            element={<AdminReviewsPage />}
          />

          <Route
            path="approvals"
            element={<AdminApprovalsPage />}
          />

          <Route
            path="ai-monitoring"
            element={<AdminAIMonitoringPage />}
          />

          <Route
            path="reports"
            element={<AdminReportsPage />}
          />

          <Route
            path="settings"
            element={<AdminSettingsPage />}
          />
        </Routes>
      </main>
    </div>
  );
}