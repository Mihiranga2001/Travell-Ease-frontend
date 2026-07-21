import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";

import Header from "../components/header";
import Footer from "../components/footer";

import {
  FaArrowLeft,
  FaBus,
  FaCalendarCheck,
  FaCar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaMotorcycle,
  FaTaxi,
  FaTimesCircle,
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

export default function VehicleDetailsPage() {
  const { id } = useParams();

  const [vehicle, setVehicle] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] = useState("");

  const loadVehicle = useCallback(
    async (signal) => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/vehicles/${id}`,
          {
            method: "GET",
            headers: {
              Accept:
                "application/json",
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
              "Failed to load vehicle details"
          );
        }

        setVehicle(
          result?.vehicle ||
            result?.data ||
            result
        );
      } catch (loadError) {
        if (
          loadError?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Vehicle details load error:",
          loadError
        );

        setVehicle(null);
        setError(
          loadError?.message ||
            "Failed to load vehicle details"
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id]
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadVehicle(controller.signal);

    return () =>
      controller.abort();
  }, [loadVehicle]);

  if (loading) {
    return (
      <PageLayout>
        <StatusPanel message="Loading vehicle details..." />
      </PageLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <PageLayout>
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-10 text-center shadow-md">
          <p className="mb-6 text-red-600">
            {error ||
              "Vehicle was not found"}
          </p>

          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 font-semibold text-white"
          >
            <FaArrowLeft />
            Back to Vehicles
          </Link>
        </div>
      </PageLayout>
    );
  }

  const available =
    vehicle.isAvailable !== false;

  return (
    <PageLayout>
      <div className="mx-auto max-w-6xl">
        <Link
          to="/vehicles"
          className="mb-6 inline-flex items-center gap-2 font-semibold text-accent hover:text-orange"
        >
          <FaArrowLeft />
          Back to Vehicles
        </Link>

        <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="min-h-[360px] bg-gray-100 lg:min-h-[560px]">
              {getImageUrl(
                vehicle.image
              ) ? (
                <img
                  src={getImageUrl(
                    vehicle.image
                  )}
                  alt={
                    vehicle.model ||
                    "Vehicle"
                  }
                  onError={(event) => {
                    event.currentTarget.onerror =
                      null;
                    event.currentTarget.src =
                      "/vehicle-placeholder.jpg";
                  }}
                  className="h-full min-h-[360px] w-full object-cover lg:min-h-[560px]"
                />
              ) : (
                <div className="flex h-full min-h-[360px] items-center justify-center text-8xl text-gray-400 lg:min-h-[560px]">
                  <VehicleTypeIcon
                    type={vehicle.type}
                  />
                </div>
              )}
            </div>

            <div className="p-7 md:p-10">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-orange">
                    {formatVehicleType(
                      vehicle.type
                    )}
                  </p>

                  <h1 className="text-4xl font-bold text-secondary">
                    {vehicle.model ||
                      "Unnamed vehicle"}
                  </h1>
                </div>

                <AvailabilityBadge
                  available={available}
                />
              </div>

              <p className="mb-8 flex items-start gap-3 text-gray-500">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
                {formatLocation(
                  vehicle.location
                )}
              </p>

              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <DetailBox
                  label="Vehicle Type"
                  value={formatVehicleType(
                    vehicle.type
                  )}
                  icon={
                    <VehicleTypeIcon
                      type={vehicle.type}
                    />
                  }
                />

                <DetailBox
                  label="Seats"
                  value={String(
                    vehicle.seats || 0
                  )}
                  icon={<FaUsers />}
                />

                <DetailBox
                  label="Price Per Day"
                  value={`Rs. ${formatCurrency(
                    vehicle.pricePerDay
                  )}`}
                  icon={
                    <FaMoneyBillWave />
                  }
                />
              </div>

              <div
                className={`mb-8 rounded-2xl border p-5 ${
                  available
                    ? "border-green-200 bg-green-50"
                    : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  {available ? (
                    <FaCheckCircle className="mt-1 shrink-0 text-xl text-green-600" />
                  ) : (
                    <FaTimesCircle className="mt-1 shrink-0 text-xl text-red-600" />
                  )}

                  <div>
                    <h2 className="font-bold text-gray-800">
                      {available
                        ? "Available for Rental"
                        : "Currently Unavailable"}
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-gray-600">
                      {available
                        ? "This vehicle is currently marked as available by the vehicle company."
                        : "The vehicle remains visible for reference, but it cannot be rented until the company marks it as available again."}
                    </p>
                  </div>
                </div>
              </div>

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
                className={`flex w-full items-center justify-center gap-3 rounded-xl px-6 py-4 text-lg font-bold text-white transition ${
                  available
                    ? "bg-green-600 hover:bg-green-700"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <FaCalendarCheck />

                {available
                  ? "Book This Rental Vehicle"
                  : "Vehicle Unavailable"}
              </button>
            </div>
          </div>
        </article>
      </div>
    </PageLayout>
  );
}

function PageLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-primary text-secondary">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        {children}
      </main>

      <Footer />
    </div>
  );
}

function DetailBox({
  label,
  value,
  icon,
}) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="flex items-center gap-2 text-sm text-gray-500">
        <span className="text-orange">
          {icon}
        </span>
        {label}
      </p>

      <p className="mt-2 font-bold text-gray-800">
        {value}
      </p>
    </div>
  );
}

function AvailabilityBadge({
  available,
}) {
  return (
    <span
      className={`inline-flex rounded-full px-4 py-2 text-sm font-bold text-white ${
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

function StatusPanel({ message }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center text-gray-500 shadow-md">
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
