import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaUserTie,
} from "react-icons/fa";
import {
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";
import {
  API_URL,
  axios,
  extractObject,
  getApiErrorMessage,
  getAuthConfig,
} from "./guideApi";

export default function GuideAvailabilityPage() {
  const [guide, setGuide] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilityNote, setAvailabilityNote] =
    useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my-profile`,
        getAuthConfig()
      );
      const data = extractObject(response.data, [
        "guide",
        "data",
      ]);
      setGuide(data);
      setIsAvailable(data?.isAvailable !== false);
      setAvailabilityNote(data?.availabilityNote || "");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to load availability"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function saveAvailability() {
    try {
      setSaving(true);

      const response = await axios.patch(
        `${API_URL}/travel-guides/my/availability`,
        {
          isAvailable,
          availabilityNote: availabilityNote.trim(),
        },
        getAuthConfig()
      );

      const updated = extractObject(response.data, [
        "guide",
        "data",
      ]);
      if (updated) {
        setGuide(updated);
      }

      toast.success("Availability updated successfully");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update availability"
        )
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Availability
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Control whether travelers can send new booking requests.
          </p>
        </div>
        <button
          type="button"
          onClick={loadProfile}
          disabled={loading}
          className="w-fit inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-[20px]">
        <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-md p-[25px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[20px]">
            Current Availability
          </h2>

          <div
            className={`rounded-2xl border p-[22px] ${
              isAvailable
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <div className="flex items-start gap-[15px]">
              <div
                className={`w-[55px] h-[55px] rounded-full text-white text-2xl flex items-center justify-center ${
                  isAvailable ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {isAvailable ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {isAvailable
                    ? "Available for Bookings"
                    : "Currently Unavailable"}
                </h3>
                <p className="text-gray-600 mt-[5px] leading-7">
                  {isAvailable
                    ? "Travelers can see you as available and submit booking requests."
                    : "Your existing profile remains visible, but new booking requests are disabled."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-[22px]">
            <label className="block text-sm font-semibold text-gray-700 mb-[7px]">
              Availability Status
            </label>
            <select
              value={isAvailable ? "true" : "false"}
              onChange={(event) =>
                setIsAvailable(event.target.value === "true")
              }
              className={`w-full h-[45px] rounded-lg px-[12px] text-white font-semibold border-none outline-none ${
                isAvailable ? "bg-green-600" : "bg-red-600"
              }`}
            >
              <option value="true">Available</option>
              <option value="false">Unavailable</option>
            </select>
          </div>

          <div className="mt-[20px]">
            <label className="block text-sm font-semibold text-gray-700 mb-[7px]">
              Availability Note
            </label>
            <textarea
              rows="5"
              maxLength="500"
              value={availabilityNote}
              onChange={(event) =>
                setAvailabilityNote(event.target.value)
              }
              placeholder="Example: Available on weekdays and weekends with two days' notice."
              className="w-full border border-gray-300 rounded-lg px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <p className="text-xs text-gray-400 mt-[4px]">
              {availabilityNote.length}/500 characters
            </p>
          </div>

          <div className="flex justify-end mt-[22px]">
            <button
              type="button"
              onClick={saveAvailability}
              disabled={saving || loading || !guide}
              className="inline-flex items-center gap-[8px] bg-accent text-white px-[20px] py-[10px] rounded-lg font-semibold hover:bg-orange disabled:opacity-60"
            >
              {saving ? (
                <FiRefreshCw className="animate-spin" />
              ) : (
                <FiSave />
              )}
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <h2 className="text-xl font-bold text-gray-800 mb-[18px]">
            Status Information
          </h2>
          <Info
            icon={<FaUserTie className="text-blue-600" />}
            title="Profile Approval"
            value={guide?.isApproved ? "Approved" : "Pending"}
          />
          <Info
            icon={<FaClock className="text-orange" />}
            title="Last Updated"
            value={
              guide?.updatedAt
                ? new Date(guide.updatedAt).toLocaleString("en-LK")
                : "Not available"
            }
          />
          <div className="mt-[18px] bg-blue-50 border border-blue-200 rounded-xl p-[14px] text-sm text-blue-700 leading-6">
            Updating availability does not send your profile back
            for administrator approval.
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, title, value }) {
  return (
    <div className="flex items-center justify-between gap-[10px] bg-gray-50 rounded-xl px-[14px] py-[12px] mb-[10px]">
      <div className="flex items-center gap-[9px]">
        {icon}
        <span className="text-sm text-gray-600">{title}</span>
      </div>
      <span className="font-bold text-gray-800">{value}</span>
    </div>
  );
}
