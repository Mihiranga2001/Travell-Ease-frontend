import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaChartBar,
  FaUsers,
  FaHotel,
  FaCar,
  FaUserTie,
  FaMapMarkedAlt,
  FaCalendarCheck,
  FaStar,
  FaImage,
  FaRobot,
  FaDownload,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminReportsPage() {
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([]);
  const [places, setPlaces] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [media, setMedia] = useState([]);
  const [aiAlerts, setAiAlerts] = useState([]);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function safeGet(endpoint) {
    try {
      const response = await axios.get(`${API_URL}${endpoint}`, getAuthHeader());

      return Array.isArray(response.data)
        ? response.data
        : response.data.data ||
            response.data.users ||
            response.data.places ||
            response.data.hotels ||
            response.data.vehicles ||
            response.data.guides ||
            response.data.bookings ||
            response.data.reviews ||
            response.data.media ||
            response.data.alerts ||
            response.data.aiAlerts ||
            [];
    } catch (error) {
      console.warn(`${endpoint} failed`, error.response?.data || error.message);
      return [];
    }
  }

  async function loadReports() {
    try {
      setLoading(true);

      const [
        usersData,
        placesData,
        hotelsData,
        vehiclesData,
        guidesData,
        bookingsData,
        reviewsData,
        mediaData,
        aiAlertsData,
      ] = await Promise.all([
        safeGet("/users"),
        safeGet("/places"),
        safeGet("/hotels/admin/all"),
        safeGet("/vehicles/admin/all"),
        safeGet("/guides/admin/all"),
        safeGet("/bookings/admin/all"),
        safeGet("/reviews/admin/all"),
        safeGet("/media/admin/all"),
        safeGet("/ai-alerts/admin/all"),
      ]);

      setUsers(usersData);
      setPlaces(placesData);
      setHotels(hotelsData);
      setVehicles(vehiclesData);
      setGuides(guidesData);
      setBookings(bookingsData);
      setReviews(reviewsData);
      setMedia(mediaData);
      setAiAlerts(aiAlertsData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, []);

  function getStatus(item) {
    return item.status || (item.isApproved ? "approved" : "pending");
  }

  function getBookingAmount(booking) {
    return Number(booking.totalAmount || booking.amount || booking.total || 0);
  }

  function formatCurrency(value) {
    return `Rs. ${Number(value || 0).toLocaleString("en-LK")}`;
  }

  function getAverageRating() {
    if (reviews.length === 0) return "0.0";

    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating || review.stars || 0),
      0
    );

    return (total / reviews.length).toFixed(1);
  }

  function getRoleCount(role) {
    return users.filter((user) => user.role === role).length;
  }

  function getApprovedCount(list) {
    return list.filter((item) => item.isApproved === true).length;
  }

  function getPendingCount(list) {
    return list.filter((item) => item.isApproved === false).length;
  }

  function getActiveCount(list) {
    return list.filter((item) => (item.status || "active") === "active").length;
  }

  function getRevenueByType(type) {
    return bookings
      .filter(
        (booking) =>
          (booking.bookingType || booking.type || "hotel") === type &&
          booking.status !== "cancelled"
      )
      .reduce((sum, booking) => sum + getBookingAmount(booking), 0);
  }

  function exportReportCSV() {
    const rows = [
      ["Travel Ease Admin Report"],
      ["Generated Date", new Date().toLocaleString("en-LK")],
      [],
      ["Section", "Value"],
      ["Total Users", users.length],
      ["Travelers", getRoleCount("traveler")],
      ["Hotel Owners", getRoleCount("hotel_owner")],
      ["Vehicle Companies", getRoleCount("vehicle_company")],
      ["Travel Guides", getRoleCount("guide")],
      ["Admins", getRoleCount("admin")],
      ["Tourist Places", places.length],
      ["Hotels", hotels.length],
      ["Approved Hotels", getApprovedCount(hotels)],
      ["Pending Hotels", getPendingCount(hotels)],
      ["Vehicles", vehicles.length],
      ["Approved Vehicles", getApprovedCount(vehicles)],
      ["Pending Vehicles", getPendingCount(vehicles)],
      ["Guides", guides.length],
      ["Approved Guides", getApprovedCount(guides)],
      ["Pending Guides", getPendingCount(guides)],
      ["Bookings", bookings.length],
      ["Reviews", reviews.length],
      ["Average Rating", getAverageRating()],
      ["Media Uploads", media.length],
      ["AI Alerts", aiAlerts.length],
      ["Total Revenue", formatCurrency(totalRevenue)],
    ];

    const csvContent = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `travel-ease-admin-report-${Date.now()}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  }

  const totalRevenue = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce((sum, booking) => sum + getBookingAmount(booking), 0);

  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "pending") === "pending"
  ).length;

  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const approvedMedia = media.filter((item) => getStatus(item) === "approved")
    .length;

  const pendingMedia = media.filter((item) => getStatus(item) === "pending")
    .length;

  const activeAIAlerts = aiAlerts.filter(
    (alert) => (alert.status || (alert.isResolved ? "resolved" : "active")) === "active"
  ).length;

  const reportCards = [
    {
      title: "Total Users",
      value: users.length,
      icon: <FaUsers />,
      color: "bg-blue-600",
    },
    {
      title: "Tourist Places",
      value: places.length,
      icon: <FaMapMarkedAlt />,
      color: "bg-green-600",
    },
    {
      title: "Total Hotels",
      value: hotels.length,
      icon: <FaHotel />,
      color: "bg-purple-600",
    },
    {
      title: "Total Vehicles",
      value: vehicles.length,
      icon: <FaCar />,
      color: "bg-orange",
    },
    {
      title: "Travel Guides",
      value: guides.length,
      icon: <FaUserTie />,
      color: "bg-pink-600",
    },
    {
      title: "Bookings",
      value: bookings.length,
      icon: <FaCalendarCheck />,
      color: "bg-indigo-600",
    },
    {
      title: "Reviews",
      value: reviews.length,
      icon: <FaStar />,
      color: "bg-yellow-500",
    },
    {
      title: "AI Alerts",
      value: aiAlerts.length,
      icon: <FaRobot />,
      color: "bg-red-600",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">Reports</h1>
          <p className="text-gray-500 mt-[5px]">
            View platform performance, users, bookings, approvals, reviews,
            revenue and AI monitoring reports.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={loadReports}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={exportReportCSV}
            className="flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
          >
            <FaDownload />
            Export CSV
          </button>
        </div>
      </div>

      {loading && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-[15px] mb-[20px]">
          Loading report data...
        </div>
      )}

      {/* Main Report Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        {reportCards.map((card, index) => (
          <ReportCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
          />
        ))}
      </div>

      {/* Revenue Report */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px] mb-[25px]">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center justify-between mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Revenue Summary
              </h2>
              <p className="text-sm text-gray-500">
                Booking revenue from hotels, vehicles and travel guides.
              </p>
            </div>

            <FaChartBar className="text-3xl text-accent" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
            <SummaryBox
              title="Total Revenue"
              value={formatCurrency(totalRevenue)}
              color="bg-accent"
            />

            <SummaryBox
              title="Hotel Revenue"
              value={formatCurrency(getRevenueByType("hotel"))}
              color="bg-purple-600"
            />

            <SummaryBox
              title="Vehicle Revenue"
              value={formatCurrency(getRevenueByType("vehicle"))}
              color="bg-orange"
            />

            <SummaryBox
              title="Guide Revenue"
              value={formatCurrency(getRevenueByType("guide"))}
              color="bg-green-600"
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            Booking Status
          </h2>

          <div className="space-y-[12px]">
            <StatusRow label="Total Bookings" value={bookings.length} />
            <StatusRow label="Confirmed" value={confirmedBookings} />
            <StatusRow label="Pending" value={pendingBookings} />
            <StatusRow label="Cancelled" value={cancelledBookings} />
          </div>
        </div>
      </div>

      {/* User and Approval Reports */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px] mb-[25px]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            User Role Report
          </h2>

          <div className="space-y-[12px]">
            <ProgressRow
              label="Travelers"
              value={getRoleCount("traveler")}
              total={users.length}
            />
            <ProgressRow
              label="Hotel Owners"
              value={getRoleCount("hotel_owner")}
              total={users.length}
            />
            <ProgressRow
              label="Vehicle Companies"
              value={getRoleCount("vehicle_company")}
              total={users.length}
            />
            <ProgressRow
              label="Travel Guides"
              value={getRoleCount("guide")}
              total={users.length}
            />
            <ProgressRow
              label="Admins"
              value={getRoleCount("admin")}
              total={users.length}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            Approval Report
          </h2>

          <div className="space-y-[12px]">
            <ApprovalReportRow
              label="Hotels"
              approved={getApprovedCount(hotels)}
              pending={getPendingCount(hotels)}
              total={hotels.length}
            />

            <ApprovalReportRow
              label="Vehicles"
              approved={getApprovedCount(vehicles)}
              pending={getPendingCount(vehicles)}
              total={vehicles.length}
            />

            <ApprovalReportRow
              label="Travel Guides"
              approved={getApprovedCount(guides)}
              pending={getPendingCount(guides)}
              total={guides.length}
            />

            <ApprovalReportRow
              label="Media"
              approved={approvedMedia}
              pending={pendingMedia}
              total={media.length}
            />
          </div>
        </div>
      </div>

      {/* Content and AI Reports */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            Content Report
          </h2>

          <div className="space-y-[12px]">
            <StatusRow label="Tourist Places" value={places.length} />
            <StatusRow label="Uploaded Media" value={media.length} />
            <StatusRow label="Approved Media" value={approvedMedia} />
            <StatusRow label="Pending Media" value={pendingMedia} />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            Review Report
          </h2>

          <div className="space-y-[12px]">
            <StatusRow label="Total Reviews" value={reviews.length} />
            <StatusRow label="Average Rating" value={getAverageRating()} />
            <StatusRow
              label="Flagged Reviews"
              value={reviews.filter((review) => review.isFlagged).length}
            />
            <StatusRow
              label="Negative Sentiment"
              value={
                reviews.filter(
                  (review) =>
                    review.sentiment === "negative" ||
                    review.aiSentiment === "negative"
                ).length
              }
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            AI Monitoring Report
          </h2>

          <div className="space-y-[12px]">
            <StatusRow label="Total AI Alerts" value={aiAlerts.length} />
            <StatusRow label="Active AI Alerts" value={activeAIAlerts} />
            <StatusRow
              label="High Risk Alerts"
              value={aiAlerts.filter((alert) => alert.severity === "high").length}
            />
            <StatusRow
              label="Resolved Alerts"
              value={
                aiAlerts.filter(
                  (alert) => alert.status === "resolved" || alert.isResolved
                ).length
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">{value}</h2>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function SummaryBox({ title, value, color }) {
  return (
    <div className={`${color} text-white rounded-xl p-[18px]`}>
      <p className="text-sm opacity-90">{title}</p>
      <h3 className="text-2xl font-bold mt-[6px]">{value}</h3>
    </div>
  );
}

function StatusRow({ label, value }) {
  return (
    <div className="flex justify-between items-center border border-gray-200 rounded-lg px-[14px] py-[12px]">
      <span className="font-medium text-gray-600">{label}</span>
      <span className="font-bold text-accent">{value}</span>
    </div>
  );
}

function ProgressRow({ label, value, total }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="border border-gray-200 rounded-lg p-[12px]">
      <div className="flex justify-between items-center mb-[8px]">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="font-bold text-accent">
          {value} ({percentage}%)
        </span>
      </div>

      <div className="w-full h-[8px] bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function ApprovalReportRow({ label, approved, pending, total }) {
  return (
    <div className="border border-gray-200 rounded-lg p-[12px]">
      <div className="flex justify-between items-center mb-[8px]">
        <span className="font-bold text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">Total: {total}</span>
      </div>

      <div className="grid grid-cols-2 gap-[8px]">
        <div className="bg-green-50 text-green-700 rounded-lg px-[10px] py-[8px] text-sm">
          Approved: <span className="font-bold">{approved}</span>
        </div>

        <div className="bg-orange/10 text-orange rounded-lg px-[10px] py-[8px] text-sm">
          Pending: <span className="font-bold">{pending}</span>
        </div>
      </div>
    </div>
  );
}