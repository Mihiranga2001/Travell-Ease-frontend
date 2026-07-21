import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Header from "../components/header";
import Footer from "../components/footer";

import {
  FaArrowRight,
  FaBus,
  FaCalendarCheck,
  FaCar,
  FaFilter,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMotorcycle,
  FaRedo,
  FaSearch,
  FaTaxi,
  FaUsers,
} from "react-icons/fa";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const API_URL = `${RAW_API_URL.replace(
  /\/api\/?$/,
  ""
).replace(/\/$/, "")}/api`;

const VEHICLES_API_URL =
  `${API_URL}/vehicles`;

const VEHICLE_TYPES = [
  { value: "all", label: "All Types" },
  { value: "bike", label: "Bike" },
  { value: "tuk", label: "Tuk Tuk" },
  { value: "car", label: "Car" },
  { value: "van", label: "Van" },
  { value: "bus", label: "Bus" },
];

export default function VehiclePage() {
  const [vehicles, setVehicles] = useState([]);
  const [loadingVehicles, setLoadingVehicles] =
    useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");
  const [minimumSeats, setMinimumSeats] =
    useState("");
  const [maximumPrice, setMaximumPrice] =
    useState("");

  const fetchVehicles = useCallback(
    async (signal) => {
      try {
        setLoadingVehicles(true);
        setLoadError("");

        const response = await fetch(
          VEHICLES_API_URL,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
            signal,
          }
        );

        const result = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
          throw new Error(
            result?.message ||
              "Failed to load vehicles"
          );
        }

        const vehicleList = Array.isArray(
          result
        )
          ? result
          : result?.vehicles ||
            result?.data ||
            [];

        /*
          Only approval is checked here.

          Unavailable vehicles remain visible and receive
          an "Unavailable" badge.
        */
        const publicVehicles =
          vehicleList.filter(
            (vehicle) =>
              vehicle &&
              vehicle.isApproved === true
          );

        setVehicles(publicVehicles);
      } catch (error) {
        if (error?.name === "AbortError") {
          return;
        }

        console.error(
          "Failed to load vehicles:",
          error
        );

        setVehicles([]);
        setLoadError(
          error?.message ||
            "Failed to load vehicles"
        );
      } finally {
        if (!signal?.aborted) {
          setLoadingVehicles(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller =
      new AbortController();

    fetchVehicles(controller.signal);

    return () => controller.abort();
  }, [fetchVehicles]);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    const selectedSeats =
      minimumSeats === ""
        ? null
        : Number(minimumSeats);

    const selectedPrice =
      maximumPrice === ""
        ? null
        : Number(maximumPrice);

    return vehicles.filter((vehicle) => {
      const searchableText = [
        vehicle.model,
        vehicle.type,
        formatVehicleType(vehicle.type),
        formatLocation(vehicle.location),
      ]
        .map((value) =>
          String(value || "").toLowerCase()
        )
        .join(" ");

      const matchesSearch =
        search === "" ||
        searchableText.includes(search);

      const matchesType =
        typeFilter === "all" ||
        vehicle.type === typeFilter;

      const isAvailable =
        vehicle.isAvailable !== false;

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter ===
          "available" &&
          isAvailable) ||
        (availabilityFilter ===
          "unavailable" &&
          !isAvailable);

      const matchesSeats =
        selectedSeats === null ||
        Number(vehicle.seats || 0) >=
          selectedSeats;

      const matchesPrice =
        selectedPrice === null ||
        Number(
          vehicle.pricePerDay || 0
        ) <= selectedPrice;

      return (
        matchesSearch &&
        matchesType &&
        matchesAvailability &&
        matchesSeats &&
        matchesPrice
      );
    });
  }, [
    vehicles,
    searchTerm,
    typeFilter,
    availabilityFilter,
    minimumSeats,
    maximumPrice,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setTypeFilter("all");
    setAvailabilityFilter("all");
    setMinimumSeats("");
    setMaximumPrice("");
  }

  const filtersAreActive =
    searchTerm.trim() !== "" ||
    typeFilter !== "all" ||
    availabilityFilter !== "all" ||
    minimumSeats !== "" ||
    maximumPrice !== "";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-primary text-secondary">
      <Header />

      <section
        className="relative min-h-[410px] w-full bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/bgVehicle.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-secondary/70" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center text-white lg:px-8">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-sm">
            <FaCar />
            Approved Rental Vehicles
          </p>

          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Find the Right{" "}
            <span className="text-orange">
              Rental Vehicle
            </span>
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-white/90 md:text-xl">
            Compare approved vehicles, daily
            prices, seating capacity and current
            availability.
          </p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-14 max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Search Vehicles
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaSearch className="shrink-0 text-orange" />

                <input
                  type="search"
                  placeholder="Search model, type or location"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent text-secondary outline-none"
                />
              </div>
            </div>

            <FilterSelect
              label="Vehicle Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={VEHICLE_TYPES}
            />

            <FilterSelect
              label="Availability"
              value={availabilityFilter}
              onChange={
                setAvailabilityFilter
              }
              options={[
                {
                  value: "all",
                  label: "All Availability",
                },
                {
                  value: "available",
                  label: "Available",
                },
                {
                  value: "unavailable",
                  label: "Unavailable",
                },
              ]}
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Maximum Daily Price
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaFilter className="shrink-0 text-orange" />

                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Any price"
                  value={maximumPrice}
                  onChange={(event) =>
                    setMaximumPrice(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent text-secondary outline-none"
                />
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-600">
                Minimum Seats
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaUsers className="shrink-0 text-orange" />

                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Any seats"
                  value={minimumSeats}
                  onChange={(event) =>
                    setMinimumSeats(
                      event.target.value
                    )
                  }
                  className="w-full bg-transparent text-secondary outline-none"
                />
              </div>
            </div>

            <div className="flex items-end">
              {filtersAreActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex h-[58px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 font-semibold text-gray-600 transition hover:border-accent hover:text-accent"
                >
                  <FaRedo />
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange">
              Vehicle Selection
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Approved Vehicles
            </h2>
          </div>

          <p className="text-gray-500">
            Showing{" "}
            <span className="font-bold text-secondary">
              {filteredVehicles.length}
            </span>{" "}
            vehicle
            {filteredVehicles.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        {loadingVehicles ? (
          <StatusPanel message="Loading vehicles..." />
        ) : loadError ? (
          <div className="rounded-2xl border border-red-200 bg-white p-10 text-center shadow-md">
            <p className="mb-5 text-red-600">
              {loadError}
            </p>

            <button
              type="button"
              onClick={() =>
                fetchVehicles()
              }
              className="rounded-lg bg-accent px-5 py-3 font-semibold text-white"
            >
              Try Again
            </button>
          </div>
        ) : filteredVehicles.length ===
          0 ? (
          <StatusPanel message="No vehicles match your filters." />
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map(
              (vehicle) => (
                <VehicleCard
                  key={vehicle._id}
                  vehicle={vehicle}
                />
              )
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const available =
    vehicle.isAvailable !== false;

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[225px] bg-gray-100">
        {getImageUrl(vehicle.image) ? (
          <img
            src={getImageUrl(vehicle.image)}
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
          <div className="flex h-full w-full items-center justify-center text-6xl text-gray-400">
            <VehicleTypeIcon
              type={vehicle.type}
            />
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white ${
            available
              ? "bg-green-600"
              : "bg-red-600"
          }`}
        >
          {available
            ? "Available"
            : "Unavailable"}
        </span>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
            {formatVehicleType(
              vehicle.type
            )}
          </p>

          <h3 className="text-2xl font-bold">
            {vehicle.model ||
              "Unnamed vehicle"}
          </h3>

          <p className="mt-3 flex items-start gap-2 text-sm text-gray-500">
            <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
            {formatLocation(
              vehicle.location
            )}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3">
          <InfoBox
            icon={<FaUsers />}
            label="Seats"
            value={vehicle.seats || 0}
          />

          <InfoBox
            icon={<FaMoneyBillWave />}
            label="Per Day"
            value={`Rs. ${formatCurrency(
              vehicle.pricePerDay
            )}`}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={`/vehicles/${vehicle._id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-accent bg-white px-5 py-3 font-semibold text-accent transition hover:bg-accent hover:text-white"
          >
            View Details
            <FaArrowRight />
          </Link>

          <button
            type="button"
            disabled={!available}
            onClick={() => {
              /*
                Replace this toast with navigation to your
                booking page after you create the booking feature.
              */
              toast.success(
                `Booking for ${
                  vehicle.model || "this vehicle"
                } will be available soon.`
              );
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white transition ${
              available
                ? "bg-green-600 hover:bg-green-700"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            <FaCalendarCheck />

            {available
              ? "Book Rental"
              : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-[58px] w-full rounded-xl border border-gray-200 bg-white px-4 text-secondary outline-none focus:ring-2 focus:ring-accent"
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="flex items-center gap-2 text-xs text-gray-500">
        <span className="text-orange">
          {icon}
        </span>
        {label}
      </p>

      <p className="mt-1 font-bold">
        {value}
      </p>
    </div>
  );
}

function StatusPanel({ message }) {
  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-md">
      {message}
    </div>
  );
}

function VehicleTypeIcon({ type }) {
  const value = String(type || "")
    .trim()
    .toLowerCase();

  if (value === "bike") {
    return <FaMotorcycle />;
  }

  if (value === "tuk") {
    return <FaTaxi />;
  }

  if (value === "bus") {
    return <FaBus />;
  }

  return <FaCar />;
}

function formatVehicleType(type) {
  const value = String(type || "")
    .trim()
    .toLowerCase();

  if (!value) {
    return "Unknown";
  }

  if (value === "tuk") {
    return "Tuk Tuk";
  }

  return (
    value.charAt(0).toUpperCase() +
    value.slice(1)
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

  return Number.isFinite(number)
    ? number.toLocaleString("en-LK", {
        maximumFractionDigits: 2,
      })
    : "0";
}

function getImageUrl(image) {
  const value = String(image || "")
    .trim()
    .replace(/\\/g, "/");

  if (!value) {
    return "";
  }

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  const backendOrigin = API_URL.replace(
    /\/api\/?$/,
    ""
  );

  return value.startsWith("/")
    ? `${backendOrigin}${value}`
    : `${backendOrigin}/${value}`;
}
