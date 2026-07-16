import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

import {
  FaArrowRight,
  FaBed,
  FaFilter,
  FaHotel,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaRedo,
  FaSearch,
  FaStar,
  FaUsers,
} from "react-icons/fa";

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_BASE_URL = RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
const HOTELS_API_URL = `${API_BASE_URL}/api/hotels`;

export default function HotelPage() {
  const [hotels, setHotels] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [guestCount, setGuestCount] = useState("all");
  const [maxPrice, setMaxPrice] = useState("");
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchHotels = useCallback(async (signal) => {
    try {
      setLoadingHotels(true);
      setLoadError("");

      const response = await fetch(HOTELS_API_URL, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        signal,
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.message || "Failed to load hotels");
      }

      const hotelList = Array.isArray(result)
        ? result
        : result?.hotels || result?.data || [];

      // The public controller should already return only approved and
      // available hotels. This additional check protects the UI if the
      // backend response changes accidentally.
      const publicHotels = hotelList.filter(
        (hotel) =>
          hotel &&
          hotel.isApproved === true &&
          hotel.isAvailable !== false
      );

      setHotels(publicHotels);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Failed to load hotels:", error);
      setHotels([]);
      setLoadError(error?.message || "Failed to load hotels");
    } finally {
      if (!signal?.aborted) {
        setLoadingHotels(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchHotels(controller.signal);

    return () => controller.abort();
  }, [fetchHotels]);

  const filteredHotels = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();
    const selectedGuestCount =
      guestCount === "all" ? null : Number(guestCount);
    const selectedMaximumPrice =
      maxPrice.trim() === "" ? null : Number(maxPrice);

    return hotels.filter((hotel) => {
      const roomTypes = getValidRoomTypes(hotel.roomTypes);

      const searchableText = [
        hotel.name,
        hotel.address,
        hotel.description,
        hotel.contactNumber,
        ...roomTypes.map((room) => room.name),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      const matchesSearch =
        searchValue === "" || searchableText.includes(searchValue);

      /*
        Capacity and maximum price must be satisfied by the same room.
        This prevents a cheap single room and an expensive family room
        from incorrectly matching both filters together.
      */
      const matchesRoomFilters =
        selectedGuestCount === null && selectedMaximumPrice === null
          ? true
          : roomTypes.some((room) => {
              const matchesGuests =
                selectedGuestCount === null ||
                room.capacity >= selectedGuestCount;

              const matchesPrice =
                selectedMaximumPrice === null ||
                room.pricePerNight <= selectedMaximumPrice;

              return matchesGuests && matchesPrice;
            });

      return matchesSearch && matchesRoomFilters;
    });
  }, [hotels, searchTerm, guestCount, maxPrice]);

  function clearFilters() {
    setSearchTerm("");
    setGuestCount("all");
    setMaxPrice("");
  }

  function retryLoading() {
    fetchHotels();
  }

  const filtersAreActive =
    searchTerm.trim() !== "" ||
    guestCount !== "all" ||
    maxPrice.trim() !== "";

  return (
    <div className="w-full min-h-screen bg-primary text-secondary overflow-x-hidden">
      <Header />

      {/* Hero section */}
      <section
        className="relative w-full min-h-[420px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bgHotel.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/70" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center text-white">
          <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5">
            <FaHotel />
            Approved Hotels and Accommodation
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Find Your Perfect{" "}
            <span className="text-orange">Hotel Stay</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-8">
            Search approved hotels and compare room types, guest capacities,
            ratings, and prices before planning your stay.
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2">
              <label
                htmlFor="hotel-search"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Search Hotel
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaSearch className="text-orange shrink-0" />

                <input
                  id="hotel-search"
                  type="search"
                  placeholder="Search by hotel, address, room type, or description"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full outline-none text-secondary bg-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="guest-count"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Number of Guests
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaUsers className="text-orange shrink-0" />

                <select
                  id="guest-count"
                  value={guestCount}
                  onChange={(event) => setGuestCount(event.target.value)}
                  className="w-full outline-none text-secondary bg-transparent"
                >
                  <option value="all">Any Capacity</option>
                  <option value="1">1 Guest</option>
                  <option value="2">2 Guests</option>
                  <option value="3">3 Guests</option>
                  <option value="4">4 Guests</option>
                  <option value="5">5+ Guests</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="maximum-price"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Maximum Price
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaFilter className="text-orange shrink-0" />

                <input
                  id="maximum-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Price per night"
                  value={maxPrice}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value === "" || Number(value) >= 0) {
                      setMaxPrice(value);
                    }
                  }}
                  className="w-full outline-none text-secondary bg-transparent"
                />
              </div>
            </div>
          </div>

          {filtersAreActive && (
            <div className="flex justify-end mt-5">
              <button
                type="button"
                onClick={clearFilters}
                className="text-accent font-semibold hover:text-orange transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hotel list */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Available Hotels
            </h2>

            <p className="text-gray-600">
              Found {filteredHotels.length} approved and available hotel
              {filteredHotels.length !== 1 ? "s" : ""}.
            </p>
          </div>

          <Link
            to="/discover"
            className="w-fit inline-flex items-center gap-3 bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
          >
            Explore Tourist Places
            <FaArrowRight />
          </Link>
        </div>

        {loadingHotels ? (
          <LoadingMessage />
        ) : loadError ? (
          <ErrorMessage message={loadError} onRetry={retryLoading} />
        ) : filteredHotels.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id || hotel.id} hotel={hotel} />
            ))}
          </div>
        ) : (
          <EmptyMessage
            filtersAreActive={filtersAreActive}
            onClearFilters={clearFilters}
          />
        )}
      </section>

      <Footer />
    </div>
  );
}

function HotelCard({ hotel }) {
  const hotelId = hotel._id || hotel.id;
  const roomTypes = getValidRoomTypes(hotel.roomTypes);
  const minimumPrice = getMinimumRoomPrice(roomTypes);
  const maximumCapacity = getMaximumCapacity(roomTypes);
  const image = getHotelImage(hotel);
  const rating = getSafeRating(hotel.rating);

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={hotel.name || "Hotel"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/hotel-placeholder.jpg";
          }}
          className="w-full h-full object-cover hover:scale-110 transition duration-500"
        />

        <div className="absolute top-4 left-4 bg-accent text-white rounded-full px-4 py-2 text-sm font-semibold">
          Available
        </div>

        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-md">
          <FaStar className="text-orange" />
          <span className="text-secondary font-semibold">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary mb-3">
          {hotel.name || "Unnamed Hotel"}
        </h3>

        <p className="flex items-start gap-2 text-gray-600 mb-3">
          <FaMapMarkerAlt className="text-orange mt-1 shrink-0" />
          <span>{hotel.address || "Address not available"}</span>
        </p>

        {hotel.contactNumber && (
          <p className="flex items-center gap-2 text-gray-600 mb-3">
            <FaPhoneAlt className="text-orange shrink-0" />
            <span>{hotel.contactNumber}</span>
          </p>
        )}

        <p className="text-gray-600 leading-7 mb-5 line-clamp-3">
          {hotel.description || "Hotel information is not available."}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <FaBed className="text-orange" />
              Starting From
            </p>

            <p className="font-bold text-secondary">
              {minimumPrice === null
                ? "Not available"
                : `Rs. ${formatCurrency(minimumPrice)}`}
            </p>

            {minimumPrice !== null && (
              <p className="text-xs text-gray-400">per night</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <FaUsers className="text-orange" />
              Room Capacity
            </p>

            <p className="font-bold text-secondary">
              {maximumCapacity > 0
                ? `Up to ${maximumCapacity}`
                : "Not available"}
            </p>

            {maximumCapacity > 0 && (
              <p className="text-xs text-gray-400">guests</p>
            )}
          </div>
        </div>

        {roomTypes.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-secondary mb-2">
              Room Types
            </p>

            <div className="space-y-2">
              {roomTypes.slice(0, 3).map((room, index) => (
                <div
                  key={`${room.name || "room"}-${index}`}
                  className="flex items-center justify-between gap-3 bg-orange/10 rounded-xl px-3 py-2"
                >
                  <span className="text-orange text-xs font-semibold truncate">
                    {room.name || `Room ${index + 1}`}
                  </span>

                  <span className="text-xs font-semibold text-secondary whitespace-nowrap">
                    Rs. {formatCurrency(room.pricePerNight)} · {room.capacity}{" "}
                    guest{room.capacity !== 1 ? "s" : ""}
                  </span>
                </div>
              ))}

              {roomTypes.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{roomTypes.length - 3} more room type
                  {roomTypes.length - 3 !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {hotelId ? (
            <Link
              to={`/hotels/${hotelId}`}
              className="font-semibold text-accent hover:text-orange transition"
            >
              View Details
            </Link>
          ) : (
            <span className="font-semibold text-gray-400">
              Details unavailable
            </span>
          )}

          {hotelId ? (
            <Link
              to={`/hotels/${hotelId}`}
              className="bg-orange text-white px-5 py-2 rounded-full font-semibold hover:bg-accent transition"
            >
              Book Now
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="bg-gray-300 text-white px-5 py-2 rounded-full font-semibold cursor-not-allowed"
            >
              Book Now
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function LoadingMessage() {
  return (
    <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-secondary mb-3">
        Loading hotels...
      </h3>

      <p className="text-gray-600">
        Please wait while approved hotels are loaded.
      </p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center bg-red-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-red-700 mb-3">
        Unable to load hotels
      </h3>

      <p className="text-red-600 mb-6">{message}</p>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
      >
        <FaRedo />
        Try Again
      </button>
    </div>
  );
}

function EmptyMessage({ filtersAreActive, onClearFilters }) {
  return (
    <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-secondary mb-3">
        No hotels found
      </h3>

      <p className="text-gray-600 mb-6">
        {filtersAreActive
          ? "No approved and available hotel matches your current filters."
          : "There are no approved and available hotels at the moment."}
      </p>

      {filtersAreActive && (
        <button
          type="button"
          onClick={onClearFilters}
          className="bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

function getValidRoomTypes(roomTypes) {
  if (!Array.isArray(roomTypes)) {
    return [];
  }

  return roomTypes
    .map((room) => ({
      name: String(room?.name || "").trim(),
      pricePerNight: Number(room?.pricePerNight),
      capacity: Number(room?.capacity),
    }))
    .filter(
      (room) =>
        room.name !== "" &&
        Number.isFinite(room.pricePerNight) &&
        room.pricePerNight >= 0 &&
        Number.isInteger(room.capacity) &&
        room.capacity >= 1
    );
}

function getHotelImage(hotel) {
  const images = Array.isArray(hotel.images) ? hotel.images : [];

  const image =
    images.find((item) => String(item || "").trim() !== "") ||
    hotel.image ||
    hotel.imageUrl ||
    hotel.thumbnail;

  if (!image) {
    return "/hotel-placeholder.jpg";
  }

  const imageText = String(image).trim().replace(/\\/g, "/");

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:") ||
    imageText.startsWith("blob:")
  ) {
    return imageText;
  }

  if (imageText.startsWith("/uploads/")) {
    return `${API_BASE_URL}${imageText}`;
  }

  if (imageText.startsWith("uploads/")) {
    return `${API_BASE_URL}/${imageText}`;
  }

  if (imageText.startsWith("/")) {
    return imageText;
  }

  return `${API_BASE_URL}/${imageText}`;
}

function getMinimumRoomPrice(roomTypes) {
  if (roomTypes.length === 0) {
    return null;
  }

  return Math.min(...roomTypes.map((room) => room.pricePerNight));
}

function getMaximumCapacity(roomTypes) {
  if (roomTypes.length === 0) {
    return 0;
  }

  return Math.max(...roomTypes.map((room) => room.capacity));
}

function getSafeRating(value) {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
}

function formatCurrency(value) {
  return Number(value).toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  });
}