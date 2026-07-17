import { useEffect, useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import { Link } from "react-router-dom";

import {
  FaSearch,
  FaMapMarkerAlt,
  FaHotel,
  FaCarSide,
  FaUserTie,
  FaRobot,
  FaStar,
  FaGlobeAsia,
  FaArrowRight,
  FaPlaneDeparture,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const PLACES_API = `${API_BASE_URL}/api/places`;

export default function HomePage() {
  const [places, setPlaces] = useState([]);
  const [loadingPlaces, setLoadingPlaces] = useState(true);

  useEffect(() => {
    fetchPopularPlaces();
  }, []);

  const fetchPopularPlaces = async () => {
    try {
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

      setPlaces(approvedPlaces.slice(0, 3));
    } catch (error) {
      console.error("Failed to load places:", error);
      setPlaces([]);
    } finally {
      setLoadingPlaces(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-primary text-secondary overflow-x-hidden">
      <Header />

      {/* Hero Section */}
      <section
        className="relative w-full min-h-[calc(100vh-100px)] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/bg3.jpg')" }}
      >
        <div className="absolute inset-0 bg-secondary/65"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-white">
            <p className="inline-flex items-center gap-2 mb-5 px-5 py-2 rounded-full bg-white/15 text-sm font-medium backdrop-blur-sm">
              <FaPlaneDeparture />
              Discover • Explore • Relax
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Plan Your Perfect Trip With{" "}
              <span className="text-orange">Travel Ease</span>
            </h1>

            <p className="text-lg md:text-xl text-white/90 leading-8 mb-8 max-w-xl">
              Discover tourist places, book hotels, rent vehicles, find travel
              guides, and plan your journey easily with smart AI travel
              recommendations.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/discover"
                className="px-8 py-4 rounded-full bg-orange text-white font-semibold hover:bg-white hover:text-accent transition"
              >
                Start Exploring
              </Link>

              <Link
                to="/ai-planner"
                className="px-8 py-4 rounded-full border border-white text-white font-semibold hover:bg-white hover:text-accent transition"
              >
                Try AI Planner
              </Link>
            </div>
          </div>

          {/* Search Box */}
          <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-secondary">
              Find Your Next Journey
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-2">
                  Destination
                </label>

                <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-3">
                  <FaMapMarkerAlt className="text-orange" />

                  <input
                    type="text"
                    placeholder="Where do you want to go?"
                    className="w-full outline-none text-secondary bg-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none"
                />

                <input
                  type="date"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none"
                />
              </div>

              <Link
                to="/discover"
                className="w-full flex items-center justify-center gap-3 bg-accent text-white rounded-xl py-4 font-semibold hover:bg-orange transition"
              >
                <FaSearch />
                Search Trip
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-4">
            Everything You Need for Travel
          </h2>

          <p className="max-w-2xl mx-auto text-gray-600 leading-7">
            Travel Ease helps travelers discover places, book services, and
            manage the full travel experience in one smart platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceCard
            icon={<FaGlobeAsia />}
            title="Discover Places"
            text="Explore tourist places, images, reviews, maps, and destination details."
          />

          <ServiceCard
            icon={<FaHotel />}
            title="Hotel Booking"
            text="Find suitable hotels and book rooms based on location, date, and budget."
          />

          <ServiceCard
            icon={<FaCarSide />}
            title="Vehicle Rentals"
            text="Rent cars, vans, bikes, and other vehicles for your travel journey."
          />

          <ServiceCard
            icon={<FaUserTie />}
            title="Travel Guides"
            text="Connect with trusted travel guides for safe and informative trips."
          />
        </div>
      </section>

      {/* AI Planner Section */}
      <section className="bg-gray-50 py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="w-16 h-16 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl mb-6">
              <FaRobot />
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-5">
              Smart AI Travel Planner
            </h2>

            <p className="text-gray-600 leading-8 mb-8 max-w-xl">
              Create a personalized travel plan based on your destination,
              budget, dates, hotels, vehicles, guides, and nearby attractions.
            </p>

            <Link
              to="/ai-planner"
              className="inline-flex items-center gap-3 bg-accent text-white px-7 py-4 rounded-full font-semibold hover:bg-orange transition"
            >
              Plan With AI
              <FaArrowRight />
            </Link>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-xl">
            <img
              src="/bg5.jpg"
              alt="AI travel planner"
              className="w-full h-[420px] object-cover"
            />

            <div className="absolute inset-0 bg-accent/35"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">
                AI Based Travel Experience
              </h3>

              <p className="text-white/90">
                Plan smarter journeys with personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Popular Destinations */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Popular Destinations
            </h2>

            <p className="text-gray-600">
              Places added and managed by admin.
            </p>
          </div>

          <Link
            to="/discover"
            className="w-fit bg-accent text-white px-7 py-3 rounded-full font-semibold hover:bg-orange transition"
          >
            View All Places
          </Link>
        </div>

        {loadingPlaces ? (
          <p className="text-center text-gray-600">Loading places...</p>
        ) : places.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {places.map((place) => (
              <PlaceCard key={place._id || place.id} place={place} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-3xl py-14 text-center">
            <h3 className="text-2xl font-bold mb-3">No places available</h3>
            <p className="text-gray-600">
              Admin has not added any approved places yet.
            </p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}

function ServiceCard({ icon, title, text }) {
  return (
    <div className="bg-white rounded-3xl shadow-md p-7 hover:-translate-y-2 hover:shadow-xl transition">
      <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center text-2xl mb-5">
        {icon}
      </div>

      <h3 className="text-xl font-bold text-secondary mb-3">{title}</h3>

      <p className="text-gray-600 leading-7">{text}</p>
    </div>
  );
}

function PlaceCard({ place }) {
  const title = place.title || place.name || "Untitled Place";
  const location = place.location || place.city || "Location not available";
  const rating = place.rating || "4.5";
  const image = getPlaceImage(place);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition">
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover hover:scale-110 transition duration-500"
        />

        <div className="absolute top-4 right-4 bg-white rounded-full px-3 py-2 flex items-center gap-1 shadow-md">
          <FaStar className="text-orange" />
          <span className="text-secondary font-semibold">{rating}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-secondary mb-3">{title}</h3>

        <p className="flex items-center gap-2 text-gray-600 mb-5">
          <FaMapMarkerAlt className="text-orange" />
          {location}
        </p>

        <Link
          to={`/discover/${place._id || place.id}`}
          className="font-semibold text-accent hover:text-orange transition"
        >
          View Details
        </Link>
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