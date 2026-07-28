import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FaHotel, FaReply, FaSearch, FaStar } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  api,
  extractReviews,
  formatDate,
  getApiErrorMessage,
} from "./hotelApi";

export default function HotelOwnerReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [replyingId, setReplyingId] = useState("");

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/reviews/owner/my");
      setReviews(extractReviews(response));
    } catch (error) {
      setReviews([]);
      toast.error(getApiErrorMessage(error, "Failed to load hotel reviews"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const filteredReviews = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return reviews.filter((review) => {
      const searchable = [
        review.hotelId?.name,
        review.travelerId?.name,
        review.travelerId?.email,
        review.comment,
        review.ownerReply,
      ]
        .map((value) => String(value || "").toLowerCase())
        .join(" ");

      return (
        (!search || searchable.includes(search)) &&
        (ratingFilter === "all" || Number(review.rating) === Number(ratingFilter))
      );
    });
  }, [reviews, searchText, ratingFilter]);

  const averageRating = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) /
      reviews.length
    : 0;

  async function replyToReview(review) {
    const ownerReply = window.prompt(
      "Enter your public reply to this review:",
      review.ownerReply || ""
    );

    if (ownerReply === null) {
      return;
    }

    try {
      setReplyingId(review._id);
      const response = await api.patch(`/reviews/owner/${review._id}/reply`, {
        ownerReply,
      });
      const updated = response.data?.review;
      setReviews((previous) =>
        previous.map((item) =>
          item._id === review._id
            ? updated || { ...item, ownerReply }
            : item
        )
      );
      toast.success("Review reply saved");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save reply"));
    } finally {
      setReplyingId("");
    }
  }

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px] flex flex-col gap-[15px] lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-accent">Reviews</h1>
          <p className="mt-[5px] text-gray-500">
            Read traveler feedback and publish hotel-owner replies.
          </p>
        </div>
        <button
          type="button"
          onClick={loadReviews}
          disabled={loading}
          className="flex w-fit items-center gap-[8px] rounded-lg border border-accent bg-white px-[18px] py-[10px] font-semibold text-accent hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-[25px] grid grid-cols-1 gap-[20px] sm:grid-cols-3">
        <StatCard title="Total Reviews" value={reviews.length} />
        <StatCard title="Average Rating" value={averageRating.toFixed(1)} />
        <StatCard
          title="Unanswered"
          value={reviews.filter((review) => !review.ownerReply).length}
        />
      </div>

      <div className="mb-[25px] rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
        <div className="grid grid-cols-1 gap-[15px] md:grid-cols-2">
          <div className="relative">
            <FaSearch className="absolute left-[15px] top-[15px] text-gray-400" />
            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Search hotel, traveler or review"
              className="h-[45px] w-full rounded-lg border border-gray-300 pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <select
            value={ratingFilter}
            onChange={(event) => setRatingFilter(event.target.value)}
            className="h-[45px] rounded-lg border border-gray-300 px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Ratings</option>
            {[5, 4, 3, 2, 1].map((rating) => (
              <option key={rating} value={rating}>
                {rating} Star{rating !== 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <MessagePanel message="Loading reviews..." />
      ) : filteredReviews.length === 0 ? (
        <MessagePanel message="No reviews match the current filters." />
      ) : (
        <div className="space-y-[15px]">
          {filteredReviews.map((review) => (
            <article
              key={review._id}
              className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md"
            >
              <div className="flex flex-col gap-[15px] lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-[8px] flex flex-wrap items-center gap-[10px]">
                    <h2 className="font-bold text-gray-800">
                      {review.hotelId?.name || "Hotel"}
                    </h2>
                    <StarRating rating={review.rating} />
                  </div>
                  <p className="text-sm text-gray-500">
                    By {review.travelerId?.name || review.travelerId?.email || "Traveler"} · {formatDate(review.createdAt)}
                  </p>
                  <p className="mt-[12px] leading-7 text-gray-700">
                    {review.comment || "No written comment was provided."}
                  </p>
                  {review.ownerReply && (
                    <div className="mt-[12px] rounded-xl border-l-4 border-accent bg-accent/5 p-[12px]">
                      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                        Hotel Owner Reply
                      </p>
                      <p className="mt-[5px] text-sm text-gray-700">
                        {review.ownerReply}
                      </p>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  disabled={replyingId === review._id}
                  onClick={() => replyToReview(review)}
                  className="flex shrink-0 items-center gap-[7px] rounded-lg bg-accent px-[14px] py-[9px] font-semibold text-white hover:bg-orange disabled:opacity-60"
                >
                  <FaReply />
                  {replyingId === review._id
                    ? "Saving..."
                    : review.ownerReply
                    ? "Edit Reply"
                    : "Reply"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <span className="flex items-center gap-[3px] text-orange">
      {Array.from({ length: 5 }, (_, index) => (
        <FaStar key={index} className={index < Number(rating || 0) ? "opacity-100" : "opacity-25"} />
      ))}
    </span>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-[5px] text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function MessagePanel({ message }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-[25px] text-center shadow-md">
      <div className="mb-[15px] flex h-[75px] w-[75px] items-center justify-center rounded-full bg-gray-100 text-4xl text-gray-400">
        <FaHotel />
      </div>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
