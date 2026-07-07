import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaHotel,
  FaCar,
  FaUserTie,
  FaRobot,
  FaMapMarkedAlt,
} from "react-icons/fa";
import {
  FiImage,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheckCircle,
} from "react-icons/fi";
import { MdOutlineRateReview, MdOutlinePendingActions } from "react-icons/md";
import { LuClipboardList } from "react-icons/lu";

const API_URL = "http://localhost:3000";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [users, setUsers] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [guides, setGuides] = useState([]);
  const [places, setPlaces] = useState([]);
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
      return Array.isArray(response.data) ? response.data : response.data.data || [];
    } catch (error) {
      console.warn(`${endpoint} API not available or failed`, error.response?.data || error.message);
      return [];
    }
  }

  async function loadDashboardData() {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        usersData,
        hotelsData,
        vehiclesData,
        guidesData,
        placesData,
        bookingsData,
        reviewsData,
        mediaData,
        aiAlertsData,
      ] = await Promise.all([
        safeGet("/users"),
        safeGet("/hotels"),
        safeGet("/vehicles"),
        safeGet("/guides"),
        safeGet("/places"),
        safeGet("/bookings"),
        safeGet("/reviews"),
        safeGet("/media"),
        safeGet("/ai-alerts"),
      ]);

      setUsers(usersData);
      setHotels(hotelsData);
      setVehicles(vehiclesData);
      setGuides(guidesData);
      setPlaces(placesData);
      setBookings(bookingsData);
      setReviews(reviewsData);
      setMedia(mediaData);
      setAiAlerts(aiAlertsData);
    } catch (error) {
      console.error(error);
      setErrorMessage("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  const totalUsers = users.length;
  const travelers = users.filter((user) => user.role === "traveler").length;
  const hotelOwners = users.filter((user) => user.role === "hotel_owner").length;
  const vehicleCompanies = users.filter(
    (user) => user.role === "vehicle_company"
  ).length;
  const travelGuidesUsers = users.filter((user) => user.role === "guide").length;
  const blockedUsers = users.filter((user) => user.isBlocked).length;

  const pendingHotels = hotels.filter(
    (hotel) => hotel.status === "pending" || hotel.isApproved === false
  );

  const pendingVehicles = vehicles.filter(
    (vehicle) => vehicle.status === "pending" || vehicle.isApproved === false
  );

  const pendingMedia = media.filter(
    (item) => item.status === "pending" || item.isApproved === false
  );

  const pendingReviews = reviews.filter(
    (review) => review.status === "pending" || review.isFlagged === true
  );

  const stats = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <FaUsers />,
      color: "bg-blue-600",
      description: "Registered platform users",
    },
    {
      title: "Travelers",
      value: travelers,
      icon: <FaMapMarkedAlt />,
      color: "bg-green-600",
      description: "Normal travel users",
    },
    {
      title: "Hotel Owners",
      value: hotelOwners,
      icon: <FaHotel />,
      color: "bg-purple-600",
      description: "Registered hotel owners",
    },
    {
      title: "Vehicle Companies",
      value: vehicleCompanies,
      icon: <FaCar />,
      color: "bg-orange",
      description: "Rental company users",
    },
    {
      title: "Travel Guides",
      value: guides.length || travelGuidesUsers,
      icon: <FaUserTie />,
      color: "bg-pink-600",
      description: "Guide profiles",
    },
    {
      title: "Tourist Places",
      value: places.length,
      icon: <FaMapMarkedAlt />,
      color: "bg-teal-600",
      description: "Places in discovery module",
    },
    {
      title: "Bookings",
      value: bookings.length,
      icon: <LuClipboardList />,
      color: "bg-indigo-600",
      description: "Hotel, vehicle and guide bookings",
    },
    {
      title: "AI Alerts",
      value: aiAlerts.length,
      icon: <FaRobot />,
      color: "bg-red-600",
      description: "AI safety and fake-review alerts",
    },
  ];

  const approvalItems = [
    ...pendingHotels.slice(0, 3).map((item) => ({
      title: item.name || item.hotelName || "Hotel Approval",
      type: "Hotel",
      owner: item.ownerName || item.owner?.name || "Hotel Owner",
      location: item.location?.address || item.location || "Not specified",
      icon: <FaHotel />,
    })),
    ...pendingVehicles.slice(0, 3).map((item) => ({
      title: item.name || item.vehicleName || item.model || "Vehicle Approval",
      type: "Vehicle",
      owner: item.companyName || item.owner?.name || "Vehicle Company",
      location: item.location?.address || item.location || "Not specified",
      icon: <FaCar />,
    })),
    ...pendingMedia.slice(0, 3).map((item) => ({
      title: item.title || "Traveler Media Upload",
      type: "Media",
      owner: item.user?.name || item.userName || "Traveler",
      location: item.placeName || item.location || "Travel location",
      icon: <FiImage />,
    })),
    ...pendingReviews.slice(0, 3).map((item) => ({
      title: item.title || "Flagged Review",
      type: "Review",
      owner: item.user?.name || item.userName || "Traveler",
      location: item.placeName || item.hotelName || "Review section",
      icon: <MdOutlineRateReview />,
    })),
  ];

  const recentUsers = [...users].slice(-6).reverse();

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Manage Travel Ease users, hotels, vehicles, guides, bookings,
            media approvals, reviews and AI monitoring.
          </p>
        </div>

        <button
          onClick={loadDashboardData}
          className="w-fit flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {loading && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-[15px] mb-[20px]">
          Loading dashboard data...
        </div>
      )}

      {errorMessage && (
        <div className="w-full bg-red-50 border border-red-200 text-red-700 rounded-xl p-[15px] mb-[20px]">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        {stats.map((item, index) => (
          <DashboardCard
            key={index}
            title={item.title}
            value={item.value}
            icon={item.icon}
            color={item.color}
            description={item.description}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px] mb-[25px]">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Pending Approvals
              </h2>
              <p className="text-sm text-gray-500">
                Hotels, vehicles, media and reviews waiting for admin action.
              </p>
            </div>

            <MdOutlinePendingActions className="text-3xl text-accent" />
          </div>

          {approvalItems.length === 0 ? (
            <EmptyBox text="No pending approvals found. Backend approval APIs may not be created yet." />
          ) : (
            <div className="space-y-[12px]">
              {approvalItems.slice(0, 6).map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-[15px] flex flex-col md:flex-row md:items-center md:justify-between gap-[12px]"
                >
                  <div className="flex items-center gap-[12px]">
                    <div className="w-[45px] h-[45px] rounded-full bg-accent text-white flex items-center justify-center text-xl">
                      {item.icon}
                    </div>

                    <div>
                      <h3 className="font-bold text-gray-800">{item.title}</h3>
                      <p className="text-sm text-gray-500">
                        {item.type} • {item.location}
                      </p>
                      <p className="text-sm text-gray-400">{item.owner}</p>
                    </div>
                  </div>

                  <div className="flex gap-[8px]">
                    <button className="px-[12px] py-[7px] rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition">
                      Approve
                    </button>
                    <button className="px-[12px] py-[7px] rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                System Overview
              </h2>
              <p className="text-sm text-gray-500">
                Main admin control summary.
              </p>
            </div>

            <FiCheckCircle className="text-3xl text-green-600" />
          </div>

          <div className="space-y-[12px]">
            <OverviewItem label="Blocked Users" value={blockedUsers} />
            <OverviewItem label="Pending Hotels" value={pendingHotels.length} />
            <OverviewItem label="Pending Vehicles" value={pendingVehicles.length} />
            <OverviewItem label="Pending Media" value={pendingMedia.length} />
            <OverviewItem label="Flagged Reviews" value={pendingReviews.length} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[25px]">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Recent Users
              </h2>
              <p className="text-sm text-gray-500">
                Latest registered users from your backend.
              </p>
            </div>

            <FaUsers className="text-3xl text-accent" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Name</th>
                  <th className="py-[12px]">Email</th>
                  <th className="py-[12px]">Role</th>
                  <th className="py-[12px]">Status</th>
                </tr>
              </thead>

              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user._id} className="border-b text-sm">
                    <td className="py-[14px] font-semibold text-gray-800">
                      {user.name}
                    </td>
                    <td className="py-[14px] text-gray-600">
                      {user.email}
                    </td>
                    <td className="py-[14px] text-gray-600">
                      {user.role}
                    </td>
                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          user.isBlocked ? "bg-red-600" : "bg-green-600"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}

                {!loading && recentUsers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-[25px] text-center text-gray-500">
                      No users found or you are not logged in as admin.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                AI Monitoring
              </h2>
              <p className="text-sm text-gray-500">
                Fake reviews, sentiment and safety alerts.
              </p>
            </div>

            <FaRobot className="text-3xl text-accent" />
          </div>

          {aiAlerts.length === 0 ? (
            <EmptyBox text="No AI alerts found. AI backend route can be added later." />
          ) : (
            <div className="space-y-[12px]">
              {aiAlerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-xl p-[14px]"
                >
                  <div className="flex items-center gap-[8px]">
                    <FiAlertTriangle className="text-orange" />
                    <h3 className="font-bold text-gray-800">
                      {alert.title || "AI Alert"}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-[6px]">
                    {alert.description || alert.message || "AI alert detected."}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color, description }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">
          {value}
        </h2>
        <p className="text-xs text-gray-400 mt-[5px]">{description}</p>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function OverviewItem({ label, value }) {
  return (
    <div className="w-full flex justify-between items-center border border-gray-200 rounded-lg px-[14px] py-[12px]">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="bg-accent text-white px-[10px] py-[4px] rounded-full text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

function EmptyBox({ text }) {
  return (
    <div className="w-full min-h-[120px] border border-dashed border-gray-300 rounded-xl flex items-center justify-center text-center text-gray-500 p-[20px]">
      {text}
    </div>
  );
}