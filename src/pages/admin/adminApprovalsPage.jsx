import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHotel,
  FaCar,
  FaUserTie,
  FaImage,
  FaSearch,
  FaEye,
  FaClock,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminApprovalsPage() {
  const [hotels, setHotels] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [guides, setGuides] = useState([]);
  const [media, setMedia] = useState([]);

  const [allApprovals, setAllApprovals] = useState([]);
  const [filteredApprovals, setFilteredApprovals] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function safeGet(primaryEndpoint, fallbackEndpoint) {
    try {
      const response = await axios.get(
        `${API_URL}${primaryEndpoint}`,
        getAuthHeader()
      );

      return Array.isArray(response.data)
        ? response.data
        : response.data.data ||
            response.data.hotels ||
            response.data.vehicles ||
            response.data.guides ||
            response.data.media ||
            [];
    } catch {
      try {
        const response = await axios.get(
          `${API_URL}${fallbackEndpoint}`,
          getAuthHeader()
        );

        return Array.isArray(response.data)
          ? response.data
          : response.data.data ||
              response.data.hotels ||
              response.data.vehicles ||
              response.data.guides ||
              response.data.media ||
              [];
      } catch {
        return [];
      }
    }
  }

  async function loadApprovals() {
    try {
      setLoading(true);

      const [hotelsData, vehiclesData, guidesData, mediaData] =
        await Promise.all([
          safeGet("/hotels/admin/all", "/hotels"),
          safeGet("/vehicles/admin/all", "/vehicles"),
          safeGet("/guides/admin/all", "/guides"),
          safeGet("/media/admin/all", "/media"),
        ]);

      setHotels(hotelsData);
      setVehicles(vehiclesData);
      setGuides(guidesData);
      setMedia(mediaData);

      const pendingHotels = hotelsData
        .filter((hotel) => hotel.isApproved === false)
        .map((hotel) => ({
          id: hotel._id,
          type: "hotel",
          title: hotel.name || hotel.hotelName || "Hotel Approval",
          owner:
            hotel.ownerName ||
            hotel.owner?.name ||
            hotel.email ||
            "Hotel Owner",
          location:
            hotel.city ||
            hotel.district ||
            hotel.location?.address ||
            "Not specified",
          description: hotel.description || "No description added",
          image: hotel.images?.[0] || "",
          status: "pending",
          rawData: hotel,
        }));

      const pendingVehicles = vehiclesData
        .filter((vehicle) => vehicle.isApproved === false)
        .map((vehicle) => ({
          id: vehicle._id,
          type: "vehicle",
          title:
            vehicle.name ||
            vehicle.vehicleName ||
            vehicle.model ||
            "Vehicle Approval",
          owner:
            vehicle.companyName ||
            vehicle.owner?.name ||
            vehicle.email ||
            "Vehicle Company",
          location:
            vehicle.city ||
            vehicle.district ||
            vehicle.location?.address ||
            "Not specified",
          description: vehicle.description || "No description added",
          image: vehicle.images?.[0] || "",
          status: "pending",
          rawData: vehicle,
        }));

      const pendingGuides = guidesData
        .filter((guide) => guide.isApproved === false)
        .map((guide) => ({
          id: guide._id,
          type: "guide",
          title: guide.name || "Travel Guide Approval",
          owner: guide.email || guide.phoneNumber || "Travel Guide",
          location:
            guide.city ||
            guide.district ||
            guide.location?.address ||
            "Not specified",
          description: guide.bio || guide.description || "No bio added",
          image: guide.images?.[0] || "",
          status: "pending",
          rawData: guide,
        }));

      const pendingMedia = mediaData
        .filter((item) => {
          const status =
            item.status || (item.isApproved === true ? "approved" : "pending");

          return status === "pending";
        })
        .map((item) => ({
          id: item._id,
          type: "media",
          title: item.title || "Traveler Media Approval",
          owner: item.user?.name || item.userName || "Traveler",
          location:
            item.place?.name ||
            item.placeName ||
            item.location ||
            "Travel Location",
          description: item.description || "No description added",
          image:
            item.url ||
            item.mediaUrl ||
            item.fileUrl ||
            item.imageUrl ||
            item.videoUrl ||
            "",
          status: "pending",
          rawData: item,
        }));

      const approvalData = [
        ...pendingHotels,
        ...pendingVehicles,
        ...pendingGuides,
        ...pendingMedia,
      ];

      setAllApprovals(approvalData);
      setFilteredApprovals(approvalData);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load approval data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  useEffect(() => {
    let result = [...allApprovals];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(search) ||
          item.owner.toLowerCase().includes(search) ||
          item.location.toLowerCase().includes(search) ||
          item.type.toLowerCase().includes(search)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((item) => item.type === typeFilter);
    }

    setFilteredApprovals(result);
  }, [searchText, typeFilter, allApprovals]);

  function getTypeIcon(type) {
    if (type === "hotel") return <FaHotel />;
    if (type === "vehicle") return <FaCar />;
    if (type === "guide") return <FaUserTie />;
    if (type === "media") return <FaImage />;
    return <FaClock />;
  }

  function getTypeColor(type) {
    if (type === "hotel") return "bg-blue-600";
    if (type === "vehicle") return "bg-green-600";
    if (type === "guide") return "bg-purple-600";
    if (type === "media") return "bg-orange";
    return "bg-gray-600";
  }

  function getApproveEndpoint(item) {
    if (item.type === "hotel") return `/hotels/${item.id}/approve`;
    if (item.type === "vehicle") return `/vehicles/${item.id}/approve`;
    if (item.type === "guide") return `/guides/${item.id}/approve`;
    if (item.type === "media") return `/media/${item.id}/approve`;
    return "";
  }

  function getRejectEndpoint(item) {
    if (item.type === "hotel") return `/hotels/${item.id}/reject`;
    if (item.type === "vehicle") return `/vehicles/${item.id}/reject`;
    if (item.type === "guide") return `/guides/${item.id}/reject`;
    if (item.type === "media") return `/media/${item.id}/reject`;
    return "";
  }

  function getUpdateEndpoint(item) {
    if (item.type === "hotel") return `/hotels/${item.id}`;
    if (item.type === "vehicle") return `/vehicles/${item.id}`;
    if (item.type === "guide") return `/guides/${item.id}`;
    if (item.type === "media") return `/media/${item.id}`;
    return "";
  }

  async function handleApprove(item) {
    try {
      const confirmApprove = window.confirm(
        `Are you sure you want to approve this ${item.type}?`
      );

      if (!confirmApprove) return;

      try {
        await axios.put(
          `${API_URL}${getApproveEndpoint(item)}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}${getUpdateEndpoint(item)}`,
          {
            isApproved: true,
            status: "approved",
            approvalStatus: "approved",
          },
          getAuthHeader()
        );
      }

      toast.success(`${capitalize(item.type)} approved successfully`);
      loadApprovals();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Approval failed");
    }
  }

  async function handleReject(item) {
    try {
      const confirmReject = window.confirm(
        `Are you sure you want to reject this ${item.type}?`
      );

      if (!confirmReject) return;

      try {
        await axios.put(
          `${API_URL}${getRejectEndpoint(item)}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}${getUpdateEndpoint(item)}`,
          {
            isApproved: false,
            status: "rejected",
            approvalStatus: "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(`${capitalize(item.type)} rejected`);
      loadApprovals();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Reject failed");
    }
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const pendingHotels = hotels.filter((hotel) => hotel.isApproved === false).length;
  const pendingVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved === false
  ).length;
  const pendingGuides = guides.filter((guide) => guide.isApproved === false).length;
  const pendingMedia = media.filter((item) => {
    const status =
      item.status || (item.isApproved === true ? "approved" : "pending");

    return status === "pending";
  }).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Approvals Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Approve or reject pending hotels, vehicles, travel guides and
            traveler uploaded media.
          </p>
        </div>

        <button
          onClick={loadApprovals}
          className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <ApprovalStatCard
          title="Pending Hotels"
          value={pendingHotels}
          icon={<FaHotel />}
          color="bg-blue-600"
        />

        <ApprovalStatCard
          title="Pending Vehicles"
          value={pendingVehicles}
          icon={<FaCar />}
          color="bg-green-600"
        />

        <ApprovalStatCard
          title="Pending Guides"
          value={pendingGuides}
          icon={<FaUserTie />}
          color="bg-purple-600"
        />

        <ApprovalStatCard
          title="Pending Media"
          value={pendingMedia}
          icon={<FaImage />}
          color="bg-orange"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by title, owner, location or type"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Types</option>
            <option value="hotel">Hotels</option>
            <option value="vehicle">Vehicles</option>
            <option value="guide">Travel Guides</option>
            <option value="media">Media Uploads</option>
          </select>
        </div>
      </div>

      {/* Approval List */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Pending Approval Requests
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredApprovals.length} pending request(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading approval requests...
          </div>
        ) : filteredApprovals.length === 0 ? (
          <div className="w-full min-h-[250px] flex flex-col justify-center items-center text-gray-500">
            <FaCheckCircle className="text-5xl text-green-600 mb-[15px]" />
            <p className="font-semibold">No pending approvals found</p>
            <p className="text-sm">
              All hotels, vehicles, guides and media are already reviewed.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
            {filteredApprovals.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="border border-gray-200 rounded-2xl p-[18px] shadow-sm"
              >
                <div className="flex gap-[15px]">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-[110px] h-[90px] rounded-xl object-cover border"
                    />
                  ) : (
                    <div className="w-[110px] h-[90px] rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400 text-3xl">
                      {getTypeIcon(item.type)}
                    </div>
                  )}

                  <div className="flex-1">
                    <div className="flex items-center gap-[8px] mb-[6px]">
                      <span
                        className={`${getTypeColor(
                          item.type
                        )} text-white text-xs px-[10px] py-[4px] rounded-full capitalize`}
                      >
                        {item.type}
                      </span>

                      <span className="bg-orange text-white text-xs px-[10px] py-[4px] rounded-full">
                        Pending
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-800 text-lg">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-500 mt-[3px]">
                      Owner: {item.owner}
                    </p>

                    <p className="text-sm text-gray-500">
                      Location: {item.location}
                    </p>

                    <p className="text-sm text-gray-400 line-clamp-2 mt-[6px]">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-[10px] mt-[18px]">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 h-[40px] rounded-lg bg-blue-600 text-white flex items-center justify-center gap-[8px] hover:bg-blue-700"
                  >
                    <FaEye />
                    View
                  </button>

                  <button
                    onClick={() => handleApprove(item)}
                    className="flex-1 h-[40px] rounded-lg bg-green-600 text-white flex items-center justify-center gap-[8px] hover:bg-green-700"
                  >
                    <FaCheckCircle />
                    Approve
                  </button>

                  <button
                    onClick={() => handleReject(item)}
                    className="flex-1 h-[40px] rounded-lg bg-red-600 text-white flex items-center justify-center gap-[8px] hover:bg-red-700"
                  >
                    <FaTimesCircle />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-[20px]">
          <div className="w-full max-w-[750px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-[25px]">
            <div className="flex justify-between items-center mb-[20px]">
              <div>
                <h2 className="text-2xl font-bold text-accent">
                  Approval Details
                </h2>
                <p className="text-sm text-gray-500">
                  Review the full details before approving or rejecting.
                </p>
              </div>

              <button
                onClick={() => setSelectedItem(null)}
                className="w-[35px] h-[35px] rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            {selectedItem.image && (
              <div className="w-full h-[300px] bg-gray-100 rounded-xl overflow-hidden mb-[20px]">
                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <DetailItem label="Type" value={selectedItem.type} />
              <DetailItem label="Title" value={selectedItem.title} />
              <DetailItem label="Owner / User" value={selectedItem.owner} />
              <DetailItem label="Location" value={selectedItem.location} />
              <DetailItem label="Status" value={selectedItem.status} />
              <DetailItem label="Record ID" value={selectedItem.id} />
            </div>

            <div className="mt-[15px] border border-gray-200 rounded-lg p-[12px]">
              <p className="text-sm text-gray-500 mb-[5px]">Description</p>
              <p className="text-gray-800 leading-relaxed">
                {selectedItem.description}
              </p>
            </div>

            <div className="flex justify-end gap-[10px] mt-[20px]">
              <button
                onClick={() => {
                  handleApprove(selectedItem);
                  setSelectedItem(null);
                }}
                className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold"
              >
                Approve
              </button>

              <button
                onClick={() => {
                  handleReject(selectedItem);
                  setSelectedItem(null);
                }}
                className="px-[18px] py-[10px] rounded-lg bg-red-600 text-white font-semibold"
              >
                Reject
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApprovalStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">
          {value}
        </h2>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-[12px]">
      <p className="text-sm text-gray-500 mb-[4px]">{label}</p>
      <p className="font-semibold text-gray-800 break-words capitalize">
        {value}
      </p>
    </div>
  );
}