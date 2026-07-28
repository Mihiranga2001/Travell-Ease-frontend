import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaBed, FaCalendarCheck, FaHotel, FaMoneyBillWave } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  api,
  extractBookings,
  extractHotels,
  formatCurrency,
  getApiErrorMessage,
  getHotelApprovalStatus,
} from "./hotelApi";

export default function HotelOwnerReportsPage() {
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = useCallback(async () => {
    setLoading(true);
    const [hotelResult, bookingResult] = await Promise.allSettled([
      api.get("/hotels/owner/my"),
      api.get("/bookings/owner/my"),
    ]);

    if (hotelResult.status === "fulfilled") {
      setHotels(extractHotels(hotelResult.value));
    } else {
      toast.error(getApiErrorMessage(hotelResult.reason, "Failed to load hotels"));
    }

    if (bookingResult.status === "fulfilled") {
      setBookings(extractBookings(bookingResult.value));
    } else {
      toast.error(getApiErrorMessage(bookingResult.reason, "Failed to load bookings"));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const report = useMemo(() => {
    const revenueBookings = bookings.filter((booking) =>
      ["approved", "completed"].includes(booking.status)
    );
    const revenue = revenueBookings.reduce(
      (total, booking) => total + Number(booking.totalPrice || 0),
      0
    );
    const physicalRooms = hotels.reduce(
      (total, hotel) =>
        total +
        (hotel.roomTypes || []).reduce(
          (roomTotal, room) => roomTotal + Number(room.totalRooms || 1),
          0
        ),
      0
    );

    return {
      approvedHotels: hotels.filter(
        (hotel) => getHotelApprovalStatus(hotel) === "approved"
      ).length,
      physicalRooms,
      totalBookings: bookings.length,
      revenue,
      completed: bookings.filter((booking) => booking.status === "completed").length,
      cancelledOrRejected: bookings.filter((booking) =>
        ["cancelled", "rejected"].includes(booking.status)
      ).length,
    };
  }, [hotels, bookings]);

  const hotelRows = useMemo(
    () =>
      hotels.map((hotel) => {
        const hotelBookings = bookings.filter(
          (booking) =>
            String(booking.hotelId?._id || booking.hotelId) === String(hotel._id)
        );
        const revenue = hotelBookings
          .filter((booking) => ["approved", "completed"].includes(booking.status))
          .reduce((total, booking) => total + Number(booking.totalPrice || 0), 0);

        return {
          id: hotel._id,
          name: hotel.name || "Unnamed Hotel",
          status: getHotelApprovalStatus(hotel),
          bookings: hotelBookings.length,
          revenue,
          rating: Number(hotel.rating || 0),
        };
      }),
    [hotels, bookings]
  );

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Reports</h1>
          <p className="mt-[5px] text-gray-500">
            Operational summary based on your current hotel and booking records.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReports}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <ReportCard title="Approved Hotels" value={report.approvedHotels} icon={<FaHotel />} color="bg-blue-600" />
        <ReportCard title="Physical Rooms" value={report.physicalRooms} icon={<FaBed />} color="bg-purple-600" />
        <ReportCard title="Total Bookings" value={report.totalBookings} icon={<FaCalendarCheck />} color="bg-green-600" />
        <ReportCard title="Booked Revenue" value={formatCurrency(report.revenue)} icon={<FaMoneyBillWave />} color="bg-orange" />
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] md:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <p className="text-sm text-gray-500">Completed Bookings</p>
          <p className="mt-[5px] text-3xl font-bold text-gray-800">{report.completed}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <p className="text-sm text-gray-500">Rejected or Cancelled</p>
          <p className="mt-[5px] text-3xl font-bold text-gray-800">{report.cancelledOrRejected}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md">
        <div className="border-b p-[20px]">
          <h2 className="text-xl font-bold text-gray-800">Hotel Performance</h2>
          <p className="text-sm text-gray-500">Revenue includes approved and completed bookings.</p>
        </div>
        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-gray-500">Loading report...</div>
        ) : (
          <div className="overflow-x-auto p-[20px]">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="py-[10px]">Hotel</th>
                  <th className="py-[10px]">Approval</th>
                  <th className="py-[10px]">Bookings</th>
                  <th className="py-[10px]">Rating</th>
                  <th className="py-[10px]">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {hotelRows.map((row) => (
                  <tr key={row.id} className="border-b text-sm last:border-b-0">
                    <td className="py-[12px] font-semibold text-gray-800">{row.name}</td>
                    <td className="py-[12px] capitalize text-gray-600">{row.status}</td>
                    <td className="py-[12px] text-gray-600">{row.bookings}</td>
                    <td className="py-[12px] text-gray-600">{row.rating.toFixed(1)}</td>
                    <td className="py-[12px] font-semibold text-gray-800">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
                {hotelRows.length === 0 && (
                  <tr><td colSpan="5" className="py-[30px] text-center text-gray-500">No hotel data is available.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReportCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="mt-[5px] text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>{icon}</div>
    </div>
  );
}
