import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FaBed,
  FaCalendarAlt,
  FaCar,
  FaCheckCircle,
  FaClock,
  FaHotel,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

import Header from "../components/header";
import Footer from "../components/footer";
import {
  api,
  extractList,
  formatCurrency,
  formatDate,
  getApiErrorMessage,
  getAuthConfig,
  getStoredToken,
  resolveAssetUrl,
} from "../utils/travelApi";

export default function TravelerBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    requestedTab === "vehicles" ? "vehicles" : "hotels"
  );

  const [hotelBookings, setHotelBookings] = useState([]);
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotelError, setHotelError] = useState("");
  const [vehicleError, setVehicleError] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);

  const loadBookings = useCallback(async () => {
    try {
      setLoading(true);
      setHotelError("");
      setVehicleError("");

      const config = getAuthConfig();
      const results = await Promise.allSettled([
        api.get("/bookings/my", config),
        api.get("/vehicle-bookings/my", config),
      ]);

      if (results[0].status === "fulfilled") {
        setHotelBookings(extractList(results[0].value, ["bookings"]));
      } else {
        setHotelBookings([]);
        setHotelError(
          getApiErrorMessage(
            results[0].reason,
            "Failed to load hotel bookings"
          )
        );
      }

      if (results[1].status === "fulfilled") {
        setVehicleBookings(extractList(results[1].value, ["bookings"]));
      } else {
        setVehicleBookings([]);
        setVehicleError(
          getApiErrorMessage(
            results[1].reason,
            "Failed to load vehicle bookings"
          )
        );
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load bookings"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (getStoredToken()) {
      loadBookings();
    }
  }, [loadBookings]);

  useEffect(() => {
    if (requestedTab === "vehicles" || requestedTab === "hotels") {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const totals = useMemo(
    () => ({
      hotel: hotelBookings.length,
      vehicle: vehicleBookings.length,
      pending:
        hotelBookings.filter((booking) => booking.status === "pending").length +
        vehicleBookings.filter((booking) => booking.status === "pending").length,
      approved:
        hotelBookings.filter((booking) => booking.status === "approved").length +
        vehicleBookings.filter((booking) => booking.status === "approved").length,
    }),
    [hotelBookings, vehicleBookings]
  );

  if (!getStoredToken()) {
    return <Navigate to="/login" replace />;
  }

  function changeTab(tab) {
    setActiveTab(tab);
    setSearchParams({ tab });
  }

  async function cancelHotelBooking(booking) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this hotel booking request?"
    );
    if (!confirmed) return;

    try {
      setUpdatingId(booking._id);
      await api.patch(
        `/bookings/${booking._id}/cancel`,
        {},
        getAuthConfig()
      );
      toast.success("Hotel booking cancelled successfully");
      await loadBookings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to cancel booking"));
    } finally {
      setUpdatingId("");
    }
  }

  async function cancelVehicleBooking(booking) {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this vehicle rental request?"
    );
    if (!confirmed) return;

    try {
      setUpdatingId(booking._id);
      await api.patch(
        `/vehicle-bookings/my/${booking._id}/cancel`,
        {},
        getAuthConfig()
      );
      toast.success("Vehicle rental cancelled successfully");
      await loadBookings();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to cancel rental"));
    } finally {
      setUpdatingId("");
    }
  }

  return (
    <div className="min-h-screen bg-primary text-secondary">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange">
              Traveler Dashboard
            </p>
            <h1 className="text-3xl font-bold md:text-4xl">My Bookings</h1>
            <p className="mt-2 text-gray-500">
              Track hotel booking requests and vehicle rental requests in one
              place.
            </p>
          </div>

          <button
            type="button"
            onClick={loadBookings}
            disabled={loading}
            className="flex w-fit items-center gap-2 rounded-xl border border-accent bg-white px-5 py-3 font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Hotel Bookings" value={totals.hotel} icon={<FaHotel />} />
          <StatCard title="Vehicle Rentals" value={totals.vehicle} icon={<FaCar />} />
          <StatCard title="Pending Requests" value={totals.pending} icon={<FaClock />} />
          <StatCard title="Approved Requests" value={totals.approved} icon={<FaCheckCircle />} />
        </div>

        <div className="mb-7 flex w-full max-w-xl rounded-2xl bg-white p-2 shadow-md">
          <TabButton
            active={activeTab === "hotels"}
            onClick={() => changeTab("hotels")}
            icon={<FaHotel />}
            label={`Hotels (${hotelBookings.length})`}
          />
          <TabButton
            active={activeTab === "vehicles"}
            onClick={() => changeTab("vehicles")}
            icon={<FaCar />}
            label={`Vehicles (${vehicleBookings.length})`}
          />
        </div>

        {activeTab === "hotels" ? (
          <BookingSection
            loading={loading}
            error={hotelError}
            emptyText="You have not submitted any hotel booking request yet."
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {hotelBookings.map((booking) => (
                <HotelBookingCard
                  key={booking._id}
                  booking={booking}
                  updating={updatingId === booking._id}
                  onCancel={() => cancelHotelBooking(booking)}
                  onReview={() =>
                    setReviewTarget({ type: "hotel", booking })
                  }
                />
              ))}
            </div>
          </BookingSection>
        ) : (
          <BookingSection
            loading={loading}
            error={vehicleError}
            emptyText="You have not submitted any vehicle rental request yet."
          >
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {vehicleBookings.map((booking) => (
                <VehicleBookingCard
                  key={booking._id}
                  booking={booking}
                  updating={updatingId === booking._id}
                  onCancel={() => cancelVehicleBooking(booking)}
                  onReview={() =>
                    setReviewTarget({ type: "vehicle", booking })
                  }
                />
              ))}
            </div>
          </BookingSection>
        )}
      </main>

      <Footer />

      {reviewTarget && (
        <ReviewModal
          target={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={async () => {
            setReviewTarget(null);
            await loadBookings();
          }}
        />
      )}
    </div>
  );
}

function HotelBookingCard({ booking, updating, onCancel, onReview }) {
  const hotel = booking.hotelId || {};
  const status = normalizeStatus(booking.status);
  const canCancel = ["pending", "approved"].includes(status);
  const canReview = ["approved", "completed"].includes(status);
  const image = resolveAssetUrl(hotel.images?.[0], "/hotel-placeholder.jpg");

  return (
    <BookingCardShell image={image} title={hotel.name || "Hotel Booking"} status={status}>
      <BookingInfo icon={<FaBed />} label="Room" value={booking.roomTypeName || getRoomName(hotel, booking.roomTypeIndex)} />
      <BookingInfo icon={<FaCalendarAlt />} label="Stay" value={`${formatDate(booking.checkInDate)} – ${formatDate(booking.checkOutDate)}`} />
      <BookingInfo icon={<FaMoneyBillWave />} label="Total" value={formatCurrency(booking.totalPrice)} />
      <BookingInfo icon={<FaUsers />} label="Guests" value={`${booking.guests || 1} guest(s), ${booking.numberOfRooms || 1} room(s)`} />

      {booking.ownerMessage && (
        <MessageBox label="Hotel message" message={booking.ownerMessage} />
      )}

      <BookingActions
        canCancel={canCancel}
        canReview={canReview}
        updating={updating}
        onCancel={onCancel}
        onReview={onReview}
      />
    </BookingCardShell>
  );
}

function VehicleBookingCard({ booking, updating, onCancel, onReview }) {
  const vehicle = booking.vehicleId || {};
  const status = normalizeStatus(booking.status);
  const canCancel = ["pending", "approved"].includes(status);
  const canReview = status === "completed";
  const image = resolveAssetUrl(vehicle.image, "/vehicle-placeholder.jpg");

  return (
    <BookingCardShell image={image} title={vehicle.model || "Vehicle Rental"} status={status}>
      <BookingInfo icon={<FaCar />} label="Vehicle" value={`${formatVehicleType(vehicle.type)} • ${vehicle.seats || 0} seats`} />
      <BookingInfo icon={<FaCalendarAlt />} label="Rental" value={`${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`} />
      <BookingInfo icon={<FaMoneyBillWave />} label="Total" value={formatCurrency(booking.totalPrice)} />
      <BookingInfo icon={<FaMapMarkerAlt />} label="Pickup" value={booking.pickupLocation || "Not specified"} />

      {booking.companyMessage && (
        <MessageBox label="Company message" message={booking.companyMessage} />
      )}

      <BookingActions
        canCancel={canCancel}
        canReview={canReview}
        updating={updating}
        onCancel={onCancel}
        onReview={onReview}
      />
    </BookingCardShell>
  );
}

function BookingCardShell({ image, title, status, children }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-md">
      <div className="grid grid-cols-1 sm:grid-cols-[170px_1fr]">
        <img
          src={image}
          alt={title}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/image-placeholder.jpg";
          }}
          className="h-52 w-full object-cover sm:h-full"
        />
        <div className="p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="text-xl font-bold">{title}</h2>
            <StatusBadge status={status} />
          </div>
          <div className="space-y-3">{children}</div>
        </div>
      </div>
    </article>
  );
}

function BookingInfo({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 text-orange">{icon}</span>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}

function MessageBox({ label, message }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4 text-sm">
      <p className="mb-1 font-bold text-accent">{label}</p>
      <p className="leading-6 text-gray-600">{message}</p>
    </div>
  );
}

function BookingActions({ canCancel, canReview, updating, onCancel, onReview }) {
  if (!canCancel && !canReview) return null;

  return (
    <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-4">
      {canCancel && (
        <button
          type="button"
          onClick={onCancel}
          disabled={updating}
          className="rounded-xl border border-red-200 px-4 py-2 font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
        >
          {updating ? "Updating..." : "Cancel Request"}
        </button>
      )}
      {canReview && (
        <button
          type="button"
          onClick={onReview}
          className="flex items-center gap-2 rounded-xl bg-orange px-4 py-2 font-semibold text-white transition hover:bg-accent"
        >
          <FaStar /> Write Review
        </button>
      )}
    </div>
  );
}

function ReviewModal({ target, onClose, onSuccess }) {
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitReview(event) {
    event.preventDefault();

    try {
      setSaving(true);
      const endpoint = target.type === "hotel" ? "/reviews" : "/vehicle-reviews";

      await api.post(
        endpoint,
        {
          bookingId: target.booking._id,
          rating: Number(rating),
          comment: comment.trim(),
        },
        getAuthConfig()
      );

      toast.success("Review submitted successfully");
      await onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to submit review"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4">
      <form
        onSubmit={submitReview}
        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange">
              Traveler Feedback
            </p>
            <h2 className="mt-1 text-2xl font-bold">Write a Review</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-gray-100 p-2 text-gray-500"
            aria-label="Close review form"
          >
            <FaTimes />
          </button>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-sm font-semibold text-gray-600">
            Rating
          </span>
          <select
            value={rating}
            onChange={(event) => setRating(event.target.value)}
            className="h-12 w-full rounded-xl border border-gray-300 px-3 outline-none focus:ring-2 focus:ring-accent"
          >
            {[5, 4, 3, 2, 1].map((value) => (
              <option key={value} value={value}>
                {value} Star{value === 1 ? "" : "s"}
              </option>
            ))}
          </select>
        </label>

        <label className="mb-6 block">
          <span className="mb-2 block text-sm font-semibold text-gray-600">
            Comment
          </span>
          <textarea
            rows="5"
            maxLength="2000"
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Share your experience"
            className="w-full resize-none rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-accent"
          />
        </label>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-accent px-5 py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </form>
    </div>
  );
}

function BookingSection({ loading, error, emptyText, children }) {
  if (loading) {
    return <PanelMessage text="Loading your bookings..." />;
  }
  if (error) {
    return <PanelMessage text={error} />;
  }

  const childCount = Array.isArray(children?.props?.children)
    ? children.props.children.length
    : children?.props?.children
      ? 1
      : 0;

  if (childCount === 0) {
    return <PanelMessage text={emptyText} />;
  }

  return children;
}

function PanelMessage({ text }) {
  return (
    <div className="flex min-h-[260px] items-center justify-center rounded-3xl bg-white p-8 text-center text-gray-500 shadow-md">
      {text}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-xl text-white">
        {icon}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
        active ? "bg-accent text-white" : "text-gray-500 hover:bg-gray-50"
      }`}
    >
      {icon} {label}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: "bg-orange/10 text-orange",
    approved: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-gray-200 text-gray-600",
  };

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
        styles[status] || "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function normalizeStatus(value) {
  return String(value || "pending").trim().toLowerCase();
}

function getRoomName(hotel, index) {
  return hotel?.roomTypes?.[Number(index)]?.name || "Room type";
}

function formatVehicleType(type) {
  const value = String(type || "").toLowerCase();
  if (value === "tuk") return "Tuk Tuk";
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : "Vehicle";
}
