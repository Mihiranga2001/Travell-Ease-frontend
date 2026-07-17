import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaBed,
  FaBuilding,
  FaCheckCircle,
  FaHotel,
  FaImage,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import {
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

export default function HotelOwnerRoomsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [updatingHotelId, setUpdatingHotelId] = useState("");
  const [updatingRoomKey, setUpdatingRoomKey] = useState("");
  const [inventoryDrafts, setInventoryDrafts] = useState({});

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

      const nextDrafts = {};

      hotelList.forEach((hotel) => {
        const roomTypes = Array.isArray(hotel.roomTypes)
          ? hotel.roomTypes
          : [];

        roomTypes.forEach((room, roomIndex) => {
          nextDrafts[getRoomKey(hotel._id, roomIndex)] =
            room.totalRooms ?? 1;
        });
      });

      setInventoryDrafts(nextDrafts);
    } catch (error) {
      console.error("Load room availability error:", error);
      setHotels([]);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load room availability"
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

    return hotels
      .filter((hotel) => {
        if (
          hotelFilter !== "all" &&
          hotel._id !== hotelFilter
        ) {
          return false;
        }

        return true;
      })
      .map((hotel) => {
        const roomTypes = Array.isArray(hotel.roomTypes)
          ? hotel.roomTypes
          : [];

        const filteredRoomTypes = roomTypes
          .map((room, roomIndex) => ({
            ...room,
            roomIndex,
          }))
          .filter((room) => {
            const matchesSearch =
              search === "" ||
              String(hotel.name || "")
                .toLowerCase()
                .includes(search) ||
              String(room.name || "")
                .toLowerCase()
                .includes(search);

            const roomIsAvailable =
              room.isAvailable !== false;

            const matchesAvailability =
              availabilityFilter === "all" ||
              (availabilityFilter === "available" &&
                roomIsAvailable) ||
              (availabilityFilter === "unavailable" &&
                !roomIsAvailable);

            return matchesSearch && matchesAvailability;
          });

        return {
          ...hotel,
          filteredRoomTypes,
        };
      })
      .filter((hotel) => {
        if (search === "" && availabilityFilter === "all") {
          return true;
        }

        return hotel.filteredRoomTypes.length > 0;
      });
  }, [
    hotels,
    searchText,
    hotelFilter,
    availabilityFilter,
  ]);

  async function handleHotelAvailabilityChange(
    hotel,
    newAvailability
  ) {
    const action = newAvailability
      ? "mark this hotel as available"
      : "mark this hotel as unavailable";

    const confirmed = window.confirm(
      `Are you sure you want to ${action}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingHotelId(hotel._id);

      await axios.patch(
        `${API_URL}/hotels/owner/${hotel._id}/availability`,
        {
          isAvailable: newAvailability,
        },
        getAuthHeader()
      );

      setHotels((previousHotels) =>
        previousHotels.map((currentHotel) =>
          currentHotel._id === hotel._id
            ? {
                ...currentHotel,
                isAvailable: newAvailability,
              }
            : currentHotel
        )
      );

      toast.success("Hotel availability updated");
    } catch (error) {
      console.error("Update hotel availability error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update hotel availability"
        )
      );
    } finally {
      setUpdatingHotelId("");
    }
  }

  async function handleRoomAvailabilityChange(
    hotel,
    room,
    roomIndex,
    newAvailability
  ) {
    const roomKey = getRoomKey(hotel._id, roomIndex);

    try {
      setUpdatingRoomKey(roomKey);

      await axios.patch(
        `${API_URL}/hotels/owner/${hotel._id}/rooms/${roomIndex}/availability`,
        {
          isAvailable: newAvailability,
        },
        getAuthHeader()
      );

      setHotels((previousHotels) =>
        previousHotels.map((currentHotel) => {
          if (currentHotel._id !== hotel._id) {
            return currentHotel;
          }

          return {
            ...currentHotel,
            roomTypes: currentHotel.roomTypes.map(
              (currentRoom, currentRoomIndex) =>
                currentRoomIndex === roomIndex
                  ? {
                      ...currentRoom,
                      isAvailable: newAvailability,
                    }
                  : currentRoom
            ),
          };
        })
      );

      toast.success(
        `${room.name || "Room type"} availability updated`
      );
    } catch (error) {
      console.error("Update room availability error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update room availability"
        )
      );
    } finally {
      setUpdatingRoomKey("");
    }
  }

  function handleInventoryDraftChange(
    hotelId,
    roomIndex,
    value
  ) {
    setInventoryDrafts((previousDrafts) => ({
      ...previousDrafts,
      [getRoomKey(hotelId, roomIndex)]: value,
    }));
  }

  async function saveRoomInventory(
    hotel,
    room,
    roomIndex
  ) {
    const roomKey = getRoomKey(hotel._id, roomIndex);
    const totalRooms = Number(inventoryDrafts[roomKey]);

    if (
      !Number.isInteger(totalRooms) ||
      totalRooms < 1
    ) {
      toast.error(
        "Total rooms must be a whole number of at least 1"
      );
      return;
    }

    try {
      setUpdatingRoomKey(roomKey);

      await axios.patch(
        `${API_URL}/hotels/owner/${hotel._id}/rooms/${roomIndex}/inventory`,
        {
          totalRooms,
        },
        getAuthHeader()
      );

      setHotels((previousHotels) =>
        previousHotels.map((currentHotel) => {
          if (currentHotel._id !== hotel._id) {
            return currentHotel;
          }

          return {
            ...currentHotel,
            roomTypes: currentHotel.roomTypes.map(
              (currentRoom, currentRoomIndex) =>
                currentRoomIndex === roomIndex
                  ? {
                      ...currentRoom,
                      totalRooms,
                    }
                  : currentRoom
            ),
          };
        })
      );

      toast.success(
        `${room.name || "Room type"} inventory updated`
      );
    } catch (error) {
      console.error("Update room inventory error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update room inventory"
        )
      );
    } finally {
      setUpdatingRoomKey("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setHotelFilter("all");
    setAvailabilityFilter("all");
  }

  const allRoomTypes = hotels.flatMap((hotel) =>
    Array.isArray(hotel.roomTypes)
      ? hotel.roomTypes
      : []
  );

  const totalRoomTypes = allRoomTypes.length;

  const availableRoomTypes = allRoomTypes.filter(
    (room) => room.isAvailable !== false
  ).length;

  const unavailableRoomTypes =
    totalRoomTypes - availableRoomTypes;

  const totalPhysicalRooms = allRoomTypes.reduce(
    (total, room) => total + Number(room.totalRooms || 1),
    0
  );

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Room Availability
          </h1>

          <p className="text-gray-500 mt-[5px]">
            View room images, manage room inventory and
            change hotel or room-type availability.
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
        <RoomStatCard
          title="Room Types"
          value={totalRoomTypes}
          icon={<FaBed />}
          color="bg-blue-600"
        />

        <RoomStatCard
          title="Available Types"
          value={availableRoomTypes}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <RoomStatCard
          title="Unavailable Types"
          value={unavailableRoomTypes}
          icon={<FaTimesCircle />}
          color="bg-red-600"
        />

        <RoomStatCard
          title="Total Rooms"
          value={totalPhysicalRooms}
          icon={<FaBuilding />}
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
              placeholder="Search hotel or room type"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={hotelFilter}
            onChange={(event) =>
              setHotelFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Hotels</option>

            {hotels.map((hotel) => (
              <option
                key={hotel._id}
                value={hotel._id}
              >
                {hotel.name || "Unnamed Hotel"}
              </option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Room Availability
            </option>
            <option value="available">
              Available Rooms
            </option>
            <option value="unavailable">
              Unavailable Rooms
            </option>
          </select>
        </div>

        {(searchText ||
          hotelFilter !== "all" ||
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

      {/* Room availability */}
      {loading ? (
        <div className="min-h-[300px] bg-white border border-gray-200 rounded-2xl shadow-md flex items-center justify-center text-gray-500">
          Loading room availability...
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="min-h-[300px] bg-white border border-gray-200 rounded-2xl shadow-md flex flex-col items-center justify-center text-center p-[25px]">
          <div className="w-[75px] h-[75px] rounded-full bg-gray-100 text-gray-400 flex items-center justify-center text-4xl mb-[15px]">
            <FaBed />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            No rooms found
          </h2>

          <p className="text-gray-500 mt-[5px]">
            Add room types from the My Hotels page or
            change your current filters.
          </p>
        </div>
      ) : (
        <div className="space-y-[25px]">
          {filteredHotels.map((hotel) => (
            <HotelRoomSection
              key={hotel._id}
              hotel={hotel}
              rooms={hotel.filteredRoomTypes}
              updatingHotelId={updatingHotelId}
              updatingRoomKey={updatingRoomKey}
              inventoryDrafts={inventoryDrafts}
              onHotelAvailabilityChange={
                handleHotelAvailabilityChange
              }
              onRoomAvailabilityChange={
                handleRoomAvailabilityChange
              }
              onInventoryDraftChange={
                handleInventoryDraftChange
              }
              onSaveInventory={saveRoomInventory}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelRoomSection({
  hotel,
  rooms,
  updatingHotelId,
  updatingRoomKey,
  inventoryDrafts,
  onHotelAvailabilityChange,
  onRoomAvailabilityChange,
  onInventoryDraftChange,
  onSaveInventory,
}) {
  const hotelUpdating =
    updatingHotelId === hotel._id;

  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md overflow-hidden">
      <div className="p-[20px] border-b flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px]">
        <div className="flex items-center gap-[12px]">
          <HotelThumbnail hotel={hotel} />

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {hotel.name || "Unnamed Hotel"}
            </h2>

            <p className="text-sm text-gray-500 mt-[3px]">
              {rooms.length} room type(s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-[10px]">
          <span
            className={`px-[10px] py-[5px] rounded-full text-xs font-semibold text-white ${
              hotel.isApproved
                ? "bg-green-600"
                : "bg-orange"
            }`}
          >
            {hotel.isApproved
              ? "Admin Approved"
              : "Pending Approval"}
          </span>

          <select
            value={
              hotel.isAvailable === false
                ? "false"
                : "true"
            }
            disabled={hotelUpdating}
            onChange={(event) =>
              onHotelAvailabilityChange(
                hotel,
                event.target.value === "true"
              )
            }
            className={`h-[38px] px-[10px] rounded-lg text-sm font-semibold text-white border-none outline-none disabled:opacity-60 ${
              hotel.isAvailable === false
                ? "bg-red-600"
                : "bg-green-600"
            }`}
          >
            <option value="true">
              Hotel Available
            </option>
            <option value="false">
              Hotel Unavailable
            </option>
          </select>
        </div>
      </div>

      <div className="p-[20px]">
        {rooms.length === 0 ? (
          <div className="min-h-[150px] flex items-center justify-center text-gray-500">
            No matching room types
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
            {rooms.map((room) => {
              const roomKey = getRoomKey(
                hotel._id,
                room.roomIndex
              );

              return (
                <RoomAvailabilityCard
                  key={roomKey}
                  hotel={hotel}
                  room={room}
                  roomIndex={room.roomIndex}
                  updating={
                    updatingRoomKey === roomKey
                  }
                  inventoryValue={
                    inventoryDrafts[roomKey] ?? 1
                  }
                  onAvailabilityChange={
                    onRoomAvailabilityChange
                  }
                  onInventoryDraftChange={
                    onInventoryDraftChange
                  }
                  onSaveInventory={
                    onSaveInventory
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function RoomAvailabilityCard({
  hotel,
  room,
  roomIndex,
  updating,
  inventoryValue,
  onAvailabilityChange,
  onInventoryDraftChange,
  onSaveInventory,
}) {
  const roomImages = Array.isArray(room.images)
    ? room.images.filter(Boolean)
    : [];

  const roomIsAvailable =
    room.isAvailable !== false;

  return (
    <article className="border border-gray-200 rounded-2xl overflow-hidden">
      <RoomImageGallery
        images={roomImages}
        fallbackImages={hotel.images}
        roomName={room.name}
      />

      <div className="p-[16px]">
        <div className="flex items-start justify-between gap-[10px] mb-[12px]">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              {room.name || "Unnamed Room"}
            </h3>

            <p className="text-sm text-gray-500 mt-[3px]">
              Capacity: {room.capacity || 0} guest(s)
            </p>
          </div>

          <span
            className={`px-[10px] py-[5px] rounded-full text-xs font-semibold text-white ${
              roomIsAvailable
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {roomIsAvailable
              ? "Available"
              : "Unavailable"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-[10px] mb-[15px]">
          <InfoBox
            label="Price Per Night"
            value={`Rs. ${Number(
              room.pricePerNight || 0
            ).toLocaleString("en-LK")}`}
          />

          <InfoBox
            label="Total Rooms"
            value={room.totalRooms || 1}
          />
        </div>

        <div className="border-t pt-[15px]">
          <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
            Total Physical Rooms
          </label>

          <div className="flex gap-[8px]">
            <input
              type="number"
              min="1"
              step="1"
              value={inventoryValue}
              onChange={(event) =>
                onInventoryDraftChange(
                  hotel._id,
                  roomIndex,
                  event.target.value
                )
              }
              className="flex-1 h-[42px] border border-gray-300 rounded-lg px-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
            />

            <button
              type="button"
              onClick={() =>
                onSaveInventory(
                  hotel,
                  room,
                  roomIndex
                )
              }
              disabled={updating}
              className="h-[42px] px-[13px] rounded-lg bg-blue-600 text-white font-semibold flex items-center gap-[6px] hover:bg-blue-700 disabled:opacity-60"
            >
              <FiSave />
              Save
            </button>
          </div>
        </div>

        <div className="mt-[15px]">
          <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
            Room Availability
          </label>

          <select
            value={
              roomIsAvailable ? "true" : "false"
            }
            disabled={updating}
            onChange={(event) =>
              onAvailabilityChange(
                hotel,
                room,
                roomIndex,
                event.target.value === "true"
              )
            }
            className={`w-full h-[42px] px-[10px] rounded-lg text-sm font-semibold text-white border-none outline-none disabled:opacity-60 ${
              roomIsAvailable
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            <option value="true">
              Available for Booking
            </option>
            <option value="false">
              Not Available for Booking
            </option>
          </select>
        </div>
      </div>
    </article>
  );
}

function RoomImageGallery({
  images,
  fallbackImages,
  roomName,
}) {
  const finalImages =
    images.length > 0
      ? images
      : Array.isArray(fallbackImages)
        ? fallbackImages.filter(Boolean)
        : [];

  if (finalImages.length === 0) {
    return (
      <div className="h-[210px] bg-gray-100 flex items-center justify-center text-gray-400 text-5xl">
        <FaImage />
      </div>
    );
  }

  return (
    <div>
      <img
        src={normalizeImageUrl(finalImages[0])}
        alt={roomName || "Room"}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/hotel-placeholder.jpg";
        }}
        className="w-full h-[210px] object-cover"
      />

      {finalImages.length > 1 && (
        <div className="grid grid-cols-3 gap-[5px] p-[5px] bg-gray-50">
          {finalImages
            .slice(1, 4)
            .map((image, index) => (
              <img
                key={`${image}-${index}`}
                src={normalizeImageUrl(image)}
                alt={`${roomName || "Room"} ${
                  index + 2
                }`}
                className="w-full h-[65px] object-cover rounded-md"
              />
            ))}
        </div>
      )}
    </div>
  );
}

function HotelThumbnail({ hotel }) {
  const firstImage = Array.isArray(hotel.images)
    ? hotel.images.find(Boolean)
    : "";

  if (!firstImage) {
    return (
      <div className="w-[60px] h-[50px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
        <FaHotel />
      </div>
    );
  }

  return (
    <img
      src={normalizeImageUrl(firstImage)}
      alt={hotel.name || "Hotel"}
      className="w-[60px] h-[50px] rounded-lg object-cover border"
    />
  );
}

function RoomStatCard({
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

function InfoBox({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-[10px]">
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-bold text-gray-800 mt-[4px]">
        {value}
      </p>
    </div>
  );
}

function getRoomKey(hotelId, roomIndex) {
  return `${hotelId}-${roomIndex}`;
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