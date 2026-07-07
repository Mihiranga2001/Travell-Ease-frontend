import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCar,
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

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    model: "",
    vehicleType: "car",
    companyName: "",
    email: "",
    phoneNumber: "",
    city: "",
    district: "",
    province: "",
    address: "",
    latitude: "",
    longitude: "",
    pricePerDay: "",
    seats: "",
    fuelType: "petrol",
    transmission: "manual",
    description: "",
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

  async function loadVehicles() {
    try {
      setLoading(true);

      let response;

      try {
        response = await axios.get(
          `${API_URL}/vehicles/admin/all`,
          getAuthHeader()
        );
      } catch {
        response = await axios.get(`${API_URL}/vehicles`, getAuthHeader());
      }

      const vehicleList = Array.isArray(response.data)
        ? response.data
        : response.data.vehicles || response.data.data || [];

      setVehicles(vehicleList);
      setFilteredVehicles(vehicleList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVehicles();
  }, []);

  useEffect(() => {
    let result = [...vehicles];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (vehicle) =>
          vehicle.name?.toLowerCase().includes(search) ||
          vehicle.vehicleName?.toLowerCase().includes(search) ||
          vehicle.brand?.toLowerCase().includes(search) ||
          vehicle.model?.toLowerCase().includes(search) ||
          vehicle.companyName?.toLowerCase().includes(search) ||
          vehicle.city?.toLowerCase().includes(search) ||
          vehicle.district?.toLowerCase().includes(search)
      );
    }

    if (typeFilter !== "all") {
      result = result.filter(
        (vehicle) =>
          vehicle.vehicleType === typeFilter || vehicle.type === typeFilter
      );
    }

    if (approvalFilter !== "all") {
      if (approvalFilter === "approved") {
        result = result.filter((vehicle) => vehicle.isApproved === true);
      }

      if (approvalFilter === "pending") {
        result = result.filter((vehicle) => vehicle.isApproved === false);
      }
    }

    if (statusFilter !== "all") {
      result = result.filter((vehicle) => {
        const status = vehicle.status || "active";
        return status === statusFilter;
      });
    }

    setFilteredVehicles(result);
  }, [searchText, typeFilter, approvalFilter, statusFilter, vehicles]);

  function resetForm() {
    setFormData({
      name: "",
      brand: "",
      model: "",
      vehicleType: "car",
      companyName: "",
      email: "",
      phoneNumber: "",
      city: "",
      district: "",
      province: "",
      address: "",
      latitude: "",
      longitude: "",
      pricePerDay: "",
      seats: "",
      fuelType: "petrol",
      transmission: "manual",
      description: "",
      images: "",
      status: "active",
      isApproved: false,
    });

    setEditingVehicle(null);
    setShowForm(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function openEditForm(vehicle) {
    setEditingVehicle(vehicle);

    setFormData({
      name: vehicle.name || vehicle.vehicleName || "",
      brand: vehicle.brand || "",
      model: vehicle.model || "",
      vehicleType: vehicle.vehicleType || vehicle.type || "car",
      companyName: vehicle.companyName || vehicle.owner?.name || "",
      email: vehicle.email || vehicle.contactEmail || "",
      phoneNumber: vehicle.phoneNumber || vehicle.contactNumber || "",
      city: vehicle.city || "",
      district: vehicle.district || "",
      province: vehicle.province || "",
      address: vehicle.address || vehicle.location?.address || "",
      latitude:
        vehicle.latitude ||
        vehicle.location?.coordinates?.[1] ||
        vehicle.coordinates?.lat ||
        "",
      longitude:
        vehicle.longitude ||
        vehicle.location?.coordinates?.[0] ||
        vehicle.coordinates?.lng ||
        "",
      pricePerDay: vehicle.pricePerDay || vehicle.price || "",
      seats: vehicle.seats || vehicle.capacity || "",
      fuelType: vehicle.fuelType || "petrol",
      transmission: vehicle.transmission || "manual",
      description: vehicle.description || "",
      images: Array.isArray(vehicle.images) ? vehicle.images.join(", ") : "",
      status: vehicle.status || "active",
      isApproved: vehicle.isApproved || false,
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
        toast.error("Vehicle name is required");
        return;
      }

      if (!formData.companyName.trim()) {
        toast.error("Company name is required");
        return;
      }

      if (!formData.city.trim()) {
        toast.error("City is required");
        return;
      }

      const vehiclePayload = {
        name: formData.name,
        vehicleName: formData.name,
        brand: formData.brand,
        model: formData.model,
        vehicleType: formData.vehicleType,
        type: formData.vehicleType,
        companyName: formData.companyName,
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
        pricePerDay: Number(formData.pricePerDay) || 0,
        price: Number(formData.pricePerDay) || 0,
        seats: Number(formData.seats) || 0,
        capacity: Number(formData.seats) || 0,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        description: formData.description,
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

      if (editingVehicle) {
        await axios.put(
          `${API_URL}/vehicles/${editingVehicle._id}`,
          vehiclePayload,
          getAuthHeader()
        );

        toast.success("Vehicle updated successfully");
      } else {
        await axios.post(`${API_URL}/vehicles`, vehiclePayload, getAuthHeader());

        toast.success("Vehicle added successfully");
      }

      resetForm();
      loadVehicles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to save vehicle");
    }
  }

  async function handleDeleteVehicle(vehicle) {
    try {
      const vehicleName =
        vehicle.name || vehicle.vehicleName || vehicle.model || "this vehicle";

      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${vehicleName}?`
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/vehicles/${vehicle._id}`, getAuthHeader());

      toast.success("Vehicle deleted successfully");
      loadVehicles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete vehicle");
    }
  }

  async function handleApprovalChange(vehicle, isApproved) {
    try {
      const endpoint = isApproved ? "approve" : "reject";

      try {
        await axios.put(
          `${API_URL}/vehicles/${vehicle._id}/${endpoint}`,
          {},
          getAuthHeader()
        );
      } catch {
        await axios.put(
          `${API_URL}/vehicles/${vehicle._id}`,
          {
            isApproved,
            approvalStatus: isApproved ? "approved" : "rejected",
          },
          getAuthHeader()
        );
      }

      toast.success(isApproved ? "Vehicle approved" : "Vehicle rejected");
      loadVehicles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update approval");
    }
  }

  async function handleStatusChange(vehicle, newStatus) {
    try {
      await axios.put(
        `${API_URL}/vehicles/${vehicle._id}`,
        {
          status: newStatus,
          isActive: newStatus === "active",
        },
        getAuthHeader()
      );

      toast.success("Vehicle status updated");
      loadVehicles();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update status");
    }
  }

  const totalVehicles = vehicles.length;
  const approvedVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved === true
  ).length;
  const pendingVehicles = vehicles.filter(
    (vehicle) => vehicle.isApproved === false
  ).length;
  const activeVehicles = vehicles.filter(
    (vehicle) => (vehicle.status || "active") === "active"
  ).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">
            Vehicles Management
          </h1>
          <p className="text-gray-500 mt-[5px]">
            Add, update, approve, reject and manage vehicle rentals on Travel
            Ease.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={loadVehicles}
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
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <VehicleStatCard
          title="Total Vehicles"
          value={totalVehicles}
          icon={<FaCar />}
          color="bg-blue-600"
        />

        <VehicleStatCard
          title="Approved Vehicles"
          value={approvedVehicles}
          icon={<FaCheckCircle />}
          color="bg-green-600"
        />

        <VehicleStatCard
          title="Pending Vehicles"
          value={pendingVehicles}
          icon={<FaTimesCircle />}
          color="bg-orange"
        />

        <VehicleStatCard
          title="Active Vehicles"
          value={activeVehicles}
          icon={<FaCar />}
          color="bg-purple-600"
        />
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex justify-between items-center mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {editingVehicle ? "Update Vehicle" : "Add New Vehicle"}
              </h2>
              <p className="text-sm text-gray-500">
                Enter vehicle, rental company, price, location and image
                details.
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
                label="Vehicle Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Example: Toyota KDH Van"
              />

              <SelectField
                label="Vehicle Type"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleInputChange}
                options={[
                  { value: "bike", label: "Bike" },
                  { value: "car", label: "Car" },
                  { value: "van", label: "Van" },
                  { value: "suv", label: "SUV" },
                  { value: "bus", label: "Bus" },
                  { value: "tuk", label: "Tuk Tuk" },
                  { value: "other", label: "Other" },
                ]}
              />

              <InputField
                label="Brand"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Example: Toyota"
              />

              <InputField
                label="Model"
                name="model"
                value={formData.model}
                onChange={handleInputChange}
                placeholder="Example: KDH"
              />

              <InputField
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Example: Travel Rent Lanka"
              />

              <InputField
                label="Email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="company@example.com"
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
                placeholder="Example: Colombo"
              />

              <InputField
                label="District"
                name="district"
                value={formData.district}
                onChange={handleInputChange}
                placeholder="Example: Colombo"
              />

              <InputField
                label="Province"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                placeholder="Example: Western Province"
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
                placeholder="Example: 6.9271"
              />

              <InputField
                label="Longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Example: 79.8612"
              />

              <InputField
                label="Price Per Day"
                name="pricePerDay"
                value={formData.pricePerDay}
                onChange={handleInputChange}
                placeholder="Example: 15000"
              />

              <InputField
                label="Seats"
                name="seats"
                value={formData.seats}
                onChange={handleInputChange}
                placeholder="Example: 4"
              />

              <SelectField
                label="Fuel Type"
                name="fuelType"
                value={formData.fuelType}
                onChange={handleInputChange}
                options={[
                  { value: "petrol", label: "Petrol" },
                  { value: "diesel", label: "Diesel" },
                  { value: "hybrid", label: "Hybrid" },
                  { value: "electric", label: "Electric" },
                ]}
              />

              <SelectField
                label="Transmission"
                name="transmission"
                value={formData.transmission}
                onChange={handleInputChange}
                options={[
                  { value: "manual", label: "Manual" },
                  { value: "automatic", label: "Automatic" },
                ]}
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
                  placeholder="Write vehicle description"
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
                {editingVehicle ? "Update Vehicle" : "Save Vehicle"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by vehicle, company, city"
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
            <option value="all">All Vehicle Types</option>
            <option value="bike">Bike</option>
            <option value="car">Car</option>
            <option value="van">Van</option>
            <option value="suv">SUV</option>
            <option value="bus">Bus</option>
            <option value="tuk">Tuk Tuk</option>
            <option value="other">Other</option>
          </select>

          <select
            value={approvalFilter}
            onChange={(e) => setApprovalFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Approval Status</option>
            <option value="approved">Approved Vehicles</option>
            <option value="pending">Pending Vehicles</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Vehicles</option>
            <option value="inactive">Inactive Vehicles</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Vehicles</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredVehicles.length} vehicle(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading vehicles...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1150px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">Vehicle</th>
                  <th className="py-[12px]">Company</th>
                  <th className="py-[12px]">Type</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Price</th>
                  <th className="py-[12px]">Rating</th>
                  <th className="py-[12px]">Approval</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredVehicles.map((vehicle) => (
                  <tr key={vehicle._id} className="border-b text-sm">
                    <td className="py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        {vehicle.images?.[0] ? (
                          <img
                            src={vehicle.images[0]}
                            alt={vehicle.name || vehicle.vehicleName}
                            className="w-[65px] h-[48px] rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-[65px] h-[48px] rounded-lg bg-gray-100 border flex items-center justify-center text-gray-400">
                            <FaImage />
                          </div>
                        )}

                        <div>
                          <p className="font-bold text-gray-800">
                            {vehicle.name || vehicle.vehicleName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {vehicle.brand || ""} {vehicle.model || ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{vehicle.companyName || vehicle.owner?.name || "Not added"}</p>
                      <p className="text-xs text-gray-400">
                        {vehicle.phoneNumber || vehicle.contactNumber || ""}
                      </p>
                    </td>

                    <td className="py-[14px] text-gray-600 capitalize">
                      {vehicle.vehicleType || vehicle.type || "car"}
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{vehicle.city || "Not added"}</p>
                      <p className="text-xs text-gray-400">
                        {vehicle.district || vehicle.province || ""}
                      </p>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      Rs. {vehicle.pricePerDay || vehicle.price || 0} / day
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <div className="flex items-center gap-[5px]">
                        <FaStar className="text-orange" />
                        {vehicle.averageRating || vehicle.rating || 0}
                      </div>
                    </td>

                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          vehicle.isApproved ? "bg-green-600" : "bg-orange"
                        }`}
                      >
                        {vehicle.isApproved ? "Approved" : "Pending"}
                      </span>
                    </td>

                    <td className="py-[14px]">
                      <select
                        value={
                          vehicle.status ||
                          (vehicle.isActive === false ? "inactive" : "active")
                        }
                        onChange={(e) =>
                          handleStatusChange(vehicle, e.target.value)
                        }
                        className={`px-[10px] py-[6px] rounded-lg text-xs text-white border-none outline-none ${
                          vehicle.status === "inactive" ||
                          vehicle.isActive === false
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
                        {!vehicle.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(vehicle, true)}
                            className="w-[35px] h-[35px] rounded-lg bg-green-600 hover:bg-green-700 flex items-center justify-center text-white"
                            title="Approve Vehicle"
                          >
                            <FaCheckCircle />
                          </button>
                        )}

                        {vehicle.isApproved && (
                          <button
                            onClick={() => handleApprovalChange(vehicle, false)}
                            className="w-[35px] h-[35px] rounded-lg bg-orange hover:bg-orange/80 flex items-center justify-center text-white"
                            title="Reject Vehicle"
                          >
                            <FaTimesCircle />
                          </button>
                        )}

                        <button
                          onClick={() => openEditForm(vehicle)}
                          className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                          title="Edit Vehicle"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDeleteVehicle(vehicle)}
                          className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                          title="Delete Vehicle"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredVehicles.length === 0 && (
                  <tr>
                    <td
                      colSpan="9"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No vehicles found
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

function VehicleStatCard({ title, value, icon, color }) {
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