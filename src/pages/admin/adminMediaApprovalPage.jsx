import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaImage,
  FaVideo,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaUser,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminMediaApprovalPage() {
  const [mediaList, setMediaList] = useState([]);
  const [filteredMedia, setFilteredMedia] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedMedia, setSelectedMedia] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadMedia() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(`${API_URL}/media/admin/all`, getAuthHeader());
      } catch {
        response = await axios.get(`${API_URL}/media`, getAuthHeader());
      }

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.media || response.data.data || [];

      setMediaList(data);
      setFilteredMedia(data);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load media");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMedia();
  }, []);

  useEffect(() => {
    let result = [...mediaList];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter((media) => {
        const userName = media.user?.name || media.userName || "";
        const placeName = media.place?.name || media.placeName || "";
        const title = media.title || "";
        const description = media.description || "";

        return (
          userName.toLowerCase().includes(search) ||
          placeName.toLowerCase().includes(search) ||
          title.toLowerCase().includes(search) ||
          description.toLowerCase().includes(search)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (media) => media.mediaType === typeFilter || media.type === typeFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((media) => {
        const status =
          media.status || (media.isApproved === true ? "approved" : "pending");

        return status === statusFilter;
      });
    }

    setFilteredMedia(result);
  }, [searchText, typeFilter, statusFilter, mediaList]);

  function getMediaType(media) {
    return media.mediaType || media.type || "photo";
  }

  function getMediaUrl(media) {
    return (
      media.url ||
      media.mediaUrl ||
      media.fileUrl ||
      media.imageUrl ||
      media.videoUrl ||
      media.images?.[0] ||
      ""
    );
  }

  function getPlaceName(media) {
    return media.place?.name || media.placeName || media.location || "Unknown place";
  }

  function getUserName(media) {
    return media.user?.name || media.userName || "Unknown traveler";
  }

  function getUserEmail(media) {
    return media.user?.email || media.userEmail || "No email";
  }

  function getStatus(media) {
    return media.status || (media.isApproved === true ? "approved" : "pending");
  }

  async function handleApprovalChange(media, isApproved) {
    try {
      const endpoint = isApproved ? "approve" : "reject";

      try {
        await axios.put(`${API_URL}/media/${media._id}/${endpoint}`, {}, getAuthHeader());
      } catch {
        await axios.put(
          `${API_URL}/media/${media._id}`,
          {
            isApproved,
            status: isApproved ? "approved" : "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(isApproved ? "Media approved successfully" : "Media rejected");
      loadMedia();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update media");
    }
  }

  async function handleDeleteMedia(media) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this media?"
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/media/${media._id}`, getAuthHeader());

      toast.success("Media deleted successfully");
      loadMedia();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete media");
    }
  }

  const totalMedia = mediaList.length;
  const pendingMedia = mediaList.filter((media) => getStatus(media) === "pending")
    .length;
  const approvedMedia = mediaList.filter((media) => getStatus(media) === "approved")
    .length;
  const rejectedMedia = mediaList.filter((media) => getStatus(media) === "rejected")
    .length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Media Approval
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Review, approve, reject and delete traveler uploaded photos and
            videos before publishing.
          </p>
        </div>

        <button
          onClick={loadMedia}
          className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <MediaStatCard
          title="Total Media"
          value={totalMedia}
          icon={<FaImage />}
          color="bg-blue-600"
        />

        <MediaStatCard
          title="Pending Approval"
          value={pendingMedia}
          icon={<FaImage />}
          color="bg-orange"
        />

        <MediaStatCard
          title="Approved Media"
          value={approvedMedia}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <MediaStatCard
          title="Rejected Media"
          value={rejectedMedia}
          icon={<FaTimesCircle />}
          color="bg-red-600"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by traveler, place, title or description"
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
            <option value="all">All Media Types</option>
            <option value="photo">Photos</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Media Cards */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Traveler Uploaded Media
            </h2>
            <p className="text-sm text-gray-500">
              Showing {filteredMedia.length} media item(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading uploaded media...
          </div>
        ) : filteredMedia.length === 0 ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            No media found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[20px]">
            {filteredMedia.map((media) => {
              const type = getMediaType(media);
              const url = getMediaUrl(media);
              const status = getStatus(media);

              return (
                <div
                  key={media._id}
                  className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
                >
                  <div className="w-full h-[220px] bg-gray-100 relative">
                    {type === "video" ? (
                      url ? (
                        <video
                          src={url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <MediaPlaceholder icon={<FaVideo />} />
                      )
                    ) : url ? (
                      <img
                        src={url}
                        alt={media.title || "Travel media"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <MediaPlaceholder icon={<FaImage />} />
                    )}

                    <span
                      className={`absolute top-[12px] right-[12px] px-[10px] py-[5px] rounded-full text-xs text-white capitalize ${
                        status === "approved"
                          ? "bg-green-600"
                          : status === "rejected"
                          ? "bg-red-600"
                          : "bg-orange"
                      }`}
                    >
                      {status}
                    </span>

                    <span className="absolute top-[12px] left-[12px] px-[10px] py-[5px] rounded-full text-xs text-white bg-black/60 capitalize">
                      {type === "image" ? "photo" : type}
                    </span>
                  </div>

                  <div className="p-[15px]">
                    <h3 className="font-bold text-gray-800 text-lg">
                      {media.title || "Travel Media"}
                    </h3>

                    <p className="text-sm text-gray-500 mt-[5px] line-clamp-2">
                      {media.description || "No description added"}
                    </p>

                    <div className="mt-[12px] space-y-[6px]">
                      <div className="flex items-center gap-[8px] text-sm text-gray-600">
                        <FaUser className="text-accent" />
                        <span>{getUserName(media)}</span>
                      </div>

                      <div className="flex items-center gap-[8px] text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-accent" />
                        <span>{getPlaceName(media)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center gap-[8px] mt-[15px]">
                      <button
                        onClick={() => setSelectedMedia(media)}
                        className="flex-1 h-[38px] rounded-lg bg-blue-600 text-white flex items-center justify-center gap-[6px] hover:bg-blue-700"
                      >
                        <FaEye />
                        View
                      </button>

                      {status !== "approved" && (
                        <button
                          onClick={() => handleApprovalChange(media, true)}
                          className="flex-1 h-[38px] rounded-lg bg-green-600 text-white flex items-center justify-center gap-[6px] hover:bg-green-700"
                        >
                          <FaCheckCircle />
                          Approve
                        </button>
                      )}

                      {status !== "rejected" && (
                        <button
                          onClick={() => handleApprovalChange(media, false)}
                          className="flex-1 h-[38px] rounded-lg bg-orange text-white flex items-center justify-center gap-[6px] hover:bg-orange/80"
                        >
                          <FaTimesCircle />
                          Reject
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteMedia(media)}
                        className="w-[40px] h-[38px] rounded-lg bg-red-600 text-white flex items-center justify-center hover:bg-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-[20px]">
          <div className="w-full max-w-[850px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-[25px]">
            <div className="flex justify-between items-center mb-[20px]">
              <div>
                <h2 className="text-2xl font-bold text-accent">
                  Media Details
                </h2>
                <p className="text-sm text-gray-500">
                  Review uploaded traveler media before publishing.
                </p>
              </div>

              <button
                onClick={() => setSelectedMedia(null)}
                className="w-[35px] h-[35px] rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="w-full h-[360px] bg-gray-100 rounded-xl overflow-hidden mb-[20px]">
              {getMediaType(selectedMedia) === "video" ? (
                getMediaUrl(selectedMedia) ? (
                  <video
                    src={getMediaUrl(selectedMedia)}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <MediaPlaceholder icon={<FaVideo />} />
                )
              ) : getMediaUrl(selectedMedia) ? (
                <img
                  src={getMediaUrl(selectedMedia)}
                  alt={selectedMedia.title || "Travel media"}
                  className="w-full h-full object-contain"
                />
              ) : (
                <MediaPlaceholder icon={<FaImage />} />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <DetailItem label="Title" value={selectedMedia.title || "No title"} />
              <DetailItem label="Media Type" value={getMediaType(selectedMedia)} />
              <DetailItem label="Status" value={getStatus(selectedMedia)} />
              <DetailItem label="Traveler" value={getUserName(selectedMedia)} />
              <DetailItem label="Traveler Email" value={getUserEmail(selectedMedia)} />
              <DetailItem label="Place" value={getPlaceName(selectedMedia)} />
            </div>

            <div className="mt-[15px] border border-gray-200 rounded-lg p-[12px]">
              <p className="text-sm text-gray-500 mb-[5px]">Description</p>
              <p className="text-gray-800">
                {selectedMedia.description || "No description added"}
              </p>
            </div>

            <div className="flex justify-end gap-[10px] mt-[20px]">
              {getStatus(selectedMedia) !== "approved" && (
                <button
                  onClick={() => {
                    handleApprovalChange(selectedMedia, true);
                    setSelectedMedia(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold"
                >
                  Approve
                </button>
              )}

              {getStatus(selectedMedia) !== "rejected" && (
                <button
                  onClick={() => {
                    handleApprovalChange(selectedMedia, false);
                    setSelectedMedia(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-orange text-white font-semibold"
                >
                  Reject
                </button>
              )}

              <button
                onClick={() => setSelectedMedia(null)}
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

function MediaStatCard({ title, value, icon, color }) {
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

function MediaPlaceholder({ icon }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-5xl">
      {icon}
      <p className="text-sm mt-[10px]">No media preview</p>
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