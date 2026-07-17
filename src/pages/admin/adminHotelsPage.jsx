import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaEye,
  FaHotel,
  FaImage,
  FaSearch,
  FaStar,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingHotelId, setUpdatingHotelId] = useState("");
  const [deletingHotelId, setDeletingHotelId] = useState("");

  const [searchText, setSearchText] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [selectedHotel, setSelectedHotel] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please log in again");
    }

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

  async function loadHotels() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/hotels/admin/all`,
        getAuthHeader()
      );

      const hotelList = Array.isArray(response.data)
        ? response.data
        : response.data?.hotels || response.data?.data || [];

      setHotels(hotelList);
    } catch (error) {
      console.error("Load hotels error:", error);
      setHotels([]);
      toast.error(getApiErrorMessage(error, "Failed to load hotels"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const ownerName =
        hotel.ownerId?.name ||
        hotel.ownerId?.email ||
        hotel.owner?.name ||
        "";

      const ownerId =
        typeof hotel.ownerId === "string"
          ? hotel.ownerId
          : hotel.ownerId?._id || hotel.owner?._id || "";

      const roomTypeText = Array.isArray(hotel.roomTypes)
        ? hotel.roomTypes.map((room) => room.name || "").join(" ")
        : "";

      const matchesSearch =
        search === "" ||
        String(hotel.name || "").toLowerCase().includes(search) ||
        String(hotel.address || "").toLowerCase().includes(search) ||
        String(hotel.contactNumber || "").toLowerCase().includes(search) ||
        String(ownerName).toLowerCase().includes(search) ||
        String(ownerId).toLowerCase().includes(search) ||
        roomTypeText.toLowerCase().includes(search);

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" &&
          hotel.isApproved === true) ||
        (approvalFilter === "pending" &&
          hotel.isApproved !== true);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          hotel.isAvailable !== false) ||
        (availabilityFilter === "unavailable" &&
          hotel.isAvailable === false);

      return (
        matchesSearch &&
        matchesApproval &&
        matchesAvailability
      );
    });
  }, [
    hotels,
    searchText,
    approvalFilter,
    availabilityFilter,
  ]);

  async function handleApprovalChange(hotel, newApprovalStatus) {
    const action = newApprovalStatus ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        hotel.name || "this hotel"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingHotelId(hotel._id);

      const endpoint = newApprovalStatus ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/hotels/${hotel._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch (specificRouteError) {
        if (
          specificRouteError?.response?.status !== 404 &&
          specificRouteError?.response?.status !== 405
        ) {
          throw specificRouteError;
        }

        await axios.put(
          `${API_URL}/hotels/${hotel._id}`,
          {
            isApproved: newApprovalStatus,
          },
          getAuthHeader()
        );
      }

      toast.success(
        newApprovalStatus
          ? "Hotel approved successfully"
          : "Hotel rejected successfully"
      );

      setSelectedHotel(null);
      await loadHotels();
    } catch (error) {
      console.error("Hotel approval error:", error);
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update hotel approval"
        )
      );
    } finally {
      setUpdatingHotelId("");
    }
  }

  async function handleDeleteHotel(hotel) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        hotel.name || "this hotel"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingHotelId(hotel._id);

      await axios.delete(
        `${API_URL}/hotels/${hotel._id}`,
        getAuthHeader()
      );

      toast.success("Hotel deleted successfully");
      setSelectedHotel(null);
      await loadHotels();
    } catch (error) {
      console.error("Delete hotel error:", error);
      toast.error(
        getApiErrorMessage(error, "Failed to delete hotel")
      );
    } finally {
      setDeletingHotelId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setApprovalFilter("all");
    setAvailabilityFilter("all");
  }

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

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Hotels Management
          </h1>

          <p className="text-gray-500 mt-[5px]">
            Review hotel-owner submissions and approve or reject
            hotels before they appear publicly.
          </p>
        </div>

        <button
          type="button"
          onClick={loadHotels}
          disabled={loading}
          className="w-fit flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <HotelStatCard
          title="Total Hotels"
          value={totalHotels}
          icon={<FaHotel />}
          color="bg-blue-600"
        />

        <HotelStatCard
          title="Approved Hotels"
          value={approvedHotels}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <HotelStatCard
          title="Pending Hotels"
          value={pendingHotels}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <HotelStatCard
          title="Available Hotels"
          value={availableHotels}
          icon={<FaHotel />}
          color="bg-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search hotel, owner, room type or address"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Approval Status
            </option>
            <option value="pending">
              Pending Hotels
            </option>
            <option value="approved">
              Approved Hotels
            </option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Availability
            </option>
            <option value="available">
              Available Hotels
            </option>
            <option value="unavailable">
              Unavailable Hotels
            </option>
          </select>
        </div>

        {(searchText ||
          approvalFilter !== "all" ||
          availabilityFilter !== "all") && (
          <div className="flex justify-end mt-[15px]">
            <button
              type="button"
              onClick={clearFilters}
              className="text-accent font-semibold hover:text-orange"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Hotels table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Hotel Submissions
            </h2>

            <p className="text-sm text-gray-500">
              Showing {filteredHotels.length} hotel(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading hotels...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1150px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Hotel</th>
                  <th className="py-[12px]">Owner</th>
                  <th className="py-[12px]">Address</th>
                  <th className="py-[12px]">Rooms</th>
                  <th className="py-[12px]">
                    Starting Price
                  </th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">
                    Availability
                  </th>
                  <th className="py-[12px] text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredHotels.map((hotel) => {
                  const isUpdating =
                    updatingHotelId === hotel._id;
                  const isDeleting =
                    deletingHotelId === hotel._id;

                  return (
                    <tr
                      key={hotel._id}
                      className="border-b text-sm"
                    >
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          {getHotelImage(hotel) ? (
                            <img
                              src={getHotelImage(hotel)}
                              alt={hotel.name || "Hotel"}
                              onError={(event) => {
                                event.currentTarget.onerror =
                                  null;
                                event.currentTarget.src =
                                  "/hotel-placeholder.jpg";
                              }}
                              className="w-[65px] h-[48px] rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-[65px] h-[48px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                              <FaImage />
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-800">
                              {hotel.name ||
                                "Unnamed hotel"}
                            </p>

                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[220px]">
                              {hotel.contactNumber ||
                                "No contact number"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600 max-w-[180px]">
                        {getOwnerDisplay(hotel)}
                      </td>

                      <td className="py-[14px] text-gray-600 max-w-[220px]">
                        {hotel.address || "Not added"}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {hotel.roomTypes?.length || 0}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        Rs.{" "}
                        {getMinimumRoomPrice(
                          hotel
                        ).toLocaleString("en-LK")}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[5px]">
                          <FaStar className="text-orange" />
                          {Number(
                            hotel.rating || 0
                          ).toFixed(1)}
                        </div>
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={hotel.isApproved === true}
                          activeText="Approved"
                          inactiveText="Pending"
                        />
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={
                            hotel.isAvailable !== false
                          }
                          activeText="Available"
                          inactiveText="Unavailable"
                        />
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedHotel(hotel)
                            }
                            disabled={
                              isUpdating || isDeleting
                            }
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="View Hotel Details"
                          >
                            <FaEye />
                          </button>

                          {!hotel.isApproved && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprovalChange(
                                  hotel,
                                  true
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white disabled:opacity-60"
                              title="Approve Hotel"
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                          {hotel.isApproved && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprovalChange(
                                  hotel,
                                  false
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white disabled:opacity-60"
                              title="Reject Hotel"
                            >
                              <FaTimesCircle />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteHotel(hotel)
                            }
                            disabled={
                              isUpdating || isDeleting
                            }
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="Delete Hotel"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredHotels.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[35px] text-center text-gray-500"
                    >
                      No hotels found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedHotel && (
        <HotelDetailsModal
          hotel={selectedHotel}
          updatingHotelId={updatingHotelId}
          deletingHotelId={deletingHotelId}
          onClose={() => setSelectedHotel(null)}
          onApprovalChange={handleApprovalChange}
          onDelete={handleDeleteHotel}
        />
      )}
    </div>
  );
}

function HotelDetailsModal({
  hotel,
  updatingHotelId,
  deletingHotelId,
  onClose,
  onApprovalChange,
  onDelete,
}) {
  const isUpdating = updatingHotelId === hotel._id;
  const isDeleting = deletingHotelId === hotel._id;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-[20px] flex items-center justify-center">
      <div className="w-full max-w-[900px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-[20px] py-[15px] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {hotel.name || "Hotel Details"}
            </h2>

            <p className="text-sm text-gray-500">
              Review the complete hotel submission.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-[20px]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px]">
            <div>
              <HotelImageGallery hotel={hotel} />
            </div>

            <div className="space-y-[12px]">
              <DetailRow
                label="Owner"
                value={getOwnerDisplay(hotel)}
              />

              <DetailRow
                label="Contact"
                value={
                  hotel.contactNumber || "Not added"
                }
              />

              <DetailRow
                label="Address"
                value={hotel.address || "Not added"}
              />

              <DetailRow
                label="Coordinates"
                value={formatCoordinates(
                  hotel.location
                )}
              />

              <DetailRow
                label="Rating"
                value={`${Number(
                  hotel.rating || 0
                ).toFixed(1)} / 5`}
              />

              <div className="flex flex-wrap gap-[8px]">
                <StatusBadge
                  active={hotel.isApproved === true}
                  activeText="Approved"
                  inactiveText="Pending"
                />

                <StatusBadge
                  active={hotel.isAvailable !== false}
                  activeText="Available"
                  inactiveText="Unavailable"
                />
              </div>
            </div>
          </div>

          <div className="mt-[20px]">
            <h3 className="font-bold text-gray-800 mb-[8px]">
              Description
            </h3>

            <p className="text-gray-600 leading-7 whitespace-pre-wrap">
              {hotel.description ||
                "No description provided."}
            </p>
          </div>

          <div className="mt-[20px]">
            <h3 className="font-bold text-gray-800 mb-[10px]">
              Room Types
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b text-sm text-gray-500">
                    <th className="py-[10px]">
                      Room Name
                    </th>
                    <th className="py-[10px]">
                      Price Per Night
                    </th>
                    <th className="py-[10px]">
                      Capacity
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(hotel.roomTypes || []).map(
                    (room, index) => (
                      <tr
                        key={`${room.name}-${index}`}
                        className="border-b text-sm"
                      >
                        <td className="py-[10px]">
                          {room.name || "Unnamed room"}
                        </td>

                        <td className="py-[10px]">
                          Rs.{" "}
                          {Number(
                            room.pricePerNight || 0
                          ).toLocaleString("en-LK")}
                        </td>

                        <td className="py-[10px]">
                          {room.capacity || 0} guest(s)
                        </td>
                      </tr>
                    )
                  )}

                  {!hotel.roomTypes?.length && (
                    <tr>
                      <td
                        colSpan="3"
                        className="py-[20px] text-center text-gray-500"
                      >
                        No room types provided
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-[10px] mt-[25px]">
            <button
              type="button"
              onClick={() => onDelete(hotel)}
              disabled={isUpdating || isDeleting}
              className="px-[18px] py-[10px] rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              Delete Hotel
            </button>

            {hotel.isApproved ? (
              <button
                type="button"
                onClick={() =>
                  onApprovalChange(hotel, false)
                }
                disabled={isUpdating || isDeleting}
                className="px-[18px] py-[10px] rounded-lg bg-orange text-white font-semibold hover:bg-orange/80 disabled:opacity-60"
              >
                Reject Hotel
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onApprovalChange(hotel, true)
                }
                disabled={isUpdating || isDeleting}
                className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                Approve Hotel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function HotelImageGallery({ hotel }) {
  const images = Array.isArray(hotel.images)
    ? hotel.images.filter(Boolean)
    : [];

  if (images.length === 0) {
    return (
      <div className="w-full h-[260px] rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400 text-5xl">
        <FaImage />
      </div>
    );
  }

  return (
    <div>
      <img
        src={normalizeImageUrl(images[0])}
        alt={hotel.name || "Hotel"}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/hotel-placeholder.jpg";
        }}
        className="w-full h-[260px] rounded-xl object-cover border"
      />

      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-[8px] mt-[8px]">
          {images.slice(1, 4).map((image, index) => (
            <img
              key={`${image}-${index}`}
              src={normalizeImageUrl(image)}
              alt={`${hotel.name || "Hotel"} ${index + 2}`}
              className="w-full h-[80px] rounded-lg object-cover border"
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelStatCard({ title, value, icon, color }) {
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

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return (
    <span
      className={`inline-flex px-[10px] py-[5px] rounded-full text-xs text-white ${
        active ? "bg-green-600" : "bg-orange"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>

      <p className="text-gray-700 mt-[2px] break-words">
        {value}
      </p>
    </div>
  );
}

function getOwnerDisplay(hotel) {
  if (hotel.ownerId && typeof hotel.ownerId === "object") {
    return (
      hotel.ownerId.name ||
      hotel.ownerId.email ||
      hotel.ownerId._id ||
      "Not added"
    );
  }

  return hotel.ownerId || hotel.owner?.name || "Not added";
}

function getMinimumRoomPrice(hotel) {
  if (!Array.isArray(hotel.roomTypes)) {
    return 0;
  }

  const prices = hotel.roomTypes
    .map((room) => Number(room.pricePerNight))
    .filter(
      (price) =>
        Number.isFinite(price) && price >= 0
    );

  return prices.length > 0 ? Math.min(...prices) : 0;
}

function formatCoordinates(location) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return "Not added";
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(
    6
  )}`;
}

function normalizeImageUrl(image) {
  const imageText = String(image || "").trim();

  if (!imageText) {
    return "";
  }

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

function getHotelImage(hotel) {
  const firstImage = Array.isArray(hotel.images)
    ? hotel.images.find(Boolean)
    : "";

  return normalizeImageUrl(firstImage);
}