import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaCheckCircle,
  FaHotel,
  FaSearch,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  api,
  extractBookings,
  formatCurrency,
  formatDate,
  getApiErrorMessage,
} from "./hotelApi";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected", "completed", "cancelled"];

export default function HotelOwnerBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState("");

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/bookings/owner/my");
      setBookings(extractBookings(response));
    } catch (error) {
      setBookings([]);
      toast.error(
        getApiErrorMessage(error, "Failed to load hotel bookings")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredBookings = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return bookings.filter((booking) => {
      const searchable = [
        booking.travelerId?.name,
        booking.travelerId?.email,
        booking.hotelId?.name,
        booking.roomTypeName,
        booking.status,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return (
        (!search || searchable.includes(search)) &&
        (statusFilter === "all" || booking.status === statusFilter)
      );
    });
  }, [bookings, searchText, statusFilter]);

  const counts = useMemo(
    () => ({
      total: bookings.length,
      pending: bookings.filter((booking) => booking.status === "pending").length,
      approved: bookings.filter((booking) => booking.status === "approved").length,
      completed: bookings.filter((booking) => booking.status === "completed").length,
    }),
    [bookings]
  );

  async function updateStatus(booking, status) {
    const message = window.prompt(
      status === "rejected"
        ? "Optional rejection message for the traveler:"
        : "Optional message for the traveler:",
      booking.ownerMessage || ""
    );

    if (message === null) {
      return;
    }

    if (
      !window.confirm(
        `${capitalize(status)} this booking for ${
          booking.travelerId?.name || "the traveler"
        }?`
      )
    ) {
      return;
    }

    try {
      setUpdatingId(booking._id);
      const response = await api.patch(`/bookings/owner/${booking._id}/status`, {
        status,
        ownerMessage: message,
      });
      const updatedBooking = response.data?.booking;

      setBookings((previous) =>
        previous.map((item) =>
          item._id === booking._id ? updatedBooking || { ...item, status } : item
        )
      );
      toast.success(`Booking ${status} successfully`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update booking status")
      );
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Bookings</h1>
          <p className="mt-[5px] text-gray-500">
            Review traveler requests and manage booking status.
          </p>
        </div>
        <button
          type="button"
          onClick={loadBookings}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Bookings" value={counts.total} icon={<FaCalendarCheck />} color="bg-blue-600" />
        <StatCard title="Pending" value={counts.pending} icon={<FaUsers />} color="bg-orange" />
        <StatCard title="Approved" value={counts.approved} icon={<FaCheckCircle />} color="bg-green-600" />
        <StatCard title="Completed" value={counts.completed} icon={<FaHotel />} color="bg-purple-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search traveler, hotel or room type"
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All Booking Status" : capitalize(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <MessagePanel message="Loading bookings..." />
      ) : filteredBookings.length === 0 ? (
        <MessagePanel message="No booking requests match the current filters." />
      ) : (
        <div className="space-y-[15px]">
          {filteredBookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              updating={updatingId === booking._id}
              onUpdateStatus={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, updating, onUpdateStatus }) {
  const status = booking.status || "pending";
  const traveler = booking.travelerId || {};
  const hotel = booking.hotelId || {};

  return (
    <article className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="flex flex-col gap-[15px] xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="mb-[12px] flex flex-wrap items-center gap-[10px]">
            <h2 className="text-xl font-bold text-gray-800">
              {hotel.name || "Hotel"}
            </h2>
            <StatusBadge status={status} />
          </div>

          <div className="grid grid-cols-1 gap-[10px] text-sm sm:grid-cols-2 xl:grid-cols-4">
            <Info label="Traveler" value={traveler.name || traveler.email || "Traveler"} />
            <Info label="Room Type" value={booking.roomTypeName || "Room"} />
            <Info label="Stay" value={`${formatDate(booking.checkInDate)} - ${formatDate(booking.checkOutDate)}`} />
            <Info label="Total" value={formatCurrency(booking.totalPrice)} />
            <Info label="Guests" value={`${booking.guests || 0}`} />
            <Info label="Rooms" value={`${booking.numberOfRooms || 1}`} />
            <Info label="Nights" value={`${booking.totalNights || 0}`} />
            <Info label="Requested" value={formatDate(booking.createdAt)} />
          </div>

          {booking.specialRequests && (
            <p className="mt-[12px] rounded-lg bg-gray-50 p-[10px] text-sm text-gray-600">
              <strong>Special request:</strong> {booking.specialRequests}
            </p>
          )}
          {booking.ownerMessage && (
            <p className="mt-[8px] rounded-lg bg-blue-50 p-[10px] text-sm text-blue-700">
              <strong>Your message:</strong> {booking.ownerMessage}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap gap-[8px] xl:max-w-[260px] xl:justify-end">
          {status === "pending" && (
            <>
              <ActionButton
                label="Approve"
                className="bg-green-600 hover:bg-green-700"
                disabled={updating}
                onClick={() => onUpdateStatus(booking, "approved")}
              />
              <ActionButton
                label="Reject"
                className="bg-red-600 hover:bg-red-700"
                disabled={updating}
                onClick={() => onUpdateStatus(booking, "rejected")}
              />
            </>
          )}
          {status === "approved" && (
            <ActionButton
              label="Mark Completed"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={updating}
              onClick={() => onUpdateStatus(booking, "completed")}
            />
          )}
          {updating && <span className="text-sm text-gray-500">Updating...</span>}
        </div>
      </div>
    </article>
  );
}

function ActionButton({ label, className, ...props }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-[14px] py-[9px] font-semibold text-white disabled:opacity-60 ${className}`}
      {...props}
    >
      {label}
    </button>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-[10px]">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-[2px] font-semibold text-gray-700">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange",
    approved: "bg-green-600",
    rejected: "bg-red-600",
    completed: "bg-blue-600",
    cancelled: "bg-gray-500",
  };

  return (
    <span className={`rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${styles[status] || styles.pending}`}>
      {capitalize(status)}
    </span>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-[5px] text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>
        {icon}
      </div>
    </div>
  );
}

function MessagePanel({ message }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
      <div className="mb-[15px] flex h-[75px] w-[75px] items-center justify-center rounded-full bg-gray-100 text-4xl text-gray-400">
        <FaCalendarCheck />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
