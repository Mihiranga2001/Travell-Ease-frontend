import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCar, FaReply, FaSearch, FaStar, FaUser } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const RAW_API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_URL = `${RAW_API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "")}/api`;

export default function VehicleCompanyReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [searchText, setSearchText] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyDrafts, setReplyDrafts] = useState({});

  function auth() {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Please log in again");
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  function errorMessage(error, fallback) {
    return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
  }

  async function loadReviews() {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/vehicle-reviews/company/my`, auth());
      const list = Array.isArray(response.data) ? response.data : response.data?.reviews || response.data?.data || [];
      setReviews(list);
      setReplyDrafts(Object.fromEntries(list.map((review) => [review._id, review.companyReply || ""])));
    } catch (error) {
      console.error("Load vehicle reviews error:", error);
      setReviews([]);
      toast.error(errorMessage(error, "Failed to load reviews"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadReviews(); }, []);

  const filtered = useMemo(() => {
    const search = searchText.trim().toLowerCase();
    return reviews.filter((review) => {
      const vehicle = review.vehicleId?.model || "";
      const traveler = review.travelerId?.name || review.travelerId?.email || "";
      const matchesSearch = !search || vehicle.toLowerCase().includes(search) || traveler.toLowerCase().includes(search) || String(review.comment || "").toLowerCase().includes(search);
      const matchesRating = ratingFilter === "all" || Number(review.rating) === Number(ratingFilter);
      return matchesSearch && matchesRating;
    });
  }, [reviews, searchText, ratingFilter]);

  async function saveReply(review) {
    try {
      setSavingId(review._id);
      const companyReply = String(replyDrafts[review._id] || "").trim();
      const response = await axios.patch(`${API_URL}/vehicle-reviews/company/${review._id}/reply`, { companyReply }, auth());
      const updated = response.data?.review;
      setReviews((previous) => previous.map((item) => item._id === review._id ? updated || { ...item, companyReply } : item));
      toast.success("Review reply saved");
    } catch (error) {
      console.error("Save review reply error:", error);
      toast.error(errorMessage(error, "Failed to save reply"));
    } finally {
      setSavingId("");
    }
  }

  const total = reviews.length;
  const average = total ? reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / total : 0;
  const replied = reviews.filter((item) => String(item.companyReply || "").trim()).length;

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div><h1 className="text-3xl font-bold text-accent">Customer Reviews</h1><p className="mt-[5px] text-gray-500">Read customer feedback and publish a company reply.</p></div>
        <button type="button" onClick={loadReviews} disabled={loading} className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent transition hover:bg-accent hover:text-white disabled:opacity-60"><FiRefreshCw className={loading ? "animate-spin" : ""}/>Refresh</button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-3">
        <Stat title="Total Reviews" value={total} icon={<FaStar />} color="bg-blue-600" />
        <Stat title="Average Rating" value={average.toFixed(1)} icon={<FaStar />} color="bg-orange" />
        <Stat title="Replies Sent" value={replied} icon={<FaReply />} color="bg-green-600" />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative"><FaSearch className="absolute left-[15px] top-[15px] text-gray-400"/><input value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search customer, vehicle or comment" className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"/></div>
          <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"><option value="all">All Ratings</option>{[5,4,3,2,1].map((value) => <option key={value} value={value}>{value} Stars</option>)}</select>
        </div>
      </div>

      <div className="space-y-[15px]">
        {loading ? <div className="flex min-h-[260px] items-center justify-center rounded-2xl border bg-white text-gray-500">Loading reviews...</div> : filtered.length === 0 ? <div className="flex min-h-[260px] items-center justify-center rounded-2xl border bg-white text-gray-500">No matching reviews found.</div> : filtered.map((review) => (
          <article key={review._id} className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
            <div className="flex flex-col gap-[15px] lg:flex-row lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="mb-[10px] flex flex-wrap items-center gap-[12px]"><span className="flex items-center gap-[6px] font-semibold"><FaUser className="text-accent"/>{review.travelerId?.name || review.travelerId?.email || "Customer"}</span><span className="flex items-center gap-[6px] text-gray-600"><FaCar className="text-accent"/>{review.vehicleId?.model || "Vehicle"}</span><span className="flex items-center gap-[2px] text-orange">{Array.from({length:5}, (_,index) => <FaStar key={index} className={index < Number(review.rating) ? "" : "opacity-20"}/>)}</span></div>
                <p className="leading-7 text-gray-700">{review.comment || "No written comment was provided."}</p>
                <p className="mt-[8px] text-xs text-gray-400">{formatDate(review.createdAt)}</p>
              </div>
              <div className="w-full lg:max-w-[420px]"><label className="mb-[6px] block text-sm font-semibold text-gray-600">Company Reply</label><textarea rows="3" maxLength="2000" value={replyDrafts[review._id] ?? ""} onChange={(e) => setReplyDrafts((previous) => ({...previous, [review._id]: e.target.value}))} className="w-full rounded-lg border border-gray-300 p-[10px] focus:outline-none focus:ring-2 focus:ring-accent" placeholder="Write a professional response..."/><button type="button" onClick={() => saveReply(review)} disabled={savingId === review._id} className="mt-[8px] flex items-center gap-[7px] rounded-lg bg-accent px-[14px] py-[9px] font-semibold text-white disabled:opacity-50"><FaReply/>{savingId === review._id ? "Saving..." : "Save Reply"}</button></div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({ title, value, icon, color }) { return <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md"><div><p className="text-sm text-gray-500">{title}</p><h2 className="mt-[5px] text-3xl font-bold">{value}</h2></div><div className={`${color} flex h-[52px] w-[52px] items-center justify-center rounded-full text-xl text-white`}>{icon}</div></div>; }
function formatDate(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("en-LK", {year:"numeric", month:"short", day:"numeric"}); }
