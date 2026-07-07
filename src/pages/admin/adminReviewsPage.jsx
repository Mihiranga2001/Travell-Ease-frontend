import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaStar,
  FaSearch,
  FaTrash,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaFlag,
  FaUser,
  FaHotel,
  FaMapMarkedAlt,
  FaUserTie,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");

  const [selectedReview, setSelectedReview] = useState(null);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadReviews() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(
          `${API_URL}/reviews/admin/all`,
          getAuthHeader()
        );
      } catch {
        response = await axios.get(`${API_URL}/reviews`, getAuthHeader());
      }

      const reviewList = Array.isArray(response.data)
        ? response.data
        : response.data.reviews || response.data.data || [];

      setReviews(reviewList);
      setFilteredReviews(reviewList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    let result = [...reviews];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter((review) => {
        const userName = review.user?.name || review.userName || "";
        const targetName = getReviewTargetName(review);
        const comment = review.comment || review.reviewText || review.text || "";
        const title = review.title || "";

        return (
          userName.toLowerCase().includes(search) ||
          targetName.toLowerCase().includes(search) ||
          comment.toLowerCase().includes(search) ||
          title.toLowerCase().includes(search)
        );
      });
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (review) => getReviewType(review) === typeFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((review) => getReviewStatus(review) === statusFilter);
    }

    if (sentimentFilter !== "all") {
      result = result.filter(
        (review) => getSentiment(review) === sentimentFilter
      );
    }

    setFilteredReviews(result);
  }, [searchText, typeFilter, statusFilter, sentimentFilter, reviews]);

  function getReviewType(review) {
    return review.reviewType || review.type || review.targetType || "place";
  }

  function getReviewTargetName(review) {
    return (
      review.place?.name ||
      review.placeName ||
      review.hotel?.name ||
      review.hotel?.hotelName ||
      review.hotelName ||
      review.guide?.name ||
      review.guideName ||
      review.targetName ||
      "Unknown Target"
    );
  }

  function getReviewerName(review) {
    return review.user?.name || review.userName || "Unknown User";
  }

  function getReviewerEmail(review) {
    return review.user?.email || review.userEmail || "No email";
  }

  function getReviewText(review) {
    return review.comment || review.reviewText || review.text || "No review text";
  }

  function getReviewStatus(review) {
    if (review.status) return review.status;
    if (review.isApproved === true) return "approved";
    if (review.isFlagged === true) return "flagged";
    return "pending";
  }

  function getSentiment(review) {
    return review.sentiment || review.aiSentiment || "neutral";
  }

  function getRating(review) {
    return Number(review.rating || review.stars || 0);
  }

  function getReviewIcon(type) {
    if (type === "hotel") return <FaHotel />;
    if (type === "guide") return <FaUserTie />;
    return <FaMapMarkedAlt />;
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

  async function handleStatusChange(review, newStatus) {
    try {
      await axios.put(
        `${API_URL}/reviews/${review._id}`,
        {
          status: newStatus,
          isApproved: newStatus === "approved",
          isFlagged: newStatus === "flagged",
        },
        getAuthHeader()
      );

      toast.success("Review status updated");
      loadReviews();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  }

  async function handleApprovalChange(review, isApproved) {
    try {
      const endpoint = isApproved ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/reviews/${review._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}/reviews/${review._id}`,
          {
            isApproved,
            isFlagged: false,
            status: isApproved ? "approved" : "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(isApproved ? "Review approved" : "Review rejected");
      loadReviews();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update review");
    }
  }

  async function handleDeleteReview(review) {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this review?"
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/reviews/${review._id}`, getAuthHeader());

      toast.success("Review deleted successfully");
      loadReviews();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete review");
    }
  }

  const totalReviews = reviews.length;
  const approvedReviews = reviews.filter(
    (review) => getReviewStatus(review) === "approved"
  ).length;
  const pendingReviews = reviews.filter(
    (review) => getReviewStatus(review) === "pending"
  ).length;
  const flaggedReviews = reviews.filter(
    (review) => getReviewStatus(review) === "flagged" || review.isFlagged
  ).length;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + getRating(review), 0) /
          reviews.length
        ).toFixed(1)
      : "0.0";

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Reviews Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Manage traveler reviews, ratings, AI flagged reviews and sentiment
            analysis results.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-[20px] mb-[25px]">
        <ReviewStatCard
          title="Total Reviews"
          value={totalReviews}
          icon={<FaStar />}
          color="bg-blue-600"
        />

        <ReviewStatCard
          title="Approved"
          value={approvedReviews}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <ReviewStatCard
          title="Pending"
          value={pendingReviews}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <ReviewStatCard
          title="Flagged"
          value={flaggedReviews}
          icon={<FaFlag />}
          color="bg-red-600"
        />

        <ReviewStatCard
          title="Average Rating"
          value={averageRating}
          icon={<FaStar />}
          color="bg-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by user, place, hotel, guide or review"
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
            <option value="all">All Review Types</option>
            <option value="place">Place Reviews</option>
            <option value="hotel">Hotel Reviews</option>
            <option value="guide">Guide Reviews</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="flagged">Flagged</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={sentimentFilter}
            onChange={(e) => setSentimentFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Sentiment</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Reviews</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredReviews.length} review(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading reviews...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Review</th>
                  <th className="py-[12px]">Reviewer</th>
                  <th className="py-[12px]">Target</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Sentiment</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px]">Date</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredReviews.map((review) => {
                  const type = getReviewType(review);
                  const status = getReviewStatus(review);
                  const sentiment = getSentiment(review);

                  return (
                    <tr key={review._id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="max-w-[280px]">
                          <p className="font-bold text-gray-800">
                            {review.title || "Traveler Review"}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-[4px]">
                            {getReviewText(review)}
                          </p>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[10px]">
                          <div className="w-[38px] h-[38px] rounded-full bg-gray-100 flex items-center justify-center text-accent">
                            <FaUser />
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {getReviewerName(review)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {getReviewerEmail(review)}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[8px]">
                          <div className="text-accent">
                            {getReviewIcon(type)}
                          </div>

                          <div>
                            <p className="font-semibold text-gray-800">
                              {getReviewTargetName(review)}
                            </p>
                            <p className="text-xs text-gray-400 capitalize">
                              {type}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[5px]">
                          <FaStar className="text-orange" />
                          <span>{getRating(review)}</span>
                        </div>
                      </td>

                      <td className="py-[14px]">
                        <span
                          className={`px-[10px] py-[5px] rounded-full text-xs text-white capitalize ${
                            sentiment === "positive"
                              ? "bg-green-600"
                              : sentiment === "negative"
                              ? "bg-red-600"
                              : "bg-gray-500"
                          }`}
                        >
                          {sentiment}
                        </span>
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(review, e.target.value)
                          }
                          className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                            status === "approved"
                              ? "bg-green-600"
                              : status === "flagged"
                              ? "bg-red-600"
                              : status === "rejected"
                              ? "bg-gray-600"
                              : "bg-orange"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="flagged">Flagged</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {formatDate(review.createdAt || review.date)}
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            onClick={() => setSelectedReview(review)}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                            title="View Review"
                          >
                            <FaEye />
                          </button>

                          {status !== "approved" && (
                            <button
                              onClick={() => handleApprovalChange(review, true)}
                              className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                              title="Approve Review"
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                          {status !== "rejected" && (
                            <button
                              onClick={() => handleApprovalChange(review, false)}
                              className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                              title="Reject Review"
                            >
                              <FaTimesCircle />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteReview(review)}
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                            title="Delete Review"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredReviews.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No reviews found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {selectedReview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-[20px]">
          <div className="w-full max-w-[750px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl p-[25px]">
            <div className="flex justify-between items-center mb-[20px]">
              <div>
                <h2 className="text-2xl font-bold text-accent">
                  Review Details
                </h2>
                <p className="text-sm text-gray-500">
                  Full review details and AI analysis summary.
                </p>
              </div>

              <button
                onClick={() => setSelectedReview(null)}
                className="w-[35px] h-[35px] rounded-full bg-gray-200 hover:bg-gray-300"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <DetailItem label="Review ID" value={selectedReview._id} />
              <DetailItem
                label="Review Type"
                value={getReviewType(selectedReview)}
              />
              <DetailItem
                label="Reviewer"
                value={getReviewerName(selectedReview)}
              />
              <DetailItem
                label="Reviewer Email"
                value={getReviewerEmail(selectedReview)}
              />
              <DetailItem
                label="Target"
                value={getReviewTargetName(selectedReview)}
              />
              <DetailItem
                label="Rating"
                value={`${getRating(selectedReview)} / 5`}
              />
              <DetailItem
                label="Sentiment"
                value={getSentiment(selectedReview)}
              />
              <DetailItem
                label="Status"
                value={getReviewStatus(selectedReview)}
              />
              <DetailItem
                label="Created Date"
                value={formatDate(selectedReview.createdAt || selectedReview.date)}
              />
              <DetailItem
                label="Fake Review Score"
                value={
                  selectedReview.fakeReviewScore !== undefined
                    ? `${selectedReview.fakeReviewScore}%`
                    : "Not analyzed"
                }
              />
            </div>

            <div className="mt-[15px] border border-gray-200 rounded-lg p-[12px]">
              <p className="text-sm text-gray-500 mb-[5px]">Review Text</p>
              <p className="text-gray-800 leading-relaxed">
                {getReviewText(selectedReview)}
              </p>
            </div>

            {selectedReview.aiReason && (
              <div className="mt-[15px] border border-red-200 bg-red-50 rounded-lg p-[12px]">
                <p className="text-sm text-red-600 mb-[5px]">
                  AI Flag Reason
                </p>
                <p className="text-red-700">{selectedReview.aiReason}</p>
              </div>
            )}

            <div className="flex justify-end gap-[10px] mt-[20px]">
              {getReviewStatus(selectedReview) !== "approved" && (
                <button
                  onClick={() => {
                    handleApprovalChange(selectedReview, true);
                    setSelectedReview(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold"
                >
                  Approve
                </button>
              )}

              {getReviewStatus(selectedReview) !== "rejected" && (
                <button
                  onClick={() => {
                    handleApprovalChange(selectedReview, false);
                    setSelectedReview(null);
                  }}
                  className="px-[18px] py-[10px] rounded-lg bg-orange text-white font-semibold"
                >
                  Reject
                </button>
              )}

              <button
                onClick={() => setSelectedReview(null)}
                className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold"
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

function ReviewStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">
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
      <p className="font-semibold text-gray-800 break-words capitalize">
        {value}
      </p>
    </div>
  );
}