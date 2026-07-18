import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCar,
  FaCheckCircle,
  FaEye,
  FaImage,
  FaSearch,
  FaTimes,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  function getAuthConfig() {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error("Please log in again");
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
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
        `${API_URL}/vehicles/admin/all`,
        getAuthConfig()
      );

      const list = Array.isArray(response.data)
        ? response.data
        : response.data?.vehicles ||
          response.data?.data ||
          response.data?.results ||
          [];

      setVehicles(list);
    } catch (error) {
      console.error("Load vehicles error:", error);
      setVehicles([]);
      toast.error(
        getErrorMessage(error, "Failed to load vehicles")
      );
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
      const company = getCompanyName(vehicle);

      const matchesSearch =
        !search ||
        String(vehicle.model || "")
          .toLowerCase()
          .includes(search) ||
        String(vehicle.type || "")
          .toLowerCase()
          .includes(search) ||
        String(company).toLowerCase().includes(search);

      const matchesType =
        typeFilter === "all" ||
        vehicle.type === typeFilter;

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" &&
          vehicle.isApproved === true) ||
        (approvalFilter === "pending" &&
          vehicle.isApproved !== true);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          vehicle.isAvailable !== false) ||
        (availabilityFilter === "unavailable" &&
          vehicle.isAvailable === false);

      return (
        matchesSearch &&
        matchesType &&
        matchesApproval &&
        matchesAvailability
      );
    });
  }, [
    vehicles,
    searchText,
    typeFilter,
    approvalFilter,
    availabilityFilter,
  ]);

  async function changeApproval(vehicle, shouldApprove) {
    const action = shouldApprove ? "approve" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        vehicle.model || "this vehicle"
      }?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(vehicle._id);

      await axios.put(
        `${API_URL}/vehicles/${vehicle._id}/${
          shouldApprove ? "approve" : "reject"
        }`,
        {},
        getAuthConfig()
      );

      toast.success(
        shouldApprove
          ? "Vehicle approved successfully"
          : "Vehicle rejected successfully"
      );

      setSelectedVehicle(null);
      await loadVehicles();
    } catch (error) {
      console.error("Approval update error:", error);
      toast.error(
        getErrorMessage(
          error,
          "Failed to update vehicle approval"
        )
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteVehicle(vehicle) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        vehicle.model || "this vehicle"
      }?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(vehicle._id);

      await axios.delete(
        `${API_URL}/vehicles/${vehicle._id}`,
        getAuthConfig()
      );

      toast.success("Vehicle deleted successfully");
      setSelectedVehicle(null);
      await loadVehicles();
    } catch (error) {
      console.error("Delete vehicle error:", error);
      toast.error(
        getErrorMessage(error, "Failed to delete vehicle")
      );
    } finally {
      setDeletingId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setTypeFilter("all");
    setApprovalFilter("all");
    setAvailabilityFilter("all");
  }

  const total = vehicles.length;
  const approved = vehicles.filter(
    (vehicle) => vehicle.isApproved === true
  ).length;
  const pending = vehicles.filter(
    (vehicle) => vehicle.isApproved !== true
  ).length;
  const available = vehicles.filter(
    (vehicle) => vehicle.isAvailable !== false
  ).length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] text-gray-800">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Vehicle Management
          </h1>

          <p className="mt-[5px] text-gray-500">
            Review vehicle-company submissions and manage approval.
          </p>
        </div>

        <button
          type="button"
          onClick={loadVehicles}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Vehicles"
          value={total}
          icon={<FaCar />}
          color="bg-blue-600"
        />
        <StatCard
          title="Approved Vehicles"
          value={approved}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />
        <StatCard
          title="Pending Vehicles"
          value={pending}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />
        <StatCard
          title="Available Vehicles"
          value={available}
          icon={<FaCar />}
          color="bg-purple-600"
        />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-4">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search model, type or company"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Types</option>
            <option value="bike">Bike</option>
            <option value="tuk">Tuk Tuk</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="bus">Bus</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(event.target.value)
            }
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Availability</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        {(searchText ||
          typeFilter !== "all" ||
          approvalFilter !== "all" ||
          availabilityFilter !== "all") && (
          <div className="mt-[15px] flex justify-end">
            <button
              type="button"
              onClick={clearFilters}
              className="font-semibold text-accent hover:text-orange"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="mb-[20px]">
          <h2 className="text-xl font-bold">
            Vehicle Submissions
          </h2>

          <p className="text-sm text-gray-500">
            Showing {filteredVehicles.length} vehicle(s)
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-[250px] items-center justify-center text-gray-500">
            Loading vehicles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-left">
              <thead>
                <tr className="border-b text-sm text-gray-500">
                  <th className="py-[12px]">Vehicle</th>
                  <th className="py-[12px]">Company</th>
                  <th className="py-[12px]">Type</th>
                  <th className="py-[12px]">Seats</th>
                  <th className="py-[12px]">Price</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">Availability</th>
                  <th className="py-[12px] text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((vehicle) => {
                  const busy =
                    updatingId === vehicle._id ||
                    deletingId === vehicle._id;

                  return (
                    <tr
                      key={vehicle._id}
                      className="border-b text-sm"
                    >
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          {getImageUrl(vehicle.image) ? (
                            <img
                              src={getImageUrl(vehicle.image)}
                              alt={vehicle.model || "Vehicle"}
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                              className="h-[48px] w-[65px] rounded-lg border object-cover"
                            />
                          ) : (
                            <div className="flex h-[48px] w-[65px] items-center justify-center rounded-lg border bg-gray-100 text-gray-400">
                              <FaImage />
                            </div>
                          )}

                          <p className="font-bold">
                            {vehicle.model || "Unnamed vehicle"}
                          </p>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {getCompanyName(vehicle)}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {formatType(vehicle.type)}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {vehicle.seats ?? 0}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        Rs.{" "}
                        {Number(
                          vehicle.pricePerDay || 0
                        ).toLocaleString("en-LK")}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {formatLocation(vehicle.location)}
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={vehicle.isApproved === true}
                          activeText="Approved"
                          inactiveText="Pending"
                        />
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={vehicle.isAvailable !== false}
                          activeText="Available"
                          inactiveText="Unavailable"
                        />
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedVehicle(vehicle)
                            }
                            disabled={busy}
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                            title="View details"
                          >
                            <FaEye />
                          </button>

                          {!vehicle.isApproved ? (
                            <button
                              type="button"
                              onClick={() =>
                                changeApproval(vehicle, true)
                              }
                              disabled={busy}
                              className="flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
                              title="Approve vehicle"
                            >
                              <FaCheckCircle />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                changeApproval(vehicle, false)
                              }
                              disabled={busy}
                              className="flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-orange text-white hover:bg-orange/80 disabled:opacity-60"
                              title="Reject vehicle"
                            >
                              <FaTimesCircle />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteVehicle(vehicle)}
                            disabled={busy}
                            className="flex h-[35px] w-[35px] items-center justify-center rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            title="Delete vehicle"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[35px] text-center text-gray-500"
                    >
                      No vehicles found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedVehicle && (
        <VehicleModal
          vehicle={selectedVehicle}
          busy={
            updatingId === selectedVehicle._id ||
            deletingId === selectedVehicle._id
          }
          onClose={() => setSelectedVehicle(null)}
          onApprove={() =>
            changeApproval(selectedVehicle, true)
          }
          onReject={() =>
            changeApproval(selectedVehicle, false)
          }
          onDelete={() => deleteVehicle(selectedVehicle)}
        />
      )}
    </div>
  );
}

function VehicleModal({
  vehicle,
  busy,
  onClose,
  onApprove,
  onReject,
  onDelete,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-[20px]">
      <div className="max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b bg-white px-[20px] py-[15px]">
          <div>
            <h2 className="text-2xl font-bold">
              {vehicle.model || "Vehicle Details"}
            </h2>
            <p className="text-sm text-gray-500">
              Review this vehicle submission.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-gray-200 hover:bg-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-[20px]">
          <div className="grid grid-cols-1 gap-[20px] md:grid-cols-2">
            {getImageUrl(vehicle.image) ? (
              <img
                src={getImageUrl(vehicle.image)}
                alt={vehicle.model || "Vehicle"}
                className="h-[280px] w-full rounded-xl border object-cover"
              />
            ) : (
              <div className="flex h-[280px] items-center justify-center rounded-xl border bg-gray-100 text-6xl text-gray-400">
                <FaImage />
              </div>
            )}

            <div className="space-y-[12px]">
              <DetailRow
                label="Company"
                value={getCompanyName(vehicle)}
              />
              <DetailRow
                label="Type"
                value={formatType(vehicle.type)}
              />
              <DetailRow
                label="Model"
                value={vehicle.model || "Not available"}
              />
              <DetailRow
                label="Seats"
                value={String(vehicle.seats ?? 0)}
              />
              <DetailRow
                label="Price Per Day"
                value={`Rs. ${Number(
                  vehicle.pricePerDay || 0
                ).toLocaleString("en-LK")}`}
              />
              <DetailRow
                label="Location"
                value={formatLocation(vehicle.location)}
              />

              <div className="flex gap-[8px]">
                <StatusBadge
                  active={vehicle.isApproved === true}
                  activeText="Approved"
                  inactiveText="Pending"
                />
                <StatusBadge
                  active={vehicle.isAvailable !== false}
                  activeText="Available"
                  inactiveText="Unavailable"
                />
              </div>
            </div>
          </div>

          <div className="mt-[25px] flex justify-end gap-[10px]">
            <button
              type="button"
              onClick={onDelete}
              disabled={busy}
              className="rounded-lg bg-red-600 px-[18px] py-[10px] font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              Delete Vehicle
            </button>

            {vehicle.isApproved ? (
              <button
                type="button"
                onClick={onReject}
                disabled={busy}
                className="rounded-lg bg-orange px-[18px] py-[10px] font-semibold text-white hover:bg-orange/80 disabled:opacity-60"
              >
                Reject Vehicle
              </button>
            ) : (
              <button
                type="button"
                onClick={onApprove}
                disabled={busy}
                className="rounded-lg bg-green-600 px-[18px] py-[10px] font-semibold text-white hover:bg-green-700 disabled:opacity-60"
              >
                Approve Vehicle
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="mt-[6px] text-3xl font-bold">
          {value}
        </h2>
      </div>

      <div
        className={`${color} flex h-[55px] w-[55px] items-center justify-center rounded-full text-2xl text-white`}
      >
        {icon}
      </div>
    </div>
  );
}

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return (
    <span
      className={`inline-flex rounded-full px-[10px] py-[5px] text-xs text-white ${
        active ? "bg-green-600" : "bg-orange"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </p>
      <p className="mt-[2px] break-words text-gray-700">
        {value}
      </p>
    </div>
  );
}

function getCompanyName(vehicle) {
  if (
    vehicle.companyId &&
    typeof vehicle.companyId === "object"
  ) {
    return (
      vehicle.companyId.companyName ||
      vehicle.companyId.name ||
      vehicle.companyId.email ||
      vehicle.companyId._id ||
      "Unknown company"
    );
  }

  return vehicle.companyId || "Unknown company";
}

function formatType(type) {
  if (!type) return "Unknown";
  if (type === "tuk") return "Tuk Tuk";

  return (
    type.charAt(0).toUpperCase() +
    type.slice(1).toLowerCase()
  );
}

function formatLocation(location) {
  const latitude = Number(location?.latitude);
  const longitude = Number(location?.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    (latitude === 0 && longitude === 0)
  ) {
    return "Not available";
  }

  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function getImageUrl(image) {
  const value = String(image || "").trim();

  if (!value) return "";

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:")
  ) {
    return value;
  }

  const backendOrigin = API_URL.replace(/\/api\/?$/, "");

  return value.startsWith("/")
    ? `${backendOrigin}${value}`
    : `${backendOrigin}/${value}`;
}