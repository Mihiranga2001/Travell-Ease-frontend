import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUserTie,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaStar,
  FaImage,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminTravelGuidesPage() {
  const [guides, setGuides] = useState([]);
  const [filteredGuides, setFilteredGuides] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    languages: "",
    experienceYears: "",
    pricePerDay: "",
    city: "",
    district: "",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    bio: "",
    specializations: "",
    images: "",
    status: "active",
    isApproved: false,
  });

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadGuides() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(`${API_URL}/guides/admin/all`, getAuthHeader());
      } catch {
        response = await axios.get(`${API_URL}/guides`, getAuthHeader());
      }

      const guideList = Array.isArray(response.data)
        ? response.data
        : response.data.guides || response.data.data || [];

      setGuides(guideList);
      setFilteredGuides(guideList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load travel guides");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadGuides();
  }, []);

  useEffect(() => {
    let result = [...guides];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (guide) =>
          guide.name?.toLowerCase().includes(search) ||
          guide.email?.toLowerCase().includes(search) ||
          guide.city?.toLowerCase().includes(search) ||
          guide.district?.toLowerCase().includes(search) ||
          guide.languages?.some((language) =>
            language.toLowerCase().includes(search)
          )
      );
    }

    if (languageFilter !== "all") {
      result = result.filter((guide) =>
        guide.languages?.map((language) => language.toLowerCase()).includes(languageFilter)
      );
    }

    if (approvalFilter !== "all") {
      if (approvalFilter === "approved") {
        result = result.filter((guide) => guide.isApproved === true);
      }

      if (approvalFilter === "pending") {
        result = result.filter((guide) => guide.isApproved === false);
      }
    }

    if (statusFilter !== "all") {
      result = result.filter((guide) => {
        const status = guide.status || "active";
        return status === statusFilter;
      });
    }

    setFilteredGuides(result);
  }, [searchText, languageFilter, approvalFilter, statusFilter, guides]);

  function resetForm() {
    setFormData({
      name: "",
      email: "",
      phoneNumber: "",
      languages: "",
      experienceYears: "",
      pricePerDay: "",
      city: "",
      district: "",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      bio: "",
      specializations: "",
      images: "",
      status: "active",
      isApproved: false,
    });

    setEditingGuide(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(guide) {
    setEditingGuide(guide);

    setFormData({
      name: guide.name || "",
      email: guide.email || "",
      phoneNumber: guide.phoneNumber || guide.contactNumber || "",
      languages: Array.isArray(guide.languages) ? guide.languages.join(", ") : "",
      experienceYears: guide.experienceYears || guide.experience || "",
      pricePerDay: guide.pricePerDay || guide.price || "",
      city: guide.city || "",
      district: guide.district || "",
      province: guide.province || "",
      address: guide.address || guide.location?.address || "",
      latitude:
        guide.latitude ||
        guide.location?.coordinates?.[1] ||
        guide.coordinates?.lat ||
        "",
      longitude:
        guide.longitude ||
        guide.location?.coordinates?.[0] ||
        guide.coordinates?.lng ||
        "",
      bio: guide.bio || guide.description || "",
      specializations: Array.isArray(guide.specializations)
        ? guide.specializations.join(", ")
        : "",
      images: Array.isArray(guide.images) ? guide.images.join(", ") : "",
      status: guide.status || "active",
      isApproved: guide.isApproved || false,
    });

    setShowForm(true);
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
        toast.error("Guide name is required");
        return;
      }

      if (!formData.email.trim()) {
        toast.error("Email is required");
        return;
      }

      if (!formData.city.trim()) {
        toast.error("City is required");
        return;
      }

      const guidePayload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        contactNumber: formData.phoneNumber,
        languages: formData.languages
          .split(",")
          .map((language) => language.trim())
          .filter((language) => language !== ""),
        experienceYears: Number(formData.experienceYears) || 0,
        experience: Number(formData.experienceYears) || 0,
        pricePerDay: Number(formData.pricePerDay) || 0,
        price: Number(formData.pricePerDay) || 0,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        address: formData.address,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        bio: formData.bio,
        description: formData.bio,
        specializations: formData.specializations
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== ""),
        images: formData.images
          .split(",")
          .map((image) => image.trim())
          .filter((image) => image !== ""),
        status: formData.status,
        isApproved: formData.isApproved,
        location: {
          type: "Point",
          coordinates: [
            Number(formData.longitude) || 0,
            Number(formData.latitude) || 0,
          ],
          address: formData.address,
        },
      };

      if (editingGuide) {
        await axios.put(
          `${API_URL}/guides/${editingGuide._id}`,
          guidePayload,
          getAuthHeader()
        );

        toast.success("Travel guide updated successfully");
      } else {
        await axios.post(`${API_URL}/guides`, guidePayload, getAuthHeader());

        toast.success("Travel guide added successfully");
      }

      resetForm();
      loadGuides();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save travel guide");
    }
  }

  async function handleDeleteGuide(guide) {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${guide.name || "this travel guide"}?`
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/guides/${guide._id}`, getAuthHeader());

      toast.success("Travel guide deleted successfully");
      loadGuides();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete travel guide");
    }
  }

  async function handleApprovalChange(guide, isApproved) {
    try {
      const endpoint = isApproved ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/guides/${guide._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}/guides/${guide._id}`,
          {
            isApproved,
            approvalStatus: isApproved ? "approved" : "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(isApproved ? "Travel guide approved" : "Travel guide rejected");
      loadGuides();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update approval");
    }
  }

  async function handleStatusChange(guide, newStatus) {
    try {
      await axios.put(
        `${API_URL}/guides/${guide._id}`,
        {
          status: newStatus,
          isActive: newStatus === "active",
        },
        getAuthHeader()
      );

      toast.success("Guide status updated");
      loadGuides();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  }

  const totalGuides = guides.length;
  const approvedGuides = guides.filter((guide) => guide.isApproved === true).length;
  const pendingGuides = guides.filter((guide) => guide.isApproved === false).length;
  const activeGuides = guides.filter(
    (guide) => (guide.status || "active") === "active"
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Travel Guides Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Add, update, approve, reject and manage travel guide profiles on Travel Ease.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={loadGuides}
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
            Add Guide
          </button>
        </div>
      </div>

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
          title="Active Guides"
          value={activeGuides}
          icon={<FaUserTie />}
          color="bg-purple-600"
        />
      </div>

      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingGuide ? "Update Travel Guide" : "Add New Travel Guide"}
              </h2>
              <p className="text-sm text-gray-500">
                Enter guide profile, languages, experience, price and location details.
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
                label="Guide Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Nimal Fernando"
              />

              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="guide@example.com"
              />

              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="0771234567"
              />

              <InputField
                label="Languages"
                name="languages"
                value={formData.languages}
                onChange={handleInputChange}
                placeholder="Sinhala, English, Tamil"
              />

              <InputField
                label="Experience Years"
                name="experienceYears"
                value={formData.experienceYears}
                onChange={handleInputChange}
                placeholder="Example: 5"
              />

              <InputField
                label="Price Per Day"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                placeholder="Example: 8000"
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Example: Kandy"
              />

              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Example: Kandy"
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
                placeholder="Example: 7.2906"
              />

              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Example: 80.6337"
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

              <div className="flex items-center gap-[10px] mt-[28px]">
                <input
                  type="checkbox"
                  name="isApproved"
                  checked={formData.isApproved}
                  onChange={handleInputChange}
                  className="w-[18px] h-[18px]"
                />
                <label className="text-sm font-semibold text-gray-700">
                  Admin Approved
                </label>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Specializations
                </label>
                <input
                  type="text"
                  name="specializations"
                  value={formData.specializations}
                  onChange={handleInputChange}
                  placeholder="Historical Tours, Wildlife, Hiking, Cultural Tours"
                  className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

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
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
                  Guide Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Write travel guide bio"
                  rows="4"
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
                {editingGuide ? "Update Guide" : "Save Guide"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, language, city"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Languages</option>
            <option value="sinhala">Sinhala</option>
            <option value="english">English</option>
            <option value="tamil">Tamil</option>
            <option value="arabic">Arabic</option>
            <option value="french">French</option>
            <option value="german">German</option>
            <option value="chinese">Chinese</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved Guides</option>
            <option value="pending">Pending Guides</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Guides</option>
            <option value="inactive">Inactive Guides</option>
          </select>
        </div>
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Travel Guides</h2>
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
            <table className="w-full text-left min-w-[1150px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Guide</th>
                  <th className="py-[12px]">Languages</th>
                  <th className="py-[12px]">Experience</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Price</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredGuides.map((guide) => (
                  <tr key={guide._id} className="border-b text-sm">
                    <td className="py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        {guide.images?.[0] ? (
                          <img
                            src={guide.images[0]}
                            alt={guide.name}
                            className="w-[55px] h-[55px] rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-[55px] h-[55px] rounded-full bg-gray-100 border flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-gray-800">
                            {guide.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {guide.email || "No email"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {guide.phoneNumber || guide.contactNumber || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      {guide.languages?.length > 0
                        ? guide.languages.join(", ")
                        : "Not added"}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      {guide.experienceYears || guide.experience || 0} years
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{guide.city || "Not added"}</p>
                      <p className="text-xs text-gray-400">
                        {guide.district || guide.province || ""}
                      </p>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      Rs. {guide.pricePerDay || guide.price || 0} / day
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <div className="flex items-center gap-[5px]">
                        <FaStar className="text-orange" />
                        {guide.averageRating || guide.rating || 0}
                      </div>
                    </td>

                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          guide.isApproved ? "bg-green-600" : "bg-orange"
                        }`}
                      >
                        {guide.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="py-[14px]">
                      <select
                        value={
                          guide.status ||
                          (guide.isActive === false ? "inactive" : "active")
                        }
                        onChange={(e) => handleStatusChange(guide, e.target.value)}
                        className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                          guide.status === "inactive" ||
                          guide.isActive === false
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
                        {!guide.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(guide, true)}
                            className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                            title="Approve Guide"
                          >
                            <FaCheckCircle />
                          </button>
                        )}

                        {guide.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(guide, false)}
                            className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                            title="Reject Guide"
                          >
                            <FaTimesCircle />
                          </button>
                        )}

                        <button
                          onClick={() => openEditForm(guide)}
                          className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                          title="Edit Guide"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDeleteGuide(guide)}
                          className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                          title="Delete Guide"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredGuides.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[30px] text-center text-gray-500"
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
    </div>
  );
}

function GuideStatCard({ title, value, icon, color }) {
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

function InputField({ label, name, value, onChange, placeholder }) {
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