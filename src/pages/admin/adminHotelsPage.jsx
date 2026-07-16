import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaHotel,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaStar,
  FaImage,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

const EMPTY_ROOM_TYPE = {
  name: "",
  pricePerNight: "",
  capacity: "",
};

function isValidMongoObjectId(value) {
  return /^[a-fA-F0-9]{24}$/.test(value);
}

function getApiErrorMessage(error, fallbackMessage) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMessage
  );
}

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  // Separate useState variables matching the Hotel model
  const [ownerId, setOwnerId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [images, setImages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([{ ...EMPTY_ROOM_TYPE }]);
  const [contactNumber, setContactNumber] = useState("");
  const [rating, setRating] = useState(0);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadHotels() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(
          `${API_URL}/hotels/admin/all`,
          getAuthHeader()
        );
      } catch (adminRouteError) {
        console.warn(
          "Admin hotel route failed. Trying the normal hotel route.",
          adminRouteError
        );

        response = await axios.get(`${API_URL}/hotels`, getAuthHeader());
      }

      const hotelList = Array.isArray(response.data)
        ? response.data
        : response.data?.hotels || response.data?.data || [];

      setHotels(hotelList);
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to load hotels"));
      setHotels([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    let result = [...hotels];

    if (searchText.trim() !== "") {
      const search = searchText.trim().toLowerCase();

      result = result.filter((hotel) => {
        const hotelOwnerName =
          hotel.ownerId?.name || hotel.owner?.name || hotel.ownerName || "";

        const hotelOwnerId =
          typeof hotel.ownerId === "string"
            ? hotel.ownerId
            : hotel.ownerId?._id || hotel.owner?._id || "";

        return (
          String(hotel.name || "").toLowerCase().includes(search) ||
          String(hotel.address || "").toLowerCase().includes(search) ||
          String(hotel.contactNumber || "").toLowerCase().includes(search) ||
          String(hotelOwnerName).toLowerCase().includes(search) ||
          String(hotelOwnerId).toLowerCase().includes(search)
        );
      });
    }

    if (statusFilter !== "all") {
      result = result.filter((hotel) => {
        if (statusFilter === "available") {
          return hotel.isAvailable !== false;
        }

        return hotel.isAvailable === false;
      });
    }

    if (approvalFilter !== "all") {
      result = result.filter((hotel) => {
        if (approvalFilter === "approved") {
          return hotel.isApproved === true;
        }

        return hotel.isApproved !== true;
      });
    }

    setFilteredHotels(result);
  }, [searchText, statusFilter, approvalFilter, hotels]);

  function resetForm() {
    setOwnerId("");
    setName("");
    setDescription("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setImages([]);
    setRoomTypes([{ ...EMPTY_ROOM_TYPE }]);
    setContactNumber("");
    setRating(0);
    setIsAvailable(true);
    setIsApproved(false);

    setEditingHotel(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(hotel) {
    setEditingHotel(hotel);

    setOwnerId(
      typeof hotel.ownerId === "string"
        ? hotel.ownerId
        : hotel.ownerId?._id || hotel.owner?._id || ""
    );
    setName(hotel.name || "");
    setDescription(hotel.description || "");
    setAddress(hotel.address || "");
    setLatitude(hotel.location?.latitude ?? "");
    setLongitude(hotel.location?.longitude ?? "");
    setImages(Array.isArray(hotel.images) ? hotel.images : []);
    setRoomTypes(
      Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0
        ? hotel.roomTypes.map((room) => ({
            name: room.name || "",
            pricePerNight: room.pricePerNight ?? "",
            capacity: room.capacity ?? "",
          }))
        : [{ ...EMPTY_ROOM_TYPE }]
    );
    setContactNumber(hotel.contactNumber || "");
    setRating(hotel.rating ?? 0);
    setIsAvailable(hotel.isAvailable !== false);
    setIsApproved(hotel.isApproved === true);

    setShowForm(true);
  }

  function handleImagesChange(e) {
    const imageList = e.target.value
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    setImages(imageList);
  }

  function handleRoomTypeChange(index, field, value) {
    setRoomTypes((previousRoomTypes) =>
      previousRoomTypes.map((room, roomIndex) =>
        roomIndex === index
          ? {
              ...room,
              [field]: value,
            }
          : room
      )
    );
  }

  function addRoomType() {
    setRoomTypes((previousRoomTypes) => [
      ...previousRoomTypes,
      { ...EMPTY_ROOM_TYPE },
    ]);
  }

  function removeRoomType(index) {
    if (roomTypes.length === 1) {
      toast.error("At least one room type is required");
      return;
    }

    setRoomTypes((previousRoomTypes) =>
      previousRoomTypes.filter((_, roomIndex) => roomIndex !== index)
    );
  }

  function validateAndBuildPayload() {
    const cleanOwnerId = ownerId.trim();
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanAddress = address.trim();
    const cleanContactNumber = contactNumber.trim();

    if (!cleanOwnerId) {
      toast.error("Owner ID is required");
      return null;
    }

    if (!isValidMongoObjectId(cleanOwnerId)) {
      toast.error("Owner ID must be a valid 24-character MongoDB ID");
      return null;
    }

    if (cleanName.length < 2) {
      toast.error("Hotel name must contain at least 2 characters");
      return null;
    }

    if (cleanName.length > 150) {
      toast.error("Hotel name cannot exceed 150 characters");
      return null;
    }

    if (cleanDescription.length < 10) {
      toast.error("Description must contain at least 10 characters");
      return null;
    }

    if (cleanDescription.length > 3000) {
      toast.error("Description cannot exceed 3000 characters");
      return null;
    }

    if (cleanAddress.length > 500) {
      toast.error("Address cannot exceed 500 characters");
      return null;
    }

    if (cleanContactNumber.length > 30) {
      toast.error("Contact number cannot exceed 30 characters");
      return null;
    }

    const latitudeNumber = latitude === "" ? 0 : Number(latitude);
    const longitudeNumber = longitude === "" ? 0 : Number(longitude);
    const ratingNumber = rating === "" ? 0 : Number(rating);

    if (
      Number.isNaN(latitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      toast.error("Latitude must be between -90 and 90");
      return null;
    }

    if (
      Number.isNaN(longitudeNumber) ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      toast.error("Longitude must be between -180 and 180");
      return null;
    }

    if (
      Number.isNaN(ratingNumber) ||
      ratingNumber < 0 ||
      ratingNumber > 5
    ) {
      toast.error("Rating must be between 0 and 5");
      return null;
    }

    if (!Array.isArray(roomTypes) || roomTypes.length === 0) {
      toast.error("At least one room type is required");
      return null;
    }

    const normalizedRoomTypes = [];

    for (let index = 0; index < roomTypes.length; index += 1) {
      const room = roomTypes[index];
      const roomName = room.name.trim();
      const roomPrice = Number(room.pricePerNight);
      const roomCapacity = Number(room.capacity);

      if (!roomName) {
        toast.error(`Room type ${index + 1}: name is required`);
        return null;
      }

      if (roomName.length > 100) {
        toast.error(
          `Room type ${index + 1}: name cannot exceed 100 characters`
        );
        return null;
      }

      if (
        room.pricePerNight === "" ||
        Number.isNaN(roomPrice) ||
        roomPrice < 0
      ) {
        toast.error(`Room type ${index + 1}: enter a valid price`);
        return null;
      }

      if (
        room.capacity === "" ||
        Number.isNaN(roomCapacity) ||
        roomCapacity < 1 ||
        !Number.isInteger(roomCapacity)
      ) {
        toast.error(
          `Room type ${index + 1}: capacity must be a whole number of at least 1`
        );
        return null;
      }

      normalizedRoomTypes.push({
        name: roomName,
        pricePerNight: roomPrice,
        capacity: roomCapacity,
      });
    }

    return {
      ownerId: cleanOwnerId,
      name: cleanName,
      description: cleanDescription,
      address: cleanAddress,
      location: {
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      },
      images: images.map((image) => image.trim()).filter(Boolean),
      roomTypes: normalizedRoomTypes,
      contactNumber: cleanContactNumber,
      rating: ratingNumber,
      isAvailable,
      isApproved,
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const hotelPayload = validateAndBuildPayload();

    if (!hotelPayload) {
      return;
    }

    try {
      setSaving(true);

      if (editingHotel) {
        await axios.put(
          `${API_URL}/hotels/${editingHotel._id}`,
          hotelPayload,
          getAuthHeader()
        );

        toast.success("Hotel updated successfully");
      } else {
        await axios.post(`${API_URL}/hotels`, hotelPayload, getAuthHeader());
        toast.success("Hotel added successfully");
      }

      resetForm();
      await loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to save hotel"));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHotel(hotel) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${hotel.name || "this hotel"}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/hotels/${hotel._id}`, getAuthHeader());

      toast.success("Hotel deleted successfully");
      await loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to delete hotel"));
    }
  }

  async function handleApprovalChange(hotel, newApprovalStatus) {
    try {
      const endpoint = newApprovalStatus ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/hotels/${hotel._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch (specificRouteError) {
        console.warn(
          "Specific approval route failed. Trying the normal update route.",
          specificRouteError
        );

        await axios.put(
          `${API_URL}/hotels/${hotel._id}`,
          { isApproved: newApprovalStatus },
          getAuthHeader()
        );
      }

      toast.success(newApprovalStatus ? "Hotel approved" : "Hotel rejected");
      await loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to update approval"));
    }
  }

  async function handleAvailabilityChange(hotel, newAvailability) {
    try {
      await axios.put(
        `${API_URL}/hotels/${hotel._id}`,
        { isAvailable: newAvailability },
        getAuthHeader()
      );

      toast.success("Hotel availability updated");
      await loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(getApiErrorMessage(error, "Failed to update availability"));
    }
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
    if (!Array.isArray(hotel.roomTypes) || hotel.roomTypes.length === 0) {
      return 0;
    }

    const prices = hotel.roomTypes
      .map((room) => Number(room.pricePerNight))
      .filter((price) => Number.isFinite(price) && price >= 0);

    return prices.length > 0 ? Math.min(...prices) : 0;
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
            Add, update, approve, reject and manage hotels listed on Travel
            Ease.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={loadHotels}
            disabled={loading}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
          >
            <FaPlus />
            Add Hotel
          </button>
        </div>
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

      {/* Add and edit form */}
      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingHotel ? "Update Hotel" : "Add New Hotel"}
              </h2>
              <p className="text-sm text-gray-500">
                Enter the hotel details that match your Hotel model.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="px-[14px] py-[8px] rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <InputField
                label="Owner ID"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                placeholder="24-character MongoDB user ID"
                maxLength={24}
                required
              />

              <InputField
                label="Hotel Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Ocean View Hotel"
                minLength={2}
                maxLength={150}
                required
              />

              <InputField
                label="Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Full hotel address"
                maxLength={500}
              />

              <InputField
                label="Contact Number"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="Example: 0771234567"
                maxLength={30}
              />

              <InputField
                label="Latitude"
                type="number"
                step="any"
                min="-90"
                max="90"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="Example: 6.0329"
              />

              <InputField
                label="Longitude"
                type="number"
                step="any"
                min="-180"
                max="180"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="Example: 80.2168"
              />

              <InputField
                label="Rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="Example: 4.5"
              />

              <div className="flex flex-col sm:flex-row gap-[20px] sm:items-center mt-[10px] md:mt-[28px]">
                <label className="flex items-center gap-[10px] text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-[18px] h-[18px]"
                  />
                  Hotel Available
                </label>

                <label className="flex items-center gap-[10px] text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={isApproved}
                    onChange={(e) => setIsApproved(e.target.checked)}
                    className="w-[18px] h-[18px]"
                  />
                  Admin Approved
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Image URLs
                </label>
                <input
                  type="text"
                  value={images.join(", ")}
                  onChange={handleImagesChange}
                  placeholder="Paste image URLs separated by commas"
                  className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-[10px]">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Room Types
                    </label>
                    <p className="text-xs text-gray-400 mt-[3px]">
                      Add the room name, price per night and guest capacity.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addRoomType}
                    className="flex items-center gap-[6px] px-[12px] py-[8px] rounded-lg bg-accent text-white text-sm font-semibold"
                  >
                    <FaPlus />
                    Add Room
                  </button>
                </div>

                <div className="space-y-[12px]">
                  {roomTypes.map((room, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-[10px] items-end border border-gray-200 rounded-xl p-[12px]"
                    >
                      <InputField
                        label={`Room Name ${index + 1}`}
                        value={room.name}
                        onChange={(e) =>
                          handleRoomTypeChange(index, "name", e.target.value)
                        }
                        placeholder="Example: Deluxe Room"
                        maxLength={100}
                        required
                      />

                      <InputField
                        label="Price Per Night"
                        type="number"
                        min="0"
                        step="0.01"
                        value={room.pricePerNight}
                        onChange={(e) =>
                          handleRoomTypeChange(
                            index,
                            "pricePerNight",
                            e.target.value
                          )
                        }
                        placeholder="Example: 12000"
                        required
                      />

                      <InputField
                        label="Capacity"
                        type="number"
                        min="1"
                        step="1"
                        value={room.capacity}
                        onChange={(e) =>
                          handleRoomTypeChange(index, "capacity", e.target.value)
                        }
                        placeholder="Example: 2"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => removeRoomType(index)}
                        className="h-[45px] w-[45px] rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                        title="Remove room type"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write hotel description"
                  rows="4"
                  minLength={10}
                  maxLength={3000}
                  required
                  className="w-full border border-gray-300 rounded-lg px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-gray-400 mt-[4px]">
                  {description.length}/3000 characters
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-[10px] mt-[20px]">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving
                  ? "Saving..."
                  : editingHotel
                    ? "Update Hotel"
                    : "Save Hotel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by hotel, owner, address or contact number"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved Hotels</option>
            <option value="pending">Pending Hotels</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Availability</option>
            <option value="available">Available Hotels</option>
            <option value="unavailable">Unavailable Hotels</option>
          </select>
        </div>
      </div>

      {/* Hotels table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hotels</h2>
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
                  <th className="py-[12px]">Room Types</th>
                  <th className="py-[12px]">Starting Price</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">Availability</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel._id} className="border-b text-sm">
                    <td className="py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        {hotel.images?.[0] ? (
                          <img
                            src={hotel.images[0]}
                            alt={hotel.name || "Hotel"}
                            className="w-[65px] h-[48px] rounded-lg object-cover border"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-[65px] h-[48px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-gray-800">
                            {hotel.name || "Unnamed hotel"}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-[220px]">
                            {hotel.contactNumber || "No contact number"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-[14px] text-gray-600 max-w-[160px] break-all">
                      {getOwnerDisplay(hotel)}
                    </td>

                    <td className="py-[14px] text-gray-600 max-w-[220px]">
                      {hotel.address || "Not added"}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      {hotel.roomTypes?.length || 0}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      Rs. {getMinimumRoomPrice(hotel).toLocaleString()}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <div className="flex items-center gap-[5px]">
                        <FaStar className="text-orange" />
                        {hotel.rating ?? 0}
                      </div>
                    </td>

                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          hotel.isApproved ? "bg-green-600" : "bg-orange"
                        }`}
                      >
                        {hotel.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="py-[14px]">
                      <select
                        value={hotel.isAvailable === false ? "false" : "true"}
                        onChange={(e) =>
                          handleAvailabilityChange(
                            hotel,
                            e.target.value === "true"
                          )
                        }
                        className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                          hotel.isAvailable === false
                            ? "bg-red-600"
                            : "bg-green-600"
                        }`}
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </td>

                    <td className="py-[14px]">
                      <div className="flex justify-center gap-[8px]">
                        {!hotel.isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprovalChange(hotel, true)}
                            className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                            title="Approve Hotel"
                          >
                            <FaCheckCircle />
                          </button>
                        )}

                        {hotel.isApproved && (
                          <button
                            type="button"
                            onClick={() => handleApprovalChange(hotel, false)}
                            className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                            title="Reject Hotel"
                          >
                            <FaTimesCircle />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openEditForm(hotel)}
                          className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                          title="Edit Hotel"
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteHotel(hotel)}
                          className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                          title="Delete Hotel"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredHotels.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[30px] text-center text-gray-500"
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
    </div>
  );
}

function HotelStatCard({ title, value, icon, color }) {
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

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  min,
  max,
  step,
  minLength,
  maxLength,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        minLength={minLength}
        maxLength={maxLength}
        required={required}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}