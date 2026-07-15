import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaStar,
  FaFilter,
  FaGlobeAsia,
  FaUmbrellaBeach,
  FaMountain,
  FaLandmark,
  FaTree,
  FaCity,
  FaPaw,
  FaPray,
  FaHiking,
  FaArrowRight,
  FaRedo,
} from "react-icons/fa";

const RAW_API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_BASE_URL = RAW_API_URL
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

const PLACES_API = `${API_BASE_URL}/api/places`;

const PLACE_CATEGORIES = [
  "Historical",
  "Beach",
  "Nature",
  "Religious",
  "Adventure",
  "Wildlife",
  "Mountain",
  "City",
  "Other",
];

const ALL_CATEGORIES = "All Categories";

export default function DiscoverPage() {
  const [places, setPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState(ALL_CATEGORIES);
  const [loadingPlaces, setLoadingPlaces] = useState(true);
  const [loadError, setLoadError] = useState("");

  const categories = [ALL_CATEGORIES, ...PLACE_CATEGORIES];

  async function fetchPlaces() {
    try {
      setLoadingPlaces(true);
      setLoadError("");

      const response = await fetch(PLACES_API);

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to load tourist places"
        );
      }

      const placeList = Array.isArray(result)
        ? result
        : result?.places || result?.data || [];

      /*
       * Only approved tourist places are displayed to normal users.
       * The backend schema uses:
       * approved | pending | rejected
       */
      const approvedPlaces = placeList.filter(
        (place) => place.status === "approved"
      );

      setPlaces(approvedPlaces);
    } catch (error) {
      console.error("Failed to load tourist places:", error);
      setPlaces([]);
      setLoadError(
        error.message || "Failed to load tourist places"
      );
    } finally {
      setLoadingPlaces(false);
    }
  }

  useEffect(() => {
    fetchPlaces();
  }, []);

  const filteredPlaces = useMemo(() => {
    const searchValue = searchTerm.trim().toLowerCase();

    return places.filter((place) => {
      const name = String(place.name || "").toLowerCase();
      const location = String(place.location || "").toLowerCase();
      const district = String(place.district || "").toLowerCase();
      const category = String(place.category || "").toLowerCase();
      const description = String(
        place.description || ""
      ).toLowerCase();

      const matchesSearch =
        searchValue === "" ||
        name.includes(searchValue) ||
        location.includes(searchValue) ||
        district.includes(searchValue) ||
        category.includes(searchValue) ||
        description.includes(searchValue);

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        place.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [places, searchTerm, selectedCategory]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory(ALL_CATEGORIES);
  }

  return (
    <div className="w-full min-h-screen bg-primary text-secondary overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[420px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/65" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center text-white">
          <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5">
            <FaGlobeAsia />
            Explore Beautiful Destinations
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Discover Your Next{" "}
            <span className="text-orange">Travel Place</span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-8">
            Explore approved tourist destinations, historical sites,
            beaches, nature attractions, religious places, mountains,
            wildlife locations, and city attractions.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Search Destination
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaSearch className="text-orange shrink-0" />

                <input
                  type="text"
                  placeholder="Search by name, location, district, category, or description..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full outline-none text-secondary bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Filter Category
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaFilter className="text-orange shrink-0" />

                <select
                  value={selectedCategory}
                  onChange={(event) =>
                    setSelectedCategory(event.target.value)
                  }
                  className="w-full outline-none text-secondary bg-transparent"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 mt-7">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full font-semibold transition ${
                  selectedCategory === category
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-secondary hover:bg-orange hover:text-white"
                }`}
              >
                {getCategoryIcon(category)}
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tourist Places */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Available Tourist Places
            </h2>

            <p className="text-gray-600">
              Found {filteredPlaces.length} approved place
              {filteredPlaces.length !== 1 ? "s" : ""}.
            </p>
          </div>

          <Link
            to="/ai-planner"
            className="w-fit inline-flex items-center gap-3 bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
          >
            Plan With AI
            <FaArrowRight />
          </Link>
        </div>

        {loadingPlaces ? (
          <LoadingMessage />
        ) : loadError ? (
          <ErrorMessage
            message={loadError}
            onRetry={fetchPlaces}
          />
        ) : filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <PlaceCard
                key={place._id || place.id}
                place={place}
              />
            ))}
          </div>
        ) : (
          <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
            <h3 className="text-2xl font-bold text-secondary mb-3">
              No tourist places found
            </h3>

            <p className="text-gray-600 mb-6">
              No approved tourist place matches your current search
              and category filters.
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function PlaceCard({ place }) {
  const placeId = place._id || place.id;
  const name = place.name || "Untitled Place";
  const location = place.location || "Location not available";
  const district = place.district || "";
  const category = place.category || "Other";
  const rating = place.rating ?? 4.5;
  const description =
    place.description ||
    "Explore this beautiful destination with Travel Ease.";
  const image = getPlaceImage(place);

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt={name}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/bg3.jpg";
          }}
          className="w-full h-full object-cover hover:scale-110 transition duration-500"
        />

        <div className="absolute top-4 left-4 bg-accent text-white rounded-full px-4 py-2 text-sm font-semibold">
          {category}
        </div>

        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-md">
          <FaStar className="text-orange" />
          <span className="text-secondary font-semibold">
            {Number(rating).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary mb-3">
          {name}
        </h3>

        <p className="flex items-start gap-2 text-gray-600 mb-2">
          <FaMapMarkerAlt className="text-orange mt-1 shrink-0" />
          <span>{location}</span>
        </p>

        {district && (
          <p className="text-sm text-gray-500 mb-4">
            District: {district}
          </p>
        )}

        <p className="text-gray-600 leading-7 mb-6 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between gap-3">
          {placeId ? (
            <Link
              to={`/discover/${placeId}`}
              className="font-semibold text-accent hover:text-orange transition"
            >
              View Details
            </Link>
          ) : (
            <span className="font-semibold text-gray-400">
              Details unavailable
            </span>
          )}

          <Link
            to="/hotels"
            className="bg-orange text-white px-5 py-2 rounded-full font-semibold hover:bg-accent transition"
          >
            Find Hotels
          </Link>
        </div>
      </div>
    </article>
  );
}

function LoadingMessage() {
  return (
    <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-secondary mb-3">
        Loading tourist places...
      </h3>

      <p className="text-gray-600">
        Please wait while the approved destinations are loaded.
      </p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center bg-red-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-red-700 mb-3">
        Unable to load tourist places
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

function getPlaceImage(place) {
  const image =
    place.image ||
    place.imageUrl ||
    place.photo ||
    place.thumbnail ||
    place.images?.[0];

  if (!image) {
    return "/bg3.jpg";
  }

  const imageText = String(image);

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:")
  ) {
    return imageText;
  }

  if (imageText.startsWith("/uploads")) {
    return `${API_BASE_URL}${imageText}`;
  }

  if (imageText.startsWith("/")) {
    return imageText;
  }

  return `${API_BASE_URL}/${imageText}`;
}

function getCategoryIcon(category) {
  switch (category) {
    case "Historical":
      return <FaLandmark />;

    case "Beach":
      return <FaUmbrellaBeach />;

    case "Nature":
      return <FaTree />;

    case "Religious":
      return <FaPray />;

    case "Adventure":
      return <FaHiking />;

    case "Wildlife":
      return <FaPaw />;

    case "Mountain":
      return <FaMountain />;

    case "City":
      return <FaCity />;

    default:
      return <FaGlobeAsia />;
  }
}