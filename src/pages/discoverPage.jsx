import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import { PLACE_CATEGORIES } from "../constants/placeCategories";

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
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const PLACES_API = `${API_BASE_URL}/api/places`;

export default function DiscoverPage() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  const categories = ["All Categories", ...PLACE_CATEGORIES];

  useEffect(() => {
    fetchPlaces();
  }, []);

  useEffect(() => {
    filterPlaces();
  }, [places, searchTerm, selectedCategory]);

  const fetchPlaces = async () => {
    try {
      setLoadingPlaces(true);

      const response = await fetch(PLACES_API);
      const result = await response.json();

      const placeList = Array.isArray(result)
        ? result
        : result.places || result.data || [];

      const approvedPlaces = placeList.filter(
        (place) =>
          !place.status ||
          place.status === "approved" ||
          place.isApproved === true ||
          place.approved === true
      );

      setPlaces(approvedPlaces);
    } catch (error) {
      console.error("Failed to load places:", error);
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const filterPlaces = () => {
    const filtered = places.filter((place) => {
      const name = place.name || place.title || "";
      const location = place.location || "";
      const district = place.district || "";
      const category = place.category || "";

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        district.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "All Categories" || category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    setFilteredPlaces(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All Categories");
  };

  return (
    <div className="w-full min-h-screen bg-primary text-secondary overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[420px] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/65"></div>

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
            Search and explore tourist places, beaches, historical sites,
            religious places, mountains, wildlife locations, and city
            attractions added by admin.
          </p>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Search Destination
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4">
                <FaSearch className="text-orange" />

                <input
                  type="text"
                  placeholder="Search by place, location, district, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full outline-none text-secondary bg-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-600 mb-2">
                Filter Category
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4">
                <FaFilter className="text-orange" />

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
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

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-3 mt-7">
            {categories.map((category) => (
              <button
                key={category}
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

      {/* Places Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Available Places
            </h2>

            <p className="text-gray-600">
              Found {filteredPlaces.length} place
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
          <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
            <h3 className="text-2xl font-bold text-secondary mb-3">
              Loading places...
            </h3>
            <p className="text-gray-600">
              Please wait while we load tourist places.
            </p>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPlaces.map((place) => (
              <PlaceCard key={place._id || place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
            <h3 className="text-2xl font-bold text-secondary mb-3">
              No places found
            </h3>

            <p className="text-gray-600 mb-6">
              Admin has not added places yet, or no place matches your search.
            </p>

            <button
              onClick={clearFilters}
              className="bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function PlaceCard({ place }) {
  const name = place.name || place.title || "Untitled Place";
  const location = place.location || "Location not available";
  const district = place.district || "";
  const category = place.category || "Other";
  const rating = place.rating || "4.5";
  const description =
    place.description ||
    place.shortDescription ||
    "Explore this destination with Travel Ease.";
  const image = getPlaceImage(place);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover hover:scale-110 transition duration-500"
        />

        <div className="absolute top-4 left-4 bg-accent text-white rounded-full px-4 py-2 text-sm font-semibold">
          {category}
        </div>

        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-md">
          <FaStar className="text-orange" />
          <span className="text-secondary font-semibold">{rating}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary mb-3">{name}</h3>

        <p className="flex items-center gap-2 text-gray-600 mb-2">
          <FaMapMarkerAlt className="text-orange" />
          {location}
        </p>

        {district && (
          <p className="text-sm text-gray-500 mb-4">District: {district}</p>
        )}

        <p className="text-gray-600 leading-7 mb-6 line-clamp-3">
          {description}
        </p>

        <div className="flex items-center justify-between gap-3">
          <Link
            to={`/discover/${place._id || place.id}`}
            className="font-semibold text-accent hover:text-orange transition"
          >
            View Details
          </Link>

          <Link
            to="/hotels"
            className="bg-orange text-white px-5 py-2 rounded-full font-semibold hover:bg-accent transition"
          >
            Book Now
          </Link>
        </div>
      </div>
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

  if (!image) return "/bg3.jpg";

  if (image.startsWith("http")) return image;

  if (image.startsWith("/")) {
    if (image.startsWith("/uploads")) {
      return `${API_BASE_URL}${image}`;
    }

    return image;
  }

  return `${API_BASE_URL}/${image}`;
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