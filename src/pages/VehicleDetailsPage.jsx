import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStar,
  FaUsers,
} from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";
import "./hotel-details.css";
import {
  addDaysToDateInput,
  api,
  extractList,
  formatCurrency,
  formatDate,
  getApiErrorMessage,
  getAuthConfig,
  getDateDifference,
  getStoredToken,
  resolveAssetUrl,
  toDateInputValue,
} from "../utils/travelApi";

export default function VehicleDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingRef = useRef(null);

  const [vehicle, setVehicle] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [pickupLocation, setPickupLocation] = useState("");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDetails() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get(`/vehicles/${id}`),
          api.get(`/vehicle-reviews/vehicle/${id}`),
        ]);

        if (results[0].status === "rejected") {
          throw results[0].reason;
        }

        const vehicleData =
          results[0].value?.data?.vehicle || results[0].value?.data;

        if (!vehicleData) {
          throw new Error("Vehicle was not found");
        }

        if (!cancelled) {
          setVehicle(vehicleData);
          setReviews(
            results[1].status === "fulfilled"
              ? extractList(results[1].value, ["reviews"])
              : []
          );
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Failed to load vehicle"));
          setVehicle(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("book") === "1" && !loading && vehicle) {
      window.setTimeout(() => {
        bookingRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [location.search, loading, vehicle]);

  const totalDays = getDateDifference(startDate, endDate);
  const totalPrice = totalDays * Number(vehicle?.pricePerDay || 0);
  const available = vehicle?.isAvailable !== false;
  const today = toDateInputValue();

  const companyName = useMemo(() => {
    const company = vehicle?.companyId;
    return (
      company?.companyName ||
      company?.businessName ||
      company?.name ||
      company?.email ||
      "Vehicle Rental Company"
    );
  }, [vehicle]);

  function handleStartDate(value) {
    setStartDate(value);
    if (!endDate || getDateDifference(value, endDate) === 0) {
      setEndDate(addDaysToDateInput(value, 1));
    }
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (!getStoredToken()) {
      toast.error("Please log in before hiring a vehicle");
      navigate("/login", {
        state: { from: `${location.pathname}${location.search}` },
      });
      return;
    }

    if (!available) {
      toast.error("This vehicle is currently unavailable");
      return;
    }

    const passengerCount = Number(passengers);

    if (totalDays < 1) {
      toast.error("Rental end date must be after the start date");
      return;
    }

    if (
      !Number.isInteger(passengerCount) ||
      passengerCount < 1 ||
      passengerCount > Number(vehicle.seats || 1)
    ) {
      toast.error("Passenger count exceeds the vehicle seating capacity");
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        "/vehicle-bookings",
        {
          vehicleId: vehicle._id,
          startDate,
          endDate,
          passengers: passengerCount,
          pickupLocation: pickupLocation.trim(),
          dropoffLocation: dropoffLocation.trim(),
          specialRequests: specialRequests.trim(),
        },
        getAuthConfig()
      );

      toast.success("Vehicle rental request submitted successfully");
      navigate("/my-bookings?tab=vehicles");
    } catch (bookingError) {
      toast.error(
        getApiErrorMessage(
          bookingError,
          "Failed to submit vehicle rental request"
        )
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageMessage title="Loading vehicle details..." />;
  }

  if (error || !vehicle) {
    return (
      <PageMessage
        title="Vehicle details unavailable"
        text={error || "Vehicle was not found"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-primary text-secondary">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link
          to="/vehicles"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-accent transition hover:text-orange"
        >
          <FaArrowLeft /> Back to Vehicles
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <section className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="relative h-[470px] bg-gray-100">
                <img
                  src={resolveAssetUrl(
                    vehicle.image,
                    "/vehicle-placeholder.jpg"
                  )}
                  alt={vehicle.model || "Vehicle"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/vehicle-placeholder.jpg";
                  }}
                  className="h-full w-full object-cover"
                />

                <span
                  className={`absolute left-5 top-5 rounded-full px-4 py-2 text-sm font-semibold text-white ${
                    available ? "bg-green-600" : "bg-red-600"
                  }`}
                >
                  {available ? "Available for Hire" : "Currently Unavailable"}
                </span>

                <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold shadow-lg">
                  <FaStar className="text-orange" />
                  {Number(vehicle.rating || 0).toFixed(1)}
                </span>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-md">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange">
                {formatVehicleType(vehicle.type)} Rental
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">
                {vehicle.model || "Unnamed Vehicle"}
              </h1>
              <p className="mt-3 flex items-start gap-2 text-gray-600">
                <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
                {formatLocation(vehicle.location)}
              </p>

              <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoBox
                  icon={<FaUsers />}
                  label="Passenger Seats"
                  value={vehicle.seats || 0}
                />
                <InfoBox
                  icon={<FaMoneyBillWave />}
                  label="Daily Price"
                  value={formatCurrency(vehicle.pricePerDay)}
                />
                <InfoBox
                  icon={<FaCar />}
                  label="Rental Company"
                  value={companyName}
                />
              </div>

              <div className="mt-7 rounded-2xl bg-gray-50 p-5">
                <h2 className="mb-2 text-lg font-bold">Rental Information</h2>
                <p className="leading-7 text-gray-600">
                  Select your rental dates, passenger count, pickup location and
                  drop-off location. The vehicle company will review your
                  request before confirming the rental.
                </p>
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-md">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Traveler Reviews</h2>
                <span className="rounded-full bg-orange/10 px-4 py-2 text-sm font-semibold text-orange">
                  {reviews.length} review(s)
                </span>
              </div>

              {reviews.length === 0 ? (
                <p className="rounded-2xl bg-gray-50 p-6 text-gray-500">
                  No traveler review has been submitted for this vehicle yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id || review.id} review={review} />
                  ))}
                </div>
              )}
            </section>
          </div>

          <aside ref={bookingRef} className="scroll-mt-28">
            <form
              onSubmit={submitBooking}
              className="sticky top-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl"
            >
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-orange">
                Vehicle Hire Request
              </p>
              <h2 className="text-2xl font-bold">Hire This Vehicle</h2>
              <p className="mb-6 mt-2 text-sm leading-6 text-gray-500">
                Choose your dates and send the request to {companyName}.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Start Date">
                  <input
                    type="date"
                    min={today}
                    value={startDate}
                    onChange={(event) => handleStartDate(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
                <FormField label="End Date">
                  <input
                    type="date"
                    min={startDate ? addDaysToDateInput(startDate, 1) : today}
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
              </div>

              <FormField label="Passengers">
                <input
                  type="number"
                  min="1"
                  max={vehicle.seats || 1}
                  value={passengers}
                  onChange={(event) => setPassengers(event.target.value)}
                  required
                  className="form-control"
                />
              </FormField>

              <FormField label="Pickup Location">
                <input
                  type="text"
                  value={pickupLocation}
                  onChange={(event) => setPickupLocation(event.target.value)}
                  placeholder="Where should the vehicle be collected?"
                  className="form-control"
                />
              </FormField>

              <FormField label="Drop-off Location">
                <input
                  type="text"
                  value={dropoffLocation}
                  onChange={(event) => setDropoffLocation(event.target.value)}
                  placeholder="Where will the vehicle be returned?"
                  className="form-control"
                />
              </FormField>

              <FormField label="Special Requests">
                <textarea
                  rows="3"
                  maxLength="2000"
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Optional message for the rental company"
                  className="form-control resize-none"
                />
              </FormField>

              <div className="my-6 rounded-2xl bg-gray-50 p-5">
                <PriceRow label="Vehicle" value={vehicle.model} />
                <PriceRow label="Rental Period" value={`${totalDays} day(s)`} />
                <PriceRow
                  label="Daily Price"
                  value={formatCurrency(vehicle.pricePerDay)}
                />
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-2xl font-bold text-accent">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !available}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                <FaCalendarAlt />
                {submitting
                  ? "Submitting..."
                  : available
                    ? "Send Rental Request"
                    : "Vehicle Unavailable"}
              </button>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
                <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                The company must approve your request before the rental is
                confirmed.
              </p>
            </form>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-gray-50 p-4">
      <p className="mb-1 flex items-center gap-2 text-xs text-gray-500">
        <span className="text-orange">{icon}</span> {label}
      </p>
      <p className="break-words font-bold text-secondary">{value}</p>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-sm font-semibold text-gray-600">
        {label}
      </span>
      {children}
    </label>
  );
}

function PriceRow({ label, value }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const traveler = review.travelerId;
  const name = traveler?.name || traveler?.username || "Verified Traveler";

  return (
    <article className="rounded-2xl border border-gray-200 p-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <div>
          <p className="font-bold">{name}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-orange/10 px-3 py-1 text-sm font-semibold text-orange">
          <FaStar /> {Number(review.rating || 0).toFixed(1)}
        </span>
      </div>
      <p className="leading-7 text-gray-600">
        {review.comment || "No written comment was provided."}
      </p>
      {review.companyReply && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="mb-1 text-sm font-bold text-accent">Company response</p>
          <p className="text-sm leading-6 text-gray-600">
            {review.companyReply}
          </p>
        </div>
      )}
    </article>
  );
}

function PageMessage({ title, text = "" }) {
  return (
    <div className="min-h-screen bg-primary text-secondary">
      <Header />
      <main className="mx-auto flex min-h-[520px] max-w-7xl items-center justify-center px-6 py-14">
        <div className="w-full rounded-3xl bg-white p-12 text-center shadow-md">
          <h1 className="mb-3 text-3xl font-bold">{title}</h1>
          {text && <p className="mb-6 text-gray-500">{text}</p>}
          <Link
            to="/vehicles"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white"
          >
            <FaArrowLeft /> Return to Vehicles
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function formatVehicleType(type) {
  const value = String(type || "").trim().toLowerCase();
  if (!value) return "Vehicle";
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
