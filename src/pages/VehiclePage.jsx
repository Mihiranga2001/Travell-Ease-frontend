import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

import Header from "../components/header";
import Footer from "../components/footer";
import {
  api,
  extractList,
  formatCurrency,
  getApiErrorMessage,
  resolveAssetUrl,
} from "../utils/travelApi";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");
  const [minimumSeats, setMinimumSeats] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");

  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/vehicles");
      const list = extractList(response, ["vehicles"]);
      setVehicles(list.filter((vehicle) => vehicle?.isApproved === true));
    } catch (loadError) {
      setVehicles([]);
      setError(getApiErrorMessage(loadError, "Failed to load vehicles"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  const filteredVehicles = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const seats = minimumSeats === "" ? null : Number(minimumSeats);
    const price = maximumPrice === "" ? null : Number(maximumPrice);

    return vehicles.filter((vehicle) => {
      const searchable = [
        vehicle.model,
        vehicle.type,
        formatVehicleType(vehicle.type),
        formatLocation(vehicle.location),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      const available = vehicle.isAvailable !== false;

      return (
        (!search || searchable.includes(search)) &&
        (typeFilter === "all" || vehicle.type === typeFilter) &&
        (availabilityFilter === "all" ||
          (availabilityFilter === "available" && available) ||
          (availabilityFilter === "unavailable" && !available)) &&
        (seats === null || Number(vehicle.seats || 0) >= seats) &&
        (price === null || Number(vehicle.pricePerDay || 0) <= price)
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

  const filtersActive =
    searchTerm.trim() !== "" ||
    typeFilter !== "all" ||
    availabilityFilter !== "all" ||
    minimumSeats !== "" ||
    maximumPrice !== "";

  function clearFilters() {
    setSearchTerm("");
    setTypeFilter("all");
    setAvailabilityFilter("all");
    setMinimumSeats("");
    setMaximumPrice("");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-primary text-secondary">
      <Header />

      <section
        className="relative min-h-[410px] bg-cover bg-center"
        style={{ backgroundImage: "url('/bgVehicle.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/75" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center text-white lg:px-8">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium">
            <FaCar /> Approved Rental Vehicles
          </p>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Find the Right <span className="text-orange">Rental Vehicle</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-white/90">
            Compare approved vehicles, daily prices, seating capacity and
            availability, then send a rental request online.
          </p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-14 max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
            <FilterField label="Search Vehicles" icon={<FaSearch />} className="lg:col-span-2">
              <input
                type="search"
                placeholder="Model, type or location"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </FilterField>

            <FilterSelect
              label="Vehicle Type"
              value={typeFilter}
              onChange={setTypeFilter}
              options={VEHICLE_TYPES}
            />
            <FilterSelect
              label="Availability"
              value={availabilityFilter}
              onChange={setAvailabilityFilter}
              options={[
                { value: "all", label: "All Availability" },
                { value: "available", label: "Available" },
                { value: "unavailable", label: "Unavailable" },
              ]}
            />
            <FilterField label="Maximum Daily Price" icon={<FaFilter />}>
              <input
                type="number"
                min="0"
                placeholder="Any price"
                value={maximumPrice}
                onChange={(event) => setMaximumPrice(event.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </FilterField>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <FilterField label="Minimum Seats" icon={<FaUsers />}>
              <input
                type="number"
                min="1"
                placeholder="Any seats"
                value={minimumSeats}
                onChange={(event) => setMinimumSeats(event.target.value)}
                className="w-full bg-transparent outline-none"
              />
            </FilterField>

            <div className="flex items-end">
              {filtersActive && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex h-[58px] w-full items-center justify-center gap-2 rounded-xl border border-gray-200 font-semibold text-gray-600 transition hover:border-accent hover:text-accent"
                >
                  <FaRedo /> Clear Filters
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
            <h2 className="mt-2 text-3xl font-bold">Approved Vehicles</h2>
          </div>
          <p className="text-gray-500">
            Showing <strong className="text-secondary">{filteredVehicles.length}</strong> vehicle(s)
          </p>
        </div>

        {loading ? (
          <StatusPanel message="Loading vehicles..." />
        ) : error ? (
          <StatusPanel
            message={error}
            action={
              <button
                type="button"
                onClick={loadVehicles}
                className="rounded-xl bg-accent px-5 py-3 font-semibold text-white"
              >
                Try Again
              </button>
            }
          />
        ) : filteredVehicles.length === 0 ? (
          <StatusPanel message="No vehicles match your filters." />
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard key={vehicle._id || vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

function VehicleCard({ vehicle }) {
  const id = vehicle._id || vehicle.id;
  const available = vehicle.isAvailable !== false;
  const image = resolveAssetUrl(vehicle.image, "/vehicle-placeholder.jpg");

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-[225px] bg-gray-100">
        {image ? (
          <img
            src={image}
            alt={vehicle.model || "Vehicle"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/vehicle-placeholder.jpg";
            }}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl text-gray-400">
            <VehicleTypeIcon type={vehicle.type} />
          </div>
        )}

        <span
          className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold text-white ${
            available ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {available ? "Available" : "Unavailable"}
        </span>
      </div>

      <div className="p-5">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-orange">
          {formatVehicleType(vehicle.type)}
        </p>
        <h3 className="text-2xl font-bold">{vehicle.model || "Unnamed Vehicle"}</h3>
        <p className="mt-3 flex items-start gap-2 text-sm text-gray-500">
          <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
          {formatLocation(vehicle.location)}
        </p>

        <div className="my-5 grid grid-cols-2 gap-3">
          <InfoBox icon={<FaUsers />} label="Seats" value={vehicle.seats || 0} />
          <InfoBox
            icon={<FaMoneyBillWave />}
            label="Per Day"
            value={formatCurrency(vehicle.pricePerDay)}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={`/vehicles/${id}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-accent px-4 py-3 font-semibold text-accent transition hover:bg-accent hover:text-white"
          >
            View Details <FaArrowRight />
          </Link>

          {available ? (
            <Link
              to={`/vehicles/${id}?book=1`}
              className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              <FaCalendarCheck /> Hire Now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="cursor-not-allowed rounded-xl bg-gray-400 px-4 py-3 font-semibold text-white"
            >
              Unavailable
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function FilterField({ label, icon, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        {label}
      </label>
      <div className="flex h-[58px] items-center gap-3 rounded-xl border border-gray-200 px-4 focus-within:ring-2 focus-within:ring-accent">
        <span className="text-orange">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-[58px] w-full rounded-xl border border-gray-200 bg-white px-4 outline-none focus:ring-2 focus:ring-accent"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
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
        <span className="text-orange">{icon}</span> {label}
      </p>
      <p className="mt-1 font-bold">{value}</p>
    </div>
  );
}

function StatusPanel({ message, action = null }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center text-gray-500 shadow-md">
      <p className={action ? "mb-5" : ""}>{message}</p>
      {action}
    </div>
  );
}

function VehicleTypeIcon({ type }) {
  const value = String(type || "").toLowerCase();
  if (value === "bike") return <FaMotorcycle />;
  if (value === "tuk") return <FaTaxi />;
  if (value === "bus") return <FaBus />;
  return <FaCar />;
}

function formatVehicleType(type) {
  const value = String(type || "").trim().toLowerCase();
  if (!value) return "Unknown";
  if (value === "tuk") return "Tuk Tuk";
  return value.charAt(0).toUpperCase() + value.slice(1);
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
