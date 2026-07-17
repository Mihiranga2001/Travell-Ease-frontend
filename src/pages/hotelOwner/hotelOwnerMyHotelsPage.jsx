import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaBed,
  FaCheckCircle,
  FaEdit,
  FaHotel,
  FaImage,
  FaMapMarkerAlt,
  FaPlus,
  FaSearch,
  FaStar,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

const EMPTY_ROOM_TYPE = {
  name: "",
  pricePerNight: "",
  capacity: "",
  images: [],
};

export default function HotelOwnerMyHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingHotelId, setDeletingHotelId] = useState("");

  const [searchText, setSearchText] = useState("");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Hotel model fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [images, setImages] = useState([]);
  const [roomTypes, setRoomTypes] = useState([
    { ...EMPTY_ROOM_TYPE },
  ]);
  const [contactNumber, setContactNumber] = useState("");

  // Availability will be managed from HotelOwnerRoomAvailabilityPage later.
  // It is kept internally so editing a hotel does not accidentally reset it.
  const [isAvailable, setIsAvailable] = useState(true);

  const loggedInUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  }, []);

  const ownerId =
    loggedInUser?._id ||
    loggedInUser?.id ||
    loggedInUser?.userId ||
    "";

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
        `${API_URL}/hotels/owner/my`,
        getAuthHeader()
      );

      const hotelList = Array.isArray(response.data)
        ? response.data
        : response.data?.hotels ||
          response.data?.data ||
          [];

      setHotels(hotelList);
    } catch (error) {
      console.error("Load owner hotels error:", error);
      setHotels([]);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load your hotels"
        )
      );
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
      const roomNames = Array.isArray(hotel.roomTypes)
        ? hotel.roomTypes
            .map((room) => room.name || "")
            .join(" ")
            .toLowerCase()
        : "";

      const matchesSearch =
        search === "" ||
        String(hotel.name || "")
          .toLowerCase()
          .includes(search) ||
        String(hotel.address || "")
          .toLowerCase()
          .includes(search) ||
        String(hotel.contactNumber || "")
          .toLowerCase()
          .includes(search) ||
        roomNames.includes(search);

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" &&
          hotel.isApproved === true) ||
        (approvalFilter === "pending" &&
          hotel.isApproved !== true);

      return matchesSearch && matchesApproval;
    });
  }, [hotels, searchText, approvalFilter]);

  function resetForm() {
    setName("");
    setDescription("");
    setAddress("");
    setLatitude("");
    setLongitude("");
    setImages([]);
    setRoomTypes([{ ...EMPTY_ROOM_TYPE }]);
    setContactNumber("");
    setIsAvailable(true);

    setEditingHotel(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(hotel) {
    setEditingHotel(hotel);

    setName(hotel.name || "");
    setDescription(hotel.description || "");
    setAddress(hotel.address || "");
    setLatitude(hotel.location?.latitude ?? "");
    setLongitude(hotel.location?.longitude ?? "");
    setImages(
      Array.isArray(hotel.images) ? hotel.images : []
    );

    setRoomTypes(
      Array.isArray(hotel.roomTypes) &&
        hotel.roomTypes.length > 0
        ? hotel.roomTypes.map((room) => ({
            name: room.name || "",
            pricePerNight: room.pricePerNight ?? "",
            capacity: room.capacity ?? "",
            images: Array.isArray(room.images)
              ? room.images
              : [],
          }))
        : [{ ...EMPTY_ROOM_TYPE }]
    );

    setContactNumber(hotel.contactNumber || "");
    setIsAvailable(hotel.isAvailable !== false);

    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function handleImagesChange(event) {
    const imageList = event.target.value
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

  function handleRoomImagesChange(index, value) {
    const roomImages = value
      .split(",")
      .map((image) => image.trim())
      .filter(Boolean);

    setRoomTypes((previousRoomTypes) =>
      previousRoomTypes.map((room, roomIndex) =>
        roomIndex === index
          ? {
              ...room,
              images: roomImages,
            }
          : room
      )
    );
  }

  function addRoomType() {
    setRoomTypes((previousRoomTypes) => [
      ...previousRoomTypes,
      {
        ...EMPTY_ROOM_TYPE,
        images: [],
      },
    ]);
  }

  function removeRoomType(index) {
    if (roomTypes.length === 1) {
      toast.error("At least one room type is required");
      return;
    }

    setRoomTypes((previousRoomTypes) =>
      previousRoomTypes.filter(
        (_, roomIndex) => roomIndex !== index
      )
    );
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error(
        "Location services are not supported by this browser"
      );
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(
          position.coords.latitude.toFixed(6)
        );
        setLongitude(
          position.coords.longitude.toFixed(6)
        );

        toast.success("Current location added");
        setGettingLocation(false);
      },
      (error) => {
        console.error("Location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          toast.error("Location permission was denied");
        } else if (
          error.code === error.POSITION_UNAVAILABLE
        ) {
          toast.error("Current location is unavailable");
        } else if (error.code === error.TIMEOUT) {
          toast.error("Location request timed out");
        } else {
          toast.error("Unable to get current location");
        }

        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0,
      }
    );
  }

  function validateAndBuildPayload() {
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    const cleanAddress = address.trim();
    const cleanContactNumber = contactNumber.trim();

    if (!ownerId) {
      toast.error(
        "Logged-in hotel owner information was not found"
      );
      return null;
    }

    if (cleanName.length < 2) {
      toast.error(
        "Hotel name must contain at least 2 characters"
      );
      return null;
    }

    if (cleanName.length > 150) {
      toast.error(
        "Hotel name cannot exceed 150 characters"
      );
      return null;
    }

    if (cleanDescription.length < 10) {
      toast.error(
        "Description must contain at least 10 characters"
      );
      return null;
    }

    if (cleanDescription.length > 3000) {
      toast.error(
        "Description cannot exceed 3000 characters"
      );
      return null;
    }

    if (cleanAddress.length > 500) {
      toast.error(
        "Address cannot exceed 500 characters"
      );
      return null;
    }

    if (cleanContactNumber.length > 30) {
      toast.error(
        "Contact number cannot exceed 30 characters"
      );
      return null;
    }

    const latitudeNumber =
      latitude === "" ? 0 : Number(latitude);

    const longitudeNumber =
      longitude === "" ? 0 : Number(longitude);

    if (
      !Number.isFinite(latitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      toast.error(
        "Latitude must be between -90 and 90"
      );
      return null;
    }

    if (
      !Number.isFinite(longitudeNumber) ||
      longitudeNumber < -180 ||
      longitudeNumber > 180
    ) {
      toast.error(
        "Longitude must be between -180 and 180"
      );
      return null;
    }

    const normalizedRoomTypes = [];

    for (
      let index = 0;
      index < roomTypes.length;
      index += 1
    ) {
      const room = roomTypes[index];
      const roomName = String(room.name || "").trim();
      const roomPrice = Number(room.pricePerNight);
      const roomCapacity = Number(room.capacity);

      if (!roomName) {
        toast.error(
          `Room type ${index + 1}: name is required`
        );
        return null;
      }

      if (roomName.length > 100) {
        toast.error(
          `Room type ${
            index + 1
          }: name cannot exceed 100 characters`
        );
        return null;
      }

      if (
        room.pricePerNight === "" ||
        !Number.isFinite(roomPrice) ||
        roomPrice < 0
      ) {
        toast.error(
          `Room type ${
            index + 1
          }: enter a valid price`
        );
        return null;
      }

      if (
        room.capacity === "" ||
        !Number.isInteger(roomCapacity) ||
        roomCapacity < 1
      ) {
        toast.error(
          `Room type ${
            index + 1
          }: capacity must be a whole number of at least 1`
        );
        return null;
      }

      const roomImages = Array.isArray(room.images)
        ? room.images
            .map((image) => String(image).trim())
            .filter(Boolean)
        : [];

      normalizedRoomTypes.push({
        name: roomName,
        pricePerNight: roomPrice,
        capacity: roomCapacity,
        images: roomImages,
      });
    }

    return {
      ownerId,
      name: cleanName,
      description: cleanDescription,
      address: cleanAddress,

      location: {
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      },

      images: images
        .map((image) => image.trim())
        .filter(Boolean),

      roomTypes: normalizedRoomTypes,
      contactNumber: cleanContactNumber,

      // This value is preserved but not editable on this page.
      isAvailable,

      // Hotel owners cannot approve their own hotel.
      isApproved: false,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = validateAndBuildPayload();

    if (!payload) {
      return;
    }

    try {
      setSaving(true);

      if (editingHotel) {
        await axios.put(
          `${API_URL}/hotels/owner/${editingHotel._id}`,
          payload,
          getAuthHeader()
        );

        toast.success(
          "Hotel updated and sent for admin approval"
        );
      } else {
        await axios.post(
          `${API_URL}/hotels/owner`,
          payload,
          getAuthHeader()
        );

        toast.success(
          "Hotel added and sent for admin approval"
        );
      }

      resetForm();
      await loadHotels();
    } catch (error) {
      console.error("Save hotel error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to save hotel"
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteHotel(hotel) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        hotel.name || "this hotel"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingHotelId(hotel._id);

      await axios.delete(
        `${API_URL}/hotels/owner/${hotel._id}`,
        getAuthHeader()
      );

      toast.success("Hotel deleted successfully");
      await loadHotels();
    } catch (error) {
      console.error("Delete hotel error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete hotel"
        )
      );
    } finally {
      setDeletingHotelId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setApprovalFilter("all");
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
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            My Hotels
          </h1>

          <p className="text-gray-500 mt-[5px]">
            Add and manage your hotels. New or edited
            hotels must be approved by an administrator.
          </p>
        </div>

        <div className="flex flex-wrap gap-[10px]">
          <button
            type="button"
            onClick={loadHotels}
            disabled={loading}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
            />
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
          title="Approved"
          value={approvedHotels}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <HotelStatCard
          title="Pending Approval"
          value={pendingHotels}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <HotelStatCard
          title="Available"
          value={availableHotels}
          icon={<FaBed />}
          color="bg-purple-600"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex items-center justify-between gap-[15px] mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingHotel
                  ? "Update Hotel"
                  : "Add New Hotel"}
              </h2>

              <p className="text-sm text-gray-500 mt-[3px]">
                Add hotel images and separate images for
                each room type.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="w-[38px] h-[38px] rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
              title="Close form"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <InputField
                label="Hotel Name"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: Ocean View Hotel"
                minLength={2}
                maxLength={150}
                required
              />

              <InputField
                label="Contact Number"
                value={contactNumber}
                onChange={(event) =>
                  setContactNumber(event.target.value)
                }
                placeholder="Example: 0771234567"
                maxLength={30}
              />

              <div className="md:col-span-2">
                <InputField
                  label="Address"
                  value={address}
                  onChange={(event) =>
                    setAddress(event.target.value)
                  }
                  placeholder="Full hotel address"
                  maxLength={500}
                />
              </div>

              <InputField
                label="Latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                value={latitude}
                onChange={(event) =>
                  setLatitude(event.target.value)
                }
                placeholder="Example: 6.0329"
              />

              <InputField
                label="Longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                value={longitude}
                onChange={(event) =>
                  setLongitude(event.target.value)
                }
                placeholder="Example: 80.2168"
              />

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="inline-flex items-center gap-[8px] px-[14px] py-[9px] rounded-lg border border-accent text-accent font-semibold hover:bg-accent hover:text-white transition disabled:opacity-60"
                >
                  <FaMapMarkerAlt />

                  {gettingLocation
                    ? "Getting Location..."
                    : "Use Current GPS Location"}
                </button>
              </div>

              {/* Hotel Images */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Hotel Image URLs
                </label>

                <input
                  type="text"
                  value={images.join(", ")}
                  onChange={handleImagesChange}
                  placeholder="Paste hotel image URLs separated by commas"
                  className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
                />

                <ImagePreviewList
                  images={images}
                  altPrefix={name || "Hotel"}
                />
              </div>

              {/* Room Types */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between gap-[10px] mb-[10px]">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Room Types
                    </label>

                    <p className="text-xs text-gray-400 mt-[3px]">
                      Add room name, price, capacity and
                      room-specific images.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={addRoomType}
                    className="inline-flex items-center gap-[6px] px-[12px] py-[8px] rounded-lg bg-accent text-white text-sm font-semibold"
                  >
                    <FaPlus />
                    Add Room Type
                  </button>
                </div>

                <div className="space-y-[14px]">
                  {roomTypes.map((room, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl p-[14px]"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-[10px] items-end">
                        <InputField
                          label={`Room Name ${index + 1}`}
                          value={room.name}
                          onChange={(event) =>
                            handleRoomTypeChange(
                              index,
                              "name",
                              event.target.value
                            )
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
                          onChange={(event) =>
                            handleRoomTypeChange(
                              index,
                              "pricePerNight",
                              event.target.value
                            )
                          }
                          placeholder="Example: 12000"
                          required
                        />

                        <InputField
                          label="Guest Capacity"
                          type="number"
                          min="1"
                          step="1"
                          value={room.capacity}
                          onChange={(event) =>
                            handleRoomTypeChange(
                              index,
                              "capacity",
                              event.target.value
                            )
                          }
                          placeholder="Example: 2"
                          required
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeRoomType(index)
                          }
                          className="h-[45px] w-[45px] rounded-lg bg-red-600 hover:bg-red-700 text-white flex items-center justify-center"
                          title="Remove room type"
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="mt-[12px]">
                        <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                          {room.name || `Room Type ${index + 1}`} Image URLs
                        </label>

                        <input
                          type="text"
                          value={
                            Array.isArray(room.images)
                              ? room.images.join(", ")
                              : ""
                          }
                          onChange={(event) =>
                            handleRoomImagesChange(
                              index,
                              event.target.value
                            )
                          }
                          placeholder="Paste room image URLs separated by commas"
                          className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
                        />

                        <ImagePreviewList
                          images={
                            Array.isArray(room.images)
                              ? room.images
                              : []
                          }
                          altPrefix={
                            room.name ||
                            `Room Type ${index + 1}`
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Description
                </label>

                <textarea
                  rows="5"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Write the hotel description"
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
                className="px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingHotel
                    ? "Update Hotel"
                    : "Submit Hotel"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search hotel, address or room type"
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
            <option value="approved">
              Approved Hotels
            </option>
            <option value="pending">
              Pending Approval
            </option>
          </select>
        </div>

        {(searchText ||
          approvalFilter !== "all") && (
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

      {/* Hotels */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex items-center justify-between mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Hotel List
            </h2>

            <p className="text-sm text-gray-500">
              Showing {filteredHotels.length} hotel(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="min-h-[250px] flex items-center justify-center text-gray-500">
            Loading hotels...
          </div>
        ) : filteredHotels.length === 0 ? (
          <div className="min-h-[250px] flex flex-col items-center justify-center text-center">
            <div className="w-[70px] h-[70px] rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-3xl mb-[15px]">
              <FaHotel />
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-[5px]">
              No hotels found
            </h3>

            <p className="text-gray-500">
              Add your first hotel using the Add Hotel
              button.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
            {filteredHotels.map((hotel) => (
              <HotelCard
                key={hotel._id}
                hotel={hotel}
                deleting={
                  deletingHotelId === hotel._id
                }
                onEdit={() => openEditForm(hotel)}
                onDelete={() =>
                  handleDeleteHotel(hotel)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ImagePreviewList({ images, altPrefix }) {
  if (!Array.isArray(images) || images.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-[10px] mt-[10px]">
      {images.map((image, index) => (
        <div
          key={`${image}-${index}`}
          className="h-[95px] rounded-lg overflow-hidden bg-gray-100 border"
        >
          <img
            src={normalizeImageUrl(image)}
            alt={`${altPrefix} ${index + 1}`}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "/hotel-placeholder.jpg";
            }}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}

function HotelCard({
  hotel,
  deleting,
  onEdit,
  onDelete,
}) {
  const roomTypes = Array.isArray(hotel.roomTypes)
    ? hotel.roomTypes
    : [];

  return (
    <article className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition">
      <div className="h-[210px] bg-gray-100">
        {getHotelImage(hotel) ? (
          <img
            src={getHotelImage(hotel)}
            alt={hotel.name || "Hotel"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "/hotel-placeholder.jpg";
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-5xl">
            <FaImage />
          </div>
        )}
      </div>

      <div className="p-[18px]">
        <div className="flex items-start justify-between gap-[12px] mb-[10px]">
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              {hotel.name || "Unnamed hotel"}
            </h3>

            <p className="flex items-start gap-[6px] text-sm text-gray-500 mt-[5px]">
              <FaMapMarkerAlt className="mt-[3px] shrink-0 text-orange" />
              {hotel.address || "Address not added"}
            </p>
          </div>

          <ApprovalBadge
            approved={hotel.isApproved === true}
          />
        </div>

        <p className="text-sm text-gray-600 leading-6 line-clamp-3 mb-[15px]">
          {hotel.description ||
            "No description provided."}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[10px] mb-[15px]">
          <HotelInfoBox
            label="Room Types"
            value={roomTypes.length}
            icon={<FaBed />}
          />

          <HotelInfoBox
            label="Starting Price"
            value={`Rs. ${getMinimumRoomPrice(
              roomTypes
            ).toLocaleString("en-LK")}`}
            icon={<FaHotel />}
          />

          <HotelInfoBox
            label="Rating"
            value={Number(
              hotel.rating || 0
            ).toFixed(1)}
            icon={<FaStar />}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <span
            className={`inline-flex px-[10px] py-[5px] rounded-full text-xs font-semibold text-white ${
              hotel.isAvailable !== false
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {hotel.isAvailable !== false
              ? "Available"
              : "Unavailable"}
          </span>

          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={onEdit}
              disabled={deleting}
              className="inline-flex items-center gap-[6px] px-[13px] py-[8px] rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
            >
              <FaEdit />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-[6px] px-[13px] py-[8px] rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              <FaTrash />
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HotelStatCard({
  title,
  value,
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
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function HotelInfoBox({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-gray-50 p-[10px]">
      <p className="flex items-center gap-[5px] text-xs text-gray-500 mb-[4px]">
        <span className="text-orange">{icon}</span>
        {label}
      </p>

      <p className="font-bold text-gray-800 text-sm">
        {value}
      </p>
    </div>
  );
}

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`shrink-0 inline-flex px-[10px] py-[5px] rounded-full text-xs font-semibold text-white ${
        approved ? "bg-green-600" : "bg-orange"
      }`}
    >
      {approved ? "Approved" : "Pending Approval"}
    </span>
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

function getMinimumRoomPrice(roomTypes) {
  const prices = roomTypes
    .map((room) => Number(room.pricePerNight))
    .filter(
      (price) =>
        Number.isFinite(price) && price >= 0
    );

  return prices.length > 0 ? Math.min(...prices) : 0;
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

  const backendOrigin = API_URL.replace(
    /\/api\/?$/,
    ""
  );

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