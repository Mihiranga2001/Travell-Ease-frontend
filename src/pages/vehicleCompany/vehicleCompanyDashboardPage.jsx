import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import {
  FaCalendarCheck,
  FaCar,
  FaCheckCircle,
  FaMoneyBillWave,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";

import {
  MdEventAvailable,
  MdOutlinePendingActions,
  MdRefresh,
} from "react-icons/md";

import {
  FiArrowRight,
  FiCalendar,
  FiMapPin,
} from "react-icons/fi";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const API_URL = `${RAW_API_URL.replace(
  /\/api\/?$/,
  ""
).replace(/\/$/, "")}/api`;

export default function VehicleCompanyDashboardPage() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [vehicleError, setVehicleError] = useState("");
  const [bookingError, setBookingError] = useState("");

  const loggedInUser = useMemo(() => {
    try {
      const savedUser = localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to read logged-in user:",
        error
      );

      return null;
    }
  }, []);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Authentication token is missing. Please log in again."
      );
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  function getApiErrorMessage(
    error,
    fallbackMessage
  ) {
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
      setVehicleError("");
      setBookingError("");

      /*
        These endpoints must return data belonging only to
        the currently logged-in vehicle company.
      */
      const results = await Promise.allSettled([
        axios.get(
          `${API_URL}/vehicles/company/my`,
          getAuthHeader()
        ),

        axios.get(
          `${API_URL}/vehicle-bookings/company/my`,
          getAuthHeader()
        ),
      ]);

      const vehicleResult = results[0];
      const bookingResult = results[1];

      if (vehicleResult.status === "fulfilled") {
        const responseData =
          vehicleResult.value.data;

        const vehicleList = Array.isArray(
          responseData
        )
          ? responseData
          : responseData?.vehicles ||
            responseData?.data ||
            responseData?.results ||
            [];

        setVehicles(vehicleList);
      } else {
        console.error(
          "Vehicle dashboard load error:",
          vehicleResult.reason
        );

        setVehicles([]);

        setVehicleError(
          getApiErrorMessage(
            vehicleResult.reason,
            "Failed to load your vehicles"
          )
        );
      }

      if (bookingResult.status === "fulfilled") {
        const responseData =
          bookingResult.value.data;

        const bookingList = Array.isArray(
          responseData
        )
          ? responseData
          : responseData?.bookings ||
            responseData?.data ||
            responseData?.results ||
            [];

        setBookings(bookingList);
      } else {
        console.error(
          "Vehicle booking dashboard load error:",
          bookingResult.reason
        );

        setBookings([]);

        setBookingError(
          getApiErrorMessage(
            bookingResult.reason,
            "Failed to load your vehicle bookings"
          )
        );
      }
    } catch (error) {
      console.error(
        "Vehicle dashboard load error:",
        error
      );

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

  const totalVehicles = vehicles.length;

  const approvedVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved === true
  ).length;

  const pendingVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved !== true
  ).length;

  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.isAvailable !== false
  ).length;

  const unavailableVehicles = vehicles.filter(
    (vehicle) => vehicle.isAvailable === false
  ).length;

  const totalSeats = vehicles.reduce(
    (total, vehicle) => {
      const seats = Number(vehicle.seats);

      return total + (
        Number.isFinite(seats) ? seats : 0
      );
    },
    0
  );

  const averageDailyPrice =
    totalVehicles === 0
      ? 0
      : vehicles.reduce((total, vehicle) => {
          const price = Number(
            vehicle.pricePerDay
          );

          return total + (
            Number.isFinite(price) ? price : 0
          );
        }, 0) / totalVehicles;

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      normalizeBookingStatus(booking.status) ===
      "pending"
  ).length;

  const approvedBookings = bookings.filter(
    (booking) => {
      const status = normalizeBookingStatus(
        booking.status
      );

      return (
        status === "approved" ||
        status === "confirmed"
      );
    }
  ).length;

  const rejectedBookings = bookings.filter(
    (booking) =>
      normalizeBookingStatus(booking.status) ===
      "rejected"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      normalizeBookingStatus(booking.status) ===
      "completed"
  ).length;

  const recentVehicles = [...vehicles]
    .sort(
      (firstVehicle, secondVehicle) =>
        new Date(
          secondVehicle.createdAt || 0
        ) -
        new Date(
          firstVehicle.createdAt || 0
        )
    )
    .slice(0, 4);

  const recentBookings = [...bookings]
    .sort(
      (firstBooking, secondBooking) =>
        new Date(
          secondBooking.createdAt || 0
        ) -
        new Date(
          firstBooking.createdAt || 0
        )
    )
    .slice(0, 5);

  const statistics = [
    {
      title: "My Vehicles",
      value: totalVehicles,
      description: `${approvedVehicles} approved`,
      icon: <FaCar />,
      color: "bg-blue-600",
    },
    {
      title: "Pending Vehicles",
      value: pendingVehicles,
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
      description: `${completedBookings} completed`,
      icon: <FaCalendarCheck />,
      color: "bg-green-600",
    },
  ];

  const companyDisplayName =
    loggedInUser?.companyName ||
    loggedInUser?.name ||
    "Vehicle Company";

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      {/* Header */}
      <div className="mb-[25px] flex w-full flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Welcome, {companyDisplayName}
          </h1>

          <p className="mt-[5px] text-gray-500">
            View your vehicle approval status,
            availability, booking activity and recent
            updates.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <MdRefresh
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        {statistics.map((statistic) => (
          <DashboardStatCard
            key={statistic.title}
            {...statistic}
          />
        ))}
      </div>

      {/* Summary cards */}
      <div className="mb-[25px] grid grid-cols-1 gap-[20px] xl:grid-cols-3">
        <SummaryCard
          title="Vehicle Status"
          icon={<FaCar />}
        >
          <SummaryRow
            label="Approved"
            value={approvedVehicles}
            icon={
              <FaCheckCircle className="text-green-600" />
            }
          />

          <SummaryRow
            label="Pending Approval"
            value={pendingVehicles}
            icon={
              <MdOutlinePendingActions className="text-orange" />
            }
          />

          <SummaryRow
            label="Available"
            value={availableVehicles}
            icon={
              <MdEventAvailable className="text-purple-600" />
            }
          />

          <SummaryRow
            label="Unavailable"
            value={unavailableVehicles}
            icon={
              <FaTimesCircle className="text-red-600" />
            }
          />
        </SummaryCard>

        <SummaryCard
          title="Business Summary"
          icon={<FaMoneyBillWave />}
        >
          <SummaryRow
            label="Total Seats"
            value={totalSeats}
            icon={
              <FaUsers className="text-blue-600" />
            }
          />

          <SummaryRow
            label="Average Daily Price"
            value={`Rs. ${formatCurrency(
              averageDailyPrice
            )}`}
            icon={
              <FaMoneyBillWave className="text-green-600" />
            }
          />

          <SummaryRow
            label="Pending Bookings"
            value={pendingBookings}
            icon={
              <MdOutlinePendingActions className="text-orange" />
            }
          />

          <SummaryRow
            label="Rejected Bookings"
            value={rejectedBookings}
            icon={
              <FaTimesCircle className="text-red-600" />
            }
          />
        </SummaryCard>

        {/* Quick actions */}
        <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <h2 className="mb-[5px] text-xl font-bold text-gray-800">
            Quick Actions
          </h2>

          <p className="mb-[18px] text-sm text-gray-500">
            Open your main vehicle-company management
            pages.
          </p>

          <div className="space-y-[10px]">
            <QuickActionLink
              to="/vehicle-company/vehicles"
              title="Manage My Vehicles"
              description="Add vehicles and update existing vehicle details."
              icon={<FaCar />}
            />

            <QuickActionLink
              to="/vehicle-company/bookings"
              title="View Bookings"
              description="Review pending, approved and completed bookings."
              icon={<FiCalendar />}
            />

            <QuickActionLink
              to="/vehicle-company/availability"
              title="Vehicle Availability"
              description="Update the availability of your rental vehicles."
              icon={<MdEventAvailable />}
            />
          </div>
        </div>
      </div>

      {/* API warnings */}
      {(vehicleError || bookingError) && (
        <div className="mb-[25px] rounded-xl border border-orange/30 bg-orange/10 p-[15px]">
          <p className="mb-[5px] font-semibold text-gray-800">
            Some dashboard information could not be loaded
          </p>

          {vehicleError && (
            <p className="text-sm text-gray-600">
              Vehicles: {vehicleError}
            </p>
          )}

          {bookingError && (
            <p className="text-sm text-gray-600">
              Bookings: {bookingError}
            </p>
          )}
        </div>
      )}

      {/* Recent data */}
      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
        <RecentVehiclesPanel
          vehicles={recentVehicles}
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
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">
          {title}
        </p>

        <h2 className="mt-[6px] text-3xl font-bold text-gray-800">
          {value}
        </h2>

        <p className="mt-[4px] text-xs text-gray-400">
          {description}
        </p>
      </div>

      <div
        className={`${color} flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white`}
      >
        {icon}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  icon,
  children,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="mb-[18px] flex items-center gap-[8px]">
        <span className="text-xl text-accent">
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

function SummaryRow({
  label,
  value,
  icon,
}) {
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
      className="flex items-center justify-between gap-[12px] rounded-xl border border-gray-200 p-[13px] transition hover:border-accent hover:bg-accent/5"
    >
      <div className="flex items-center gap-[12px]">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg bg-accent text-white">
          {icon}
        </div>

        <div>
          <p className="font-semibold text-gray-800">
            {title}
          </p>

          <p className="mt-[2px] text-xs text-gray-500">
            {description}
          </p>
        </div>
      </div>

      <FiArrowRight className="shrink-0 text-accent" />
    </Link>
  );
}

function RecentVehiclesPanel({
  vehicles,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="mb-[18px] flex items-center justify-between gap-[10px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Recent Vehicles
          </h2>

          <p className="text-sm text-gray-500">
            Your latest vehicle submissions.
          </p>
        </div>

        <Link
          to="/vehicle-company/vehicles"
          className="text-sm font-semibold text-accent hover:text-orange"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <PanelLoadingMessage />
      ) : vehicles.length === 0 ? (
        <PanelEmptyMessage message="No vehicles have been added yet." />
      ) : (
        <div className="space-y-[12px]">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="flex items-center justify-between gap-[12px] border-b border-gray-100 pb-[12px] last:border-b-0 last:pb-0"
            >
              <div className="flex min-w-0 items-center gap-[12px]">
                <VehicleThumbnail
                  vehicle={vehicle}
                />

                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-800">
                    {vehicle.model ||
                      "Unnamed vehicle"}
                  </p>

                  <p className="mt-[3px] flex items-center gap-[5px] truncate text-xs text-gray-500">
                    <FiMapPin className="shrink-0" />

                    {formatLocation(
                      vehicle.location
                    )}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <ApprovalBadge
                  approved={
                    vehicle.isApproved === true
                  }
                />

                <p className="mt-[5px] text-xs text-gray-500">
                  Rs.{" "}
                  {formatCurrency(
                    vehicle.pricePerDay
                  )}{" "}
                  / day
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentBookingsPanel({
  bookings,
  loading,
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="mb-[18px] flex items-center justify-between gap-[10px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Recent Bookings
          </h2>

          <p className="text-sm text-gray-500">
            Latest traveler vehicle rental requests.
          </p>
        </div>

        <Link
          to="/vehicle-company/bookings"
          className="text-sm font-semibold text-accent hover:text-orange"
        >
          View All
        </Link>
      </div>

      {loading ? (
        <PanelLoadingMessage />
      ) : bookings.length === 0 ? (
        <PanelEmptyMessage message="No vehicle booking requests are available." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left">
            <thead>
              <tr className="border-b text-xs text-gray-500">
                <th className="py-[10px]">
                  Traveler
                </th>

                <th className="py-[10px]">
                  Vehicle
                </th>

                <th className="py-[10px]">
                  Dates
                </th>

                <th className="py-[10px]">
                  Status
                </th>
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
                    {getVehicleName(booking)}
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

function VehicleThumbnail({ vehicle }) {
  const image = getVehicleImage(
    vehicle.image
  );

  if (!image) {
    return (
      <div className="flex h-[45px] w-[60px] shrink-0 items-center justify-center rounded-lg border bg-gray-100 text-gray-400">
        <FaCar />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={vehicle.model || "Vehicle"}
      onError={(event) => {
        event.currentTarget.onerror = null;
        event.currentTarget.src =
          "/vehicle-placeholder.jpg";
      }}
      className="h-[45px] w-[60px] shrink-0 rounded-lg border object-cover"
    />
  );
}

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`inline-flex rounded-full px-[9px] py-[4px] text-[11px] font-semibold text-white ${
        approved
          ? "bg-green-600"
          : "bg-orange"
      }`}
    >
      {approved ? "Approved" : "Pending"}
    </span>
  );
}

function BookingStatusBadge({ status }) {
  const normalizedStatus =
    normalizeBookingStatus(status);

  const className =
    normalizedStatus === "approved" ||
    normalizedStatus === "confirmed"
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
      className={`inline-flex rounded-full px-[9px] py-[4px] text-[11px] font-semibold text-white ${className}`}
    >
      {capitalize(normalizedStatus)}
    </span>
  );
}

function PanelLoadingMessage() {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-gray-500">
      Loading...
    </div>
  );
}

function PanelEmptyMessage({ message }) {
  return (
    <div className="flex min-h-[180px] items-center justify-center text-center text-gray-500">
      {message}
    </div>
  );
}

function getVehicleImage(image) {
  const imageText = String(
    image || ""
  )
    .trim()
    .replace(/\\/g, "/");

  if (!imageText) {
    return "";
  }

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:") ||
    imageText.startsWith("blob:")
  ) {
    return imageText;
  }

  const backendOrigin = API_URL.replace(
    /\/api\/?$/,
    ""
  );

  if (imageText.startsWith("/")) {
    return `${backendOrigin}${imageText}`;
  }

  return `${backendOrigin}/${imageText}`;
}

function formatLocation(location) {
  const latitude = Number(
    location?.latitude
  );

  const longitude = Number(
    location?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return "Location not added";
  }

  return `${latitude.toFixed(
    5
  )}, ${longitude.toFixed(5)}`;
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
    booking.customerName ||
    "Traveler"
  );
}

function getVehicleName(booking) {
  if (
    booking.vehicleId &&
    typeof booking.vehicleId === "object"
  ) {
    return (
      booking.vehicleId.model ||
      booking.vehicleId.name ||
      "Vehicle"
    );
  }

  return (
    booking.vehicle?.model ||
    booking.vehicleModel ||
    "Vehicle"
  );
}

function formatBookingDates(booking) {
  const startDate =
    booking.startDate ||
    booking.pickupDate ||
    booking.fromDate;

  const endDate =
    booking.endDate ||
    booking.returnDate ||
    booking.toDate;

  if (!startDate || !endDate) {
    return "Dates not added";
  }

  return `${formatDate(
    startDate
  )} - ${formatDate(endDate)}`;
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

function normalizeBookingStatus(status) {
  return String(status || "pending")
    .trim()
    .toLowerCase();
}

function capitalize(value) {
  if (!value) {
    return "";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
  );
}

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  });
}