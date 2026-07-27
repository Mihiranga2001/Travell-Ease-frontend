import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaClock,
  FaMoneyBillWave,
  FaStar,
  FaUserTie,
} from "react-icons/fa";
import {
  MdOutlinePendingActions,
  MdRefresh,
} from "react-icons/md";
import {
  FiArrowRight,
  FiCalendar,
} from "react-icons/fi";
import {
  API_URL,
  axios,
  extractObject,
  formatCurrency,
  formatDateRange,
  getApiErrorMessage,
  getAuthConfig,
  getGuideName,
  getLoggedInUser,
  getTravelerName,
  safeRating,
} from "./guideApi";

export default function GuideDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const loggedInUser = useMemo(
    () => getLoggedInUser(),
    []
  );

  async function loadDashboard() {
    try {
      setLoading(true);
      setLoadError("");

      const response = await axios.get(
        `${API_URL}/travel-guides/my/dashboard`,
        getAuthConfig()
      );

      setDashboard(
        extractObject(response.data, ["dashboard", "data"])
      );
    } catch (error) {
      console.error("Guide dashboard load error:", error);
      const message = getApiErrorMessage(
        error,
        "Failed to load guide dashboard"
      );
      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const guide = dashboard?.guide || null;
  const summary = dashboard?.summary || {};
  const bookings = Array.isArray(dashboard?.bookings)
    ? dashboard.bookings
    : [];
  const reviews = Array.isArray(dashboard?.reviews)
    ? dashboard.reviews
    : [];

  const statistics = [
    {
      title: "Total Bookings",
      value: summary.totalBookings || 0,
      description: `${summary.pendingBookings || 0} pending`,
      icon: <FiCalendar />,
      color: "bg-purple-600",
    },
    {
      title: "Approved",
      value: summary.approvedBookings || 0,
      description: `${summary.completedBookings || 0} completed`,
      icon: <FaCalendarCheck />,
      color: "bg-green-600",
    },
    {
      title: "Rating",
      value: safeRating(guide?.rating).toFixed(1),
      description: `${guide?.reviewCount || 0} review(s)`,
      icon: <FaStar />,
      color: "bg-orange",
    },
    {
      title: "Total Earnings",
      value: `Rs. ${formatCurrency(summary.totalEarnings)}`,
      description: "Completed bookings",
      icon: <FaMoneyBillWave />,
      color: "bg-blue-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Welcome, {loggedInUser?.name || getGuideName(guide)}
          </h1>
          <p className="text-gray-500 mt-[5px]">
            View your profile status, bookings, ratings and earnings.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          disabled={loading}
          className="w-fit flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
        >
          <MdRefresh className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {loadError && (
        <div className="mb-[25px] rounded-xl border border-red-200 bg-red-50 p-[15px] text-red-700">
          {loadError}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        {statistics.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[20px] mb-[25px]">
        <SummaryCard title="Profile Status" icon={<FaUserTie />}>
          <SummaryRow
            label="Approval"
            value={guide?.isApproved ? "Approved" : "Pending"}
            icon={
              guide?.isApproved ? (
                <FaCheckCircle className="text-green-600" />
              ) : (
                <FaClock className="text-orange" />
              )
            }
          />
          <SummaryRow
            label="Availability"
            value={
              guide?.isAvailable !== false
                ? "Available"
                : "Unavailable"
            }
            icon={<FaCheckCircle className="text-blue-600" />}
          />
          <SummaryRow
            label="Daily Price"
            value={`Rs. ${formatCurrency(guide?.pricePerDay)}`}
            icon={<FaMoneyBillWave className="text-purple-600" />}
          />
          <SummaryRow
            label="Languages"
            value={guide?.languages?.length || 0}
            icon={<FaUserTie className="text-blue-600" />}
          />
        </SummaryCard>

        <SummaryCard title="Booking Status" icon={<FiCalendar />}>
          <SummaryRow
            label="Pending"
            value={summary.pendingBookings || 0}
            icon={<MdOutlinePendingActions className="text-orange" />}
          />
          <SummaryRow
            label="Approved"
            value={summary.approvedBookings || 0}
            icon={<FaCheckCircle className="text-green-600" />}
          />
          <SummaryRow
            label="Completed"
            value={summary.completedBookings || 0}
            icon={<FaCalendarCheck className="text-blue-600" />}
          />
          <SummaryRow
            label="Rejected"
            value={summary.rejectedBookings || 0}
            icon={<FaClock className="text-red-600" />}
          />
        </SummaryCard>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[5px]">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-500 mb-[18px]">
            Open the main travel guide management pages.
          </p>

          <div className="space-y-[10px]">
            <QuickLink
              to="/guide/profile"
              title="Manage Profile"
              description="Update experience and daily price."
              icon={<FaUserTie />}
            />
            <QuickLink
              to="/guide/bookings"
              title="View Bookings"
              description="Review and update booking requests."
              icon={<FiCalendar />}
            />
            <QuickLink
              to="/guide/availability"
              title="Availability"
              description="Change your current service status."
              icon={<FaCheckCircle />}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <RecentBookings bookings={bookings} loading={loading} />
        <RecentReviews reviews={reviews} loading={loading} />
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
  color,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">
          {value}
        </h2>
        <p className="text-xs text-gray-400 mt-[4px]">
          {description}
        </p>
      </div>
      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
      <div className="flex items-center gap-[8px] mb-[18px]">
        <span className="text-accent text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="space-y-[12px]">{children}</div>
    </div>
  );
}

function SummaryRow({ label, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-gray-50 px-[14px] py-[11px]">
      <div className="flex items-center gap-[9px]">
        {icon}
        <span className="text-sm font-medium text-gray-600">
          {label}
        </span>
      </div>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}

function QuickLink({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-[12px] rounded-xl border border-gray-200 p-[13px] hover:border-accent hover:bg-accent/5 transition"
    >
      <div className="flex items-center gap-[12px]">
        <div className="w-[38px] h-[38px] rounded-lg bg-accent text-white flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="text-xs text-gray-500 mt-[2px]">
            {description}
          </p>
        </div>
      </div>
      <FiArrowRight className="text-accent shrink-0" />
    </Link>
  );
}

function RecentBookings({ bookings, loading }) {
  return (
    <Panel
      title="Recent Bookings"
      subtitle="Latest traveler booking requests."
      to="/guide/bookings"
    >
      {loading ? (
        <Empty text="Loading..." />
      ) : bookings.length === 0 ? (
        <Empty text="No booking requests are available." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="py-[10px]">Traveler</th>
                <th className="py-[10px]">Dates</th>
                <th className="py-[10px]">Amount</th>
                <th className="py-[10px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr
                  key={booking._id}
                  className="border-b text-sm last:border-b-0"
                >
                  <td className="py-[12px]">
                    {getTravelerName(booking)}
                  </td>
                  <td className="py-[12px] text-gray-500">
                    {formatDateRange(
                      booking.startDate,
                      booking.endDate
                    )}
                  </td>
                  <td className="py-[12px]">
                    Rs. {formatCurrency(booking.totalAmount)}
                  </td>
                  <td className="py-[12px]">
                    <StatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

function RecentReviews({ reviews, loading }) {
  return (
    <Panel
      title="Recent Reviews"
      subtitle="Latest customer feedback."
      to="/guide/reviews"
    >
      {loading ? (
        <Empty text="Loading..." />
      ) : reviews.length === 0 ? (
        <Empty text="No reviews are available." />
      ) : (
        <div className="space-y-[12px]">
          {reviews.slice(0, 4).map((review) => (
            <div
              key={review._id}
              className="border-b border-gray-100 pb-[12px] last:border-b-0"
            >
              <div className="flex items-center justify-between gap-[10px]">
                <p className="font-semibold text-gray-800">
                  {getTravelerName(review)}
                </p>
                <p className="flex items-center gap-[4px] text-orange font-semibold">
                  <FaStar />
                  {safeRating(review.rating).toFixed(1)}
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-[5px] line-clamp-2">
                {review.comment || "No written comment."}
              </p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Panel({ title, subtitle, to, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
      <div className="flex items-center justify-between gap-[10px] mb-[18px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <Link
          to={to}
          className="text-sm font-semibold text-accent hover:text-orange"
        >
          View All
        </Link>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="min-h-[180px] flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}

function StatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();
  const color =
    normalized === "approved"
      ? "bg-green-600"
      : normalized === "completed"
        ? "bg-blue-600"
        : normalized === "rejected"
          ? "bg-red-600"
          : normalized === "cancelled"
            ? "bg-gray-500"
            : "bg-orange";

  return (
    <span
      className={`inline-flex px-[9px] py-[4px] rounded-full text-[11px] font-semibold text-white ${color}`}
    >
      {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
    </span>
  );
}
