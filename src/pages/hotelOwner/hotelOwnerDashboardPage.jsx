import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBed,
  FaCalendarCheck,
  FaCheckCircle,
  FaHotel,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import { FiArrowRight, FiCalendar, FiMapPin } from "react-icons/fi";
import { MdOutlinePendingActions, MdRefresh } from "react-icons/md";
import {
  api,
  extractBookings,
  extractHotels,
  formatDate,
  getApiErrorMessage,
  getHotelApprovalStatus,
  resolveAssetUrl,
} from "./hotelApi";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function HotelOwnerDashboardPage() {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelError, setHotelError] = useState("");
  const [bookingError, setBookingError] = useState("");
  const loggedInUser = useMemo(readStoredUser, []);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setHotelError("");
    setBookingError("");

    const [hotelResult, bookingResult] = await Promise.allSettled([
      api.get("/hotels/owner/my"),
      api.get("/bookings/owner/my"),
    ]);

    if (hotelResult.status === "fulfilled") {
      setHotels(extractHotels(hotelResult.value));
    } else {
      console.error("Hotel dashboard load error:", hotelResult.reason);
      setHotels([]);
      setHotelError(
        getApiErrorMessage(hotelResult.reason, "Failed to load your hotels")
      );
    }

    if (bookingResult.status === "fulfilled") {
      setBookings(extractBookings(bookingResult.value));
    } else {
      console.error("Booking dashboard load error:", bookingResult.reason);
      setBookings([]);
      setBookingError(
        getApiErrorMessage(
          bookingResult.reason,
          "Failed to load your hotel bookings"
        )
      );
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const summary = useMemo(() => {
    const approvedHotels = hotels.filter(
      (hotel) => getHotelApprovalStatus(hotel) === "approved"
    ).length;
    const pendingHotels = hotels.filter(
      (hotel) => getHotelApprovalStatus(hotel) === "pending"
    ).length;
    const rejectedHotels = hotels.filter(
      (hotel) => getHotelApprovalStatus(hotel) === "rejected"
    ).length;
    const availableHotels = hotels.filter(
      (hotel) =>
        getHotelApprovalStatus(hotel) === "approved" &&
        hotel.isAvailable !== false
    ).length;
    const totalRoomTypes = hotels.reduce(
      (total, hotel) =>
        total + (Array.isArray(hotel.roomTypes) ? hotel.roomTypes.length : 0),
      0
    );
    const pendingBookings = bookings.filter(
      (booking) => booking.status === "pending"
    ).length;
    const approvedBookings = bookings.filter(
      (booking) => booking.status === "approved"
    ).length;
    const rejectedBookings = bookings.filter(
      (booking) => booking.status === "rejected"
    ).length;
    const completedBookings = bookings.filter(
      (booking) => booking.status === "completed"
    ).length;

    return {
      approvedHotels,
      pendingHotels,
      rejectedHotels,
      availableHotels,
      totalRoomTypes,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      completedBookings,
    };
  }, [hotels, bookings]);

  const recentHotels = useMemo(
    () =>
      [...hotels]
        .sort(
          (first, second) =>
            new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
        )
        .slice(0, 4),
    [hotels]
  );

  const recentBookings = useMemo(
    () =>
      [...bookings]
        .sort(
          (first, second) =>
            new Date(second.createdAt || 0) - new Date(first.createdAt || 0)
        )
        .slice(0, 5),
    [bookings]
  );

  const statistics = [
    {
      title: "My Hotels",
      value: hotels.length,
      description: `${summary.approvedHotels} approved`,
      icon: <FaHotel />,
      color: "bg-blue-600",
    },
    {
      title: "Pending Hotels",
      value: summary.pendingHotels,
      description:
        summary.rejectedHotels > 0
          ? `${summary.rejectedHotels} rejected`
          : "Waiting for admin approval",
      icon: <MdOutlinePendingActions />,
      color: "bg-orange",
    },
    {
      title: "Total Bookings",
      value: bookings.length,
      description: `${summary.pendingBookings} pending`,
      icon: <FiCalendar />,
      color: "bg-purple-600",
    },
    {
      title: "Approved Bookings",
      value: summary.approvedBookings,
      description: `${summary.completedBookings} completed`,
      icon: <FaCalendarCheck />,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex w-full flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Welcome, {loggedInUser?.name || "Hotel Owner"}
          </h1>
          <p className="mt-[5px] text-gray-500">
            View hotel approvals, booking activity, room inventory and recent updates.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <MdRefresh className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((item) => (
          <DashboardStatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] xl:grid-cols-3">
        <SummaryCard title="Hotel Status" icon={<FaHotel />}>
          <SummaryRow
            label="Approved"
            value={summary.approvedHotels}
            icon={<FaCheckCircle className="text-green-600" />}
          />
          <SummaryRow
            label="Pending"
            value={summary.pendingHotels}
            icon={<MdOutlinePendingActions className="text-orange" />}
          />
          <SummaryRow
            label="Available"
            value={summary.availableHotels}
            icon={<FaBed className="text-purple-600" />}
          />
          <SummaryRow
            label="Room Types"
            value={summary.totalRoomTypes}
            icon={<FaBed className="text-blue-600" />}
          />
        </SummaryCard>

        <SummaryCard title="Booking Status" icon={<FiCalendar />}>
          <SummaryRow
            label="Pending"
            value={summary.pendingBookings}
            icon={<MdOutlinePendingActions className="text-orange" />}
          />
          <SummaryRow
            label="Approved"
            value={summary.approvedBookings}
            icon={<FaCheckCircle className="text-green-600" />}
          />
          <SummaryRow
            label="Rejected"
            value={summary.rejectedBookings}
            icon={<FaTimesCircle className="text-red-600" />}
          />
          <SummaryRow
            label="Completed"
            value={summary.completedBookings}
            icon={<FaCalendarCheck className="text-blue-600" />}
          />
        </SummaryCard>

        <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <h2 className="mb-[5px] text-xl font-bold text-gray-800">Quick Actions</h2>
          <p className="mb-[18px] text-sm text-gray-500">
            Open your main hotel-owner management pages.
          </p>
          <div className="space-y-[10px]">
            <QuickActionLink
              to="/hotel-owner/hotels"
              title="Manage My Hotels"
              description="Add hotels and update existing details."
              icon={<FaHotel />}
            />
            <QuickActionLink
              to="/hotel-owner/bookings"
              title="View Bookings"
              description="Approve, reject and complete booking requests."
              icon={<FiCalendar />}
            />
            <QuickActionLink
              to="/hotel-owner/rooms"
              title="Room Availability"
              description="Manage room inventory and availability."
              icon={<FaBed />}
            />
          </div>
        </div>
      </div>

      {(hotelError || bookingError) && (
        <div className="mb-[25px] rounded-xl border border-red-200 bg-red-50 p-[15px]">
          <p className="mb-[5px] font-semibold text-gray-800">
            Some dashboard information could not be loaded
          </p>
          {hotelError && <p className="text-sm text-gray-600">Hotels: {hotelError}</p>}
          {bookingError && (
            <p className="text-sm text-gray-600">Bookings: {bookingError}</p>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
        <RecentHotelsPanel hotels={recentHotels} loading={loading} />
        <RecentBookingsPanel bookings={recentBookings} loading={loading} />
      </div>
    </div>
  );
}

function DashboardStatCard({ title, value, description, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-[6px] text-3xl font-bold text-gray-800">{value}</h2>
        <p className="mt-[4px] text-xs text-gray-400">{description}</p>
      </div>
      <div className={`${color} flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white`}>
        {icon}
      </div>
    </div>
  );
}

function SummaryCard({ title, icon, children }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="mb-[18px] flex items-center gap-[8px]">
        <span className="text-xl text-accent">{icon}</span>
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
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}

function QuickActionLink({ to, title, description, icon }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between gap-[12px] rounded-xl border border-gray-200 p-[13px] transition hover:border-accent hover:bg-accent/5"
    >
      <div className="flex items-center gap-[12px]">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-accent text-white">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-gray-800">{title}</p>
          <p className="mt-[2px] text-xs text-gray-500">{description}</p>
        </div>
      </div>
      <FiArrowRight className="shrink-0 text-accent" />
    </Link>
  );
}

function RecentHotelsPanel({ hotels, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <PanelHeader
        title="Recent Hotels"
        description="Your latest hotel submissions."
        to="/hotel-owner/hotels"
      />
      {loading ? (
        <PanelMessage message="Loading hotels..." />
      ) : hotels.length === 0 ? (
        <PanelMessage message="No hotels have been added yet." />
      ) : (
        <div className="space-y-[12px]">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className="flex items-center justify-between gap-[12px] border-b border-gray-100 pb-[12px] last:border-b-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-[12px]">
                <img
                  src={resolveAssetUrl(hotel.images?.[0])}
                  alt={hotel.name || "Hotel"}
                  className="h-[45px] w-[55px] shrink-0 rounded-lg border object-cover"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/hotel-placeholder.jpg";
                  }}
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {hotel.name || "Unnamed hotel"}
                  </p>
                  <p className="mt-[3px] flex items-center gap-[5px] truncate text-xs text-gray-500">
                    <FiMapPin className="shrink-0" />
                    {hotel.address || "Address not added"}
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <ApprovalBadge status={getHotelApprovalStatus(hotel)} />
                <p className="mt-[5px] flex items-center justify-end gap-[4px] text-xs text-gray-500">
                  <FaStar className="text-orange" />
                  {Number(hotel.rating || 0).toFixed(1)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentBookingsPanel({ bookings, loading }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <PanelHeader
        title="Recent Bookings"
        description="Latest traveler booking requests."
        to="/hotel-owner/bookings"
      />
      {loading ? (
        <PanelMessage message="Loading bookings..." />
      ) : bookings.length === 0 ? (
        <PanelMessage message="No booking requests are available." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="py-[10px]">Traveler</th>
                <th className="py-[10px]">Hotel</th>
                <th className="py-[10px]">Dates</th>
                <th className="py-[10px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking._id} className="border-b text-sm last:border-b-0">
                  <td className="py-[12px] text-gray-700">
                    {booking.travelerId?.name ||
                      booking.travelerId?.email ||
                      booking.travelerName ||
                      "Traveler"}
                  </td>
                  <td className="py-[12px] text-gray-700">
                    {booking.hotelId?.name || booking.hotelName || "Hotel"}
                  </td>
                  <td className="py-[12px] text-gray-500">
                    {formatBookingDates(booking)}
                  </td>
                  <td className="py-[12px]">
                    <BookingStatusBadge status={booking.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function PanelHeader({ title, description, to }) {
  return (
    <div className="mb-[18px] flex items-center justify-between gap-[10px]">
      <div>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <Link to={to} className="text-sm font-semibold text-accent hover:text-orange">
        View All
      </Link>
    </div>
  );
}

function PanelMessage({ message }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-center text-gray-500">
      {message}
    </div>
  );
}

function ApprovalBadge({ status }) {
  const styles = {
    approved: "bg-green-600",
    rejected: "bg-red-600",
    pending: "bg-orange",
  };

  return (
    <span className={`inline-flex rounded-full px-[9px] py-[4px] text-[11px] font-semibold text-white ${styles[status] || styles.pending}`}>
      {capitalize(status || "pending")}
    </span>
  );
}

function BookingStatusBadge({ status }) {
  const normalized = String(status || "pending").toLowerCase();
  const styles = {
    approved: "bg-green-600",
    rejected: "bg-red-600",
    cancelled: "bg-gray-500",
    completed: "bg-blue-600",
    pending: "bg-orange",
  };

  return (
    <span className={`inline-flex rounded-full px-[9px] py-[4px] text-[11px] font-semibold text-white ${styles[normalized] || styles.pending}`}>
      {capitalize(normalized)}
    </span>
  );
}

function formatBookingDates(booking) {
  const checkIn = booking.checkInDate || booking.checkIn || booking.startDate;
  const checkOut = booking.checkOutDate || booking.checkOut || booking.endDate;

  if (!checkIn || !checkOut) {
    return "Dates not added";
  }

  return `${formatDate(checkIn)} - ${formatDate(checkOut)}`;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}
