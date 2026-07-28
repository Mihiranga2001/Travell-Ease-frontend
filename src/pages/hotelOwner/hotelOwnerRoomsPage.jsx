import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBed,
  FaBuilding,
  FaCheckCircle,
  FaHotel,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw, FiSave } from "react-icons/fi";
import {
  api,
  extractHotels,
  formatCurrency,
  getApiErrorMessage,
  getHotelApprovalStatus,
  resolveAssetUrl,
} from "./hotelApi";

function getRoomKey(hotelId, roomIndex) {
  return `${hotelId}:${roomIndex}`;
}

export default function HotelOwnerRoomsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [hotelFilter, setHotelFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [updatingHotelId, setUpdatingHotelId] = useState("");
  const [updatingRoomKey, setUpdatingRoomKey] = useState("");
  const [inventoryDrafts, setInventoryDrafts] = useState({});

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hotels/owner/my");
      const hotelList = extractHotels(response);
      setHotels(hotelList);

      const drafts = {};
      hotelList.forEach((hotel) => {
        (hotel.roomTypes || []).forEach((room, roomIndex) => {
          drafts[getRoomKey(hotel._id, roomIndex)] = room.totalRooms ?? 1;
        });
      });
      setInventoryDrafts(drafts);
    } catch (error) {
      setHotels([]);
      toast.error(
        getApiErrorMessage(error, "Failed to load room availability")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const filteredHotels = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return hotels
      .filter((hotel) => hotelFilter === "all" || hotel._id === hotelFilter)
      .map((hotel) => ({
        ...hotel,
        filteredRoomTypes: (hotel.roomTypes || [])
          .map((room, roomIndex) => ({ ...room, roomIndex }))
          .filter((room) => {
            const matchesSearch =
              !search ||
              String(hotel.name || "").toLowerCase().includes(search) ||
              String(room.name || "").toLowerCase().includes(search);
            const available = room.isAvailable !== false;
            const matchesAvailability =
              availabilityFilter === "all" ||
              (availabilityFilter === "available" && available) ||
              (availabilityFilter === "unavailable" && !available);

            return matchesSearch && matchesAvailability;
          }),
      }))
      .filter(
        (hotel) =>
          (!search && availabilityFilter === "all") ||
          hotel.filteredRoomTypes.length > 0
      );
  }, [hotels, searchText, hotelFilter, availabilityFilter]);

  const allRooms = hotels.flatMap((hotel) => hotel.roomTypes || []);
  const statistics = {
    roomTypes: allRooms.length,
    available: allRooms.filter((room) => room.isAvailable !== false).length,
    unavailable: allRooms.filter((room) => room.isAvailable === false).length,
    physicalRooms: allRooms.reduce(
      (total, room) => total + Number(room.totalRooms || 1),
      0
    ),
  };

  async function updateHotelAvailability(hotel, isAvailable) {
    if (
      !window.confirm(
        `Mark ${hotel.name || "this hotel"} as ${
          isAvailable ? "available" : "unavailable"
        }?`
      )
    ) {
      return;
    }

    try {
      setUpdatingHotelId(hotel._id);
      await api.patch(`/hotels/owner/${hotel._id}/availability`, {
        isAvailable,
      });
      setHotels((previous) =>
        previous.map((item) =>
          item._id === hotel._id ? { ...item, isAvailable } : item
        )
      );
      toast.success("Hotel availability updated");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update hotel availability")
      );
    } finally {
      setUpdatingHotelId("");
    }
  }

  async function updateRoomAvailability(hotel, roomIndex, isAvailable) {
    const key = getRoomKey(hotel._id, roomIndex);

    try {
      setUpdatingRoomKey(key);
      await api.patch(
        `/hotels/owner/${hotel._id}/rooms/${roomIndex}/availability`,
        { isAvailable }
      );
      setHotels((previous) =>
        previous.map((item) =>
          item._id !== hotel._id
            ? item
            : {
                ...item,
                roomTypes: item.roomTypes.map((room, index) =>
                  index === roomIndex ? { ...room, isAvailable } : room
                ),
              }
        )
      );
      toast.success("Room availability updated");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update room availability")
      );
    } finally {
      setUpdatingRoomKey("");
    }
  }

  async function saveInventory(hotel, roomIndex) {
    const key = getRoomKey(hotel._id, roomIndex);
    const totalRooms = Number(inventoryDrafts[key]);

    if (!Number.isInteger(totalRooms) || totalRooms < 1) {
      toast.error("Total rooms must be a whole number of at least 1");
      return;
    }

    try {
      setUpdatingRoomKey(key);
      await api.patch(
        `/hotels/owner/${hotel._id}/rooms/${roomIndex}/inventory`,
        { totalRooms }
      );
      setHotels((previous) =>
        previous.map((item) =>
          item._id !== hotel._id
            ? item
            : {
                ...item,
                roomTypes: item.roomTypes.map((room, index) =>
                  index === roomIndex ? { ...room, totalRooms } : room
                ),
              }
        )
      );
      toast.success("Room inventory updated");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update room inventory")
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

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Room Availability</h1>
          <p className="mt-[5px] text-gray-500">
            Manage hotel availability, room-type availability and physical inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={loadHotels}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Room Types" value={statistics.roomTypes} icon={<FaBed />} color="bg-blue-600" />
        <StatCard title="Available Types" value={statistics.available} icon={<FaCheckCircle />} color="bg-green-600" />
        <StatCard title="Unavailable Types" value={statistics.unavailable} icon={<FaTimesCircle />} color="bg-red-600" />
        <StatCard title="Total Rooms" value={statistics.physicalRooms} icon={<FaBuilding />} color="bg-purple-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-3">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search hotel or room type"
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={hotelFilter}
            onChange={(event) => setHotelFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Hotels</option>
            {hotels.map((hotel) => (
              <option key={hotel._id} value={hotel._id}>
                {hotel.name || "Unnamed Hotel"}
              </option>
            ))}
          </select>
          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Room Availability</option>
            <option value="available">Available Rooms</option>
            <option value="unavailable">Unavailable Rooms</option>
          </select>
        </div>
        {(searchText || hotelFilter !== "all" || availabilityFilter !== "all") && (
          <div className="mt-[15px] flex justify-end">
            <button type="button" onClick={clearFilters} className="font-semibold text-accent hover:text-orange">
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <MessagePanel message="Loading room availability..." />
      ) : filteredHotels.length === 0 ? (
        <MessagePanel message="No rooms match the current filters." />
      ) : (
        <div className="space-y-[25px]">
          {filteredHotels.map((hotel) => (
            <section key={hotel._id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
              <div className="flex flex-col gap-[15px] border-b p-[20px] lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-[12px]">
                  <img
                    src={resolveAssetUrl(hotel.images?.[0])}
                    alt={hotel.name || "Hotel"}
                    className="h-[58px] w-[78px] rounded-lg border object-cover"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/hotel-placeholder.jpg";
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{hotel.name || "Unnamed Hotel"}</h2>
                    <p className="text-sm text-gray-500">
                      {hotel.filteredRoomTypes.length} room type(s) shown · {getHotelApprovalStatus(hotel)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={updatingHotelId === hotel._id}
                  onClick={() => updateHotelAvailability(hotel, hotel.isAvailable === false)}
                  className={`rounded-lg px-[15px] py-[9px] font-semibold text-white disabled:opacity-60 ${
                    hotel.isAvailable === false ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {updatingHotelId === hotel._id
                    ? "Updating..."
                    : hotel.isAvailable === false
                    ? "Make Hotel Available"
                    : "Make Hotel Unavailable"}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-[15px] p-[20px] xl:grid-cols-2">
                {hotel.filteredRoomTypes.map((room) => {
                  const key = getRoomKey(hotel._id, room.roomIndex);
                  const updating = updatingRoomKey === key;

                  return (
                    <div key={key} className="rounded-xl border border-gray-200 p-[15px]">
                      <div className="mb-[12px] flex items-start justify-between gap-[10px]">
                        <div className="flex items-center gap-[10px]">
                          <img
                            src={resolveAssetUrl(room.images?.[0])}
                            alt={room.name || "Room"}
                            className="h-[55px] w-[75px] rounded-lg border object-cover"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = "/hotel-placeholder.jpg";
                            }}
                          />
                          <div>
                            <h3 className="font-bold text-gray-800">{room.name || "Unnamed Room"}</h3>
                            <p className="text-sm text-gray-500">
                              {formatCurrency(room.pricePerNight)} · {room.capacity || 0} guest(s)
                            </p>
                          </div>
                        </div>
                        <span className={`rounded-full px-[9px] py-[4px] text-xs font-semibold text-white ${room.isAvailable === false ? "bg-red-600" : "bg-green-600"}`}>
                          {room.isAvailable === false ? "Unavailable" : "Available"}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-[10px] sm:grid-cols-[1fr_auto_auto] sm:items-end">
                        <label>
                          <span className="mb-[5px] block text-xs font-semibold text-gray-500">Total Physical Rooms</span>
                          <input
                            type="number"
                            min="1"
                            value={inventoryDrafts[key] ?? 1}
                            onChange={(event) =>
                              setInventoryDrafts((previous) => ({
                                ...previous,
                                [key]: event.target.value,
                              }))
                            }
                            className="h-[42px] w-full rounded-lg border border-gray-300 px-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </label>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => saveInventory(hotel, room.roomIndex)}
                          className="flex h-[42px] items-center justify-center gap-[6px] rounded-lg bg-accent px-[13px] font-semibold text-white hover:bg-orange disabled:opacity-60"
                        >
                          <FiSave /> Save
                        </button>
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() =>
                            updateRoomAvailability(
                              hotel,
                              room.roomIndex,
                              room.isAvailable === false
                            )
                          }
                          className={`h-[42px] rounded-lg px-[13px] font-semibold text-white disabled:opacity-60 ${room.isAvailable === false ? "bg-green-600" : "bg-red-600"}`}
                        >
                          {room.isAvailable === false ? "Enable" : "Disable"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-[5px] text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>
        {icon}
      </div>
    </div>
  );
}

function MessagePanel({ message }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
      <div className="mb-[15px] flex h-[75px] w-[75px] items-center justify-center rounded-full bg-gray-100 text-4xl text-gray-400">
        <FaHotel />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
