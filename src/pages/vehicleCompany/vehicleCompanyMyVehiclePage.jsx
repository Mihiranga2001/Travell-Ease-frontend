import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FaBus,
  FaCar,
  FaCheckCircle,
  FaEdit,
  FaImage,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMotorcycle,
  FaPlus,
  FaSearch,
  FaTaxi,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";

import {
  MdEventAvailable,
  MdOutlinePendingActions,
} from "react-icons/md";

import { FiRefreshCw } from "react-icons/fi";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const API_URL = `${RAW_API_URL.replace(
  /\/api\/?$/,
  ""
).replace(/\/$/, "")}/api`;

const VEHICLE_TYPES = [
  { value: "bike", label: "Bike" },
  { value: "tuk", label: "Tuk Tuk" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
];

export default function VehicleCompanyMyVehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingVehicleId, setDeletingVehicleId] =
    useState("");

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] =
    useState("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] =
    useState(null);
  const [gettingLocation, setGettingLocation] =
    useState(false);

  const [type, setType] = useState("car");
  const [model, setModel] = useState("");
  const [image, setImage] = useState("");
  const [pricePerDay, setPricePerDay] = useState("");
  const [seats, setSeats] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  function getAuthConfig() {
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

  async function loadVehicles() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/vehicles/company/my`,
        getAuthConfig()
      );

      const vehicleList = Array.isArray(response.data)
        ? response.data
        : response.data?.vehicles ||
          response.data?.data ||
          response.data?.results ||
          [];

      setVehicles(vehicleList);
    } catch (error) {
      console.error("Load company vehicles error:", error);
      setVehicles([]);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load your vehicles"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const typeText = formatVehicleType(vehicle.type);
      const locationText = formatLocation(vehicle.location);

      const matchesSearch =
        search === "" ||
        String(vehicle.model || "")
          .toLowerCase()
          .includes(search) ||
        String(vehicle.type || "")
          .toLowerCase()
          .includes(search) ||
        typeText.toLowerCase().includes(search) ||
        locationText.toLowerCase().includes(search);

      const matchesType =
        typeFilter === "all" ||
        vehicle.type === typeFilter;

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" &&
          vehicle.isApproved === true) ||
        (approvalFilter === "pending" &&
          vehicle.isApproved !== true);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          vehicle.isAvailable !== false) ||
        (availabilityFilter === "unavailable" &&
          vehicle.isAvailable === false);

      return (
        matchesSearch &&
        matchesType &&
        matchesApproval &&
        matchesAvailability
      );
    });
  }, [
    vehicles,
    searchText,
    typeFilter,
    approvalFilter,
    availabilityFilter,
  ]);

  function resetForm() {
    setType("car");
    setModel("");
    setImage("");
    setPricePerDay("");
    setSeats("");
    setLatitude("");
    setLongitude("");
    setEditingVehicle(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(vehicle) {
    setEditingVehicle(vehicle);
    setType(vehicle.type || "car");
    setModel(vehicle.model || "");
    setImage(vehicle.image || "");
    setPricePerDay(vehicle.pricePerDay ?? "");
    setSeats(vehicle.seats ?? "");
    setLatitude(vehicle.location?.latitude ?? "");
    setLongitude(vehicle.location?.longitude ?? "");
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
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
    const cleanType = String(type || "")
      .trim()
      .toLowerCase();
    const cleanModel = model.trim();
    const cleanImage = image.trim();

    const priceNumber = Number(pricePerDay);
    const seatNumber = Number(seats);
    const latitudeNumber =
      latitude === "" ? 0 : Number(latitude);
    const longitudeNumber =
      longitude === "" ? 0 : Number(longitude);

    if (
      !VEHICLE_TYPES.some(
        (vehicleType) =>
          vehicleType.value === cleanType
      )
    ) {
      toast.error("Please select a valid vehicle type");
      return null;
    }

    if (cleanModel.length < 2) {
      toast.error(
        "Vehicle model must contain at least 2 characters"
      );
      return null;
    }

    if (cleanModel.length > 150) {
      toast.error(
        "Vehicle model cannot exceed 150 characters"
      );
      return null;
    }

    if (
      pricePerDay === "" ||
      !Number.isFinite(priceNumber) ||
      priceNumber < 0
    ) {
      toast.error("Enter a valid price per day");
      return null;
    }

    if (
      seats === "" ||
      !Number.isInteger(seatNumber) ||
      seatNumber < 1
    ) {
      toast.error(
        "Seats must be a whole number of at least 1"
      );
      return null;
    }

    if (
      !Number.isFinite(latitudeNumber) ||
      latitudeNumber < -90 ||
      latitudeNumber > 90
    ) {
      toast.error("Latitude must be between -90 and 90");
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

    return {
      type: cleanType,
      model: cleanModel,
      image: cleanImage,
      pricePerDay: priceNumber,
      seats: seatNumber,
      location: {
        latitude: latitudeNumber,
        longitude: longitudeNumber,
      },
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

      if (editingVehicle) {
        await axios.put(
          `${API_URL}/vehicles/company/${editingVehicle._id}`,
          payload,
          getAuthConfig()
        );

        toast.success(
          "Vehicle updated and sent for administrator approval"
        );
      } else {
        await axios.post(
          `${API_URL}/vehicles/company`,
          payload,
          getAuthConfig()
        );

        toast.success(
          "Vehicle added and sent for administrator approval"
        );
      }

      resetForm();
      await loadVehicles();
    } catch (error) {
      console.error("Save vehicle error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to save vehicle"
        )
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteVehicle(vehicle) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${
        vehicle.model || "this vehicle"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingVehicleId(vehicle._id);

      await axios.delete(
        `${API_URL}/vehicles/company/${vehicle._id}`,
        getAuthConfig()
      );

      toast.success("Vehicle deleted successfully");

      if (editingVehicle?._id === vehicle._id) {
        resetForm();
      }

      await loadVehicles();
    } catch (error) {
      console.error("Delete vehicle error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete vehicle"
        )
      );
    } finally {
      setDeletingVehicleId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setTypeFilter("all");
    setApprovalFilter("all");
    setAvailabilityFilter("all");
  }

  const filtersAreActive =
    searchText.trim() !== "" ||
    typeFilter !== "all" ||
    approvalFilter !== "all" ||
    availabilityFilter !== "all";

  const totalVehicles = vehicles.length;
  const approvedVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved === true
  ).length;
  const pendingVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved !== true
  ).length;
  const availableVehicles = vehicles.filter(
    (vehicle) => vehicle.isAvailable !== false
  ).length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex w-full flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            My Vehicles
          </h1>

          <p className="mt-[5px] text-gray-500">
            Add and manage your rental vehicles. New or
            edited vehicles must be approved by an
            administrator.
          </p>
        </div>

        <div className="flex flex-wrap gap-[10px]">
          <button
            type="button"
            onClick={loadVehicles}
            disabled={loading}
            className="flex items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
          >
            <FiRefreshCw
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-[8px] rounded-lg border border-accent bg-accent px-[18px] py-[10px] font-semibold text-white transition hover:bg-transparent hover:text-accent"
          >
            <FaPlus />
            Add Vehicle
          </button>
        </div>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <VehicleStatCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={<FaCar />}
          color="bg-blue-600"
        />

        <VehicleStatCard
          title="Approved"
          value={approvedVehicles}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <VehicleStatCard
          title="Pending Approval"
          value={pendingVehicles}
          icon={<MdOutlinePendingActions />}
          color="bg-orange"
        />

        <VehicleStatCard
          title="Available"
          value={availableVehicles}
          icon={<MdEventAvailable />}
          color="bg-purple-600"
        />
      </div>

      {showForm && (
        <div className="mb-[25px] w-full rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <div className="mb-[20px] flex items-center justify-between gap-[15px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingVehicle
                  ? "Update Vehicle"
                  : "Add New Vehicle"}
              </h2>

              <p className="mt-[3px] text-sm text-gray-500">
                Enter the vehicle details and submit it
                for administrator approval.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
              title="Close form"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
              <SelectField
                label="Vehicle Type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value)
                }
                required
              >
                {VEHICLE_TYPES.map((vehicleType) => (
                  <option
                    key={vehicleType.value}
                    value={vehicleType.value}
                  >
                    {vehicleType.label}
                  </option>
                ))}
              </SelectField>

              <InputField
                label="Vehicle Model"
                value={model}
                onChange={(event) =>
                  setModel(event.target.value)
                }
                placeholder="Example: Toyota KDH"
                minLength={2}
                maxLength={150}
                required
              />

              <InputField
                label="Price Per Day"
                type="number"
                min="0"
                step="0.01"
                value={pricePerDay}
                onChange={(event) =>
                  setPricePerDay(event.target.value)
                }
                placeholder="Example: 12000"
                required
              />

              <InputField
                label="Number of Seats"
                type="number"
                min="1"
                step="1"
                value={seats}
                onChange={(event) =>
                  setSeats(event.target.value)
                }
                placeholder="Example: 5"
                required
              />

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
                placeholder="Example: 6.9271"
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
                placeholder="Example: 79.8612"
              />

              <div className="flex justify-end md:col-span-2">
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={gettingLocation}
                  className="inline-flex items-center gap-[8px] rounded-lg border border-accent px-[14px] py-[9px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
                >
                  <FaMapMarkerAlt />

                  {gettingLocation
                    ? "Getting Location..."
                    : "Use Current GPS Location"}
                </button>
              </div>

              <div className="md:col-span-2">
                <InputField
                  label="Vehicle Image URL"
                  value={image}
                  onChange={(event) =>
                    setImage(event.target.value)
                  }
                  placeholder="Paste a vehicle image URL or upload path"
                />

                <VehicleImagePreview
                  image={image}
                  model={model}
                />
              </div>
            </div>

            <div className="mt-[20px] flex justify-end gap-[10px]">
              <button
                type="button"
                onClick={resetForm}
                disabled={saving}
                className="rounded-lg bg-gray-200 px-[18px] py-[10px] font-semibold text-gray-700 hover:bg-gray-300 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="rounded-lg border border-accent bg-accent px-[18px] py-[10px] font-semibold text-white transition hover:bg-transparent hover:text-accent disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingVehicle
                    ? "Update Vehicle"
                    : "Submit Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="mb-[25px] w-full rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search model, type or location"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Vehicle Types
            </option>

            {VEHICLE_TYPES.map((vehicleType) => (
              <option
                key={vehicleType.value}
                value={vehicleType.value}
              >
                {vehicleType.label}
              </option>
            ))}
          </select>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(event.target.value)
            }
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Approval Status
            </option>
            <option value="approved">
              Approved Vehicles
            </option>
            <option value="pending">
              Pending Approval
            </option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Availability
            </option>
            <option value="available">
              Available
            </option>
            <option value="unavailable">
              Unavailable
            </option>
          </select>
        </div>

        {filtersAreActive && (
          <div className="mt-[15px] flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-accent hover:text-orange"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="w-full rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="mb-[20px]">
          <h2 className="text-xl font-bold text-gray-800">
            Vehicle List
          </h2>

          <p className="text-sm text-gray-500">
            Showing {filteredVehicles.length} vehicle
            {filteredVehicles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center text-gray-500">
            Loading vehicles...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
            <div className="mb-[15px] flex h-[70px] w-[70px] items-center justify-center rounded-full bg-gray-100 text-3xl text-gray-400">
              <FaCar />
            </div>

            <h3 className="mb-[5px] text-xl font-bold text-gray-800">
              No vehicles found
            </h3>

            <p className="text-gray-500">
              Add your first vehicle using the Add Vehicle
              button.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                deleting={
                  deletingVehicleId === vehicle._id
                }
                onEdit={() => openEditForm(vehicle)}
                onDelete={() =>
                  handleDeleteVehicle(vehicle)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function VehicleImagePreview({ image, model }) {
  const imageUrl = normalizeImageUrl(image);

  if (!imageUrl) {
    return null;
  }

  return (
    <div className="mt-[10px] h-[210px] max-w-[420px] overflow-hidden rounded-xl border bg-gray-100">
      <img
        src={imageUrl}
        alt={model || "Vehicle preview"}
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src =
            "/vehicle-placeholder.jpg";
        }}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function VehicleCard({
  vehicle,
  deleting,
  onEdit,
  onDelete,
}) {
  const imageUrl = normalizeImageUrl(vehicle.image);

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 transition hover:shadow-lg">
      <div className="relative h-[230px] bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={vehicle.model || "Vehicle"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src =
                "/vehicle-placeholder.jpg";
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl text-gray-400">
            <FaImage />
          </div>
        )}

        <div className="absolute left-[15px] top-[15px]">
          <ApprovalBadge
            approved={vehicle.isApproved === true}
          />
        </div>

        <div className="absolute right-[15px] top-[15px]">
          <span className="inline-flex items-center gap-[6px] rounded-full bg-white px-[11px] py-[6px] text-xs font-semibold text-gray-800 shadow-md">
            <VehicleTypeIcon type={vehicle.type} />
            {formatVehicleType(vehicle.type)}
          </span>
        </div>
      </div>

      <div className="p-[18px]">
        <div className="mb-[12px]">
          <h3 className="text-xl font-bold text-gray-800">
            {vehicle.model || "Unnamed vehicle"}
          </h3>

          <p className="mt-[5px] flex items-start gap-[6px] text-sm text-gray-500">
            <FaMapMarkerAlt className="mt-[3px] shrink-0 text-orange" />
            {formatLocation(vehicle.location)}
          </p>
        </div>

        <div className="mb-[15px] grid grid-cols-2 gap-[10px] sm:grid-cols-3">
          <VehicleInfoBox
            label="Daily Price"
            value={`Rs. ${formatCurrency(
              vehicle.pricePerDay
            )}`}
            icon={<FaMoneyBillWave />}
          />

          <VehicleInfoBox
            label="Seats"
            value={`${Number(vehicle.seats || 0)}`}
            icon={<FaUsers />}
          />

          <VehicleInfoBox
            label="Type"
            value={formatVehicleType(vehicle.type)}
            icon={<VehicleTypeIcon type={vehicle.type} />}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[10px]">
          <AvailabilityBadge
            available={vehicle.isAvailable !== false}
          />

          <div className="flex gap-[8px]">
            <button
              type="button"
              onClick={onEdit}
              disabled={deleting}
              className="inline-flex items-center gap-[6px] rounded-lg bg-blue-600 px-[13px] py-[8px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              <FaEdit />
              Edit
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={deleting}
              className="inline-flex items-center gap-[6px] rounded-lg bg-red-600 px-[13px] py-[8px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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

function VehicleStatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-[6px] text-3xl font-bold text-gray-800">
          {value}
        </h2>
      </div>

      <div
        className={`${color} flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white`}
      >
        {icon}
      </div>
    </div>
  );
}

function VehicleInfoBox({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-xl bg-gray-50 p-[10px]">
      <p className="mb-[4px] flex items-center gap-[5px] text-xs text-gray-500">
        <span className="text-orange">{icon}</span>
        {label}
      </p>

      <p className="truncate text-sm font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function ApprovalBadge({ approved }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${
        approved ? "bg-green-600" : "bg-orange"
      }`}
    >
      {approved ? "Approved" : "Pending Approval"}
    </span>
  );
}

function AvailabilityBadge({ available }) {
  return (
    <span
      className={`inline-flex rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${
        available ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {available ? "Available" : "Unavailable"}
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
      <label className="mb-[6px] block text-sm font-semibold text-gray-700">
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
        className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  required = false,
  children,
}) {
  return (
    <div>
      <label className="mb-[6px] block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {children}
      </select>
    </div>
  );
}

function VehicleTypeIcon({ type }) {
  const normalizedType = String(type || "")
    .trim()
    .toLowerCase();

  if (normalizedType === "bike") {
    return <FaMotorcycle />;
  }

  if (normalizedType === "tuk") {
    return <FaTaxi />;
  }

  if (normalizedType === "bus") {
    return <FaBus />;
  }

  return <FaCar />;
}

function formatVehicleType(type) {
  const normalizedType = String(type || "")
    .trim()
    .toLowerCase();

  if (!normalizedType) {
    return "Unknown";
  }

  if (normalizedType === "tuk") {
    return "Tuk Tuk";
  }

  return (
    normalizedType.charAt(0).toUpperCase() +
    normalizedType.slice(1)
  );
}

function formatLocation(location) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return "Location not added";
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function formatCurrency(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  });
}

function normalizeImageUrl(image) {
  const imageText = String(image || "")
    .trim()
    .replace(/\\/g, "/");

  if (!imageText) {
    return "";
  }

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:") ||
    imageText.startsWith("blob:")
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