import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserCheck,
  FaUserEdit,
  FaUserSlash,
  FaTrash,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

const USER_ROLES = [
  { value: "traveler", label: "Traveler" },
  { value: "hotel_owner", label: "Hotel Owner" },
  { value: "vehicle_company", label: "Vehicle Company" },
  { value: "guide", label: "Travel Guide" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState("");
  const [deletingUserId, setDeletingUserId] = useState("");

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Separate state variables matching User.js
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("traveler");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [profilePhoto, setProfilePhoto] = useState("");
  const [bio, setBio] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [interests, setInterests] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  function getErrorMessage(error, fallbackMessage) {
    const responseData = error?.response?.data;

    if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
      return responseData.errors
        .map((item) => item.message || item.msg)
        .filter(Boolean)
        .join(", ");
    }

    return (
      responseData?.message ||
      responseData?.error ||
      error?.message ||
      fallbackMessage
    );
  }

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/users`,
        getAuthHeader()
      );

      const userList = Array.isArray(response.data)
        ? response.data
        : response.data?.users || response.data?.data || [];

      setUsers(userList);
    } catch (error) {
      console.error("Load users error:", error);
      setUsers([]);
      toast.error(getErrorMessage(error, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const interestsText = Array.isArray(user.interests)
        ? user.interests.join(" ")
        : "";

      const matchesSearch =
        search === "" ||
        String(user.name || "").toLowerCase().includes(search) ||
        String(user.email || "").toLowerCase().includes(search) ||
        String(user.phoneNumber || "").toLowerCase().includes(search) ||
        String(user.bio || "").toLowerCase().includes(search) ||
        interestsText.toLowerCase().includes(search);

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.isBlocked !== true) ||
        (statusFilter === "blocked" && user.isBlocked === true);

      const matchesVerification =
        verificationFilter === "all" ||
        (verificationFilter === "verified" && user.isVerified === true) ||
        (verificationFilter === "unverified" && user.isVerified !== true);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus &&
        matchesVerification
      );
    });
  }, [
    users,
    searchText,
    roleFilter,
    statusFilter,
    verificationFilter,
  ]);

  function resetEditForm() {
    setName("");
    setEmail("");
    setRole("traveler");
    setPhoneNumber("");
    setProfilePhoto("");
    setBio("");
    setLatitude("");
    setLongitude("");
    setInterests([]);
    setIsVerified(false);
    setIsBlocked(false);
    setEditingUser(null);
    setShowEditForm(false);
  }

  function openEditForm(user) {
    setEditingUser(user);
    setName(user.name || "");
    setEmail(user.email || "");
    setRole(user.role || "traveler");
    setPhoneNumber(user.phoneNumber || "");
    setProfilePhoto(user.profilePhoto || "");
    setBio(user.bio || "");
    setLatitude(user.location?.latitude ?? "");
    setLongitude(user.location?.longitude ?? "");
    setInterests(Array.isArray(user.interests) ? user.interests : []);
    setIsVerified(user.isVerified === true);
    setIsBlocked(user.isBlocked === true);
    setShowEditForm(true);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleInterestsChange(event) {
    setInterests(
      event.target.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    );
  }

  function validateEditForm() {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const latitudeNumber = Number(latitude);
    const longitudeNumber = Number(longitude);

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast.error("Name must contain between 2 and 100 characters");
      return null;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      toast.error("Enter a valid email address");
      return null;
    }

    if (!USER_ROLES.some((item) => item.value === role)) {
      toast.error("Select a valid user role");
      return null;
    }

    if (phoneNumber.trim().length > 30) {
      toast.error("Phone number cannot exceed 30 characters");
      return null;
    }

    if (bio.trim().length > 1000) {
      toast.error("Bio cannot exceed 1000 characters");
      return null;
    }

    if (
      latitude !== "" &&
      (!Number.isFinite(latitudeNumber) ||
        latitudeNumber < -90 ||
        latitudeNumber > 90)
    ) {
      toast.error("Latitude must be between -90 and 90");
      return null;
    }

    if (
      longitude !== "" &&
      (!Number.isFinite(longitudeNumber) ||
        longitudeNumber < -180 ||
        longitudeNumber > 180)
    ) {
      toast.error("Longitude must be between -180 and 180");
      return null;
    }

    if (interests.some((interest) => interest.length > 50)) {
      toast.error("Each interest must contain 50 characters or fewer");
      return null;
    }

    return {
      name: trimmedName,
      email: trimmedEmail,
      role,
      phoneNumber: phoneNumber.trim(),
      profilePhoto: profilePhoto.trim(),
      bio: bio.trim(),
      location: {
        latitude: latitude === "" ? 0 : latitudeNumber,
        longitude: longitude === "" ? 0 : longitudeNumber,
      },
      interests,
      isVerified,
      isBlocked,
    };
  }

  async function handleUpdateUser(event) {
    event.preventDefault();

    if (!editingUser?._id) {
      toast.error("Select a valid user");
      return;
    }

    const userPayload = validateEditForm();

    if (!userPayload) return;

    try {
      setSavingUserId(editingUser._id);

      await axios.put(
        `${API_URL}/users/${editingUser._id}`,
        userPayload,
        getAuthHeader()
      );

      toast.success("User updated successfully");
      resetEditForm();
      await loadUsers();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(getErrorMessage(error, "Failed to update user"));
    } finally {
      setSavingUserId("");
    }
  }

  async function updateSingleField(user, changes, successMessage) {
    try {
      setSavingUserId(user._id);

      await axios.put(
        `${API_URL}/users/${user._id}`,
        changes,
        getAuthHeader()
      );

      toast.success(successMessage);
      await loadUsers();
    } catch (error) {
      console.error("Update user error:", error);
      toast.error(getErrorMessage(error, "Failed to update user"));
    } finally {
      setSavingUserId("");
    }
  }

  async function handleBlockToggle(user) {
    const action = user.isBlocked ? "unblock" : "block";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name || "this user"}?`
    );

    if (!confirmed) return;

    await updateSingleField(
      user,
      { isBlocked: !user.isBlocked },
      user.isBlocked
        ? "User unblocked successfully"
        : "User blocked successfully"
    );
  }

  async function handleVerificationToggle(user) {
    const action = user.isVerified ? "remove verification from" : "verify";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} ${user.name || "this user"}?`
    );

    if (!confirmed) return;

    await updateSingleField(
      user,
      { isVerified: !user.isVerified },
      user.isVerified
        ? "User verification removed"
        : "User verified successfully"
    );
  }

  async function handleRoleChange(user, newRole) {
    if (newRole === user.role) return;

    const confirmed = window.confirm(
      `Change ${user.name || "this user"}'s role to ${getRoleLabel(newRole)}?`
    );

    if (!confirmed) return;

    await updateSingleField(
      user,
      { role: newRole },
      "User role updated successfully"
    );
  }

  async function handleDeleteUser(user) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete ${
        user.name || "this user"
      }? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingUserId(user._id);

      await axios.delete(
        `${API_URL}/users/${user._id}`,
        getAuthHeader()
      );

      toast.success("User deleted successfully");
      await loadUsers();
    } catch (error) {
      console.error("Delete user error:", error);
      toast.error(getErrorMessage(error, "Failed to delete user"));
    } finally {
      setDeletingUserId("");
    }
  }

  function clearFilters() {
    setSearchText("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerificationFilter("all");
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.isBlocked !== true).length;
  const blockedUsers = users.filter((user) => user.isBlocked === true).length;
  const verifiedUsers = users.filter((user) => user.isVerified === true).length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">Users Management</h1>
          <p className="text-gray-500 mt-[5px]">
            Manage travelers, hotel owners, vehicle companies, travel guides
            and administrators.
          </p>
        </div>

        <button
          type="button"
          onClick={loadUsers}
          disabled={loading}
          className="w-fit flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition disabled:opacity-60"
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <UserStatCard title="Total Users" value={totalUsers} icon={<FaUsers />} color="bg-blue-600" />
        <UserStatCard title="Active Users" value={activeUsers} icon={<FaUsers />} color="bg-green-600" />
        <UserStatCard title="Blocked Users" value={blockedUsers} icon={<FaUserSlash />} color="bg-red-600" />
        <UserStatCard title="Verified Users" value={verifiedUsers} icon={<FaUserCheck />} color="bg-purple-600" />
      </div>

      {showEditForm && (
        <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
          <div className="flex items-center justify-between gap-[15px] mb-[20px]">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Edit User</h2>
              <p className="text-sm text-gray-500">
                Update the selected user's profile, role and account status.
              </p>
            </div>

            <button
              type="button"
              onClick={resetEditForm}
              className="w-[38px] h-[38px] rounded-lg bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
              title="Close form"
            >
              <FaTimes />
            </button>
          </div>

          <form onSubmit={handleUpdateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <InputField label="Name" value={name} onChange={(event) => setName(event.target.value)} placeholder="User name" required />
              <InputField label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="user@example.com" required />
              <InputField label="Phone Number" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} placeholder="Example: 0771234567" />
              <SelectField label="Role" value={role} onChange={(event) => setRole(event.target.value)} options={USER_ROLES} />
              <InputField label="Latitude" type="number" min="-90" max="90" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="Example: 6.9271" />
              <InputField label="Longitude" type="number" min="-180" max="180" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="Example: 79.8612" />

              <div className="md:col-span-2">
                <InputField label="Profile Photo URL" value={profilePhoto} onChange={(event) => setProfilePhoto(event.target.value)} placeholder="Image URL or uploads/profile.jpg" />
              </div>

              <div className="md:col-span-2">
                <InputField label="Interests" value={interests.join(", ")} onChange={handleInterestsChange} placeholder="Beaches, Hiking, Wildlife" />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-[6px]">Bio</label>
                <textarea
                  rows="4"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                  placeholder="Write a short user bio"
                  maxLength={1000}
                  className="w-full border border-gray-300 rounded-lg px-[12px] py-[10px] focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <p className="text-xs text-gray-400 mt-[4px]">{bio.length}/1000 characters</p>
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-[20px]">
                <label className="flex items-center gap-[10px] text-sm font-semibold text-gray-700">
                  <input type="checkbox" checked={isVerified} onChange={(event) => setIsVerified(event.target.checked)} className="w-[18px] h-[18px]" />
                  Verified User
                </label>

                <label className="flex items-center gap-[10px] text-sm font-semibold text-gray-700">
                  <input type="checkbox" checked={isBlocked} onChange={(event) => setIsBlocked(event.target.checked)} className="w-[18px] h-[18px]" />
                  Blocked User
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-[10px] mt-[20px]">
              <button type="button" onClick={resetEditForm} className="px-[18px] py-[10px] rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">Cancel</button>
              <button
                type="submit"
                disabled={savingUserId === editingUser?._id}
                className="px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition disabled:opacity-60"
              >
                {savingUserId === editingUser?._id ? "Saving..." : "Update User"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search name, email, phone or interests"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">All Roles</option>
            {USER_ROLES.map((roleOption) => <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>)}
          </select>

          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">All Account Status</option>
            <option value="active">Active Users</option>
            <option value="blocked">Blocked Users</option>
          </select>

          <select value={verificationFilter} onChange={(event) => setVerificationFilter(event.target.value)} className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent">
            <option value="all">All Verification Status</option>
            <option value="verified">Verified Users</option>
            <option value="unverified">Unverified Users</option>
          </select>
        </div>

        {(searchText || roleFilter !== "all" || statusFilter !== "all" || verificationFilter !== "all") && (
          <div className="flex justify-end mt-[15px]">
            <button type="button" onClick={clearFilters} className="text-accent font-semibold hover:text-orange">Clear Filters</button>
          </div>
        )}
      </div>

      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Users</h2>
            <p className="text-sm text-gray-500">Showing {filteredUsers.length} user(s)</p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[1200px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">User</th>
                  <th className="py-[12px]">Contact</th>
                  <th className="py-[12px]">Role</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Verification</th>
                  <th className="py-[12px]">Account Status</th>
                  <th className="py-[12px]">Joined</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => {
                  const isSaving = savingUserId === user._id;
                  const isDeleting = deletingUserId === user._id;

                  return (
                    <tr key={user._id} className="border-b text-sm">
                      <td className="py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          <img
                            src={getProfilePhoto(user)}
                            alt={user.name || "User"}
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = getAvatarUrl(user.name);
                            }}
                            className="w-[45px] h-[45px] rounded-full object-cover border"
                          />
                          <div>
                            <p className="font-bold text-gray-800">{user.name || "No name"}</p>
                            <p className="text-xs text-gray-400 max-w-[180px] truncate">{user._id}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-[14px] text-gray-600">
                        <p>{user.email || "No email"}</p>
                        <p className="text-xs text-gray-400">{user.phoneNumber || "No phone number"}</p>
                      </td>

                      <td className="py-[14px]">
                        <select
                          value={user.role || "traveler"}
                          disabled={isSaving || isDeleting}
                          onChange={(event) => handleRoleChange(user, event.target.value)}
                          className="border border-gray-300 rounded-lg px-[8px] py-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60"
                        >
                          {USER_ROLES.map((roleOption) => <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>)}
                        </select>
                      </td>

                      <td className="py-[14px] text-gray-600">{formatLocation(user.location)}</td>

                      <td className="py-[14px]">
                        <span className={`px-[10px] py-[5px] rounded-full text-xs text-white ${user.isVerified ? "bg-blue-600" : "bg-gray-500"}`}>
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>

                      <td className="py-[14px]">
                        <span className={`px-[10px] py-[5px] rounded-full text-xs text-white ${user.isBlocked ? "bg-red-600" : "bg-green-600"}`}>
                          {user.isBlocked ? "Blocked" : "Active"}
                        </span>
                      </td>

                      <td className="py-[14px] text-gray-600">{formatDate(user.createdAt)}</td>

                      <td className="py-[14px]">
                        <div className="flex justify-center gap-[8px]">
                          <button
                            type="button"
                            onClick={() => handleVerificationToggle(user)}
                            disabled={isSaving || isDeleting}
                            className={`w-[35px] h-[35px] rounded-lg flex items-center justify-center text-white disabled:opacity-60 ${user.isVerified ? "bg-gray-500 hover:bg-gray-600" : "bg-blue-600 hover:bg-blue-700"}`}
                            title={user.isVerified ? "Remove Verification" : "Verify User"}
                          >
                            <FaUserCheck />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleBlockToggle(user)}
                            disabled={isSaving || isDeleting}
                            className={`w-[35px] h-[35px] rounded-lg flex items-center justify-center text-white disabled:opacity-60 ${user.isBlocked ? "bg-green-600 hover:bg-green-700" : "bg-orange hover:bg-orange/80"}`}
                            title={user.isBlocked ? "Unblock User" : "Block User"}
                          >
                            <FaUserSlash />
                          </button>

                          <button
                            type="button"
                            onClick={() => openEditForm(user)}
                            disabled={isSaving || isDeleting}
                            className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="Edit User"
                          >
                            <FaUserEdit />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user)}
                            disabled={isSaving || isDeleting}
                            className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white disabled:opacity-60"
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="py-[30px] text-center text-gray-500">No users found</td>
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

function UserStatCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-3xl font-bold text-gray-800 mt-[6px]">{value}</h2>
      </div>
      <div className={`${color} w-[55px] h-[55px] rounded-full flex items-center justify-center text-white text-2xl`}>{icon}</div>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text", min, max, step, required = false }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        required={required}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">{label}</label>
      <select value={value} onChange={onChange} className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent">
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </div>
  );
}

function getRoleLabel(role) {
  return USER_ROLES.find((item) => item.value === role)?.label || role;
}

function formatLocation(location) {
  if (!location || typeof location !== "object") return "Not added";

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return "Not added";
  if (latitude === 0 && longitude === 0) return "Not added";

  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "Not available";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-LK", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getAvatarUrl(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=random`;
}

function getProfilePhoto(user) {
  const photo = String(user.profilePhoto || "").trim();

  if (!photo) return getAvatarUrl(user.name);

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://") ||
    photo.startsWith("data:")
  ) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return `http://localhost:3000${photo}`;
  }

  return `http://localhost:3000/${photo}`;
}
