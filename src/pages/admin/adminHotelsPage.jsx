import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaHotel,
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

export default function AdminHotelsPage() {
  const [hotels, setHotels] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    ownerName: "",
    email: "",
    phoneNumber: "",
    city: "",
    district: "",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    pricePerNight: "",
    roomsAvailable: "",
    amenities: "",
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

  async function loadHotels() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(`${API_URL}/hotels/admin/all`, getAuthHeader());
      } catch {
        response = await axios.get(`${API_URL}/hotels`, getAuthHeader());
      }

      const hotelList = Array.isArray(response.data)
        ? response.data
        : response.data.hotels || response.data.data || [];

      setHotels(hotelList);
      setFilteredHotels(hotelList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load hotels");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHotels();
  }, []);

  useEffect(() => {
    let result = [...hotels];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (hotel) =>
          hotel.name?.toLowerCase().includes(search) ||
          hotel.hotelName?.toLowerCase().includes(search) ||
          hotel.city?.toLowerCase().includes(search) ||
          hotel.district?.toLowerCase().includes(search) ||
          hotel.ownerName?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((hotel) => {
        const status = hotel.status || "active";
        return status === statusFilter;
      });
    }

    if (approvalFilter !== "all") {
      if (approvalFilter === "approved") {
        result = result.filter((hotel) => hotel.isApproved === true);
      }

      if (approvalFilter === "pending") {
        result = result.filter((hotel) => hotel.isApproved === false);
      }
    }

    setFilteredHotels(result);
  }, [searchText, statusFilter, approvalFilter, hotels]);

  function resetForm() {
    setFormData({
      name: "",
      description: "",
      ownerName: "",
      email: "",
      phoneNumber: "",
      city: "",
      district: "",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      pricePerNight: "",
      roomsAvailable: "",
      amenities: "",
      images: "",
      status: "active",
      isApproved: false,
    });

    setEditingHotel(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(hotel) {
    setEditingHotel(hotel);

    setFormData({
      name: hotel.name || hotel.hotelName || "",
      description: hotel.description || "",
      ownerName: hotel.ownerName || hotel.owner?.name || "",
      email: hotel.email || hotel.contactEmail || "",
      phoneNumber: hotel.phoneNumber || hotel.contactNumber || "",
      city: hotel.city || "",
      district: hotel.district || "",
      province: hotel.province || "",
      address: hotel.address || hotel.location?.address || "",
      latitude:
        hotel.latitude ||
        hotel.location?.coordinates?.[1] ||
        hotel.coordinates?.lat ||
        "",
      longitude:
        hotel.longitude ||
        hotel.location?.coordinates?.[0] ||
        hotel.coordinates?.lng ||
        "",
      pricePerNight: hotel.pricePerNight || hotel.price || "",
      roomsAvailable: hotel.roomsAvailable || hotel.availableRooms || "",
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities.join(", ") : "",
      images: Array.isArray(hotel.images) ? hotel.images.join(", ") : "",
      status: hotel.status || "active",
      isApproved: hotel.isApproved || false,
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
        toast.error("Hotel name is required");
        return;
      }

      if (!formData.description.trim()) {
        toast.error("Description is required");
        return;
      }

      if (!formData.city.trim()) {
        toast.error("City is required");
        return;
      }

      const hotelPayload = {
        name: formData.name,
        hotelName: formData.name,
        description: formData.description,
        ownerName: formData.ownerName,
        email: formData.email,
        contactEmail: formData.email,
        phoneNumber: formData.phoneNumber,
        contactNumber: formData.phoneNumber,
        city: formData.city,
        district: formData.district,
        province: formData.province,
        address: formData.address,
        latitude: Number(formData.latitude) || 0,
        longitude: Number(formData.longitude) || 0,
        pricePerNight: Number(formData.pricePerNight) || 0,
        price: Number(formData.pricePerNight) || 0,
        roomsAvailable: Number(formData.roomsAvailable) || 0,
        availableRooms: Number(formData.roomsAvailable) || 0,
        amenities: formData.amenities
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

      if (editingHotel) {
        await axios.put(
          `${API_URL}/hotels/${editingHotel._id}`,
          hotelPayload,
          getAuthHeader()
        );

        toast.success("Hotel updated successfully");
      } else {
        await axios.post(`${API_URL}/hotels`, hotelPayload, getAuthHeader());

        toast.success("Hotel added successfully");
      }

      resetForm();
      loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save hotel");
    }
  }

  async function handleDeleteHotel(hotel) {
    try {
      const hotelName = hotel.name || hotel.hotelName || "this hotel";

      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${hotelName}?`
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/hotels/${hotel._id}`, getAuthHeader());

      toast.success("Hotel deleted successfully");
      loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete hotel");
    }
  }

  async function handleApprovalChange(hotel, isApproved) {
    try {
      const endpoint = isApproved ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/hotels/${hotel._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}/hotels/${hotel._id}`,
          {
            isApproved,
            approvalStatus: isApproved ? "approved" : "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(isApproved ? "Hotel approved" : "Hotel rejected");
      loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update approval");
    }
  }

  async function handleStatusChange(hotel, newStatus) {
    try {
      await axios.put(
        `${API_URL}/hotels/${hotel._id}`,
        {
          status: newStatus,
          isActive: newStatus === "active",
        },
        getAuthHeader()
      );

      toast.success("Hotel status updated");
      loadHotels();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  }

  const totalHotels = hotels.length;
  const approvedHotels = hotels.filter((hotel) => hotel.isApproved === true).length;
  const pendingHotels = hotels.filter((hotel) => hotel.isApproved === false).length;
  const activeHotels = hotels.filter(
    (hotel) => (hotel.status || "active") === "active"
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Hotels Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Add, update, approve, reject and manage hotels listed on Travel Ease.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={loadHotels}
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
            Add Hotel
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <HotelStatCard
          title="Total Hotels"
          value={totalHotels}
          icon={<FaHotel />}
          color="bg-blue-600"
        />

        <HotelStatCard
          title="Approved Hotels"
          value={approvedHotels}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <HotelStatCard
          title="Pending Hotels"
          value={pendingHotels}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <HotelStatCard
          title="Active Hotels"
          value={activeHotels}
          icon={<FaHotel />}
          color="bg-purple-600"
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingHotel ? "Update Hotel" : "Add New Hotel"}
              </h2>
              <p className="text-sm text-gray-500">
                Enter hotel details, owner details, location, price and images.
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
                label="Hotel Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Ocean View Hotel"
              />

              <InputField
                label="Owner Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleInputChange}
                placeholder="Example: Kasun Perera"
              />

              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="hotel@example.com"
              />

              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="0771234567"
              />

              <InputField
                label="City"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Example: Galle"
              />

              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Example: Galle"
              />

              <InputField
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Example: Southern Province"
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
                placeholder="Example: 6.0329"
              />

              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Example: 80.2168"
              />

              <InputField
                label="Price Per Night"
                name="pricePerNight"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                placeholder="Example: 12000"
              />

              <InputField
                label="Rooms Available"
                name="roomsAvailable"
                value={formData.roomsAvailable}
                onChange={handleInputChange}
                placeholder="Example: 10"
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
                  Amenities
                </label>
                <input
                  type="text"
                  name="amenities"
                  value={formData.amenities}
                  onChange={handleInputChange}
                  placeholder="WiFi, Pool, Parking, Restaurant"
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
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Write hotel description"
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
                {editingHotel ? "Update Hotel" : "Save Hotel"}
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
              placeholder="Search by hotel name, owner, city or district"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved Hotels</option>
            <option value="pending">Pending Hotels</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Hotels</option>
            <option value="inactive">Inactive Hotels</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Hotels</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredHotels.length} hotel(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading hotels...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1100px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Hotel</th>
                  <th className="py-[12px]">Owner</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Price</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel._id} className="border-b text-sm">
                    <td className="py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        {hotel.images?.[0] ? (
                          <img
                            src={hotel.images[0]}
                            alt={hotel.name || hotel.hotelName}
                            className="w-[65px] h-[48px] rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-[65px] h-[48px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-gray-800">
                            {hotel.name || hotel.hotelName}
                          </p>
                          <p className="text-xs text-gray-400 line-clamp-1 max-w-[260px]">
                            {hotel.description || "No description"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{hotel.ownerName || hotel.owner?.name || "Not added"}</p>
                      <p className="text-xs text-gray-400">
                        {hotel.phoneNumber || hotel.contactNumber || ""}
                      </p>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{hotel.city || "Not added"}</p>
                      <p className="text-xs text-gray-400">
                        {hotel.district || hotel.province || ""}
                      </p>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      Rs. {hotel.pricePerNight || hotel.price || 0}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <div className="flex items-center gap-[5px]">
                        <FaStar className="text-orange" />
                        {hotel.averageRating || hotel.rating || 0}
                      </div>
                    </td>

                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          hotel.isApproved ? "bg-green-600" : "bg-orange"
                        }`}
                      >
                        {hotel.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="py-[14px]">
                      <select
                        value={
                          hotel.status ||
                          (hotel.isActive === false ? "inactive" : "active")
                        }
                        onChange={(e) => handleStatusChange(hotel, e.target.value)}
                        className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                          hotel.status === "inactive" ||
                          hotel.isActive === false
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
                        {!hotel.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(hotel, true)}
                            className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                            title="Approve Hotel"
                          >
                            <FaCheckCircle />
                          </button>
                        )}

                        {hotel.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(hotel, false)}
                            className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                            title="Reject Hotel"
                          >
                            <FaTimesCircle />
                          </button>
                        )}

                        <button
                          onClick={() => openEditForm(hotel)}
                          className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                          title="Edit Hotel"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDeleteHotel(hotel)}
                          className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                          title="Delete Hotel"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredHotels.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No hotels found
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

function HotelStatCard({ title, value, icon, color }) {
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