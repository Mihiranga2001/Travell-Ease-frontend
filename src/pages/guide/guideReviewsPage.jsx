import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCommentAlt,
  FaSearch,
  FaStar,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  API_URL,
  axios,
  extractList,
  formatDate,
  getApiErrorMessage,
  getAuthConfig,
  getTravelerName,
  safeRating,
} from "./guideApi";

export default function GuideReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");

  async function loadReviews() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my/reviews`,
        getAuthConfig()
      );
      setReviews(
        extractList(response.data, ["reviews", "data", "results"])
      );
    } catch (error) {
      setReviews([]);
      toast.error(
        getApiErrorMessage(error, "Failed to load reviews")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const filtered = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return reviews.filter((review) => {
      const matchesSearch =
        !search ||
        getTravelerName(review)
          .toLowerCase()
          .includes(search) ||
        String(review.comment || "")
          .toLowerCase()
          .includes(search);

      const matchesRating =
        ratingFilter === "all" ||
        Math.round(Number(review.rating)) ===
          Number(ratingFilter);

      return matchesSearch && matchesRating;
    });
  }, [reviews, searchText, ratingFilter]);

  const average =
    reviews.length > 0
      ? reviews.reduce(
          (total, review) =>
            total + safeRating(review.rating),
          0
        ) / reviews.length
      : 0;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Reviews
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Read ratings and feedback submitted by travelers.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          className="inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[20px] mb-[25px]">
        <Stat title="Total Reviews" value={reviews.length} icon={<FaCommentAlt />} color="bg-blue-600" />
        <Stat title="Average Rating" value={average.toFixed(1)} icon={<FaStar />} color="bg-orange" />
        <Stat title="Five-Star Reviews" value={reviews.filter((r) => Math.round(r.rating) === 5).length} icon={<FaStar />} color="bg-green-600" />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute left-[14px] top-[15px] text-gray-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search traveler or review"
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {loading ? (
        <Empty text="Loading reviews..." />
      ) : filtered.length === 0 ? (
        <Empty text="No matching reviews found." />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
          {filtered.map((review) => (
            <article
              key={review._id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]"
            >
              <div className="flex items-center justify-between gap-[12px] mb-[12px]">
                <div>
                  <h2 className="font-bold text-gray-800">
                    {getTravelerName(review)}
                  </h2>
                  <p className="text-xs text-gray-400 mt-[2px]">
                    {formatDate(review.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-[5px] bg-orange/10 text-orange rounded-full px-[11px] py-[6px] font-bold">
                  <FaStar />
                  {safeRating(review.rating).toFixed(1)}
                </div>
              </div>

              <div className="flex gap-[3px] text-orange mb-[12px]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <FaStar
                    key={index}
                    className={
                      index < Math.round(review.rating)
                        ? ""
                        : "opacity-20"
                    }
                  />
                ))}
              </div>

              <p className="text-gray-600 leading-7 whitespace-pre-wrap">
                {review.comment || "No written comment provided."}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-3xl font-bold mt-[6px]">{value}</h2>
      </div>
      <div className={`${color} w-[55px] h-[55px] rounded-full text-white text-2xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}

function Empty({ text }) {
  return (
    <div className="min-h-[300px] bg-white border border-gray-200 rounded-2xl shadow-md flex items-center justify-center text-gray-500">
      {text}
    </div>
  );
}
