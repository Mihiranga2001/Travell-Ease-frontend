import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FaBus,
  FaCar,
  FaCheckCircle,
  FaImage,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMotorcycle,
  FaSearch,
  FaTaxi,
  FaTimesCircle,
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

export default function VehicleCompanyVehicleAvailabilityPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingVehicleId, setUpdatingVehicleId] =
    useState("");

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] =
    useState("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

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

  function getApiErrorMessage(
    error,
    fallbackMessage
  ) {
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

      const vehicleList = Array.isArray(
        response.data
      )
        ? response.data
        : response.data?.vehicles ||
          response.data?.data ||
          response.data?.results ||
          [];

      setVehicles(vehicleList);
    } catch (error) {
      console.error(
        "Load vehicle availability error:",
        error
      );

      setVehicles([]);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load vehicle availability"
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
    const search = searchText
      .trim()
      .toLowerCase();

    return vehicles.filter((vehicle) => {
      const typeText = formatVehicleType(
        vehicle.type
      );

      const locationText = formatLocation(
        vehicle.location
      );

      const matchesSearch =
        search === "" ||
        String(vehicle.model || "")
          .toLowerCase()
          .includes(search) ||
        String(vehicle.type || "")
          .toLowerCase()
          .includes(search) ||
        typeText
          .toLowerCase()
          .includes(search) ||
        locationText
          .toLowerCase()
          .includes(search);

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

  async function handleAvailabilityChange(
    vehicle,
    newAvailability
  ) {
    const action = newAvailability
      ? "mark this vehicle as available"
      : "mark this vehicle as unavailable";

    const confirmed = window.confirm(
      `Are you sure you want to ${action}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingVehicleId(vehicle._id);

      const response = await axios.patch(
        `${API_URL}/vehicles/company/${vehicle._id}/availability`,
        {
          isAvailable: newAvailability,
        },
        getAuthConfig()
      );

      const updatedVehicle =
        response.data?.vehicle || null;

      setVehicles((previousVehicles) =>
        previousVehicles.map(
          (currentVehicle) =>
            currentVehicle._id === vehicle._id
              ? updatedVehicle
                ? {
                    ...currentVehicle,
                    ...updatedVehicle,
                  }
                : {
                    ...currentVehicle,
                    isAvailable:
                      newAvailability,
                  }
              : currentVehicle
        )
      );

      toast.success(
        newAvailability
          ? "Vehicle marked as available"
          : "Vehicle marked as unavailable"
      );
    } catch (error) {
      console.error(
        "Update vehicle availability error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update vehicle availability"
        )
      );
    } finally {
      setUpdatingVehicleId("");
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
    (vehicle) =>
      vehicle.isApproved === true
  ).length;

  const availableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.isAvailable !== false
  ).length;

  const unavailableVehicles = vehicles.filter(
    (vehicle) =>
      vehicle.isAvailable === false
  ).length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      {/* Header */}
      <div className="mb-[25px] flex w-full flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Vehicle Availability
          </h1>

          <p className="mt-[5px] text-gray-500">
            View your vehicles and control which vehicles
            are currently available for rental.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVehicles}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <VehicleStatCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={<FaCar />}
          color="bg-blue-600"
        />

        <VehicleStatCard
          title="Approved Vehicles"
          value={approvedVehicles}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <VehicleStatCard
          title="Available Vehicles"
          value={availableVehicles}
          icon={<MdEventAvailable />}
          color="bg-purple-600"
        />

        <VehicleStatCard
          title="Unavailable Vehicles"
          value={unavailableVehicles}
          icon={<FaTimesCircle />}
          color="bg-red-600"
        />
      </div>

      {/* Filters */}
      <div className="mb-[25px] w-full rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search model, type or location"
              value={searchText}
              onChange={(event) =>
                setSearchText(
                  event.target.value
                )
              }
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Vehicle Types
            </option>

            {VEHICLE_TYPES.map(
              (vehicleType) => (
                <option
                  key={vehicleType.value}
                  value={vehicleType.value}
                >
                  {vehicleType.label}
                </option>
              )
            )}
          </select>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(
                event.target.value
              )
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
              setAvailabilityFilter(
                event.target.value
              )
            }
            className="h-[45px] w-full rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Availability
            </option>

            <option value="available">
              Available Vehicles
            </option>

            <option value="unavailable">
              Unavailable Vehicles
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

      {/* Vehicle availability list */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-gray-200 bg-white text-gray-500 shadow-md">
          Loading vehicle availability...
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
          <div className="mb-[15px] flex h-[75px] w-[75px] items-center justify-center rounded-full bg-gray-100 text-4xl text-gray-400">
            <FaCar />
          </div>

          <h2 className="text-xl font-bold text-gray-800">
            No vehicles found
          </h2>

          <p className="mt-[5px] text-gray-500">
            Add vehicles from the My Vehicles page or
            change your current filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
          {filteredVehicles.map((vehicle) => (
            <VehicleAvailabilityCard
              key={vehicle._id}
              vehicle={vehicle}
              updating={
                updatingVehicleId ===
                vehicle._id
              }
              onAvailabilityChange={
                handleAvailabilityChange
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VehicleAvailabilityCard({
  vehicle,
  updating,
  onAvailabilityChange,
}) {
  const vehicleIsAvailable =
    vehicle.isAvailable !== false;

  const imageUrl = normalizeImageUrl(
    vehicle.image
  );

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:shadow-lg">
      <div className="relative h-[230px] bg-gray-100">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={
              vehicle.model || "Vehicle"
            }
            onError={(event) => {
              event.currentTarget.onerror =
                null;

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
            approved={
              vehicle.isApproved === true
            }
          />
        </div>

        <div className="absolute right-[15px] top-[15px]">
          <span className="inline-flex items-center gap-[6px] rounded-full bg-white px-[11px] py-[6px] text-xs font-semibold text-gray-800 shadow-md">
            <VehicleTypeIcon
              type={vehicle.type}
            />

            {formatVehicleType(
              vehicle.type
            )}
          </span>
        </div>
      </div>

      <div className="p-[18px]">
        <div className="mb-[15px] flex items-start justify-between gap-[12px]">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold text-gray-800">
              {vehicle.model ||
                "Unnamed vehicle"}
            </h2>

            <p className="mt-[5px] flex items-start gap-[6px] text-sm text-gray-500">
              <FaMapMarkerAlt className="mt-[3px] shrink-0 text-orange" />

              {formatLocation(
                vehicle.location
              )}
            </p>
          </div>

          <AvailabilityBadge
            available={vehicleIsAvailable}
          />
        </div>

        <div className="mb-[18px] grid grid-cols-2 gap-[10px] sm:grid-cols-3">
          <VehicleInfoBox
            label="Daily Price"
            value={`Rs. ${formatCurrency(
              vehicle.pricePerDay
            )}`}
            icon={<FaMoneyBillWave />}
          />

          <VehicleInfoBox
            label="Seats"
            value={Number(
              vehicle.seats || 0
            )}
            icon={<FaUsers />}
          />

          <VehicleInfoBox
            label="Type"
            value={formatVehicleType(
              vehicle.type
            )}
            icon={
              <VehicleTypeIcon
                type={vehicle.type}
              />
            }
          />
        </div>

        {!vehicle.isApproved && (
          <div className="mb-[15px] rounded-xl border border-orange/30 bg-orange/10 p-[12px]">
            <p className="flex items-center gap-[7px] text-sm text-gray-700">
              <MdOutlinePendingActions className="shrink-0 text-orange" />

              This vehicle is waiting for administrator
              approval. It will not appear on the public
              vehicle page yet.
            </p>
          </div>
        )}

        <div className="border-t border-gray-100 pt-[15px]">
          <label className="mb-[6px] block text-sm font-semibold text-gray-700">
            Vehicle Availability
          </label>

          <select
            value={
              vehicleIsAvailable
                ? "true"
                : "false"
            }
            disabled={updating}
            onChange={(event) =>
              onAvailabilityChange(
                vehicle,
                event.target.value ===
                  "true"
              )
            }
            className={`h-[44px] w-full rounded-lg border-none px-[12px] text-sm font-semibold text-white outline-none disabled:cursor-not-allowed disabled:opacity-60 ${
              vehicleIsAvailable
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            <option value="true">
              Available for Rental
            </option>

            <option value="false">
              Not Available for Rental
            </option>
          </select>

          {updating && (
            <p className="mt-[6px] text-xs text-gray-500">
              Updating availability...
            </p>
          )}
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
        <p className="text-sm text-gray-500">
          {title}
        </p>

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
        <span className="text-orange">
          {icon}
        </span>

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
      className={`inline-flex rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${
        approved
          ? "bg-green-600"
          : "bg-orange"
      }`}
    >
      {approved
        ? "Admin Approved"
        : "Pending Approval"}
    </span>
  );
}

function AvailabilityBadge({
  available,
}) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-[10px] py-[5px] text-xs font-semibold text-white ${
        available
          ? "bg-green-600"
          : "bg-red-600"
      }`}
    >
      {available
        ? "Available"
        : "Unavailable"}
    </span>
  );
}

function VehicleTypeIcon({ type }) {
  const normalizedType = String(
    type || ""
  )
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
  const normalizedType = String(
    type || ""
  )
    .trim()
    .toLowerCase();

  if (!normalizedType) {
    return "Unknown";
  }

  if (normalizedType === "tuk") {
    return "Tuk Tuk";
  }

  return (
    normalizedType
      .charAt(0)
      .toUpperCase() +
    normalizedType.slice(1)
  );
}

function formatLocation(location) {
  const latitude = Number(
    location?.latitude
  );

  const longitude = Number(
    location?.longitude
  );

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 &&
      longitude === 0)
  ) {
    return "Location not added";
  }

  return `${latitude.toFixed(
    6
  )}, ${longitude.toFixed(6)}`;
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
  const imageText = String(
    image || ""
  )
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
