import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaEye,
  FaHotel,
  FaSearch,
  FaTimesCircle,
  FaTrash,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  api,
  extractHotels,
  formatCurrency,
  getApiErrorMessage,
  getHotelApprovalStatus,
  resolveAssetUrl,
} from "../services/hotelApi";

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedHotel, setSelectedHotel] = useState(null);

  const loadHotels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/hotels/admin/all");
      setHotels(extractHotels(response));
    } catch (error) {
      setHotels([]);
      toast.error(getApiErrorMessage(error, "Failed to load hotels"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const filteredHotels = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return hotels.filter((hotel) => {
      const owner = hotel.ownerId || {};
      const searchable = [
        hotel.name,
        hotel.address,
        hotel.contactNumber,
        owner.name,
        owner.email,
        ...(hotel.roomTypes || []).map((room) => room.name),
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");
      const status = getHotelApprovalStatus(hotel);

      return (
        (!search || searchable.includes(search)) &&
        (statusFilter === "all" || status === statusFilter)
      );
    });
  }, [hotels, searchText, statusFilter]);

  async function changeStatus(hotel, status) {
    let reason = "";

    if (status === "rejected") {
      const value = window.prompt("Reason for rejecting this hotel:", "");
      if (value === null) return;
      reason = value;
    }

    if (!window.confirm(`${capitalize(status)} ${hotel.name || "this hotel"}?`)) {
      return;
    }

    try {
      setWorkingId(hotel._id);
      const endpoint = status === "approved" ? "approve" : "reject";
      await api.put(`/hotels/${hotel._id}/${endpoint}`, { reason });
      toast.success(`Hotel ${status} successfully`);
      setSelectedHotel(null);
      await loadHotels();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update hotel status"));
    } finally {
      setWorkingId("");
    }
  }

  async function deleteHotel(hotel) {
    if (!window.confirm(`Permanently delete ${hotel.name || "this hotel"}?`)) {
      return;
    }

    try {
      setWorkingId(hotel._id);
      await api.delete(`/hotels/${hotel._id}`);
      toast.success("Hotel deleted successfully");
      setSelectedHotel(null);
      await loadHotels();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete hotel"));
    } finally {
      setWorkingId("");
    }
  }

  const counts = {
    total: hotels.length,
    approved: hotels.filter((hotel) => getHotelApprovalStatus(hotel) === "approved").length,
    pending: hotels.filter((hotel) => getHotelApprovalStatus(hotel) === "pending").length,
    rejected: hotels.filter((hotel) => getHotelApprovalStatus(hotel) === "rejected").length,
  };

  return (
    <div className="min-h-screen w-full bg-white p-[25px] text-gray-800">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Hotels Management</h1>
          <p className="mt-[5px] text-gray-500">Review, approve or reject hotel-owner submissions.</p>
        </div>
        <button type="button" onClick={loadHotels} disabled={loading} className="flex w-fit items-center gap-[8px] rounded-lg border border-accent px-[18px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60">
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Total" value={counts.total} color="bg-blue-600" />
        <Stat title="Approved" value={counts.approved} color="bg-green-600" />
        <Stat title="Pending" value={counts.pending} color="bg-orange" />
        <Stat title="Rejected" value={counts.rejected} color="bg-red-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="Search hotel, owner or room" className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">All Approval Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-md">
        {loading ? (
          <div className="flex min-h-[260px] items-center justify-center text-gray-500">Loading hotels...</div>
        ) : (
          <div className="overflow-x-auto p-[20px]">
            <table className="w-full min-w-[1050px] text-left">
              <thead><tr className="border-b text-sm text-gray-500"><th className="py-[10px]">Hotel</th><th>Owner</th><th>Rooms</th><th>Starting Price</th><th>Approval</th><th>Availability</th><th className="text-center">Actions</th></tr></thead>
              <tbody>
                {filteredHotels.map((hotel) => {
                  const status = getHotelApprovalStatus(hotel);
                  const prices = (hotel.roomTypes || []).map((room) => Number(room.pricePerNight || 0));
                  const minimumPrice = prices.length ? Math.min(...prices) : 0;
                  const working = workingId === hotel._id;

                  return (
                    <tr key={hotel._id} className="border-b text-sm last:border-b-0">
                      <td className="py-[12px]"><div className="flex items-center gap-[10px]"><img src={resolveAssetUrl(hotel.images?.[0])} alt={hotel.name || "Hotel"} className="h-[48px] w-[65px] rounded-lg border object-cover" /><div><p className="font-semibold text-gray-800">{hotel.name || "Unnamed Hotel"}</p><p className="text-xs text-gray-500">{hotel.address || "No address"}</p></div></div></td>
                      <td>{hotel.ownerId?.name || hotel.ownerId?.email || "Owner"}</td>
                      <td>{hotel.roomTypes?.length || 0}</td>
                      <td>{formatCurrency(minimumPrice)}</td>
                      <td><StatusBadge status={status} /></td>
                      <td>{hotel.isAvailable === false ? "Unavailable" : "Available"}</td>
                      <td><div className="flex justify-center gap-[7px]"><IconButton title="View" onClick={() => setSelectedHotel(hotel)}><FaEye /></IconButton>{status !== "approved" && <IconButton title="Approve" disabled={working} onClick={() => changeStatus(hotel, "approved")} className="bg-green-600"><FaCheckCircle /></IconButton>}{status !== "rejected" && <IconButton title="Reject" disabled={working} onClick={() => changeStatus(hotel, "rejected")} className="bg-red-600"><FaTimesCircle /></IconButton>}<IconButton title="Delete" disabled={working} onClick={() => deleteHotel(hotel)} className="bg-gray-700"><FaTrash /></IconButton></div></td>
                    </tr>
                  );
                })}
                {filteredHotels.length === 0 && <tr><td colSpan="7" className="py-[30px] text-center text-gray-500">No hotels match the current filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedHotel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-[20px]">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-[22px] shadow-2xl">
            <div className="mb-[15px] flex justify-between gap-[10px]"><div><h2 className="text-2xl font-bold text-gray-800">{selectedHotel.name}</h2><p className="text-gray-500">{selectedHotel.description}</p></div><button type="button" onClick={() => setSelectedHotel(null)} className="text-2xl text-gray-500">×</button></div>
            <div className="space-y-[8px]">{(selectedHotel.roomTypes || []).map((room, index) => <div key={index} className="rounded-lg bg-gray-50 p-[10px] text-sm"><strong>{room.name}</strong> · {formatCurrency(room.pricePerNight)} · {room.capacity} guests · {room.totalRooms || 1} rooms</div>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, color }) {
  return <div className="flex items-center justify-between rounded-2xl border border-gray-200 p-[20px] shadow-md"><div><p className="text-sm text-gray-500">{title}</p><p className="mt-[5px] text-3xl font-bold">{value}</p></div><span className={`${color} h-[45px] w-[45px] rounded-full`} /></div>;
}

function StatusBadge({ status }) {
  const styles = { approved: "bg-green-600", pending: "bg-orange", rejected: "bg-red-600" };
  return <span className={`rounded-full px-[9px] py-[4px] text-xs font-semibold text-white ${styles[status] || styles.pending}`}>{capitalize(status)}</span>;
}

function IconButton({ children, className = "bg-accent", ...props }) {
  return <button type="button" className={`flex h-[34px] w-[34px] items-center justify-center rounded-lg text-white disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

function capitalize(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
}
