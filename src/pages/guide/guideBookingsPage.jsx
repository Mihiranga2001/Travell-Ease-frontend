import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaSearch,
} from "react-icons/fa";
import {
  FiCalendar,
  FiRefreshCw,
} from "react-icons/fi";
import {
  API_URL,
  axios,
  extractList,
  formatCurrency,
  formatDateRange,
  getApiErrorMessage,
  getAuthConfig,
  getTravelerName,
} from "./guideApi";

export default function GuideBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function loadBookings() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my/bookings`,
        getAuthConfig()
      );

      setBookings(
        extractList(response.data, ["bookings", "data", "results"])
      );
    } catch (error) {
      setBookings([]);
      toast.error(
        getApiErrorMessage(error, "Failed to load bookings")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !search ||
        getTravelerName(booking)
          .toLowerCase()
          .includes(search) ||
        String(booking.specialRequests || "")
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        statusFilter === "all" ||
        String(booking.status || "pending").toLowerCase() ===
          statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchText, statusFilter]);

  async function updateStatus(booking, status) {
    const confirmed = window.confirm(
      `Change this booking to ${status}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingId(booking._id);

      await axios.patch(
        `${API_URL}/travel-guides/my/bookings/${booking._id}/status`,
        { status },
        getAuthConfig()
      );

      setBookings((current) =>
        current.map((item) =>
          item._id === booking._id
            ? { ...item, status }
            : item
        )
      );

      toast.success("Booking status updated");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update booking status"
        )
      );
    } finally {
      setUpdatingId("");
    }
  }

  const pending = bookings.filter(
    (item) => item.status === "pending"
  ).length;
  const approved = bookings.filter(
    (item) => item.status === "approved"
  ).length;
  const completed = bookings.filter(
    (item) => item.status === "completed"
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <Header
        title="Bookings"
        description="Review traveler requests and update booking status."
        loading={loading}
        onRefresh={loadBookings}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <Stat title="Total Bookings" value={bookings.length} icon={<FiCalendar />} color="bg-blue-600" />
        <Stat title="Pending" value={pending} icon={<FaCalendarCheck />} color="bg-orange" />
        <Stat title="Approved" value={approved} icon={<FaCheckCircle />} color="bg-green-600" />
        <Stat title="Completed" value={completed} icon={<FaCalendarCheck />} color="bg-purple-600" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute left-[14px] top-[15px] text-gray-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search traveler or special request"
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        {loading ? (
          <Empty text="Loading bookings..." />
        ) : filteredBookings.length === 0 ? (
          <Empty text="No matching bookings found." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="py-[12px]">Traveler</th>
                  <th className="py-[12px]">Dates</th>
                  <th className="py-[12px]">Days</th>
                  <th className="py-[12px]">Amount</th>
                  <th className="py-[12px]">Payment</th>
                  <th className="py-[12px]">Request</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking._id} className="border-b text-sm">
                    <td className="py-[14px] font-semibold">
                      {getTravelerName(booking)}
                    </td>
                    <td className="py-[14px] text-gray-600">
                      {formatDateRange(
                        booking.startDate,
                        booking.endDate
                      )}
                    </td>
                    <td className="py-[14px]">
                      {booking.numberOfDays || 0}
                    </td>
                    <td className="py-[14px] font-semibold">
                      Rs. {formatCurrency(booking.totalAmount)}
                    </td>
                    <td className="py-[14px]">
                      <PaymentBadge status={booking.paymentStatus} />
                    </td>
                    <td className="py-[14px] max-w-[230px] text-gray-600">
                      <p className="line-clamp-2">
                        {booking.specialRequests || "No special request"}
                      </p>
                    </td>
                    <td className="py-[14px]">
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="py-[14px]">
                      <div className="flex justify-center gap-[7px]">
                        {booking.status === "pending" && (
                          <>
                            <Action
                              label="Approve"
                              disabled={updatingId === booking._id}
                              className="bg-green-600"
                              onClick={() =>
                                updateStatus(booking, "approved")
                              }
                            />
                            <Action
                              label="Reject"
                              disabled={updatingId === booking._id}
                              className="bg-red-600"
                              onClick={() =>
                                updateStatus(booking, "rejected")
                              }
                            />
                          </>
                        )}
                        {booking.status === "approved" && (
                          <Action
                            label="Complete"
                            disabled={updatingId === booking._id}
                            className="bg-blue-600"
                            onClick={() =>
                              updateStatus(booking, "completed")
                            }
                          />
                        )}
                        {!["pending", "approved"].includes(
                          booking.status
                        ) && (
                          <span className="text-gray-400">
                            No action
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Header({ title, description, loading, onRefresh }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
      <div>
        <h1 className="text-3xl font-bold text-accent">{title}</h1>
        <p className="text-gray-500 mt-[5px]">{description}</p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="w-fit inline-flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white disabled:opacity-60"
      >
        <FiRefreshCw className={loading ? "animate-spin" : ""} />
        Refresh
      </button>
    </div>
  );
}

function Stat({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold mt-[6px]">{value}</h2>
      </div>
      <div className={`${color} w-[55px] h-[55px] rounded-full text-white text-2xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

function Action({ label, className, ...props }) {
  return (
    <button
      type="button"
      className={`${className} text-white px-[11px] py-[7px] rounded-lg text-xs font-semibold disabled:opacity-60`}
      {...props}
    >
      {label}
    </button>
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
  return <Badge text={normalized} color={color} />;
}

function PaymentBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();
  const color =
    normalized === "paid"
      ? "bg-green-600"
      : normalized === "refunded"
        ? "bg-gray-500"
        : "bg-orange";
  return <Badge text={normalized} color={color} />;
}

function Badge({ text, color }) {
  return (
    <span className={`inline-flex px-[9px] py-[4px] rounded-full text-[11px] font-semibold text-white ${color}`}>
      {text.charAt(0).toUpperCase() + text.slice(1)}
    </span>
  );
}

function Empty({ text }) {
  return (
    <div className="min-h-[280px] flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}
