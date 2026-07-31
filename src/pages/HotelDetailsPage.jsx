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
  FaBed,
  FaCalendarAlt,
  FaCheckCircle,
  FaHotel,
  FaMapMarkerAlt,
  FaPhoneAlt,
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

export default function HotelDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const bookingSectionRef = useRef(null);

  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImage, setActiveImage] = useState("");

  const [roomTypeIndex, setRoomTypeIndex] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [numberOfRooms, setNumberOfRooms] = useState("1");
  const [guests, setGuests] = useState("1");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadHotel() {
      try {
        setLoading(true);
        setError("");

        const results = await Promise.allSettled([
          api.get(`/hotels/${id}`),
          api.get(`/reviews/hotel/${id}`),
        ]);

        if (results[0].status === "rejected") {
          throw results[0].reason;
        }

        const hotelData =
          results[0].value?.data?.hotel || results[0].value?.data;

        if (!hotelData) {
          throw new Error("Hotel was not found");
        }

        if (!cancelled) {
          setHotel(hotelData);

          const availableRooms = getRoomOptions(hotelData);
          if (availableRooms.length > 0) {
            setRoomTypeIndex(String(availableRooms[0].index));
          }

          const images = getHotelImages(hotelData);
          setActiveImage(images[0] || "/hotel-placeholder.jpg");

          if (results[1].status === "fulfilled") {
            setReviews(extractList(results[1].value, ["reviews"]));
          } else {
            setReviews([]);
          }
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(getApiErrorMessage(loadError, "Failed to load hotel"));
          setHotel(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadHotel();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    if (params.get("book") === "1" && !loading && hotel) {
      window.setTimeout(() => {
        bookingSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 150);
    }
  }, [location.search, loading, hotel]);

  const roomOptions = useMemo(() => getRoomOptions(hotel), [hotel]);

  const selectedRoom = useMemo(
    () =>
      roomOptions.find((room) => String(room.index) === roomTypeIndex) ||
      null,
    [roomOptions, roomTypeIndex]
  );

  const nights = getDateDifference(checkInDate, checkOutDate);
  const selectedRoomCount = Math.max(1, Number(numberOfRooms) || 1);
  const totalPrice =
    nights * Number(selectedRoom?.pricePerNight || 0) * selectedRoomCount;
  const maximumGuests =
    Number(selectedRoom?.capacity || 0) * selectedRoomCount;
  const today = toDateInputValue();
  const hotelImages = getHotelImages(hotel);

  function handleCheckInChange(value) {
    setCheckInDate(value);

    if (!checkOutDate || getDateDifference(value, checkOutDate) === 0) {
      setCheckOutDate(addDaysToDateInput(value, 1));
    }
  }

  function handleRoomCountChange(value) {
    setNumberOfRooms(value);

    const roomCount = Math.max(1, Number(value) || 1);
    const maxGuests = Number(selectedRoom?.capacity || 0) * roomCount;

    if (Number(guests) > maxGuests && maxGuests > 0) {
      setGuests(String(maxGuests));
    }
  }

  async function submitBooking(event) {
    event.preventDefault();

    if (!getStoredToken()) {
      toast.error("Please log in before booking a hotel");
      navigate("/login", {
        state: {
          from: `${location.pathname}${location.search}`,
        },
      });
      return;
    }

    if (!selectedRoom) {
      toast.error("Please select an available room type");
      return;
    }

    const roomCount = Number(numberOfRooms);
    const guestCount = Number(guests);

    if (nights < 1) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (!Number.isInteger(roomCount) || roomCount < 1) {
      toast.error("Number of rooms must be at least 1");
      return;
    }

    if (roomCount > Number(selectedRoom.totalRooms || 1)) {
      toast.error("Requested room count exceeds the hotel inventory");
      return;
    }

    if (!Number.isInteger(guestCount) || guestCount < 1) {
      toast.error("Guest count must be at least 1");
      return;
    }

    if (guestCount > maximumGuests) {
      toast.error("Guest count exceeds the selected room capacity");
      return;
    }

    try {
      setSubmitting(true);

      await api.post(
        "/bookings",
        {
          hotelId: hotel._id,
          roomTypeIndex: selectedRoom.index,
          checkInDate,
          checkOutDate,
          numberOfRooms: roomCount,
          guests: guestCount,
          specialRequests: specialRequests.trim(),
        },
        getAuthConfig()
      );

      toast.success("Hotel booking request submitted successfully");
      navigate("/my-bookings?tab=hotels");
    } catch (bookingError) {
      toast.error(
        getApiErrorMessage(bookingError, "Failed to submit hotel booking")
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <PageMessage title="Loading hotel details..." />;
  }

  if (error || !hotel) {
    return (
      <PageMessage
        title="Hotel details unavailable"
        text={error || "Hotel was not found"}
      />
    );
  }

  return (
    <div className="min-h-screen bg-primary text-secondary">
      <Header />

      <main className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <Link
          to="/hotels"
          className="mb-7 inline-flex items-center gap-2 font-semibold text-accent transition hover:text-orange"
        >
          <FaArrowLeft /> Back to Hotels
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <section className="overflow-hidden rounded-3xl bg-white shadow-md">
              <div className="relative h-[420px] bg-gray-100">
                <img
                  src={resolveAssetUrl(activeImage, "/hotel-placeholder.jpg")}
                  alt={hotel.name || "Hotel"}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = "/hotel-placeholder.jpg";
                  }}
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-5 top-5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white">
                  Available for Booking
                </span>
                <span className="absolute right-5 top-5 flex items-center gap-2 rounded-full bg-white px-4 py-2 font-bold shadow-lg">
                  <FaStar className="text-orange" />
                  {Number(hotel.rating || 0).toFixed(1)}
                </span>
              </div>

              {hotelImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto p-4">
                  {hotelImages.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setActiveImage(image)}
                      className={`h-20 w-28 shrink-0 overflow-hidden rounded-xl border-2 ${
                        activeImage === image
                          ? "border-accent"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={resolveAssetUrl(image, "/hotel-placeholder.jpg")}
                        alt={`${hotel.name || "Hotel"} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-md">
              <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange">
                    Approved Accommodation
                  </p>
                  <h1 className="text-3xl font-bold md:text-4xl">
                    {hotel.name || "Unnamed Hotel"}
                  </h1>
                  <p className="mt-3 flex items-start gap-2 text-gray-600">
                    <FaMapMarkerAlt className="mt-1 shrink-0 text-orange" />
                    {hotel.address || "Address not available"}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 px-5 py-4 text-right">
                  <p className="text-xs text-gray-500">Guest rating</p>
                  <p className="text-2xl font-bold text-accent">
                    {Number(hotel.rating || 0).toFixed(1)} / 5
                  </p>
                  <p className="text-xs text-gray-400">
                    {hotel.reviewCount || reviews.length} review(s)
                  </p>
                </div>
              </div>

              <p className="leading-8 text-gray-600">
                {hotel.description || "Hotel description is not available."}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <InfoBox
                  icon={<FaHotel />}
                  label="Room Types"
                  value={roomOptions.length}
                />
                <InfoBox
                  icon={<FaBed />}
                  label="Total Rooms"
                  value={roomOptions.reduce(
                    (total, room) => total + Number(room.totalRooms || 1),
                    0
                  )}
                />
                <InfoBox
                  icon={<FaPhoneAlt />}
                  label="Contact"
                  value={hotel.contactNumber || "Not provided"}
                />
              </div>
            </section>

            <section className="mt-8 rounded-3xl bg-white p-7 shadow-md">
              <h2 className="mb-5 text-2xl font-bold">Available Room Types</h2>

              {roomOptions.length === 0 ? (
                <p className="rounded-2xl bg-gray-50 p-6 text-gray-500">
                  No room type is currently available.
                </p>
              ) : (
                <div className="space-y-4">
                  {roomOptions.map((room) => (
                    <button
                      type="button"
                      key={room.index}
                      onClick={() => setRoomTypeIndex(String(room.index))}
                      className={`grid w-full grid-cols-1 gap-4 rounded-2xl border p-5 text-left transition md:grid-cols-[1fr_auto] ${
                        String(room.index) === roomTypeIndex
                          ? "border-accent bg-accent/5"
                          : "border-gray-200 hover:border-accent/50"
                      }`}
                    >
                      <div>
                        <div className="mb-2 flex items-center gap-2">
                          <FaBed className="text-accent" />
                          <h3 className="text-lg font-bold">{room.name}</h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          Up to {room.capacity} guest(s) per room • {room.totalRooms || 1} room(s) in inventory
                        </p>
                      </div>
                      <div className="md:text-right">
                        <p className="text-xl font-bold text-accent">
                          {formatCurrency(room.pricePerNight)}
                        </p>
                        <p className="text-xs text-gray-500">per night</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
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
                  No traveler review has been submitted yet.
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

          <aside ref={bookingSectionRef} className="scroll-mt-28">
            <form
              onSubmit={submitBooking}
              className="sticky top-6 rounded-3xl border border-gray-100 bg-white p-6 shadow-xl"
            >
              <div className="mb-6">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.16em] text-orange">
                  Secure Booking Request
                </p>
                <h2 className="text-2xl font-bold">Book This Hotel</h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  The hotel owner will review and approve your request.
                </p>
              </div>

              <FormField label="Room Type">
                <select
                  value={roomTypeIndex}
                  onChange={(event) => setRoomTypeIndex(event.target.value)}
                  disabled={roomOptions.length === 0}
                  className="form-control"
                >
                  {roomOptions.map((room) => (
                    <option key={room.index} value={room.index}>
                      {room.name} — {formatCurrency(room.pricePerNight)}
                    </option>
                  ))}
                </select>
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Check-in">
                  <input
                    type="date"
                    min={today}
                    value={checkInDate}
                    onChange={(event) => handleCheckInChange(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
                <FormField label="Check-out">
                  <input
                    type="date"
                    min={checkInDate ? addDaysToDateInput(checkInDate, 1) : today}
                    value={checkOutDate}
                    onChange={(event) => setCheckOutDate(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Rooms">
                  <input
                    type="number"
                    min="1"
                    max={selectedRoom?.totalRooms || 1}
                    value={numberOfRooms}
                    onChange={(event) => handleRoomCountChange(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
                <FormField label="Guests">
                  <input
                    type="number"
                    min="1"
                    max={maximumGuests || 1}
                    value={guests}
                    onChange={(event) => setGuests(event.target.value)}
                    required
                    className="form-control"
                  />
                </FormField>
              </div>

              <FormField label="Special Requests">
                <textarea
                  rows="3"
                  maxLength="1000"
                  value={specialRequests}
                  onChange={(event) => setSpecialRequests(event.target.value)}
                  placeholder="Optional requests for the hotel owner"
                  className="form-control resize-none"
                />
              </FormField>

              <div className="my-6 rounded-2xl bg-gray-50 p-5">
                <PriceRow label="Room" value={selectedRoom?.name || "Not selected"} />
                <PriceRow label="Stay" value={`${nights} night(s)`} />
                <PriceRow label="Rooms" value={selectedRoomCount} />
                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
                  <span className="font-semibold">Estimated Total</span>
                  <span className="text-2xl font-bold text-accent">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !selectedRoom}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-4 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FaCalendarAlt />
                {submitting ? "Submitting..." : "Send Booking Request"}
              </button>

              <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
                <FaCheckCircle className="mt-0.5 shrink-0 text-green-600" />
                No payment is collected on this page. The owner first reviews
                your booking request.
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
      <p className="font-bold text-secondary">{value}</p>
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
      <span className="text-right font-semibold text-secondary">{value}</span>
    </div>
  );
}

function ReviewCard({ review }) {
  const traveler = review.travelerId;
  const travelerName =
    traveler?.name || traveler?.username || "Verified Traveler";

  return (
    <article className="rounded-2xl border border-gray-200 p-5">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold">{travelerName}</p>
          <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
        </div>
        <span className="flex w-fit items-center gap-1 rounded-full bg-orange/10 px-3 py-1 text-sm font-semibold text-orange">
          <FaStar /> {Number(review.rating || 0).toFixed(1)}
        </span>
      </div>
      <p className="leading-7 text-gray-600">
        {review.comment || "No written comment was provided."}
      </p>
      {review.ownerReply && (
        <div className="mt-4 rounded-xl bg-gray-50 p-4">
          <p className="mb-1 text-sm font-bold text-accent">Hotel response</p>
          <p className="text-sm leading-6 text-gray-600">{review.ownerReply}</p>
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
            to="/hotels"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white"
          >
            <FaArrowLeft /> Return to Hotels
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function getRoomOptions(hotel) {
  if (!Array.isArray(hotel?.roomTypes)) {
    return [];
  }

  return hotel.roomTypes
    .map((room, index) => ({ ...room, index }))
    .filter((room) => room.isAvailable !== false);
}

function getHotelImages(hotel) {
  if (!hotel) {
    return [];
  }

  const images = [
    ...(Array.isArray(hotel.images) ? hotel.images : []),
    ...(Array.isArray(hotel.roomTypes)
      ? hotel.roomTypes.flatMap((room) =>
          Array.isArray(room.images) ? room.images : []
        )
      : []),
  ]
    .map((image) => String(image || "").trim())
    .filter(Boolean);

  return [...new Set(images)];
}
