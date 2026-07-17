import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import {
  FaBed,
  FaCalendarCheck,
  FaCheckCircle,
  FaHotel,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import {
  MdOutlinePendingActions,
  MdRefresh,
} from "react-icons/md";
import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function HotelOwnerDashboardPage() {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [hotelError, setHotelError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  function getApiErrorMessage(error, fallbackMessage) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      setHotelError("");
      setBookingError("");

      const results = await Promise.allSettled([
        axios.get(
          `${API_URL}/hotels/owner/my`,
          getAuthHeader()
        ),
        axios.get(
          `${API_URL}/bookings/owner/my`,
          getAuthHeader()
        ),
      ]);

      const hotelResult = results[0];
      const bookingResult = results[1];

      if (hotelResult.status === "fulfilled") {
        const responseData = hotelResult.value.data;

        const hotelList = Array.isArray(responseData)
          ? responseData
          : responseData?.hotels ||
            responseData?.data ||
            [];

        setHotels(hotelList);
      } else {
        console.error(
          "Hotel dashboard load error:",
          hotelResult.reason
        );

        setHotels([]);
        setHotelError(
          getApiErrorMessage(
            hotelResult.reason,
            "Failed to load your hotels"
          )
        );
      }

      if (bookingResult.status === "fulfilled") {
        const responseData = bookingResult.value.data;

        const bookingList = Array.isArray(responseData)
          ? responseData
          : responseData?.bookings ||
            responseData?.data ||
            [];

        setBookings(bookingList);
      } else {
        console.error(
          "Booking dashboard load error:",
          bookingResult.reason
        );

        setBookings([]);
        setBookingError(
          getApiErrorMessage(
            bookingResult.reason,
            "Failed to load your bookings"
          )
        );
      }
    } catch (error) {
      console.error("Dashboard load error:", error);
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load dashboard data"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalHotels = hotels.length;

  const approvedHotels = hotels.filter(
    (hotel) => hotel.isApproved === true
  ).length;

  const pendingHotels = hotels.filter(
    (hotel) => hotel.isApproved !== true
  ).length;

  const availableHotels = hotels.filter(
    (hotel) => hotel.isAvailable !== false
  ).length;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => booking.status === "approved"
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) => booking.status === "rejected"
  ).length;

  const totalRoomTypes = hotels.reduce(
    (total, hotel) =>
      total +
      (Array.isArray(hotel.roomTypes)
        ? hotel.roomTypes.length
        : 0),
    0
  );

  const recentHotels = [...hotels]
    .sort(
      (firstHotel, secondHotel) =>
        new Date(secondHotel.createdAt || 0) -
        new Date(firstHotel.createdAt || 0)
    )
    .slice(0, 4);

  const recentBookings = [...bookings]
    .sort(
      (firstBooking, secondBooking) =>
        new Date(secondBooking.createdAt || 0) -
        new Date(firstBooking.createdAt || 0)
    )
    .slice(0, 5);

  const statistics = [
    {
      title: "My Hotels",
      value: totalHotels,
      description: `${approvedHotels} approved`,
      icon: <FaHotel />,
      color: "bg-blue-600",
    },
    {
      title: "Pending Hotels",
      value: pendingHotels,
      description: "Waiting for admin approval",
      icon: <MdOutlinePendingActions />,
      color: "bg-orange",
    },
    {
      title: "Total Bookings",
      value: totalBookings,
      description: `${pendingBookings} pending`,
      icon: <FiCalendar />,
      color: "bg-purple-600",
    },
    {
      title: "Approved Bookings",
      value: approvedBookings,
      description: `${rejectedBookings} rejected`,
      icon: <FaCalendarCheck />,
      color: "bg-green-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Welcome, {loggedInUser?.name || "Hotel Owner"}
          </h1>

          <p className="text-gray-500 mt-[5px]">
            View your hotel approval status, booking activity and
            recent updates.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="w-fit flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
        >
          <MdRefresh
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        {statistics.map((statistic) => (
          <DashboardStatCard
            key={statistic.title}
            {...statistic}
          />
        ))}
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[20px] mb-[25px]">
        <SummaryCard
          title="Hotel Status"
          icon={<FaHotel />}
        >
          <SummaryRow
            label="Approved"
            value={approvedHotels}
            icon={<FaCheckCircle className="text-green-600" />}
          />

          <SummaryRow
            label="Pending"
            value={pendingHotels}
            icon={<MdOutlinePendingActions className="text-orange" />}
          />

          <SummaryRow
            label="Available"
            value={availableHotels}
            icon={<FaBed className="text-purple-600" />}
          />

          <SummaryRow
            label="Room Types"
            value={totalRoomTypes}
            icon={<FaBed className="text-blue-600" />}
          />
        </SummaryCard>

        <SummaryCard
          title="Booking Status"
          icon={<FiCalendar />}
        >
          <SummaryRow
            label="Pending"
            value={pendingBookings}
            icon={<MdOutlinePendingActions className="text-orange" />}
          />

          <SummaryRow
            label="Approved"
            value={approvedBookings}
            icon={<FaCheckCircle className="text-green-600" />}
          />

          <SummaryRow
            label="Rejected"
            value={rejectedBookings}
            icon={<FaTimesCircle className="text-red-600" />}
          />

          <SummaryRow
            label="Total"
            value={totalBookings}
            icon={<FaCalendarCheck className="text-blue-600" />}
          />
        </SummaryCard>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[5px]">
            Quick Actions
          </h2>

          <p className="text-sm text-gray-500 mb-[18px]">
            Open your main hotel-owner management pages.
          </p>

          <div className="space-y-[10px]">
            <QuickActionLink
              to="/hotel-owner/hotels"
              title="Manage My Hotels"
              description="Add hotels and update existing hotel details."
              icon={<FaHotel />}
            />

            <QuickActionLink
              to="/hotel-owner/bookings"
              title="View Bookings"
              description="Review pending, approved and rejected bookings."
              icon={<FiCalendar />}
            />

            <QuickActionLink
              to="/hotel-owner/rooms"
              title="Room Availability"
              description="Check room inventory for selected dates."
              icon={<FaBed />}
            />
          </div>
        </div>
      </div>

      {/* Load warnings */}
      {(hotelError || bookingError) && (
        <div className="mb-[25px] rounded-xl border border-orange/30 bg-orange/10 p-[15px]">
          <p className="font-semibold text-gray-800 mb-[5px]">
            Some dashboard information could not be loaded
          </p>

          {hotelError && (
            <p className="text-sm text-gray-600">
              Hotels: {hotelError}
            </p>
          )}

          {bookingError && (
            <p className="text-sm text-gray-600">
              Bookings: {bookingError}
            </p>
          )}
        </div>
      )}

      {/* Recent sections */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <RecentHotelsPanel
          hotels={recentHotels}
          loading={loading}
        />

        <RecentBookingsPanel
          bookings={recentBookings}
          loading={loading}
        />
      </div>
    </div>
  );
}

function DashboardStatCard({
  title,
  value,
  description,
  icon,
  color,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">
          {title}
        </p>

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
        <span className="text-accent text-xl">
          {icon}
        </span>

        <h2 className="text-xl font-bold text-gray-800">
          {title}
        </h2>
      </div>

      <div className="space-y-[12px]">
        {children}
      </div>
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

      <span className="font-bold text-gray-800">
        {value}
      </span>
    </div>
  );
}

function QuickActionLink({
  to,
  title,
  description,
  icon,
}) {
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
          <p className="font-semibold text-gray-800">
            {title}
          </p>

          <p className="text-xs text-gray-500 mt-[2px]">
            {description}
          </p>
        </div>
      </div>

      <FiArrowRight className="text-accent shrink-0" />
    </Link>
  );
}

function RecentHotelsPanel({ hotels, loading }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
      <div className="flex items-center justify-between gap-[10px] mb-[18px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Recent Hotels
          </h2>

          <p className="text-sm text-gray-500">
            Your latest hotel submissions.
          </p>
        </div>

        <Link
          to="/hotel-owner/hotels"
          className="text-sm font-semibold text-accent hover:text-orange"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <PanelLoadingMessage />
      ) : hotels.length === 0 ? (
        <PanelEmptyMessage message="No hotels have been added yet." />
      ) : (
        <div className="space-y-[12px]">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className="flex items-center justify-between gap-[12px] border-b border-gray-100 pb-[12px] last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-[12px] min-w-0">
                <HotelThumbnail hotel={hotel} />

                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {hotel.name || "Unnamed hotel"}
                  </p>

                  <p className="flex items-center gap-[5px] text-xs text-gray-500 truncate mt-[3px]">
                    <FiMapPin className="shrink-0" />
                    {hotel.address || "Address not added"}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <ApprovalBadge
                  approved={hotel.isApproved === true}
                />

                <p className="flex items-center justify-end gap-[4px] text-xs text-gray-500 mt-[5px]">
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
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
      <div className="flex items-center justify-between gap-[10px] mb-[18px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Recent Bookings
          </h2>

          <p className="text-sm text-gray-500">
            Latest traveler booking requests.
          </p>
        </div>

        <Link
          to="/hotel-owner/bookings"
          className="text-sm font-semibold text-accent hover:text-orange"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <PanelLoadingMessage />
      ) : bookings.length === 0 ? (
        <PanelEmptyMessage message="No booking requests are available." />
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
                <tr
                  key={booking._id}
                  className="border-b text-sm last:border-b-0"
                >
                  <td className="py-[12px] text-gray-700">
                    {getTravelerName(booking)}
                  </td>

                  <td className="py-[12px] text-gray-700">
                    {getHotelName(booking)}
                  </td>

                  <td className="py-[12px] text-gray-500">
                    {formatBookingDates(booking)}
                  </td>

                  <td className="py-[12px]">
                    <BookingStatusBadge
                      status={booking.status}
                    />
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

function HotelThumbnail({ hotel }) {
  const image = getHotelImage(hotel);

  if (!image) {
    return (
      <div className="w-[55px] h-[45px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400 shrink-0">
        <FaHotel />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={hotel.name || "Hotel"}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src =
          "/hotel-placeholder.jpg";
      }}
      className="w-[55px] h-[45px] rounded-lg object-cover border shrink-0"
    />
  );
}

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`inline-flex px-[9px] py-[4px] rounded-full text-[11px] font-semibold text-white ${
        approved ? "bg-green-600" : "bg-orange"
      }`}
    >
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

function BookingStatusBadge({ status }) {
  const normalizedStatus = String(
    status || "pending"
  ).toLowerCase();

  const className =
    normalizedStatus === "approved"
      ? "bg-green-600"
      : normalizedStatus === "rejected"
        ? "bg-red-600"
        : normalizedStatus === "cancelled"
          ? "bg-gray-500"
          : normalizedStatus === "completed"
            ? "bg-blue-600"
            : "bg-orange";

  return (
    <span
      className={`inline-flex px-[9px] py-[4px] rounded-full text-[11px] font-semibold text-white ${className}`}
    >
      {capitalize(normalizedStatus)}
    </span>
  );
}

function PanelLoadingMessage() {
  return (
    <div className="min-h-[180px] flex items-center justify-center text-gray-500">
      Loading...
    </div>
  );
}

function PanelEmptyMessage({ message }) {
  return (
    <div className="min-h-[180px] flex items-center justify-center text-center text-gray-500">
      {message}
    </div>
  );
}

function getHotelImage(hotel) {
  const images = Array.isArray(hotel.images)
    ? hotel.images
    : [];

  const firstImage = images.find(Boolean);

  if (!firstImage) {
    return "";
  }

  const imageText = String(firstImage).trim();

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:")
  ) {
    return imageText;
  }

  const backendOrigin = API_URL.replace(/\/api\/?$/, "");

  if (imageText.startsWith("/")) {
    return `${backendOrigin}${imageText}`;
  }

  return `${backendOrigin}/${imageText}`;
}

function getTravelerName(booking) {
  if (
    booking.travelerId &&
    typeof booking.travelerId === "object"
  ) {
    return (
      booking.travelerId.name ||
      booking.travelerId.email ||
      "Traveler"
    );
  }

  return (
    booking.traveler?.name ||
    booking.travelerName ||
    "Traveler"
  );
}

function getHotelName(booking) {
  if (
    booking.hotelId &&
    typeof booking.hotelId === "object"
  ) {
    return booking.hotelId.name || "Hotel";
  }

  return (
    booking.hotel?.name ||
    booking.hotelName ||
    "Hotel"
  );
}

function formatBookingDates(booking) {
  const checkIn =
    booking.checkInDate ||
    booking.checkIn ||
    booking.startDate;

  const checkOut =
    booking.checkOutDate ||
    booking.checkOut ||
    booking.endDate;

  if (!checkIn || !checkOut) {
    return "Dates not added";
  }

  return `${formatDate(checkIn)} - ${formatDate(
    checkOut
  )}`;
}

function formatDate(dateValue) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return date.toLocaleDateString("en-LK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() + value.slice(1)
  );
}