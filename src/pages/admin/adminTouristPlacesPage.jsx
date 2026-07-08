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
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const RAW_API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE_URL = RAW_API_URL.endsWith("/api")
  ? RAW_API_URL.replace("/api", "")
  : RAW_API_URL;

const API_URL = `${API_BASE_URL}/api`;

const CATEGORY_OPTIONS = [
  { value: "historical", label: "Historical" },
  { value: "beach", label: "Beach" },
  { value: "nature", label: "Nature" },
  { value: "religious", label: "Religious" },
  { value: "adventure", label: "Adventure" },
  { value: "wildlife", label: "Wildlife" },
  { value: "mountain", label: "Mountain" },
  { value: "city", label: "City" },
  { value: "other", label: "Other" },
];

export default function AdminTouristPlacesPage() {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingPlace, setEditingPlace] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "historical",
    city: "",
    district: "",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    entryFee: "",
    openingHours: "",
    bestTimeToVisit: "",
    images: "",
    status: "active",
    isFeatured: false,
  });

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
        : response.data.places || response.data.data || [];

      setPlaces(placeList);
      setFilteredPlaces(placeList);
    } catch (error) {
      console.error(error);
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

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (place) =>
          place.name?.toLowerCase().includes(search) ||
          place.city?.toLowerCase().includes(search) ||
          place.district?.toLowerCase().includes(search) ||
          place.province?.toLowerCase().includes(search) ||
          place.category?.toLowerCase().includes(search)
      );
    }

    if (categoryFilter !== "all") {
      result = result.filter(
        (place) => normalizeCategory(place.category) === categoryFilter
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((place) => {
        const status = getPlaceStatus(place);
        return status === statusFilter;
      });
    }

    setFilteredPlaces(result);
  }, [searchText, categoryFilter, statusFilter, places]);

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      category: "historical",
      city: "",
      district: "",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      entryFee: "",
      openingHours: "",
      bestTimeToVisit: "",
      images: "",
      status: "active",
      isFeatured: false,
    });

    setEditingPlace(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(place) {
    setEditingPlace(place);

    const imageText = Array.isArray(place.images)
      ? place.images.join(", ")
      : place.image
      ? place.image
      : "";

    setFormData({
      name: place.name || "",
      description: place.description || "",
      category: normalizeCategory(place.category) || "historical",
      city: place.city || "",
      district: place.district || "",
      province: place.province || "",
      address: place.address || place.location?.address || "",
      latitude:
        place.latitude ||
        place.location?.coordinates?.[1] ||
        place.coordinates?.lat ||
        "",
      longitude:
        place.longitude ||
        place.location?.coordinates?.[0] ||
        place.coordinates?.lng ||
        "",
      entryFee: place.entryFee || "",
      openingHours: place.openingHours || "",
      bestTimeToVisit: place.bestTimeToVisit || "",
      images: imageText,
      status: getPlaceStatus(place),
      isFeatured: place.isFeatured || false,
    });

    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      if (!formData.name.trim()) {
        toast.error("Place name is required");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("Description is required");
        return;
      }

      const imageArray = formData.images
        .split(",")
        .map((image) => image.trim())
        .filter((image) => image !== "");

      const latitude = Number(formData.latitude) || 0;
      const longitude = Number(formData.longitude) || 0;

      const placePayload = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        address: formData.address,
        latitude,
        longitude,
        entryFee: Number(formData.entryFee) || 0,
        openingHours: formData.openingHours,
        bestTimeToVisit: formData.bestTimeToVisit,
        images: imageArray,
        image: imageArray[0] || "",
        status: formData.status,
        isActive: formData.status === "active",
        isFeatured: formData.isFeatured,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
          address: formData.address,
        },
      };

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
      loadPlaces();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save place");
    }
  }

  async function handleDeletePlace(place) {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${place.name}?`
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/places/${place._id}`, getAuthHeader());

      toast.success("Tourist place deleted successfully");
      loadPlaces();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete place");
    }
  }

  async function handleStatusChange(place, newStatus) {
    try {
      await axios.put(
        `${API_URL}/places/${place._id}`,
        {
          status: newStatus,
          isActive: newStatus === "active",
        },
        getAuthHeader()
      );

      toast.success("Place status updated");
      loadPlaces();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  }

  const totalPlaces = places.length;
  const activePlaces = places.filter((place) => getPlaceStatus(place) === "active").length;
  const inactivePlaces = places.filter(
    (place) => getPlaceStatus(place) === "inactive"
  ).length;
  const featuredPlaces = places.filter((place) => place.isFeatured).length;

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
            onClick={loadPlaces}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={openAddForm}
            className="flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
          >
            <FaPlus />
            Add Place
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <PlaceStatCard
          title="Total Places"
          value={totalPlaces}
          icon={<FaMapMarkedAlt />}
          color="bg-blue-600"
        />

        <PlaceStatCard
          title="Active Places"
          value={activePlaces}
          icon={<FaMapMarkedAlt />}
          color="bg-green-600"
        />

        <PlaceStatCard
          title="Inactive Places"
          value={inactivePlaces}
          icon={<FaMapMarkedAlt />}
          color="bg-red-600"
        />

        <PlaceStatCard
          title="Featured Places"
          value={featuredPlaces}
          icon={<FaStar />}
          color="bg-orange"
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
                Enter tourist place details, location, images and visiting
                information.
              </p>
            </div>

            <button
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
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Sigiriya Rock Fortress"
                required
              />

              <SelectField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                options={CATEGORY_OPTIONS}
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Example: Dambulla"
              />

              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Example: Matale"
              />

              <InputField
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Example: Central Province"
              />

              <InputField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Full address"
              />

              <InputField
                label="Latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="Example: 7.9570"
              />

              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Example: 80.7603"
              />

              <InputField
                label="Entry Fee"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleInputChange}
                placeholder="Example: 5000"
              />

              <InputField
                label="Opening Hours"
                name="openingHours"
                value={formData.openingHours}
                onChange={handleInputChange}
                placeholder="Example: 7.00 AM - 5.30 PM"
              />

              <InputField
                label="Best Time to Visit"
                name="bestTimeToVisit"
                value={formData.bestTimeToVisit}
                onChange={handleInputChange}
                placeholder="Example: Morning / December to April"
              />

              <SelectField
                label="Status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Image URLs
                </label>

                <input
                  type="text"
                  name="images"
                  value={formData.images}
                  onChange={handleInputChange}
                  placeholder="Paste image URLs separated by commas"
                  className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
                />

                <p className="text-xs text-gray-400 mt-1">
                  Example: https://example.com/image1.jpg, https://example.com/image2.jpg
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleInputChange}
                    className="w-4 h-4 accent-accent"
                  />
                  Mark as Featured Place
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write place description"
                  rows="4"
                  required
                  className="w-full border border-gray-300 rounded-lg px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
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
              placeholder="Search by name, city, district or category"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Categories</option>
            {CATEGORY_OPTIONS.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Places</option>
            <option value="inactive">Inactive Places</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                  <th className="py-[12px]">Entry Fee</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPlaces.map((place) => {
                  const firstImage = getPlaceImage(place);
                  const status = getPlaceStatus(place);

                  return (
                    <tr key={place._id || place.id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          {firstImage ? (
                            <img
                              src={firstImage}
                              alt={place.name}
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

                            {place.isFeatured && (
                              <p className="text-xs text-orange font-semibold mt-1">
                                Featured
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600 capitalize">
                        {getCategoryLabel(place.category)}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <p>{place.city || "Not added"}</p>

                        <p className="text-xs text-gray-400">
                          {place.district || place.province || ""}
                        </p>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        Rs. {place.entryFee || 0}
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <div className="flex items-center gap-[5px]">
                          <FaStar className="text-orange" />
                          {place.averageRating || place.rating || 0}
                        </div>
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={status}
                          onChange={(e) =>
                            handleStatusChange(place, e.target.value)
                          }
                          className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                            status === "inactive"
                              ? "bg-red-600"
                              : "bg-green-600"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            onClick={() => openEditForm(place)}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                            title="Edit Place"
                          >
                            <FaEdit />
                          </button>

                          <button
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
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      >
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
  if (!category) return "other";
  return String(category).toLowerCase();
}

function getCategoryLabel(category) {
  const normalized = normalizeCategory(category);
  const found = CATEGORY_OPTIONS.find((item) => item.value === normalized);
  return found ? found.label : "Other";
}

function getPlaceStatus(place) {
  if (place.status) return place.status;
  if (place.isActive === false) return "inactive";
  return "active";
}

function getPlaceImage(place) {
  const image =
    place.images?.[0] ||
    place.image ||
    place.imageUrl ||
    place.photo ||
    place.thumbnail;

  if (!image) return "";

  if (image.startsWith("http")) return image;

  if (image.startsWith("/")) {
    return `${API_BASE_URL}${image}`;
  }

  return `${API_BASE_URL}/${image}`;
}