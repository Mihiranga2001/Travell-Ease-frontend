import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaCheckCircle,
  FaLanguage,
  FaMoneyBillWave,
  FaSave,
  FaStar,
  FaUserTie,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  API_URL,
  axios,
  commaTextToArray,
  extractObject,
  getApiErrorMessage,
  getAuthConfig,
  textArray,
} from "./guideApi";

const INITIAL_FORM = {
  languages: "",
  experience: "",
  pricePerDay: "",
  specialties: "",
  isAvailable: true,
};

export default function GuideProfilePage() {
  const [guide, setGuide] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const [loadError, setLoadError] = useState("");

  async function loadProfile() {
    try {
      setLoading(true);
      setLoadError("");

      const response = await axios.get(
        `${API_URL}/travel-guides/my-profile`,
        getAuthConfig()
      );

      const data = extractObject(response.data, [
        "guide",
        "data",
      ]);

      setGuide(data);
      setProfileExists(true);
      setForm({
        languages: textArray(data?.languages).join(", "),
        experience: data?.experience || "",
        pricePerDay:
          data?.pricePerDay !== undefined
            ? String(data.pricePerDay)
            : "",
        specialties: textArray(data?.specialties).join(", "),
        isAvailable: data?.isAvailable !== false,
      });
    } catch (error) {
      if (error?.response?.status === 404) {
        setGuide(null);
        setProfileExists(false);
        setForm(INITIAL_FORM);
      } else {
        const message = getApiErrorMessage(
          error,
          "Failed to load guide profile"
        );
        setLoadError(message);
        toast.error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const price = Number(form.pricePerDay);
    const languages = commaTextToArray(form.languages);
    const specialties = commaTextToArray(form.specialties);

    if (languages.length === 0) {
      toast.error("Please enter at least one language");
      return;
    }

    if (!Number.isFinite(price) || price < 0) {
      toast.error("Please enter a valid daily price");
      return;
    }

    if (form.experience.trim().length < 10) {
      toast.error(
        "Experience must contain at least 10 characters"
      );
      return;
    }

    const payload = {
      languages,
      experience: form.experience.trim(),
      pricePerDay: price,
      specialties,
      isAvailable: form.isAvailable,
    };

    try {
      setSaving(true);

      if (profileExists && guide?._id) {
        await axios.put(
          `${API_URL}/travel-guides/${guide._id}`,
          payload,
          getAuthConfig()
        );
        toast.success(
          "Profile updated and sent for administrator approval"
        );
      } else {
        await axios.post(
          `${API_URL}/travel-guides`,
          payload,
          getAuthConfig()
        );
        toast.success(
          "Profile created and sent for administrator approval"
        );
      }

      await loadProfile();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to save guide profile"
        )
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <Loading text="Loading guide profile..." />;
  }

  return (
    <div className="w-full min-h-screen bg-white p-[25px] pt-[75px] lg:pt-[25px] text-gray-800 overflow-y-auto">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            My Guide Profile
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Create or update your public travel guide profile.
          </p>
        </div>

        {profileExists && (
          <span
            className={`inline-flex items-center gap-[7px] px-[14px] py-[8px] rounded-full text-sm font-semibold ${
              guide?.isApproved
                ? "bg-green-100 text-green-700"
                : "bg-orange/10 text-orange"
            }`}
          >
            {guide?.isApproved ? <FaCheckCircle /> : <FaStar />}
            {guide?.isApproved
              ? "Approved Profile"
              : "Pending Approval"}
          </span>
        )}
      </div>

      {loadError && (
        <div className="mb-[20px] bg-red-50 border border-red-200 text-red-700 rounded-xl p-[15px]">
          {loadError}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] md:p-[30px]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px]">
          <Field
            label="Languages"
            icon={<FaLanguage />}
            note="Separate languages with commas."
          >
            <input
              name="languages"
              value={form.languages}
              onChange={handleChange}
              placeholder="English, Sinhala, Tamil"
              className="input"
              required
            />
          </Field>

          <Field
            label="Price Per Day"
            icon={<FaMoneyBillWave />}
            note="Enter the amount in Sri Lankan Rupees."
          >
            <input
              name="pricePerDay"
              type="number"
              min="0"
              step="0.01"
              value={form.pricePerDay}
              onChange={handleChange}
              placeholder="7500"
              className="input"
              required
            />
          </Field>

          <div className="lg:col-span-2">
            <Field
              label="Specialties"
              icon={<FaStar />}
              note="Separate specialties with commas."
            >
              <input
                name="specialties"
                value={form.specialties}
                onChange={handleChange}
                placeholder="Cultural Tours, Wildlife, Hiking"
                className="input"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field
              label="Experience"
              icon={<FaUserTie />}
              note={`${form.experience.length}/3000 characters`}
            >
              <textarea
                name="experience"
                rows="7"
                maxLength="3000"
                value={form.experience}
                onChange={handleChange}
                placeholder="Describe your experience and qualifications..."
                className="input resize-y"
                required
              />
            </Field>
          </div>
        </div>

        <label className="mt-[22px] flex items-start gap-[12px] border border-gray-200 rounded-xl p-[16px] cursor-pointer">
          <input
            name="isAvailable"
            type="checkbox"
            checked={form.isAvailable}
            onChange={handleChange}
            className="mt-[4px] w-[18px] h-[18px] accent-accent"
          />
          <span>
            <span className="block font-bold text-gray-800">
              Available for bookings
            </span>
            <span className="block text-sm text-gray-500 mt-[3px]">
              Customers can see your profile as currently available.
            </span>
          </span>
        </label>

        <div className="mt-[25px] bg-orange/10 border border-orange/30 rounded-xl p-[16px]">
          <p className="font-bold text-gray-800">
            Administrator approval
          </p>
          <p className="text-sm text-gray-600 mt-[4px]">
            Creating or changing public profile details sets the
            profile to pending approval. Availability changes made
            from the Availability tab do not remove approval.
          </p>
        </div>

        <div className="flex flex-wrap justify-end gap-[10px] mt-[25px]">
          <button
            type="button"
            onClick={loadProfile}
            disabled={saving}
            className="inline-flex items-center gap-[8px] px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-60"
          >
            <FiRefreshCw />
            Reset
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-[8px] px-[20px] py-[10px] rounded-lg bg-accent text-white font-semibold hover:bg-orange disabled:opacity-60"
          >
            {saving ? (
              <FiRefreshCw className="animate-spin" />
            ) : (
              <FaSave />
            )}
            {saving
              ? "Saving..."
              : profileExists
                ? "Update Profile"
                : "Create Profile"}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          min-height: 45px;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          padding: 0.75rem;
          outline: none;
          color: rgb(55 65 81);
          background: white;
        }
        .input:focus {
          box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.18);
          border-color: var(--color-accent, #1e40af);
        }
      `}</style>
    </div>
  );
}

function Field({ label, icon, note, children }) {
  return (
    <div>
      <label className="flex items-center gap-[8px] text-sm font-semibold text-gray-700 mb-[6px]">
        <span className="text-accent">{icon}</span>
        {label}
      </label>
      {children}
      {note && (
        <p className="text-xs text-gray-400 mt-[5px]">{note}</p>
      )}
    </div>
  );
}

function Loading({ text }) {
  return (
    <div className="w-full min-h-screen p-[25px] pt-[75px] lg:pt-[25px]">
      <div className="min-h-[400px] bg-white rounded-2xl shadow-md flex items-center justify-center text-gray-500">
        {text}
      </div>
    </div>
  );
}
