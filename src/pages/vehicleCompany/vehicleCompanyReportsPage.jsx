import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCalendarCheck, FaCar, FaMoneyBillWave, FaUsers } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const RAW_API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_URL = `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")}/api`;

export default function VehicleCompanyReportsPage() {
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  function auth() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in again");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  async function loadData() {
    try {
      setLoading(true);
      const [vehicleResponse, bookingResponse] = await Promise.all([
        axios.get(`${API_URL}/vehicles/company/my`, auth()),
        axios.get(`${API_URL}/vehicle-bookings/company/my`, auth()),
      ]);
      setVehicles(vehicleResponse.data?.vehicles || vehicleResponse.data?.data || []);
      setBookings(bookingResponse.data?.bookings || bookingResponse.data?.data || []);
    } catch (error) {
      console.error("Load vehicle reports error:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const report = useMemo(() => {
    const completed = bookings.filter((item) => normalizeStatus(item.status) === "completed");
    const approved = bookings.filter((item) => normalizeStatus(item.status) === "approved");
    const pending = bookings.filter((item) => normalizeStatus(item.status) === "pending");
    const completedRevenue = completed.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const expectedRevenue = approved.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);
    const passengers = bookings.reduce((sum, item) => sum + Number(item.passengers || 0), 0);

    const byVehicle = vehicles.map((vehicle) => {
      const vehicleBookings = bookings.filter((booking) => String(booking.vehicleId?._id || booking.vehicleId) === String(vehicle._id));
      const vehicleCompleted = vehicleBookings.filter((booking) => normalizeStatus(booking.status) === "completed");
      return {
        id: vehicle._id,
        model: vehicle.model,
        type: vehicle.type,
        bookings: vehicleBookings.length,
        completed: vehicleCompleted.length,
        revenue: vehicleCompleted.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0),
      };
    }).sort((a, b) => b.revenue - a.revenue);

    return { completed, approved, pending, completedRevenue, expectedRevenue, passengers, byVehicle };
  }, [vehicles, bookings]);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-3xl font-bold text-accent">Vehicle Reports</h1><p className="mt-[5px] text-gray-500">Review booking volume, vehicle usage and completed rental income.</p></div>
        <button type="button" onClick={loadData} disabled={loading} className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""}/>Refresh</button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total Vehicles" value={vehicles.length} icon={<FaCar/>} color="bg-blue-600"/>
        <Stat title="Total Bookings" value={bookings.length} icon={<FaCalendarCheck/>} color="bg-purple-600"/>
        <Stat title="Passengers" value={report.passengers} icon={<FaUsers/>} color="bg-orange"/>
        <Stat title="Completed Revenue" value={`Rs. ${money(report.completedRevenue)}`} icon={<FaMoneyBillWave/>} color="bg-green-600"/>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] lg:grid-cols-3">
        <Summary label="Pending Requests" value={report.pending.length}/><Summary label="Approved Rentals" value={report.approved.length}/><Summary label="Expected Approved Revenue" value={`Rs. ${money(report.expectedRevenue)}`}/>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="mb-[18px]"><h2 className="text-xl font-bold">Vehicle Performance</h2><p className="text-sm text-gray-500">Revenue includes bookings marked as completed.</p></div>
        {loading ? <div className="flex min-h-[220px] items-center justify-center text-gray-500">Loading report...</div> : report.byVehicle.length === 0 ? <div className="flex min-h-[220px] items-center justify-center text-gray-500">No vehicle data available.</div> : <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead><tr className="border-b text-sm text-gray-500"><th className="py-[12px]">Vehicle</th><th>Type</th><th>Total Bookings</th><th>Completed</th><th>Completed Revenue</th></tr></thead><tbody>{report.byVehicle.map((item) => <tr key={item.id} className="border-b last:border-0"><td className="py-[14px] font-semibold">{item.model || "Unnamed Vehicle"}</td><td className="capitalize">{item.type === "tuk" ? "Tuk Tuk" : item.type}</td><td>{item.bookings}</td><td>{item.completed}</td><td className="font-semibold text-green-700">Rs. {money(item.revenue)}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}

function Stat({title,value,icon,color}) { return <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md"><div><p className="text-sm text-gray-500">{title}</p><h2 className="mt-[6px] text-2xl font-bold">{value}</h2></div><div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>{icon}</div></div>; }
function Summary({label,value}) { return <div className="rounded-2xl border border-gray-200 bg-gray-50 p-[20px]"><p className="text-sm text-gray-500">{label}</p><p className="mt-[6px] text-2xl font-bold text-accent">{value}</p></div>; }
function normalizeStatus(status) { return String(status || "pending").trim().toLowerCase(); }
function money(value) { const number = Number(value); return Number.isFinite(number) ? number.toLocaleString("en-LK", {maximumFractionDigits:2}) : "0"; }
