import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaMapMarkedAlt,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaStar,
  FaImage,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE_URL = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL.replace(/\/api$/, "")
  : RAW_API_URL;

const API_URL = `${API_BASE_URL}/api`;

// These values exactly match the Mongoose enum values.
const CATEGORY_OPTIONS = [
  { value: "Historical", label: "Historical" },
  { value: "Beach", label: "Beach" },
  { value: "Nature", label: "Nature" },
  { value: "Religious", label: "Religious" },
  { value: "Adventure", label: "Adventure" },
  { value: "Wildlife", label: "Wildlife" },
  { value: "Mountain", label: "Mountain" },
  { value: "City", label: "City" },
  { value: "Other", label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminTouristPlacesPage() {
  // Form states based on the Mongoose touristPlaceSchema.
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [district, setDistrict] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [rating, setRating] = useState(4.5);
  const [status, setStatus] = useState("approved");

  // Page states.
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  // Filter states.
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    if (!token) {
      return {};
    }

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadPlaces() {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/places`, getAuthHeader());

      const placeList = Array.isArray(response.data)
        ? response.data
        : response.data?.places || response.data?.data || [];

      setPlaces(placeList);
      setFilteredPlaces(placeList);
    } catch (error) {
      console.error("Load places error:", error);
      toast.error(error.response?.data?.message || "Failed to load places");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlaces();
  }, []);

  useEffect(() => {
    let result = [...places];
    const search = searchText.trim().toLowerCase();

    if (search) {
      result = result.filter((place) =>
        [
          place.name,
          getLocationText(place.location),
          place.district,
          place.category,
          place.description,
        ].some((value) => String(value || "").toLowerCase().includes(search))
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (place) => normalizeCategory(place.category) === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter(
        (place) => normalizeStatus(place.status) === statusFilter
      );
    }

    setFilteredPlaces(result);
  }, [searchText, categoryFilter, statusFilter, places]);

  function clearForm() {
    setName("");
    setCategory("");
    setLocation("");
    setDistrict("");
    setDescription("");
    setImage("");
    setRating(4.5);
    setStatus("approved");
  }

  function resetForm() {
    clearForm();
    setEditingPlace(null);
    setShowForm(false);
  }

  function openAddForm() {
    clearForm();
    setEditingPlace(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditForm(place) {
    setEditingPlace(place);
    setName(place.name || "");
    setCategory(normalizeCategory(place.category));
    setLocation(getLocationText(place.location));
    setDistrict(place.district || "");
    setDescription(place.description || "");
    setImage(getRawImage(place));
    setRating(Number(place.rating ?? 4.5));
    setStatus(normalizeStatus(place.status));
    setShowForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanedName = name.trim();
    const cleanedLocation = location.trim();
    const cleanedDistrict = district.trim();
    const cleanedDescription = description.trim();
    const cleanedImage = image.trim();
    const numericRating = Number(rating);

    if (!cleanedName) {
      toast.error("Place name is required");
      return;
    }

    if (!category) {
      toast.error("Category is required");
      return;
    }

    if (!cleanedLocation) {
      toast.error("Location is required");
      return;
    }

    if (!cleanedDescription) {
      toast.error("Description is required");
      return;
    }

    if (Number.isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      toast.error("Rating must be between 0 and 5");
      return;
    }

    const placePayload = {
      name: cleanedName,
      category,
      location: cleanedLocation,
      district: cleanedDistrict,
      description: cleanedDescription,
      image: cleanedImage,
      rating: numericRating,
      status,
    };

    try {
      if (editingPlace) {
        await axios.put(
          `${API_URL}/places/${editingPlace._id}`,
          placePayload,
          getAuthHeader()
        );

        toast.success("Tourist place updated successfully");
      } else {
        await axios.post(`${API_URL}/places`, placePayload, getAuthHeader());
        toast.success("Tourist place added successfully");
      }

      resetForm();
      await loadPlaces();
    } catch (error) {
      console.error("Save place error:", error);
      toast.error(error.response?.data?.message || "Failed to save place");
    }
  }

  async function handleDeletePlace(place) {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${place.name}?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/places/${place._id}`, getAuthHeader());
      toast.success("Tourist place deleted successfully");
      await loadPlaces();
    } catch (error) {
      console.error("Delete place error:", error);
      toast.error(error.response?.data?.message || "Failed to delete place");
    }
  }

  async function handleStatusChange(place, newStatus) {
    try {
      await axios.put(
        `${API_URL}/places/${place._id}`,
        { status: newStatus },
        getAuthHeader()
      );

      toast.success("Place status updated");
      await loadPlaces();
    } catch (error) {
      console.error("Update status error:", error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  }

  const totalPlaces = places.length;
  const approvedPlaces = places.filter(
    (place) => normalizeStatus(place.status) === "approved"
  ).length;
  const pendingPlaces = places.filter(
    (place) => normalizeStatus(place.status) === "pending"
  ).length;
  const rejectedPlaces = places.filter(
    (place) => normalizeStatus(place.status) === "rejected"
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Tourist Places Management
          </h1>

          <p className="text-gray-500 mt-[5px]">
            Add, update, delete and manage tourist destinations for Travel Ease.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            type="button"
            onClick={loadPlaces}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddForm}
            className="flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
          >
            <FaPlus />
            Add Place
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <PlaceStatCard
          title="Total Places"
          value={totalPlaces}
          icon={<FaMapMarkedAlt />}
          color="bg-blue-600"
        />

        <PlaceStatCard
          title="Approved"
          value={approvedPlaces}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <PlaceStatCard
          title="Pending"
          value={pendingPlaces}
          icon={<FaClock />}
          color="bg-orange-500"
        />

        <PlaceStatCard
          title="Rejected"
          value={rejectedPlaces}
          icon={<FaTimesCircle />}
          color="bg-red-600"
        />
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex justify-between items-start gap-4 mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingPlace ? "Update Tourist Place" : "Add New Tourist Place"}
              </h2>

              <p className="text-sm text-gray-500">
                Enter the details required by the tourist place schema.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              className="px-[14px] py-[8px] rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <InputField
                label="Place Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Example: Sigiriya Rock Fortress"
                required
              />

              <SelectField
                label="Category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                options={CATEGORY_OPTIONS}
                placeholder="Select a category"
                required
              />

              <InputField
                label="Location"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Example: Sigiriya"
                required
              />

              <InputField
                label="District"
                value={district}
                onChange={(event) => setDistrict(event.target.value)}
                placeholder="Example: Matale"
              />

              <InputField
                label="Image URL"
                value={image}
                onChange={(event) => setImage(event.target.value)}
                placeholder="https://example.com/sigiriya.jpg"
              />

              <InputField
                label="Rating"
                type="number"
                value={rating}
                onChange={(event) => setRating(event.target.value)}
                min="0"
                max="5"
                step="0.1"
                placeholder="4.5"
              />

              <SelectField
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                options={STATUS_OPTIONS}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write the tourist place description"
                  rows="5"
                  required
                  className="w-full border border-gray-300 rounded-lg px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              {image.trim() && (
                <div className="md:col-span-2">
                  <p className="block text-sm font-semibold text-gray-700 mb-[6px]">
                    Image Preview
                  </p>
                  <img
                    src={getImageUrl(image)}
                    alt="Tourist place preview"
                    className="w-full max-w-[420px] h-[220px] object-cover rounded-xl border"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-[10px] mt-[20px]">
              <button
                type="button"
                onClick={resetForm}
                className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
              >
                {editingPlace ? "Update Place" : "Save Place"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />

            <input
              type="text"
              placeholder="Search by name, location, district or category"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Places Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Tourist Places</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredPlaces.length} place(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading tourist places...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Place</th>
                  <th className="py-[12px]">Category</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">District</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlaces.map((place) => {
                  const placeImage = getPlaceImage(place);
                  const placeStatus = normalizeStatus(place.status);

                  return (
                    <tr key={place._id || place.id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          {placeImage ? (
                            <img
                              src={placeImage}
                              alt={place.name || "Tourist place"}
                              className="w-[60px] h-[45px] rounded-lg object-cover border"
                            />
                          ) : (
                            <div className="w-[60px] h-[45px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                              <FaImage />
                            </div>
                          )}

                          <div>
                            <p className="font-bold text-gray-800">
                              {place.name || "Untitled Place"}
                            </p>

                            <p className="text-xs text-gray-400 line-clamp-1 max-w-[260px]">
                              {place.description || "No description"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {normalizeCategory(place.category)}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {getLocationText(place.location) || "Not added"}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        {place.district || "Not added"}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[5px]">
                          <FaStar className="text-orange-500" />
                          {Number(place.rating ?? 4.5).toFixed(1)}
                        </div>
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={placeStatus}
                          onChange={(event) =>
                            handleStatusChange(place, event.target.value)
                          }
                          className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${getStatusClass(
                            placeStatus
                          )}`}
                        >
                          {STATUS_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() => openEditForm(place)}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                            title="Edit Place"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePlace(place)}
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                            title="Delete Place"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredPlaces.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No tourist places found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">{value}</h2>
      </div>

      <div
        className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}
      >
        {icon}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  max,
  step,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        step={step}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <select
        value={value}
        onChange={onChange}
        required={required}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function normalizeCategory(category) {
  if (!category) {
    return "Other";
  }

  const foundCategory = CATEGORY_OPTIONS.find(
    (item) => item.value.toLowerCase() === String(category).toLowerCase()
  );

  return foundCategory?.value || "Other";
}

function normalizeStatus(status) {
  const normalized = String(status || "approved").toLowerCase();

  if (["approved", "pending", "rejected"].includes(normalized)) {
    return normalized;
  }

  return "approved";
}

function getLocationText(location) {
  if (!location) {
    return "";
  }

  if (typeof location === "string") {
    return location;
  }

  return location.address || location.name || "";
}

function getRawImage(place) {
  if (typeof place.image === "string") {
    return place.image;
  }

  if (Array.isArray(place.images)) {
    return place.images[0] || "";
  }

  return place.imageUrl || place.photo || place.thumbnail || "";
}

function getImageUrl(imagePath) {
  if (!imagePath) {
    return "";
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith("/")) {
    return `${API_BASE_URL}${imagePath}`;
  }

  return `${API_BASE_URL}/${imagePath}`;
}

function getPlaceImage(place) {
  return getImageUrl(getRawImage(place));
}

function getStatusClass(status) {
  if (status === "pending") {
    return "bg-orange-500";
  }

  if (status === "rejected") {
    return "bg-red-600";
  }

  return "bg-green-600";
}