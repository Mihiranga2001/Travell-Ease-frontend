import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCalendarCheck,
  FaHotel,
  FaCar,
  FaUserTie,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedBooking, setSelectedBooking] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadBookings() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(
          `${API_URL}/bookings/admin/all`,
          getAuthHeader()
        );
      } catch {
        response = await axios.get(`${API_URL}/bookings`, getAuthHeader());
      }

      const bookingList = Array.isArray(response.data)
        ? response.data
        : response.data.bookings || response.data.data || [];

      setBookings(bookingList);
      setFilteredBookings(bookingList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    let result = [...bookings];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter((booking) => {
        const customerName =
          booking.user?.name ||
          booking.customerName ||
          booking.travelerName ||
          "";

        const customerEmail =
          booking.user?.email ||
          booking.customerEmail ||
          booking.travelerEmail ||
          "";

        const serviceName =
          booking.hotel?.name ||
          booking.hotelName ||
          booking.vehicle?.name ||
          booking.vehicleName ||
          booking.guide?.name ||
          booking.guideName ||
          booking.serviceName ||
          "";

        return (
          customerName.toLowerCase().includes(search) ||
          customerEmail.toLowerCase().includes(search) ||
          serviceName.toLowerCase().includes(search) ||
          booking.bookingType?.toLowerCase().includes(search) ||
          booking.status?.toLowerCase().includes(search)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (booking) =>
          booking.bookingType === typeFilter || booking.type === typeFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((booking) => {
        const status = booking.status || "pending";
        return status === statusFilter;
      });
    }

    setFilteredBookings(result);
  }, [searchText, typeFilter, statusFilter, bookings]);

  async function handleStatusChange(booking, newStatus) {
    try {
      await axios.put(
        `${API_URL}/bookings/${booking._id}`,
        {
          status: newStatus,
        },
        getAuthHeader()
      );

      toast.success("Booking status updated");
      loadBookings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update booking");
    }
  }

  async function handleDeleteBooking(booking) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this booking?"
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/bookings/${booking._id}`, getAuthHeader());

      toast.success("Booking deleted successfully");
      loadBookings();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete booking");
    }
  }

  function getBookingType(booking) {
    return booking.bookingType || booking.type || "hotel";
  }

  function getBookingIcon(type) {
    if (type === "hotel") return <FaHotel />;
    if (type === "vehicle") return <FaCar />;
    if (type === "guide") return <FaUserTie />;
    return <FaCalendarCheck />;
  }

  function getCustomerName(booking) {
    return (
      booking.user?.name ||
      booking.customerName ||
      booking.travelerName ||
      "Unknown Traveler"
    );
  }

  function getCustomerEmail(booking) {
    return (
      booking.user?.email ||
      booking.customerEmail ||
      booking.travelerEmail ||
      "No email"
    );
  }

  function getServiceName(booking) {
    return (
      booking.hotel?.name ||
      booking.hotel?.hotelName ||
      booking.hotelName ||
      booking.vehicle?.name ||
      booking.vehicle?.vehicleName ||
      booking.vehicleName ||
      booking.guide?.name ||
      booking.guideName ||
      booking.serviceName ||
      "Booking Service"
    );
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Not added";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(value) {
    return `Rs. ${Number(value || 0).toLocaleString("en-LK")}`;
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => (booking.status || "pending") === "pending"
  ).length;
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;
  const cancelledBookings = bookings.filter(
    (booking) => booking.status === "cancelled"
  ).length;

  const totalRevenue = bookings
    .filter((booking) => booking.status !== "cancelled")
    .reduce(
      (sum, booking) =>
        sum + Number(booking.totalAmount || booking.amount || booking.total || 0),
      0
    );

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Bookings Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            View and manage hotel bookings, vehicle rentals and travel guide
            bookings.
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-[20px] mb-[25px]">
        <BookingStatCard
          title="Total Bookings"
          value={totalBookings}
          icon={<FaCalendarCheck />}
          color="bg-blue-600"
        />

        <BookingStatCard
          title="Pending"
          value={pendingBookings}
          icon={<FaCalendarCheck />}
          color="bg-orange"
        />

        <BookingStatCard
          title="Confirmed"
          value={confirmedBookings}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <BookingStatCard
          title="Cancelled"
          value={cancelledBookings}
          icon={<FaTimesCircle />}
          color="bg-red-600"
        />

        <BookingStatCard
          title="Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<FaCalendarCheck />}
          color="bg-purple-600"
          smallText
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by traveler, email, service or status"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Booking Types</option>
            <option value="hotel">Hotel Bookings</option>
            <option value="vehicle">Vehicle Rentals</option>
            <option value="guide">Guide Bookings</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Bookings</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredBookings.length} booking(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading bookings...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Booking</th>
                  <th className="py-[12px]">Traveler</th>
                  <th className="py-[12px]">Service</th>
                  <th className="py-[12px]">Dates</th>
                  <th className="py-[12px]">Amount</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredBookings.map((booking) => {
                  const type = getBookingType(booking);

                  return (
                    <tr key={booking._id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[45px] h-[45px] rounded-full bg-accent text-white flex items-center justify-center text-xl">
                            {getBookingIcon(type)}
                          </div>

                          <div>
                            <p className="font-bold text-gray-800 capitalize">
                              {type} Booking
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {booking._id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <p className="font-semibold text-gray-800">
                          {getCustomerName(booking)}
                        </p>
                        <p className="text-xs text-gray-400">
                          {getCustomerEmail(booking)}
                        </p>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <p>{getServiceName(booking)}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {type}
                        </p>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <p>
                          {formatDate(
                            booking.startDate ||
                              booking.checkInDate ||
                              booking.pickupDate
                          )}
                        </p>
                        <p className="text-xs text-gray-400">
                          to{" "}
                          {formatDate(
                            booking.endDate ||
                              booking.checkOutDate ||
                              booking.returnDate
                          )}
                        </p>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {formatCurrency(
                          booking.totalAmount ||
                            booking.amount ||
                            booking.total ||
                            0
                        )}
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={booking.status || "pending"}
                          onChange={(e) =>
                            handleStatusChange(booking, e.target.value)
                          }
                          className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                            booking.status === "confirmed"
                              ? "bg-green-600"
                              : booking.status === "completed"
                              ? "bg-blue-600"
                              : booking.status === "cancelled"
                              ? "bg-red-600"
                              : "bg-orange"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            onClick={() => setSelectedBooking(booking)}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                            title="View Booking"
                          >
                            <FaEye />
                          </button>

                          <button
                            onClick={() => handleDeleteBooking(booking)}
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                            title="Delete Booking"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredBookings.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No bookings found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-[20px]">
          <div className="w-full max-w-[650px] bg-white rounded-2xl shadow-xl p-[25px]">
            <div className="flex justify-between items-center mb-[20px]">
              <div>
                <h2 className="text-2xl font-bold text-accent">
                  Booking Details
                </h2>
                <p className="text-sm text-gray-500">
                  Full details of selected booking.
                </p>
              </div>

              <button
                onClick={() => setSelectedBooking(null)}
                className="w-[35px] h-[35px] rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <DetailItem
                label="Booking ID"
                value={selectedBooking._id}
              />

              <DetailItem
                label="Booking Type"
                value={getBookingType(selectedBooking)}
              />

              <DetailItem
                label="Traveler"
                value={getCustomerName(selectedBooking)}
              />

              <DetailItem
                label="Email"
                value={getCustomerEmail(selectedBooking)}
              />

              <DetailItem
                label="Service"
                value={getServiceName(selectedBooking)}
              />

              <DetailItem
                label="Status"
                value={selectedBooking.status || "pending"}
              />

              <DetailItem
                label="Start Date"
                value={formatDate(
                  selectedBooking.startDate ||
                    selectedBooking.checkInDate ||
                    selectedBooking.pickupDate
                )}
              />

              <DetailItem
                label="End Date"
                value={formatDate(
                  selectedBooking.endDate ||
                    selectedBooking.checkOutDate ||
                    selectedBooking.returnDate
                )}
              />

              <DetailItem
                label="Travelers"
                value={
                  selectedBooking.numberOfTravelers ||
                  selectedBooking.guests ||
                  selectedBooking.passengers ||
                  1
                }
              />

              <DetailItem
                label="Total Amount"
                value={formatCurrency(
                  selectedBooking.totalAmount ||
                    selectedBooking.amount ||
                    selectedBooking.total ||
                    0
                )}
              />
            </div>

            {selectedBooking.notes && (
              <div className="mt-[15px] border border-gray-200 rounded-lg p-[12px]">
                <p className="text-sm text-gray-500 mb-[5px]">Notes</p>
                <p className="text-gray-800">{selectedBooking.notes}</p>
              </div>
            )}

            <div className="flex justify-end mt-[20px]">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookingStatCard({ title, value, icon, color, smallText }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2
          className={`font-bold text-gray-800 mt-[6px] ${
            smallText ? "text-xl" : "text-3xl"
          }`}
        >
          {value}
        </h2>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-gray-200 rounded-lg p-[12px]">
      <p className="text-sm text-gray-500 mb-[4px]">{label}</p>
      <p className="font-semibold text-gray-800 break-words">{value}</p>
    </div>
  );
}