import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaCar,
  FaCheckCircle,
  FaSearch,
  FaTimesCircle,
  FaUser,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { MdOutlinePendingActions } from "react-icons/md";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";
const API_URL = `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")}/api`;

export default function VehicleCompanyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  function getAuthConfig() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in again");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  function getErrorMessage(error, fallback) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  }

  async function loadBookings() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/vehicle-bookings/company/my`,
        getAuthConfig()
      );
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.bookings || response.data?.data || [];
      setBookings(list);
    } catch (error) {
      console.error("Load vehicle bookings error:", error);
      setBookings([]);
      toast.error(getErrorMessage(error, "Failed to load vehicle bookings"));
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
      const vehicleName = booking.vehicleId?.model || booking.vehicle?.model || "";
      const travelerName =
        booking.travelerId?.name ||
        booking.travelerId?.email ||
        booking.traveler?.name ||
        "";
      const status = normalizeStatus(booking.status);

      const matchesSearch =
        !search ||
        vehicleName.toLowerCase().includes(search) ||
        travelerName.toLowerCase().includes(search) ||
        String(booking._id || "").toLowerCase().includes(search);

      const matchesStatus = statusFilter === "all" || status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchText, statusFilter]);

  async function updateStatus(booking, status) {
    const message =
      status === "rejected"
        ? window.prompt("Optional rejection message:", booking.companyMessage || "")
        : "";

    if (status === "rejected" && message === null) return;

    const label = status === "approved" ? "approve" : status === "completed" ? "complete" : "reject";
    if (!window.confirm(`Are you sure you want to ${label} this booking?`)) return;

    try {
      setUpdatingId(booking._id);
      const response = await axios.patch(
        `${API_URL}/vehicle-bookings/company/${booking._id}/status`,
        {
          status,
          companyMessage: message || booking.companyMessage || "",
        },
        getAuthConfig()
      );

      const updated = response.data?.booking;
      setBookings((previous) =>
        previous.map((item) =>
          item._id === booking._id ? updated || { ...item, status } : item
        )
      );
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      console.error("Update booking status error:", error);
      toast.error(getErrorMessage(error, "Failed to update booking status"));
    } finally {
      setUpdatingId("");
    }
  }

  const total = bookings.length;
  const pending = bookings.filter((item) => normalizeStatus(item.status) === "pending").length;
  const approved = bookings.filter((item) => normalizeStatus(item.status) === "approved").length;
  const completed = bookings.filter((item) => normalizeStatus(item.status) === "completed").length;
  const rejected = bookings.filter((item) => normalizeStatus(item.status) === "rejected").length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Vehicle Bookings</h1>
          <p className="mt-[5px] text-gray-500">
            Review customer rental requests and update their booking status.
          </p>
        </div>
        <button
          type="button"
          onClick={loadBookings}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total" value={total} icon={<FaCalendarCheck />} color="bg-blue-600" />
        <StatCard title="Pending" value={pending} icon={<MdOutlinePendingActions />} color="bg-orange" />
        <StatCard title="Approved" value={approved} icon={<FaCheckCircle />} color="bg-green-600" />
        <StatCard title="Completed" value={completed} icon={<FaCalendarCheck />} color="bg-purple-600" />
        <StatCard title="Rejected" value={rejected} icon={<FaTimesCircle />} color="bg-red-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search booking, customer or vehicle"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Booking Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center text-gray-500">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="flex min-h-[260px] items-center justify-center text-gray-500">No matching bookings found.</div>
        ) : (
          <div className="space-y-[14px]">
            {filteredBookings.map((booking) => {
              const status = normalizeStatus(booking.status);
              const updating = updatingId === booking._id;
              const vehicle = booking.vehicleId || booking.vehicle || {};
              const traveler = booking.travelerId || booking.traveler || {};

              return (
                <article key={booking._id} className="rounded-xl border border-gray-200 p-[16px]">
                  <div className="flex flex-col gap-[16px] xl:flex-row xl:items-center xl:justify-between">
                    <div className="grid flex-1 grid-cols-1 gap-[14px] md:grid-cols-2 xl:grid-cols-4">
                      <InfoBlock icon={<FaCar />} label="Vehicle" value={vehicle.model || "Vehicle not available"} />
                      <InfoBlock icon={<FaUser />} label="Customer" value={traveler.name || traveler.email || "Customer"} />
                      <InfoBlock icon={<FaCalendarCheck />} label="Rental Dates" value={`${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`} />
                      <InfoBlock icon={<FaCalendarCheck />} label="Total" value={`Rs. ${formatCurrency(booking.totalPrice)}`} />
                    </div>

                    <div className="flex min-w-[240px] flex-col items-start gap-[10px] xl:items-end">
                      <StatusBadge status={status} />
                      <div className="flex flex-wrap gap-[8px]">
                        {status === "pending" && (
                          <>
                            <ActionButton disabled={updating} onClick={() => updateStatus(booking, "approved")} className="bg-green-600 hover:bg-green-700">
                              Approve
                            </ActionButton>
                            <ActionButton disabled={updating} onClick={() => updateStatus(booking, "rejected")} className="bg-red-600 hover:bg-red-700">
                              Reject
                            </ActionButton>
                          </>
                        )}
                        {status === "approved" && (
                          <ActionButton disabled={updating} onClick={() => updateStatus(booking, "completed")} className="bg-purple-600 hover:bg-purple-700">
                            Mark Completed
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>

                  {(booking.pickupLocation || booking.dropoffLocation || booking.specialRequests || booking.companyMessage) && (
                    <div className="mt-[14px] grid grid-cols-1 gap-[10px] rounded-lg bg-gray-50 p-[12px] text-sm text-gray-600 md:grid-cols-2">
                      {booking.pickupLocation && <p><strong>Pickup:</strong> {booking.pickupLocation}</p>}
                      {booking.dropoffLocation && <p><strong>Drop-off:</strong> {booking.dropoffLocation}</p>}
                      {booking.specialRequests && <p><strong>Request:</strong> {booking.specialRequests}</p>}
                      {booking.companyMessage && <p><strong>Company message:</strong> {booking.companyMessage}</p>}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[18px] shadow-md">
      <div><p className="text-sm text-gray-500">{title}</p><h2 className="mt-[5px] text-3xl font-bold">{value}</h2></div>
      <div className={`${color} flex h-[50px] w-[50px] items-center justify-center rounded-full text-xl text-white`}>{icon}</div>
    </div>
  );
}

function InfoBlock({ icon, label, value }) {
  return (
    <div className="flex items-start gap-[9px]">
      <span className="mt-[3px] text-accent">{icon}</span>
      <div className="min-w-0"><p className="text-xs text-gray-400">{label}</p><p className="truncate font-semibold text-gray-700">{value}</p></div>
    </div>
  );
}

function ActionButton({ children, className, ...props }) {
  return <button type="button" {...props} className={`${className} rounded-lg px-[13px] py-[8px] text-sm font-semibold text-white disabled:opacity-50`}>{children}</button>;
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange/10 text-orange",
    approved: "bg-green-100 text-green-700",
    completed: "bg-purple-100 text-purple-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-700",
  };
  return <span className={`rounded-full px-[11px] py-[5px] text-xs font-semibold capitalize ${styles[status] || styles.pending}`}>{status}</span>;
}

function normalizeStatus(status) {
  return String(status || "pending").trim().toLowerCase();
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString("en-LK", { year: "numeric", month: "short", day: "numeric" });
}

function formatCurrency(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toLocaleString("en-LK", { maximumFractionDigits: 2 }) : "0";
}
