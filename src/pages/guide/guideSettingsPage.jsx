import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaBell,
  FaMoneyBillWave,
  FaSave,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  API_URL,
  axios,
  extractObject,
  getApiErrorMessage,
  getAuthConfig,
} from "./guideApi";

const INITIAL_SETTINGS = {
  pricePerDay: "",
  bookingRequests: true,
  bookingUpdates: true,
  reviewAlerts: true,
};

export default function GuideSettingsPage() {
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSettings() {
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
      setSettings({
        pricePerDay:
          data?.pricePerDay !== undefined
            ? String(data.pricePerDay)
            : "",
        bookingRequests:
          data?.notificationSettings?.bookingRequests !== false,
        bookingUpdates:
          data?.notificationSettings?.bookingUpdates !== false,
        reviewAlerts:
          data?.notificationSettings?.reviewAlerts !== false,
      });
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to load settings")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setSettings((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function saveSettings() {
    const price = Number(settings.pricePerDay);

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid daily price");
      return;
    }

    try {
      setSaving(true);
      const response = await axios.patch(
        `${API_URL}/travel-guides/my/settings`,
        {
          pricePerDay: price,
          notificationSettings: {
            bookingRequests: settings.bookingRequests,
            bookingUpdates: settings.bookingUpdates,
            reviewAlerts: settings.reviewAlerts,
          },
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

      toast.success("Guide settings updated");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to update settings")
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
            Settings
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Manage your service price and guide notifications.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSettings}
          disabled={loading}
          className="inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Reset
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[9px] mb-[6px]">
            <FaMoneyBillWave className="text-accent text-xl" />
            <h2 className="text-xl font-bold text-gray-800">
              Service Price
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-[18px]">
            Set the daily amount displayed on your public profile.
          </p>

          <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
            Price Per Day
          </label>
          <input
            name="pricePerDay"
            type="number"
            min="0"
            step="0.01"
            value={settings.pricePerDay}
            onChange={handleChange}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          />

          <div className="mt-[15px] bg-orange/10 border border-orange/30 rounded-xl p-[14px] text-sm text-gray-600 leading-6">
            Changing the public daily price sets your profile to
            pending administrator approval.
          </div>
        </section>

        <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[9px] mb-[6px]">
            <FaBell className="text-accent text-xl" />
            <h2 className="text-xl font-bold text-gray-800">
              Notifications
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-[18px]">
            Choose which guide activities should produce notifications.
          </p>

          <Toggle
            name="bookingRequests"
            checked={settings.bookingRequests}
            onChange={handleChange}
            title="New booking requests"
            description="Notify me when a traveler requests a booking."
          />
          <Toggle
            name="bookingUpdates"
            checked={settings.bookingUpdates}
            onChange={handleChange}
            title="Booking updates"
            description="Notify me when a booking or payment changes."
          />
          <Toggle
            name="reviewAlerts"
            checked={settings.reviewAlerts}
            onChange={handleChange}
            title="New reviews"
            description="Notify me when a traveler submits feedback."
          />
        </section>
      </div>

      <div className="flex justify-end mt-[22px]">
        <button
          type="button"
          onClick={saveSettings}
          disabled={saving || loading || !guide}
          className="inline-flex items-center gap-[8px] bg-accent text-white px-[20px] py-[10px] rounded-lg font-semibold hover:bg-orange disabled:opacity-60"
        >
          {saving ? (
            <FiRefreshCw className="animate-spin" />
          ) : (
            <FaSave />
          )}
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

function Toggle({
  name,
  checked,
  onChange,
  title,
  description,
}) {
  return (
    <label className="flex items-start justify-between gap-[15px] rounded-xl bg-gray-50 px-[14px] py-[13px] mb-[10px] cursor-pointer">
      <span>
        <span className="block font-semibold text-gray-800">
          {title}
        </span>
        <span className="block text-xs text-gray-500 mt-[3px]">
          {description}
        </span>
      </span>
      <input
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-[4px] w-[18px] h-[18px] accent-accent"
      />
    </label>
  );
}
