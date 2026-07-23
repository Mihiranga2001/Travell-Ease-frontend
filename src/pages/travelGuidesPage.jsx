import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import Header from "../components/header";
import Footer from "../components/footer";

import {
  FaArrowRight,
  FaBriefcase,
  FaFilter,
  FaGlobeAsia,
  FaLanguage,
  FaMoneyBillWave,
  FaRedo,
  FaSearch,
  FaStar,
  FaUserTie,
} from "react-icons/fa";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const API_BASE_URL = RAW_API_URL.replace(
  /\/api\/?$/,
  ""
).replace(/\/$/, "");

const TRAVEL_GUIDES_API_URL =
  `${API_BASE_URL}/api/travel-guides`;

export default function TravelGuidesPage() {
  const [guides, setGuides] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] =
    useState("all");
  const [maxPrice, setMaxPrice] = useState("");

  const [loadingGuides, setLoadingGuides] =
    useState(true);
  const [loadError, setLoadError] = useState("");

  const fetchGuides = useCallback(async (signal) => {
    try {
      setLoadingGuides(true);
      setLoadError("");

      const response = await fetch(
        TRAVEL_GUIDES_API_URL,
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
            "Failed to load travel guides"
        );
      }

      const guideList = Array.isArray(result)
        ? result
        : result?.guides ||
          result?.data ||
          result?.results ||
          [];

      /*
        The public backend route should already return only
        approved and available guides. This extra check
        protects the frontend if the backend changes.
      */
      const publicGuides = guideList.filter(
        (guide) =>
          guide &&
          guide.isApproved === true &&
          guide.isAvailable !== false
      );

      setGuides(publicGuides);
    } catch (error) {
      if (error?.name === "AbortError") {
        return;
      }

      console.error(
        "Failed to load travel guides:",
        error
      );

      setGuides([]);
      setLoadError(
        error?.message ||
          "Failed to load travel guides"
      );
    } finally {
      if (!signal?.aborted) {
        setLoadingGuides(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchGuides(controller.signal);

    return () => controller.abort();
  }, [fetchGuides]);

  const availableLanguages = useMemo(() => {
    const languageSet = new Set();

    guides.forEach((guide) => {
      getValidTextArray(guide.languages).forEach(
        (language) => {
          languageSet.add(language);
        }
      );
    });

    return Array.from(languageSet).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [guides]);

  const filteredGuides = useMemo(() => {
    const searchValue = searchTerm
      .trim()
      .toLowerCase();

    const selectedMaximumPrice =
      maxPrice.trim() === ""
        ? null
        : Number(maxPrice);

    return guides.filter((guide) => {
      const guideName = getGuideName(guide);
      const languages = getValidTextArray(
        guide.languages
      );
      const specialties = getValidTextArray(
        guide.specialties
      );

      const searchableText = [
        guideName,
        guide.experience,
        ...languages,
        ...specialties,
      ]
        .map((value) =>
          String(value || "").toLowerCase()
        )
        .join(" ");

      const matchesSearch =
        searchValue === "" ||
        searchableText.includes(searchValue);

      const matchesLanguage =
        selectedLanguage === "all" ||
        languages.some(
          (language) =>
            language.toLowerCase() ===
            selectedLanguage.toLowerCase()
        );

      const guidePrice = Number(
        guide.pricePerDay
      );

      const matchesPrice =
        selectedMaximumPrice === null ||
        (Number.isFinite(guidePrice) &&
          guidePrice <= selectedMaximumPrice);

      return (
        matchesSearch &&
        matchesLanguage &&
        matchesPrice
      );
    });
  }, [
    guides,
    searchTerm,
    selectedLanguage,
    maxPrice,
  ]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedLanguage("all");
    setMaxPrice("");
  }

  function retryLoading() {
    fetchGuides();
  }

  const filtersAreActive =
    searchTerm.trim() !== "" ||
    selectedLanguage !== "all" ||
    maxPrice.trim() !== "";

  return (
    <div className="w-full min-h-screen bg-primary text-secondary overflow-x-hidden">
      <Header />

      {/* Hero section */}
      <section
        className="relative w-full min-h-[420px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('/bgTravelGuide.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-secondary/75" />

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center text-white">
          <p className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/15 backdrop-blur-sm text-sm font-medium mb-5">
            <FaUserTie />
            Approved Local Travel Guides
          </p>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            Explore Sri Lanka with a{" "}
            <span className="text-orange">
              Local Guide
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg md:text-xl text-white/90 leading-8">
            Find approved and experienced travel guides,
            compare their languages, specialties, ratings,
            experience, and daily prices.
          </p>
        </div>
      </section>

      {/* Search and filters */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 -mt-14 relative z-20">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
            <div className="lg:col-span-2">
              <label
                htmlFor="guide-search"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Search Travel Guide
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaSearch className="text-orange shrink-0" />

                <input
                  id="guide-search"
                  type="search"
                  placeholder="Search by guide, language, experience, or specialty"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  className="w-full outline-none text-secondary bg-transparent"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="guide-language"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Preferred Language
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaLanguage className="text-orange shrink-0" />

                <select
                  id="guide-language"
                  value={selectedLanguage}
                  onChange={(event) =>
                    setSelectedLanguage(
                      event.target.value
                    )
                  }
                  className="w-full outline-none text-secondary bg-transparent"
                >
                  <option value="all">
                    Any Language
                  </option>

                  {availableLanguages.map(
                    (language) => (
                      <option
                        key={language}
                        value={language}
                      >
                        {language}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="guide-maximum-price"
                className="block text-sm font-semibold text-gray-600 mb-2"
              >
                Maximum Daily Price
              </label>

              <div className="flex items-center gap-3 border border-gray-200 rounded-xl px-4 py-4 focus-within:ring-2 focus-within:ring-accent">
                <FaFilter className="text-orange shrink-0" />

                <input
                  id="guide-maximum-price"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Price per day"
                  value={maxPrice}
                  onChange={(event) => {
                    const value =
                      event.target.value;

                    if (
                      value === "" ||
                      Number(value) >= 0
                    ) {
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

      {/* Guide list */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-3">
              Available Travel Guides
            </h2>

            <p className="text-gray-600">
              Found {filteredGuides.length} approved and
              available travel guide
              {filteredGuides.length !== 1 ? "s" : ""}.
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

        {loadingGuides ? (
          <LoadingMessage />
        ) : loadError ? (
          <ErrorMessage
            message={loadError}
            onRetry={retryLoading}
          />
        ) : filteredGuides.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredGuides.map((guide) => (
              <TravelGuideCard
                key={guide._id || guide.id}
                guide={guide}
              />
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

function TravelGuideCard({ guide }) {
  const guideId = guide._id || guide.id;

  const guideName = getGuideName(guide);
  const guideImage = getGuideImage(guide);
  const languages = getValidTextArray(
    guide.languages
  );
  const specialties = getValidTextArray(
    guide.specialties
  );

  const rating = getSafeRating(guide.rating);
  const dailyPrice = getSafePrice(
    guide.pricePerDay
  );

  return (
    <article className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-xl transition">
      <div className="relative h-64 overflow-hidden bg-gray-100">
        <img
          src={guideImage}
          alt={guideName}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;

            event.currentTarget.src =
              "/user-placeholder.jpg";
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
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-orange/10 flex items-center justify-center text-orange">
            <FaUserTie />
          </div>

          <div>
            <h3 className="text-xl font-bold text-secondary">
              {guideName}
            </h3>

            <p className="text-sm text-gray-500">
              Professional Travel Guide
            </p>
          </div>
        </div>

        <p className="text-gray-600 leading-7 mb-5 line-clamp-3">
          {guide.experience ||
            "Experience information is not available."}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <FaMoneyBillWave className="text-orange" />
              Daily Price
            </p>

            <p className="font-bold text-secondary">
              {dailyPrice === null
                ? "Not available"
                : `Rs. ${formatCurrency(
                    dailyPrice
                  )}`}
            </p>

            {dailyPrice !== null && (
              <p className="text-xs text-gray-400">
                per day
              </p>
            )}
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <p className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <FaGlobeAsia className="text-orange" />
              Languages
            </p>

            <p className="font-bold text-secondary">
              {languages.length > 0
                ? `${languages.length} language${
                    languages.length !== 1
                      ? "s"
                      : ""
                  }`
                : "Not available"}
            </p>

            {languages.length > 0 && (
              <p className="text-xs text-gray-400">
                available
              </p>
            )}
          </div>
        </div>

        {languages.length > 0 && (
          <div className="mb-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-secondary mb-2">
              <FaLanguage className="text-orange" />
              Languages
            </p>

            <div className="flex flex-wrap gap-2">
              {languages
                .slice(0, 4)
                .map((language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className="bg-blue-100 text-blue-700 rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    {language}
                  </span>
                ))}

              {languages.length > 4 && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                  +{languages.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {specialties.length > 0 && (
          <div className="mb-6">
            <p className="flex items-center gap-2 text-sm font-semibold text-secondary mb-2">
              <FaBriefcase className="text-orange" />
              Specialties
            </p>

            <div className="flex flex-wrap gap-2">
              {specialties
                .slice(0, 4)
                .map((specialty, index) => (
                  <span
                    key={`${specialty}-${index}`}
                    className="bg-orange/10 text-orange rounded-full px-3 py-1 text-xs font-semibold"
                  >
                    {specialty}
                  </span>
                ))}

              {specialties.length > 4 && (
                <span className="bg-gray-100 text-gray-600 rounded-full px-3 py-1 text-xs font-semibold">
                  +{specialties.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          {guideId ? (
            <Link
              to={`/travel-guides/${guideId}`}
              className="font-semibold text-accent hover:text-orange transition"
            >
              View Details
            </Link>
          ) : (
            <span className="font-semibold text-gray-400">
              Details unavailable
            </span>
          )}

          {guideId ? (
            <Link
              to={`/travel-guides/${guideId}`}
              className="bg-orange text-white px-5 py-2 rounded-full font-semibold hover:bg-accent transition"
            >
              Hire Guide
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="bg-gray-300 text-white px-5 py-2 rounded-full font-semibold cursor-not-allowed"
            >
              Hire Guide
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
        Loading travel guides...
      </h3>

      <p className="text-gray-600">
        Please wait while approved travel guides are
        loaded.
      </p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center bg-red-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-red-700 mb-3">
        Unable to load travel guides
      </h3>

      <p className="text-red-600 mb-6">
        {message}
      </p>

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

function EmptyMessage({
  filtersAreActive,
  onClearFilters,
}) {
  return (
    <div className="text-center bg-gray-50 rounded-3xl py-16 px-6">
      <h3 className="text-2xl font-bold text-secondary mb-3">
        No travel guides found
      </h3>

      <p className="text-gray-600 mb-6">
        {filtersAreActive
          ? "No approved and available travel guide matches your current filters."
          : "There are no approved and available travel guides at the moment."}
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

function getGuideName(guide) {
  const user = guide?.userId;

  if (user && typeof user === "object") {
    if (user.name) {
      return user.name;
    }

    const fullName = [
      user.firstName,
      user.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }

    return (
      user.username ||
      user.email ||
      "Unnamed Travel Guide"
    );
  }

  return (
    guide?.name ||
    guide?.userName ||
    "Unnamed Travel Guide"
  );
}

function getGuideImage(guide) {
  const user = guide?.userId;

  let image = "";

  if (user && typeof user === "object") {
    image =
      user.profilePicture ||
      user.profileImage ||
      user.avatar ||
      user.image ||
      "";
  }

  if (!image) {
    image =
      guide?.profilePicture ||
      guide?.profileImage ||
      guide?.avatar ||
      guide?.image ||
      "";
  }

  if (!image) {
    return "/user-placeholder.png";
  }

  const imageText = String(image)
    .trim()
    .replace(/\\/g, "/");

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

function getValidTextArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean);
}

function getSafeRating(value) {
  const rating = Number(value);

  if (!Number.isFinite(rating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, rating));
}

function getSafePrice(value) {
  const price = Number(value);

  if (!Number.isFinite(price) || price < 0) {
    return null;
  }

  return price;
}

function formatCurrency(value) {
  return Number(value).toLocaleString("en-LK", {
    maximumFractionDigits: 2,
  });
}