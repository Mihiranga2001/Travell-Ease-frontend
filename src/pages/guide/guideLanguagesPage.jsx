import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FaLanguage,
  FaPlus,
  FaSave,
  FaStar,
  FaTimes,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import {
  API_URL,
  axios,
  extractObject,
  getApiErrorMessage,
  getAuthConfig,
  textArray,
} from "./guideApi";

export default function GuideLanguagesPage() {
  const [languages, setLanguages] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [languageInput, setLanguageInput] = useState("");
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadSkills() {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/travel-guides/my-profile`,
        getAuthConfig()
      );
      const guide = extractObject(response.data, [
        "guide",
        "data",
      ]);
      setLanguages(textArray(guide?.languages));
      setSpecialties(textArray(guide?.specialties));
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Failed to load skills")
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSkills();
  }, []);

  function addValue(value, setter, current, clear) {
    const cleaned = value.trim();

    if (!cleaned) {
      return;
    }

    if (
      current.some(
        (item) => item.toLowerCase() === cleaned.toLowerCase()
      )
    ) {
      toast.error("This item has already been added");
      return;
    }

    setter([...current, cleaned]);
    clear("");
  }

  async function saveSkills() {
    if (languages.length === 0) {
      toast.error("At least one language is required");
      return;
    }

    try {
      setSaving(true);
      await axios.patch(
        `${API_URL}/travel-guides/my/skills`,
        { languages, specialties },
        getAuthConfig()
      );
      toast.success(
        "Languages and skills updated and sent for approval"
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Failed to update languages and skills"
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
            Languages & Skills
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Manage the languages you speak and the tours you specialize in.
          </p>
        </div>
        <button
          type="button"
          onClick={loadSkills}
          disabled={loading}
          className="inline-flex items-center gap-[8px] border border-accent text-accent px-[18px] py-[10px] rounded-lg font-semibold hover:bg-accent hover:text-white disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[20px]">
        <Editor
          title="Languages"
          description="Add every language you can confidently use with travelers."
          icon={<FaLanguage />}
          values={languages}
          input={languageInput}
          setInput={setLanguageInput}
          onAdd={() =>
            addValue(
              languageInput,
              setLanguages,
              languages,
              setLanguageInput
            )
          }
          onRemove={(index) =>
            setLanguages((current) =>
              current.filter((_, itemIndex) => itemIndex !== index)
            )
          }
          placeholder="Example: English"
          badgeClass="bg-blue-100 text-blue-700"
        />

        <Editor
          title="Specialties"
          description="Add tour areas, activities, and subjects you specialize in."
          icon={<FaStar />}
          values={specialties}
          input={specialtyInput}
          setInput={setSpecialtyInput}
          onAdd={() =>
            addValue(
              specialtyInput,
              setSpecialties,
              specialties,
              setSpecialtyInput
            )
          }
          onRemove={(index) =>
            setSpecialties((current) =>
              current.filter((_, itemIndex) => itemIndex !== index)
            )
          }
          placeholder="Example: Wildlife Tours"
          badgeClass="bg-orange/10 text-orange"
        />
      </div>

      <div className="mt-[20px] bg-orange/10 border border-orange/30 rounded-xl p-[16px]">
        <p className="font-bold text-gray-800">
          Approval required after public-profile changes
        </p>
        <p className="text-sm text-gray-600 mt-[4px]">
          Changing languages or specialties sets the profile to
          pending until an administrator reviews it.
        </p>
      </div>

      <div className="flex justify-end mt-[22px]">
        <button
          type="button"
          onClick={saveSkills}
          disabled={saving || loading}
          className="inline-flex items-center gap-[8px] bg-accent text-white px-[20px] py-[10px] rounded-lg font-semibold hover:bg-orange disabled:opacity-60"
        >
          {saving ? (
            <FiRefreshCw className="animate-spin" />
          ) : (
            <FaSave />
          )}
          {saving ? "Saving..." : "Save Languages & Skills"}
        </button>
      </div>
    </div>
  );
}

function Editor({
  title,
  description,
  icon,
  values,
  input,
  setInput,
  onAdd,
  onRemove,
  placeholder,
  badgeClass,
}) {
  return (
    <section className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
      <div className="flex items-center gap-[9px] mb-[5px]">
        <span className="text-accent text-xl">{icon}</span>
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
      </div>
      <p className="text-sm text-gray-500 mb-[18px]">
        {description}
      </p>

      <div className="flex gap-[8px]">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          className="flex-1 h-[44px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
        />
        <button
          type="button"
          onClick={onAdd}
          className="h-[44px] px-[14px] rounded-lg bg-accent text-white font-semibold inline-flex items-center gap-[6px]"
        >
          <FaPlus />
          Add
        </button>
      </div>

      <div className="mt-[18px] min-h-[150px] border border-dashed border-gray-300 rounded-xl p-[14px]">
        {values.length === 0 ? (
          <div className="h-[120px] flex items-center justify-center text-gray-400">
            No items added
          </div>
        ) : (
          <div className="flex flex-wrap gap-[8px]">
            {values.map((value, index) => (
              <span
                key={`${value}-${index}`}
                className={`${badgeClass} inline-flex items-center gap-[7px] rounded-full px-[11px] py-[6px] text-sm font-semibold`}
              >
                {value}
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="hover:text-red-600"
                  aria-label={`Remove ${value}`}
                >
                  <FaTimes />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
