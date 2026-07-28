import { useCallback, useEffect, useMemo, useState } from "react";
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
import { FiMapPin, FiRefreshCw } from "react-icons/fi";
import {
  api,
  extractHotels,
  formatCurrency,
  getApiErrorMessage,
  getHotelApprovalStatus,
  resolveAssetUrl,
} from "./hotelApi";

const EMPTY_ROOM_TYPE = {
  name: "",
  pricePerNight: "",
  capacity: "",
  totalRooms: 1,
  isAvailable: true,
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

  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
    imagesText: "",
    contactNumber: "",
    isAvailable: true,
    roomTypes: [{ ...EMPTY_ROOM_TYPE }],
  });

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hotels/owner/my");
      setHotels(extractHotels(response));
    } catch (error) {
      console.error("Load owner hotels error:", error);
      setHotels([]);
      toast.error(getApiErrorMessage(error, "Failed to load your hotels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const filteredHotels = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const roomText = Array.isArray(hotel.roomTypes)
        ? hotel.roomTypes.map((room) => room.name || "").join(" ").toLowerCase()
        : "";
      const matchesSearch =
        search === "" ||
        String(hotel.name || "").toLowerCase().includes(search) ||
        String(hotel.address || "").toLowerCase().includes(search) ||
        String(hotel.contactNumber || "").toLowerCase().includes(search) ||
        roomText.includes(search);
      const status = getHotelApprovalStatus(hotel);
      const matchesApproval =
        approvalFilter === "all" || status === approvalFilter;

      return matchesSearch && matchesApproval;
    });
  }, [hotels, searchText, approvalFilter]);

  const statistics = useMemo(
    () => ({
      total: hotels.length,
      approved: hotels.filter(
        (hotel) => getHotelApprovalStatus(hotel) === "approved"
      ).length,
      pending: hotels.filter(
        (hotel) => getHotelApprovalStatus(hotel) === "pending"
      ).length,
      rejected: hotels.filter(
        (hotel) => getHotelApprovalStatus(hotel) === "rejected"
      ).length,
    }),
    [hotels]
  );

  function resetForm() {
    setForm({
      name: "",
      description: "",
      address: "",
      latitude: "",
      longitude: "",
      imagesText: "",
      contactNumber: "",
      isAvailable: true,
      roomTypes: [{ ...EMPTY_ROOM_TYPE }],
    });
    setEditingHotel(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(hotel) {
    setEditingHotel(hotel);
    setForm({
      name: hotel.name || "",
      description: hotel.description || "",
      address: hotel.address || "",
      latitude: hotel.location?.latitude ?? "",
      longitude: hotel.location?.longitude ?? "",
      imagesText: Array.isArray(hotel.images) ? hotel.images.join(", ") : "",
      contactNumber: hotel.contactNumber || "",
      isAvailable: hotel.isAvailable !== false,
      roomTypes:
        Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0
          ? hotel.roomTypes.map((room) => ({
              name: room.name || "",
              pricePerNight: room.pricePerNight ?? "",
              capacity: room.capacity ?? "",
              totalRooms: room.totalRooms ?? 1,
              isAvailable: room.isAvailable !== false,
              images: Array.isArray(room.images) ? room.images : [],
            }))
          : [{ ...EMPTY_ROOM_TYPE }],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateRoom(index, field, value) {
    setForm((previous) => ({
      ...previous,
      roomTypes: previous.roomTypes.map((room, roomIndex) =>
        roomIndex === index ? { ...room, [field]: value } : room
      ),
    }));
  }

  function addRoomType() {
    setForm((previous) => ({
      ...previous,
      roomTypes: [...previous.roomTypes, { ...EMPTY_ROOM_TYPE }],
    }));
  }

  function removeRoomType(index) {
    if (form.roomTypes.length === 1) {
      toast.error("At least one room type is required");
      return;
    }

    setForm((previous) => ({
      ...previous,
      roomTypes: previous.roomTypes.filter((_, roomIndex) => roomIndex !== index),
    }));
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      toast.error("Location services are not supported by this browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setForm((previous) => ({
          ...previous,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6),
        }));
        setGettingLocation(false);
        toast.success("Current location added");
      },
      () => {
        setGettingLocation(false);
        toast.error("Unable to get your current location");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  function buildPayload() {
    const name = form.name.trim();
    const description = form.description.trim();
    const latitude = form.latitude === "" ? 0 : Number(form.latitude);
    const longitude = form.longitude === "" ? 0 : Number(form.longitude);

    if (name.length < 2 || name.length > 150) {
      toast.error("Hotel name must contain 2 to 150 characters");
      return null;
    }

    if (description.length < 10 || description.length > 3000) {
      toast.error("Description must contain 10 to 3000 characters");
      return null;
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      toast.error("Latitude must be between -90 and 90");
      return null;
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      toast.error("Longitude must be between -180 and 180");
      return null;
    }

    const roomTypes = [];

    for (let index = 0; index < form.roomTypes.length; index += 1) {
      const room = form.roomTypes[index];
      const roomName = String(room.name || "").trim();
      const pricePerNight = Number(room.pricePerNight);
      const capacity = Number(room.capacity);
      const totalRooms = Number(room.totalRooms);

      if (!roomName || roomName.length > 100) {
        toast.error(`Room type ${index + 1}: enter a valid name`);
        return null;
      }
      if (!Number.isFinite(pricePerNight) || pricePerNight < 0) {
        toast.error(`Room type ${index + 1}: enter a valid price`);
        return null;
      }
      if (!Number.isInteger(capacity) || capacity < 1) {
        toast.error(`Room type ${index + 1}: capacity must be at least 1`);
        return null;
      }
      if (!Number.isInteger(totalRooms) || totalRooms < 1) {
        toast.error(`Room type ${index + 1}: total rooms must be at least 1`);
        return null;
      }

      roomTypes.push({
        name: roomName,
        pricePerNight,
        capacity,
        totalRooms,
        isAvailable: room.isAvailable !== false,
        images: Array.isArray(room.images)
          ? room.images.map((image) => String(image).trim()).filter(Boolean)
          : [],
      });
    }

    return {
      name,
      description,
      address: form.address.trim(),
      location: { latitude, longitude },
      images: form.imagesText
        .split(",")
        .map((image) => image.trim())
        .filter(Boolean),
      roomTypes,
      contactNumber: form.contactNumber.trim(),
      isAvailable: form.isAvailable,
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = buildPayload();

    if (!payload) {
      return;
    }

    try {
      setSaving(true);

      if (editingHotel) {
        await api.put(`/hotels/owner/${editingHotel._id}`, payload);
        toast.success("Hotel updated and sent for admin approval");
      } else {
        await api.post("/hotels/owner", payload);
        toast.success("Hotel submitted for admin approval");
      }

      resetForm();
      await loadHotels();
    } catch (error) {
      console.error("Save hotel error:", error);
      toast.error(getApiErrorMessage(error, "Failed to save hotel"));
    } finally {
      setSaving(false);
    }
  }

  async function deleteHotel(hotel) {
    if (!window.confirm(`Delete ${hotel.name || "this hotel"}?`)) {
      return;
    }

    try {
      setDeletingHotelId(hotel._id);
      await api.delete(`/hotels/owner/${hotel._id}`);
      toast.success("Hotel deleted successfully");
      await loadHotels();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete hotel"));
    } finally {
      setDeletingHotelId("");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">My Hotels</h1>
          <p className="mt-[5px] text-gray-500">
            Add hotels, room types, images, location and contact details.
          </p>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <button
            type="button"
            onClick={loadHotels}
            disabled={loading}
            className="flex items-center gap-[8px] rounded-lg border border-accent bg-white px-[16px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-[8px] rounded-lg bg-accent px-[18px] py-[10px] font-semibold text-white hover:bg-orange"
          >
            <FaPlus /> Add Hotel
          </button>
        </div>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Hotels" value={statistics.total} icon={<FaHotel />} color="bg-blue-600" />
        <StatCard title="Approved" value={statistics.approved} icon={<FaCheckCircle />} color="bg-green-600" />
        <StatCard title="Pending" value={statistics.pending} icon={<FaTimesCircle />} color="bg-orange" />
        <StatCard title="Rejected" value={statistics.rejected} icon={<FaTimesCircle />} color="bg-red-600" />
      </div>

      {showForm && (
        <HotelForm
          form={form}
          editing={Boolean(editingHotel)}
          saving={saving}
          gettingLocation={gettingLocation}
          onSubmit={handleSubmit}
          onCancel={resetForm}
          onFieldChange={updateField}
          onRoomChange={updateRoom}
          onAddRoom={addRoomType}
          onRemoveRoom={removeRoomType}
          onGetLocation={getCurrentLocation}
        />
      )}

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search hotel, address, contact or room type"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={approvalFilter}
            onChange={(event) => setApprovalFilter(event.target.value)}
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved Hotels</option>
            <option value="pending">Pending Approval</option>
            <option value="rejected">Rejected Hotels</option>
          </select>
        </div>
      </div>

      {loading ? (
        <MessagePanel message="Loading hotels..." />
      ) : filteredHotels.length === 0 ? (
        <MessagePanel message="No hotels match the current filters." />
      ) : (
        <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
          {filteredHotels.map((hotel) => (
            <HotelCard
              key={hotel._id}
              hotel={hotel}
              deleting={deletingHotelId === hotel._id}
              onEdit={() => openEditForm(hotel)}
              onDelete={() => deleteHotel(hotel)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HotelForm({
  form,
  editing,
  saving,
  gettingLocation,
  onSubmit,
  onCancel,
  onFieldChange,
  onRoomChange,
  onAddRoom,
  onRemoveRoom,
  onGetLocation,
}) {
  return (
    <form onSubmit={onSubmit} className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div className="mb-[20px] flex items-center justify-between gap-[10px]">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            {editing ? "Edit Hotel" : "Add New Hotel"}
          </h2>
          <p className="text-sm text-gray-500">
            Editing hotel details will return the hotel to pending approval.
          </p>
        </div>
        <button type="button" onClick={onCancel} className="text-xl text-gray-500 hover:text-red-600">
          <FaTimes />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
        <Input label="Hotel Name *" value={form.name} onChange={(value) => onFieldChange("name", value)} />
        <Input label="Contact Number" value={form.contactNumber} onChange={(value) => onFieldChange("contactNumber", value)} />
        <div className="md:col-span-2">
          <TextArea label="Description *" value={form.description} onChange={(value) => onFieldChange("description", value)} />
        </div>
        <div className="md:col-span-2">
          <Input label="Address" value={form.address} onChange={(value) => onFieldChange("address", value)} />
        </div>
        <Input label="Latitude" type="number" step="any" value={form.latitude} onChange={(value) => onFieldChange("latitude", value)} />
        <Input label="Longitude" type="number" step="any" value={form.longitude} onChange={(value) => onFieldChange("longitude", value)} />
        <div className="md:col-span-2">
          <button
            type="button"
            onClick={onGetLocation}
            disabled={gettingLocation}
            className="flex items-center gap-[8px] rounded-lg border border-accent px-[14px] py-[9px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
          >
            <FiMapPin /> {gettingLocation ? "Getting Location..." : "Use Current Location"}
          </button>
        </div>
        <div className="md:col-span-2">
          <TextArea
            label="Hotel Image URLs"
            value={form.imagesText}
            onChange={(value) => onFieldChange("imagesText", value)}
            placeholder="Separate multiple image URLs with commas"
          />
        </div>
      </div>

      <div className="mt-[25px] border-t pt-[20px]">
        <div className="mb-[15px] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800">Room Types</h3>
            <p className="text-sm text-gray-500">Keep totalRooms and availability when editing.</p>
          </div>
          <button type="button" onClick={onAddRoom} className="flex items-center gap-[6px] rounded-lg bg-accent px-[13px] py-[8px] text-sm font-semibold text-white hover:bg-orange">
            <FaPlus /> Add Room Type
          </button>
        </div>

        <div className="space-y-[15px]">
          {form.roomTypes.map((room, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-gray-50 p-[15px]">
              <div className="mb-[12px] flex items-center justify-between">
                <p className="font-semibold text-gray-700">Room Type {index + 1}</p>
                <button type="button" onClick={() => onRemoveRoom(index)} className="text-red-600 hover:text-red-700">
                  <FaTrash />
                </button>
              </div>
              <div className="grid grid-cols-1 gap-[12px] md:grid-cols-2 xl:grid-cols-4">
                <Input label="Name *" value={room.name} onChange={(value) => onRoomChange(index, "name", value)} />
                <Input label="Price Per Night *" type="number" min="0" value={room.pricePerNight} onChange={(value) => onRoomChange(index, "pricePerNight", value)} />
                <Input label="Capacity *" type="number" min="1" value={room.capacity} onChange={(value) => onRoomChange(index, "capacity", value)} />
                <Input label="Total Rooms *" type="number" min="1" value={room.totalRooms} onChange={(value) => onRoomChange(index, "totalRooms", value)} />
              </div>
              <div className="mt-[12px] grid grid-cols-1 gap-[12px] md:grid-cols-[1fr_auto] md:items-end">
                <TextArea
                  label="Room Image URLs"
                  value={room.images.join(", ")}
                  onChange={(value) =>
                    onRoomChange(
                      index,
                      "images",
                      value.split(",").map((item) => item.trim()).filter(Boolean)
                    )
                  }
                  placeholder="Separate multiple image URLs with commas"
                />
                <label className="flex h-[45px] items-center gap-[8px] rounded-lg border border-gray-300 bg-white px-[12px] text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={room.isAvailable !== false}
                    onChange={(event) => onRoomChange(index, "isAvailable", event.target.checked)}
                  />
                  Room Available
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-[20px] flex justify-end gap-[10px]">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-300 px-[18px] py-[10px] font-semibold text-gray-600 hover:bg-gray-100">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="rounded-lg bg-accent px-[20px] py-[10px] font-semibold text-white hover:bg-orange disabled:opacity-60">
          {saving ? "Saving..." : editing ? "Update Hotel" : "Submit Hotel"}
        </button>
      </div>
    </form>
  );
}

function Input({ label, value, onChange, type = "text", ...props }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-sm font-semibold text-gray-600">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
        {...props}
      />
    </label>
  );
}

function TextArea({ label, value, onChange, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-[6px] block text-sm font-semibold text-gray-600">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg border border-gray-300 px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </label>
  );
}

function HotelCard({ hotel, deleting, onEdit, onDelete }) {
  const status = getHotelApprovalStatus(hotel);
  const roomTypes = Array.isArray(hotel.roomTypes) ? hotel.roomTypes : [];
  const minimumPrice = roomTypes.length
    ? Math.min(...roomTypes.map((room) => Number(room.pricePerNight || 0)))
    : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
      <img
        src={resolveAssetUrl(hotel.images?.[0])}
        alt={hotel.name || "Hotel"}
        className="h-[210px] w-full object-cover"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = "/hotel-placeholder.jpg";
        }}
      />
      <div className="p-[20px]">
        <div className="mb-[12px] flex items-start justify-between gap-[12px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{hotel.name || "Unnamed Hotel"}</h2>
            <p className="mt-[5px] flex items-start gap-[6px] text-sm text-gray-500">
              <FaMapMarkerAlt className="mt-[2px] shrink-0 text-orange" />
              {hotel.address || "Address not added"}
            </p>
          </div>
          <StatusBadge status={status} />
        </div>

        {status === "rejected" && hotel.rejectionReason && (
          <p className="mb-[12px] rounded-lg bg-red-50 p-[10px] text-sm text-red-700">
            Rejection reason: {hotel.rejectionReason}
          </p>
        )}

        <div className="mb-[15px] grid grid-cols-3 gap-[8px] rounded-xl bg-gray-50 p-[12px] text-center">
          <div><p className="text-xs text-gray-500">Room Types</p><p className="font-bold">{roomTypes.length}</p></div>
          <div><p className="text-xs text-gray-500">From</p><p className="font-bold">{formatCurrency(minimumPrice)}</p></div>
          <div><p className="text-xs text-gray-500">Rating</p><p className="flex items-center justify-center gap-[4px] font-bold"><FaStar className="text-orange" />{Number(hotel.rating || 0).toFixed(1)}</p></div>
        </div>

        <div className="mb-[15px] space-y-[8px]">
          {roomTypes.slice(0, 3).map((room, index) => (
            <div key={`${room.name}-${index}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-[11px] py-[8px] text-sm">
              <span className="flex items-center gap-[6px] text-gray-700"><FaBed className="text-accent" />{room.name}</span>
              <span className="text-gray-500">{room.totalRooms || 1} room(s)</span>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-[10px]">
          <button type="button" onClick={onEdit} className="flex items-center gap-[7px] rounded-lg border border-accent px-[14px] py-[9px] font-semibold text-accent hover:bg-accent hover:text-white">
            <FaEdit /> Edit
          </button>
          <button type="button" onClick={onDelete} disabled={deleting} className="flex items-center gap-[7px] rounded-lg bg-red-600 px-[14px] py-[9px] font-semibold text-white hover:bg-red-700 disabled:opacity-60">
            <FaTrash /> {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </article>
  );
}

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-green-600",
    pending: "bg-orange",
    rejected: "bg-red-600",
  };

  return (
    <span className={`rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div><p className="text-sm text-gray-500">{title}</p><p className="mt-[5px] text-3xl font-bold text-gray-800">{value}</p></div>
      <div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>{icon}</div>
    </div>
  );
}

function MessagePanel({ message }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
      <div className="mb-[15px] flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400"><FaImage /></div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
