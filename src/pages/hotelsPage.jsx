import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaBed,
  FaCalendarCheck,
  FaFilter,
  FaHotel,
  FaMapMarkerAlt,
  FaRedo,
  FaSearch,
  FaStar,
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

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [guestCount, setGuestCount] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/hotels");
      const list = extractList(response, ["hotels"]);

      setHotels(
        list.filter(
          (hotel) =>
            hotel &&
            hotel.isApproved === true &&
            hotel.isAvailable !== false
        )
      );
    } catch (loadError) {
      setHotels([]);
      setError(getApiErrorMessage(loadError, "Failed to load hotels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const filteredHotels = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    const guests = guestCount === "all" ? null : Number(guestCount);
    const price = maxPrice === "" ? null : Number(maxPrice);

    return hotels.filter((hotel) => {
      const rooms = getAvailableRooms(hotel);
      const searchable = [
        hotel.name,
        hotel.address,
        hotel.description,
        ...rooms.map((room) => room.name),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const roomMatches =
        guests === null && price === null
          ? true
          : rooms.some(
              (room) =>
                (guests === null || Number(room.capacity) >= guests) &&
                (price === null || Number(room.pricePerNight) <= price)
            );

      return (!search || searchable.includes(search)) && roomMatches;
    });
  }, [hotels, searchTerm, guestCount, maxPrice]);

  const filtersActive =
    searchTerm.trim() !== "" || guestCount !== "all" || maxPrice !== "";

  function clearFilters() {
    setSearchTerm("");
    setGuestCount("all");
    setMaxPrice("");
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-primary text-secondary">
      <Header />

      <section
        className="relative min-h-[420px] bg-cover bg-center"
        style={{ backgroundImage: "url('/bgHotel.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/75" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 text-center text-white lg:px-8">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-5 py-2 text-sm font-medium backdrop-blur-sm">
            <FaHotel /> Approved Hotels and Accommodation
          </p>
          <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
            Find Your Perfect <span className="text-orange">Hotel Stay</span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-8 text-white/90">
            Compare approved hotels, room types, guest capacities, ratings and
            nightly prices, then send your booking request online.
          </p>
        </div>
      </section>

      <section className="relative z-20 mx-auto -mt-14 max-w-7xl px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-2xl md:p-8">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
            <Field
              label="Search Hotel"
              icon={<FaSearch />}
              className="lg:col-span-2"
            >
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Hotel, address, room type or description"
                className="w-full bg-transparent outline-none"
              />
            </Field>

            <Field label="Number of Guests" icon={<FaUsers />}>
              <select
                value={guestCount}
                onChange={(event) => setGuestCount(event.target.value)}
                className="w-full bg-transparent outline-none"
              >
                <option value="all">Any Capacity</option>
                {[1, 2, 3, 4, 5].map((number) => (
                  <option key={number} value={number}>
                    {number}
                    {number === 5 ? "+" : ""} Guest
                    {number !== 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Maximum Price" icon={<FaFilter />}>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => setMaxPrice(event.target.value)}
                placeholder="Price per night"
                className="w-full bg-transparent outline-none"
              />
            </Field>
          </div>

          {filtersActive && (
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-2 font-semibold text-accent transition hover:text-orange"
              >
                <FaRedo /> Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">
              Available Hotels
            </h2>
            <p className="text-gray-600">
              Found {filteredHotels.length} approved hotel
              {filteredHotels.length === 1 ? "" : "s"}.
            </p>
          </div>

          <Link
            to="/places"
            className="inline-flex w-fit items-center gap-3 rounded-full bg-accent px-7 py-3 font-semibold text-white transition hover:bg-orange"
          >
            Explore Tourist Places <FaArrowRight />
          </Link>
        </div>

        {loading ? (
          <StatusPanel title="Loading hotels..." />
        ) : error ? (
          <StatusPanel
            title="Unable to load hotels"
            text={error}
            action={
              <button
                type="button"
                onClick={loadHotels}
                className="rounded-xl bg-accent px-5 py-3 font-semibold text-white"
              >
                Try Again
              </button>
            }
          />
        ) : filteredHotels.length === 0 ? (
          <StatusPanel
            title="No hotels found"
            text="No approved hotel matches your current filters."
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id || hotel.id} hotel={hotel} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function Field({ label, icon, children, className = "" }) {
  return (
    <div className={className}>
      <label className="mb-2 block text-sm font-semibold text-gray-600">
        {label}
      </label>
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
        <span className="shrink-0 text-orange">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function HotelCard({ hotel }) {
  const hotelId = hotel._id || hotel.id;
  const rooms = getAvailableRooms(hotel);
  const prices = rooms
    .map((room) => Number(room.pricePerNight))
    .filter(Number.isFinite);
  const capacities = rooms
    .map((room) => Number(room.capacity))
    .filter(Number.isFinite);
  const minimumPrice = prices.length ? Math.min(...prices) : 0;
  const maximumCapacity = capacities.length ? Math.max(...capacities) : 0;
  const image = resolveAssetUrl(
    hotel.images?.[0],
    "/hotel-placeholder.jpg"
  );

  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-md transition hover:-translate-y-2 hover:shadow-xl">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={hotel.name || "Hotel"}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/hotel-placeholder.jpg";
          }}
          className="h-full w-full object-cover transition duration-500 hover:scale-110"
        />

        <span className="absolute left-4 top-4 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">
          Available
        </span>
        <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-3 py-2 shadow">
          <FaStar className="text-orange" />
          {Number(hotel.rating || 0).toFixed(1)}
        </span>
      </div>

      <div className="p-6">
        <h3 className="mb-3 text-xl font-bold">
          {hotel.name || "Unnamed Hotel"}
        </h3>
        <p className="mb-4 flex items-start gap-2 text-gray-600">
          <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
          {hotel.address || "Address not available"}
        </p>

        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
          <span className="flex items-center gap-2">
            <FaBed className="text-accent" /> {rooms.length} room type
            {rooms.length === 1 ? "" : "s"}
          </span>
          <span className="flex items-center gap-2">
            <FaUsers className="text-accent" /> Up to {maximumCapacity}
          </span>
        </div>

        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs text-gray-500">Starting from</p>
            <p className="text-xl font-bold text-accent">
              {formatCurrency(minimumPrice)}
            </p>
            <p className="text-xs text-gray-400">per night</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to={`/hotels/${hotelId}`}
            className="flex items-center justify-center gap-2 rounded-xl border border-accent px-4 py-3 font-semibold text-accent transition hover:bg-accent hover:text-white"
          >
            View Details <FaArrowRight />
          </Link>
          <Link
            to={`/hotels/${hotelId}?book=1`}
            className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700"
          >
            <FaCalendarCheck /> Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}

function StatusPanel({ title, text = "", action = null }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-md">
      <h3 className="mb-2 text-2xl font-bold text-secondary">{title}</h3>
      {text && <p className="mb-5 max-w-xl text-gray-500">{text}</p>}
      {action}
    </div>
  );
}

function getAvailableRooms(hotel) {
  return Array.isArray(hotel?.roomTypes)
    ? hotel.roomTypes.filter((room) => room?.isAvailable !== false)
    : [];
}
