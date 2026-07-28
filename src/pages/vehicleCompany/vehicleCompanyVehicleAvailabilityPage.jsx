import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCar,
  FaCheckCircle,
  FaSearch,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { MdEventAvailable } from "react-icons/md";

const RAW_API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

const API_URL = `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")}/api`;

export default function VehicleCompanyVehicleAvailabilityPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  function getAuthConfig() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in again");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  function getErrorMessage(error, fallback) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  }

  async function loadVehicles() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/vehicles/company/my`,
        getAuthConfig()
      );
      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.vehicles || response.data?.data || [];
      setVehicles(list);
    } catch (error) {
      console.error("Load vehicle availability error:", error);
      setVehicles([]);
      toast.error(getErrorMessage(error, "Failed to load vehicles"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return vehicles.filter((vehicle) => {
      const matchesSearch =
        !search ||
        String(vehicle.model || "").toLowerCase().includes(search) ||
        String(vehicle.type || "").toLowerCase().includes(search);

      const available = vehicle.isAvailable !== false;
      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" && available) ||
        (availabilityFilter === "unavailable" && !available);

      return matchesSearch && matchesAvailability;
    });
  }, [vehicles, searchText, availabilityFilter]);

  async function changeAvailability(vehicle, isAvailable) {
    const action = isAvailable ? "make available" : "make unavailable";
    if (!window.confirm(`Are you sure you want to ${action} ${vehicle.model}?`)) {
      return;
    }

    try {
      setUpdatingId(vehicle._id);
      const response = await axios.patch(
        `${API_URL}/vehicles/company/${vehicle._id}/availability`,
        { isAvailable },
        getAuthConfig()
      );

      const updatedVehicle = response.data?.vehicle;
      setVehicles((previous) =>
        previous.map((item) =>
          item._id === vehicle._id
            ? updatedVehicle || { ...item, isAvailable }
            : item
        )
      );
      toast.success("Vehicle availability updated");
    } catch (error) {
      console.error("Update availability error:", error);
      toast.error(getErrorMessage(error, "Failed to update availability"));
    } finally {
      setUpdatingId("");
    }
  }

  const total = vehicles.length;
  const available = vehicles.filter((item) => item.isAvailable !== false).length;
  const unavailable = total - available;
  const approved = vehicles.filter(
    (item) => item.approvalStatus === "approved" || item.isApproved === true
  ).length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Vehicle Availability</h1>
          <p className="mt-[5px] text-gray-500">
            Control which approved vehicles are currently available for rental.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVehicles}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Vehicles" value={total} icon={<FaCar />} color="bg-blue-600" />
        <StatCard title="Approved" value={approved} icon={<FaCheckCircle />} color="bg-green-600" />
        <StatCard title="Available" value={available} icon={<MdEventAvailable />} color="bg-purple-600" />
        <StatCard title="Unavailable" value={unavailable} icon={<FaTimesCircle />} color="bg-red-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search model or vehicle type"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={availabilityFilter}
            onChange={(event) => setAvailabilityFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        {loading ? (
          <div className="flex min-h-[240px] items-center justify-center text-gray-500">
            Loading vehicles...
          </div>
        ) : filteredVehicles.length === 0 ? (
          <div className="flex min-h-[240px] items-center justify-center text-gray-500">
            No matching vehicles found.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-[16px] xl:grid-cols-2">
            {filteredVehicles.map((vehicle) => {
              const isAvailable = vehicle.isAvailable !== false;
              const isApproved =
                vehicle.approvalStatus === "approved" || vehicle.isApproved === true;
              const updating = updatingId === vehicle._id;

              return (
                <div
                  key={vehicle._id}
                  className="flex flex-col gap-[15px] rounded-xl border border-gray-200 p-[16px] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-center gap-[14px]">
                    <img
                      src={getImageUrl(vehicle.image)}
                      alt={vehicle.model || "Vehicle"}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = "/vehicle-placeholder.jpg";
                      }}
                      className="h-[78px] w-[105px] rounded-xl bg-gray-100 object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="truncate text-lg font-bold text-gray-800">
                        {vehicle.model || "Unnamed Vehicle"}
                      </h3>
                      <p className="text-sm capitalize text-gray-500">
                        {vehicle.type === "tuk" ? "Tuk Tuk" : vehicle.type}
                      </p>
                      <div className="mt-[7px] flex flex-wrap gap-[7px]">
                        <Badge
                          label={isApproved ? "Approved" : "Not Approved"}
                          className={
                            isApproved
                              ? "bg-green-100 text-green-700"
                              : "bg-orange/10 text-orange"
                          }
                        />
                        <Badge
                          label={isAvailable ? "Available" : "Unavailable"}
                          className={
                            isAvailable
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeAvailability(vehicle, !isAvailable)}
                    disabled={updating}
                    className={`rounded-lg px-[16px] py-[10px] font-semibold text-white transition disabled:opacity-60 ${
                      isAvailable
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {updating
                      ? "Updating..."
                      : isAvailable
                        ? "Make Unavailable"
                        : "Make Available"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-[6px] text-3xl font-bold text-gray-800">{value}</h2>
      </div>
      <div className={`${color} flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white`}>
        {icon}
      </div>
    </div>
  );
}

function Badge({ label, className }) {
  return <span className={`rounded-full px-[10px] py-[4px] text-xs font-semibold ${className}`}>{label}</span>;
}

function getImageUrl(image) {
  const value = String(image || "").trim().replace(/\\/g, "/");
  if (!value) return "/vehicle-placeholder.jpg";
  if (/^(https?:|data:|blob:)/.test(value)) return value;
  const backendOrigin = API_URL.replace(/\/api\/?$/, "");
  return value.startsWith("/") ? `${backendOrigin}${value}` : `${backendOrigin}/${value}`;
}
