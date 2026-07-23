import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FaCheckCircle,
  FaEye,
  FaImage,
  FaLanguage,
  FaMoneyBillWave,
  FaSearch,
  FaStar,
  FaTimes,
  FaTimesCircle,
  FaTrash,
  FaUserTie,
} from "react-icons/fa";

import { FiRefreshCw } from "react-icons/fi";

const API_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

export default function AdminTravelGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const [updatingGuideId, setUpdatingGuideId] =
    useState("");

  const [deletingGuideId, setDeletingGuideId] =
    useState("");

  const [searchText, setSearchText] = useState("");
  const [approvalFilter, setApprovalFilter] =
    useState("all");

  const [availabilityFilter, setAvailabilityFilter] =
    useState("all");

  const [selectedGuide, setSelectedGuide] =
    useState(null);

  function getAuthHeader() {
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

  function getApiErrorMessage(error, fallbackMessage) {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallbackMessage
    );
  }

  async function loadGuides() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/travel-guides/admin/all`,
        getAuthHeader()
      );

      const guideList = Array.isArray(response.data)
        ? response.data
        : response.data?.guides ||
          response.data?.data ||
          response.data?.results ||
          [];

      setGuides(guideList);
    } catch (error) {
      console.error("Load travel guides error:", error);

      setGuides([]);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load travel guides"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuides();
  }, []);

  const filteredGuides = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return guides.filter((guide) => {
      const guideName = getGuideName(guide);
      const guideEmail = getGuideEmail(guide);
      const guidePhone = getGuidePhone(guide);

      const userId =
        typeof guide.userId === "string"
          ? guide.userId
          : guide.userId?._id || "";

      const languages = arrayToText(guide.languages);
      const specialties = arrayToText(
        guide.specialties
      );

      const matchesSearch =
        search === "" ||
        guideName.toLowerCase().includes(search) ||
        guideEmail.toLowerCase().includes(search) ||
        guidePhone.toLowerCase().includes(search) ||
        String(userId).toLowerCase().includes(search) ||
        String(guide.experience || "")
          .toLowerCase()
          .includes(search) ||
        languages.toLowerCase().includes(search) ||
        specialties.toLowerCase().includes(search);

      const matchesApproval =
        approvalFilter === "all" ||
        (approvalFilter === "approved" &&
          guide.isApproved === true) ||
        (approvalFilter === "pending" &&
          guide.isApproved !== true);

      const matchesAvailability =
        availabilityFilter === "all" ||
        (availabilityFilter === "available" &&
          guide.isAvailable !== false) ||
        (availabilityFilter === "unavailable" &&
          guide.isAvailable === false);

      return (
        matchesSearch &&
        matchesApproval &&
        matchesAvailability
      );
    });
  }, [
    guides,
    searchText,
    approvalFilter,
    availabilityFilter,
  ]);

  async function handleApprovalChange(
    guide,
    newApprovalStatus
  ) {
    const action = newApprovalStatus
      ? "approve"
      : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${
        getGuideName(guide) || "this travel guide"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdatingGuideId(guide._id);

      const endpoint = newApprovalStatus
        ? "approve"
        : "reject";

      try {
        await axios.put(
          `${API_URL}/travel-guides/${guide._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch (specificRouteError) {
        const status =
          specificRouteError?.response?.status;

        if (status !== 404 && status !== 405) {
          throw specificRouteError;
        }

        await axios.put(
          `${API_URL}/travel-guides/${guide._id}`,
          {
            isApproved: newApprovalStatus,
          },
          getAuthHeader()
        );
      }

      toast.success(
        newApprovalStatus
          ? "Travel guide approved successfully"
          : "Travel guide rejected successfully"
      );

      setSelectedGuide(null);
      await loadGuides();
    } catch (error) {
      console.error(
        "Travel guide approval error:",
        error
      );

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update travel guide approval"
        )
      );
    } finally {
      setUpdatingGuideId("");
    }
  }

  async function handleDeleteGuide(guide) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        getGuideName(guide) || "this travel guide"
      }?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingGuideId(guide._id);

      await axios.delete(
        `${API_URL}/travel-guides/${guide._id}`,
        getAuthHeader()
      );

      toast.success(
        "Travel guide deleted successfully"
      );

      setSelectedGuide(null);
      await loadGuides();
    } catch (error) {
      console.error("Delete travel guide error:", error);

      toast.error(
        getApiErrorMessage(
          error,
          "Failed to delete travel guide"
        )
      );
    } finally {
      setDeletingGuideId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setApprovalFilter("all");
    setAvailabilityFilter("all");
  }

  const totalGuides = guides.length;

  const approvedGuides = guides.filter(
    (guide) => guide.isApproved === true
  ).length;

  const pendingGuides = guides.filter(
    (guide) => guide.isApproved !== true
  ).length;

  const availableGuides = guides.filter(
    (guide) => guide.isAvailable !== false
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Travel Guides Management
          </h1>

          <p className="text-gray-500 mt-[5px]">
            Review travel guide registrations and approve or
            reject profiles before they appear publicly.
          </p>
        </div>

        <button
          type="button"
          onClick={loadGuides}
          disabled={loading}
          className="w-fit flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition disabled:opacity-60"
        >
          <FiRefreshCw
            className={loading ? "animate-spin" : ""}
          />

          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <GuideStatCard
          title="Total Guides"
          value={totalGuides}
          icon={<FaUserTie />}
          color="bg-blue-600"
        />

        <GuideStatCard
          title="Approved Guides"
          value={approvedGuides}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <GuideStatCard
          title="Pending Guides"
          value={pendingGuides}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <GuideStatCard
          title="Available Guides"
          value={availableGuides}
          icon={<FaUserTie />}
          color="bg-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search guide, email, language or specialty"
              value={searchText}
              onChange={(event) =>
                setSearchText(event.target.value)
              }
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(event) =>
              setApprovalFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Approval Status
            </option>

            <option value="pending">
              Pending Guides
            </option>

            <option value="approved">
              Approved Guides
            </option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(event) =>
              setAvailabilityFilter(event.target.value)
            }
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">
              All Availability
            </option>

            <option value="available">
              Available Guides
            </option>

            <option value="unavailable">
              Unavailable Guides
            </option>
          </select>
        </div>

        {(searchText ||
          approvalFilter !== "all" ||
          availabilityFilter !== "all") && (
          <div className="flex justify-end mt-[15px]">
            <button
              type="button"
              onClick={clearFilters}
              className="text-accent font-semibold hover:text-orange"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Travel guides table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Travel Guide Submissions
            </h2>

            <p className="text-sm text-gray-500">
              Showing {filteredGuides.length} guide(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading travel guides...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1250px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Guide</th>
                  <th className="py-[12px]">Languages</th>
                  <th className="py-[12px]">
                    Experience
                  </th>
                  <th className="py-[12px]">
                    Specialties
                  </th>
                  <th className="py-[12px]">
                    Price Per Day
                  </th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">
                    Availability
                  </th>
                  <th className="py-[12px] text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredGuides.map((guide) => {
                  const isUpdating =
                    updatingGuideId === guide._id;

                  const isDeleting =
                    deletingGuideId === guide._id;

                  return (
                    <tr
                      key={guide._id}
                      className="border-b text-sm"
                    >
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          {getGuideImage(guide) ? (
                            <img
                              src={getGuideImage(guide)}
                              alt={getGuideName(guide)}
                              onError={(event) => {
                                event.currentTarget.onerror =
                                  null;

                                event.currentTarget.src =
                                  "/user-placeholder.png";
                              }}
                              className="w-[55px] h-[55px] rounded-full object-cover border"
                            />
                          ) : (
                            <div className="w-[55px] h-[55px] rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
                              <FaImage />
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-800">
                              {getGuideName(guide)}
                            </p>

                            <p className="text-xs text-gray-500">
                              {getGuideEmail(guide) ||
                                "No email"}
                            </p>

                            <p className="text-xs text-gray-400">
                              {getGuidePhone(guide) ||
                                "No phone number"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600 max-w-[180px]">
                        <TagList
                          values={guide.languages}
                          emptyText="Not added"
                        />
                      </td>

                      <td className="py-[14px] text-gray-600 max-w-[180px]">
                        <p className="line-clamp-2">
                          {guide.experience ||
                            "Not added"}
                        </p>
                      </td>

                      <td className="py-[14px] text-gray-600 max-w-[220px]">
                        <TagList
                          values={guide.specialties}
                          emptyText="Not added"
                        />
                      </td>

                      <td className="py-[14px] text-gray-600 font-semibold">
                        Rs.{" "}
                        {Number(
                          guide.pricePerDay || 0
                        ).toLocaleString("en-LK")}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[5px]">
                          <FaStar className="text-orange" />

                          {Number(
                            guide.rating || 0
                          ).toFixed(1)}
                        </div>
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={
                            guide.isApproved === true
                          }
                          activeText="Approved"
                          inactiveText="Pending"
                        />
                      </td>

                      <td className="py-[14px]">
                        <StatusBadge
                          active={
                            guide.isAvailable !== false
                          }
                          activeText="Available"
                          inactiveText="Unavailable"
                        />
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedGuide(guide)
                            }
                            disabled={
                              isUpdating || isDeleting
                            }
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="View Guide Details"
                          >
                            <FaEye />
                          </button>

                          {!guide.isApproved && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprovalChange(
                                  guide,
                                  true
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white disabled:opacity-60"
                              title="Approve Guide"
                            >
                              <FaCheckCircle />
                            </button>
                          )}

                          {guide.isApproved && (
                            <button
                              type="button"
                              onClick={() =>
                                handleApprovalChange(
                                  guide,
                                  false
                                )
                              }
                              disabled={
                                isUpdating ||
                                isDeleting
                              }
                              className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white disabled:opacity-60"
                              title="Reject Guide"
                            >
                              <FaTimesCircle />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteGuide(guide)
                            }
                            disabled={
                              isUpdating || isDeleting
                            }
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="Delete Guide"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredGuides.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[35px] text-center text-gray-500"
                    >
                      No travel guides found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedGuide && (
        <GuideDetailsModal
          guide={selectedGuide}
          updatingGuideId={updatingGuideId}
          deletingGuideId={deletingGuideId}
          onClose={() => setSelectedGuide(null)}
          onApprovalChange={handleApprovalChange}
          onDelete={handleDeleteGuide}
        />
      )}
    </div>
  );
}

function GuideDetailsModal({
  guide,
  updatingGuideId,
  deletingGuideId,
  onClose,
  onApprovalChange,
  onDelete,
}) {
  const isUpdating =
    updatingGuideId === guide._id;

  const isDeleting =
    deletingGuideId === guide._id;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 p-[20px] flex items-center justify-center">
      <div className="w-full max-w-[850px] max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl">
        <div className="sticky top-0 z-10 bg-white border-b px-[20px] py-[15px] flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {getGuideName(guide)}
            </h2>

            <p className="text-sm text-gray-500">
              Review the complete travel guide submission.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-[38px] h-[38px] rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-[20px]">
          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-[25px]">
            <div>
              {getGuideImage(guide) ? (
                <img
                  src={getGuideImage(guide)}
                  alt={getGuideName(guide)}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "/user-placeholder.png";
                  }}
                  className="w-full h-[230px] rounded-xl object-cover border"
                />
              ) : (
                <div className="w-full h-[230px] rounded-xl bg-gray-100 border flex items-center justify-center text-gray-400 text-6xl">
                  <FaUserTie />
                </div>
              )}
            </div>

            <div className="space-y-[12px]">
              <DetailRow
                label="Guide Name"
                value={getGuideName(guide)}
              />

              <DetailRow
                label="Email"
                value={
                  getGuideEmail(guide) || "Not added"
                }
              />

              <DetailRow
                label="Phone Number"
                value={
                  getGuidePhone(guide) || "Not added"
                }
              />

              <DetailRow
                label="Price Per Day"
                value={`Rs. ${Number(
                  guide.pricePerDay || 0
                ).toLocaleString("en-LK")}`}
              />

              <DetailRow
                label="Rating"
                value={`${Number(
                  guide.rating || 0
                ).toFixed(1)} / 5`}
              />

              <DetailRow
                label="Registered Date"
                value={formatDate(guide.createdAt)}
              />

              <div className="flex flex-wrap gap-[8px]">
                <StatusBadge
                  active={guide.isApproved === true}
                  activeText="Approved"
                  inactiveText="Pending"
                />

                <StatusBadge
                  active={guide.isAvailable !== false}
                  activeText="Available"
                  inactiveText="Unavailable"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] mt-[25px]">
            <InformationCard
              title="Languages"
              icon={<FaLanguage />}
            >
              <TagList
                values={guide.languages}
                emptyText="No languages provided"
              />
            </InformationCard>

            <InformationCard
              title="Specialties"
              icon={<FaUserTie />}
            >
              <TagList
                values={guide.specialties}
                emptyText="No specialties provided"
              />
            </InformationCard>
          </div>

          <div className="mt-[20px]">
            <InformationCard
              title="Experience"
              icon={<FaStar />}
            >
              <p className="text-gray-600 leading-7 whitespace-pre-wrap">
                {guide.experience ||
                  "No experience details provided."}
              </p>
            </InformationCard>
          </div>

          <div className="mt-[20px]">
            <InformationCard
              title="Daily Rate"
              icon={<FaMoneyBillWave />}
            >
              <p className="text-2xl font-bold text-accent">
                Rs.{" "}
                {Number(
                  guide.pricePerDay || 0
                ).toLocaleString("en-LK")}
              </p>

              <p className="text-sm text-gray-500 mt-[4px]">
                Price charged per day
              </p>
            </InformationCard>
          </div>

          <div className="flex flex-wrap justify-end gap-[10px] mt-[25px]">
            <button
              type="button"
              onClick={() => onDelete(guide)}
              disabled={isUpdating || isDeleting}
              className="px-[18px] py-[10px] rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60"
            >
              {isDeleting
                ? "Deleting..."
                : "Delete Guide"}
            </button>

            {guide.isApproved ? (
              <button
                type="button"
                onClick={() =>
                  onApprovalChange(guide, false)
                }
                disabled={isUpdating || isDeleting}
                className="px-[18px] py-[10px] rounded-lg bg-orange text-white font-semibold hover:bg-orange/80 disabled:opacity-60"
              >
                {isUpdating
                  ? "Updating..."
                  : "Reject Guide"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  onApprovalChange(guide, true)
                }
                disabled={isUpdating || isDeleting}
                className="px-[18px] py-[10px] rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-60"
              >
                {isUpdating
                  ? "Updating..."
                  : "Approve Guide"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function GuideStatCard({
  title,
  value,
  icon,
  color,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">
          {title}
        </p>

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

function StatusBadge({
  active,
  activeText,
  inactiveText,
}) {
  return (
    <span
      className={`inline-flex px-[10px] py-[5px] rounded-full text-xs text-white ${
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

      <p className="text-gray-700 mt-[2px] break-words">
        {value}
      </p>
    </div>
  );
}

function InformationCard({
  title,
  icon,
  children,
}) {
  return (
    <div className="border border-gray-200 rounded-xl p-[18px] bg-gray-50">
      <div className="flex items-center gap-[8px] mb-[12px]">
        <span className="text-accent">{icon}</span>

        <h3 className="font-bold text-gray-800">
          {title}
        </h3>
      </div>

      {children}
    </div>
  );
}

function TagList({ values, emptyText }) {
  const items = Array.isArray(values)
    ? values.filter(
        (value) => String(value || "").trim() !== ""
      )
    : [];

  if (items.length === 0) {
    return (
      <span className="text-gray-500">
        {emptyText}
      </span>
    );
  }

  return (
    <div className="flex flex-wrap gap-[6px]">
      {items.map((item, index) => (
        <span
          key={`${item}-${index}`}
          className="inline-flex px-[9px] py-[4px] rounded-full bg-blue-100 text-blue-700 text-xs font-medium"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function getGuideName(guide) {
  const user = guide?.userId;

  if (user && typeof user === "object") {
    if (user.name) {
      return user.name;
    }

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (fullName) {
      return fullName;
    }

    return (
      user.username ||
      user.email ||
      "Unnamed guide"
    );
  }

  return (
    guide?.name ||
    guide?.userName ||
    "Unnamed guide"
  );
}

function getGuideEmail(guide) {
  if (
    guide?.userId &&
    typeof guide.userId === "object"
  ) {
    return guide.userId.email || "";
  }

  return guide?.email || "";
}

function getGuidePhone(guide) {
  if (
    guide?.userId &&
    typeof guide.userId === "object"
  ) {
    return (
      guide.userId.phoneNumber ||
      guide.userId.phone ||
      ""
    );
  }

  return guide?.phoneNumber || guide?.phone || "";
}

function getGuideImage(guide) {
  if (
    guide?.userId &&
    typeof guide.userId === "object"
  ) {
    const image =
      guide.userId.profilePicture ||
      guide.userId.avatar ||
      guide.userId.image ||
      "";

    return normalizeImageUrl(image);
  }

  return normalizeImageUrl(
    guide?.profilePicture ||
      guide?.avatar ||
      guide?.image ||
      ""
  );
}

function arrayToText(values) {
  return Array.isArray(values)
    ? values.filter(Boolean).join(" ")
    : "";
}

function formatDate(dateValue) {
  if (!dateValue) {
    return "Not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function normalizeImageUrl(image) {
  const imageText = String(image || "").trim();

  if (!imageText) {
    return "";
  }

  if (
    imageText.startsWith("http://") ||
    imageText.startsWith("https://") ||
    imageText.startsWith("data:")
  ) {
    return imageText;
  }

  const backendOrigin = API_URL.replace(
    /\/api\/?$/,
    ""
  );

  if (imageText.startsWith("/")) {
    return `${backendOrigin}${imageText}`;
  }

  return `${backendOrigin}/${imageText}`;
}