import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaUsers,
  FaUserShield,
  FaUserSlash,
  FaTrash,
  FaEdit,
  FaSearch,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async function loadUsers() {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/users`, getAuthHeader());

      const userList = Array.isArray(response.data)
        ? response.data
        : response.data.users || response.data.data || [];

      setUsers(userList);
      setFilteredUsers(userList);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let result = [...users];

    if (searchText.trim() !== "") {
      const search = searchText.toLowerCase();

      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.email?.toLowerCase().includes(search) ||
          user.phoneNumber?.toLowerCase().includes(search)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      if (statusFilter === "active") {
        result = result.filter((user) => !user.isBlocked);
      }

      if (statusFilter === "blocked") {
        result = result.filter((user) => user.isBlocked);
      }
    }

    setFilteredUsers(result);
  }, [searchText, roleFilter, statusFilter, users]);

  async function handleBlockToggle(user) {
    try {
      const actionText = user.isBlocked ? "unblock" : "block";

      const confirmAction = window.confirm(
        `Are you sure you want to ${actionText} ${user.name}?`
      );

      if (!confirmAction) return;

      await axios.put(
        `${API_URL}/users/${user._id}`,
        {
          isBlocked: !user.isBlocked,
        },
        getAuthHeader()
      );

      toast.success(
        user.isBlocked ? "User unblocked successfully" : "User blocked successfully"
      );

      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  }

  async function handleRoleChange(user, newRole) {
    try {
      const confirmAction = window.confirm(
        `Change ${user.name}'s role to ${newRole}?`
      );

      if (!confirmAction) return;

      await axios.put(
        `${API_URL}/users/${user._id}`,
        {
          role: newRole,
        },
        getAuthHeader()
      );

      toast.success("User role updated successfully");
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  }

  async function handleDeleteUser(user) {
    try {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      );

      if (!confirmDelete) return;

      await axios.delete(`${API_URL}/users/${user._id}`, getAuthHeader());

      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  }

  const totalUsers = users.length;
  const activeUsers = users.filter((user) => !user.isBlocked).length;
  const blockedUsers = users.filter((user) => user.isBlocked).length;
  const adminUsers = users.filter((user) => user.role === "admin").length;

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">Users Management</h1>
          <p className="text-gray-500 mt-[5px]">
            Manage Travel Ease travelers, hotel owners, vehicle companies,
            travel guides and admins.
          </p>
        </div>

        <button
          onClick={loadUsers}
          className="w-fit flex items-center gap-[8px] bg-accent text-white px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
        >
          <FiRefreshCw />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <UserStatCard
          title="Total Users"
          value={totalUsers}
          icon={<FaUsers />}
          color="bg-blue-600"
        />

        <UserStatCard
          title="Active Users"
          value={activeUsers}
          icon={<FaUsers />}
          color="bg-green-600"
        />

        <UserStatCard
          title="Blocked Users"
          value={blockedUsers}
          icon={<FaUserSlash />}
          color="bg-red-600"
        />

        <UserStatCard
          title="Admins"
          value={adminUsers}
          icon={<FaUserShield />}
          color="bg-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[15px]">
          <div className="relative">
            <FaSearch className="absolute top-[15px] left-[15px] text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or phone"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-[45px] border border-gray-300 rounded-lg pl-[40px] pr-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Roles</option>
            <option value="traveler">Traveler</option>
            <option value="hotel_owner">Hotel Owner</option>
            <option value="vehicle_company">Vehicle Company</option>
            <option value="guide">Travel Guide</option>
            <option value="admin">Admin</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">All Status</option>
            <option value="active">Active Users</option>
            <option value="blocked">Blocked Users</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex justify-between items-center mb-[20px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">All Users</h2>
            <p className="text-sm text-gray-500">
              Showing {filteredUsers.length} user(s)
            </p>
          </div>
        </div>

        {loading ? (
          <div className="w-full min-h-[250px] flex justify-center items-center text-gray-500">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="py-[12px]">User</th>
                  <th className="py-[12px]">Contact</th>
                  <th className="py-[12px]">Role</th>
                  <th className="py-[12px]">Location</th>
                  <th className="py-[12px]">Status</th>
                  <th className="py-[12px] text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="border-b text-sm">
                    <td className="py-[14px]">
                      <div className="flex items-center gap-[12px]">
                        <img
                          src={
                            user.profilePhoto ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(user.name || "User")
                          }
                          alt={user.name}
                          className="w-[45px] h-[45px] rounded-full object-cover border"
                        />

                        <div>
                          <p className="font-bold text-gray-800">
                            {user.name || "No Name"}
                          </p>
                          <p className="text-xs text-gray-400">
                            ID: {user._id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      <p>{user.email}</p>
                      <p className="text-xs text-gray-400">
                        {user.phoneNumber || "No phone number"}
                      </p>
                    </td>

                    <td className="py-[14px]">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user, e.target.value)
                        }
                        className="border border-gray-300 rounded-lg px-[8px] py-[6px] text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                      >
                        <option value="traveler">Traveler</option>
                        <option value="hotel_owner">Hotel Owner</option>
                        <option value="vehicle_company">Vehicle Company</option>
                        <option value="guide">Travel Guide</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="py-[14px] text-gray-600">
                      {user.location || "Not added"}
                    </td>

                    <td className="py-[14px]">
                      <span
                        className={`px-[10px] py-[5px] rounded-full text-xs text-white ${
                          user.isBlocked ? "bg-red-600" : "bg-green-600"
                        }`}
                      >
                        {user.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>

                    <td className="py-[14px]">
                      <div className="flex justify-center gap-[8px]">
                        <button
                          onClick={() => handleBlockToggle(user)}
                          className={`w-[35px] h-[35px] rounded-lg flex items-center justify-center text-white ${
                            user.isBlocked
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-orange hover:bg-orange/80"
                          }`}
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          <FaUserSlash />
                        </button>

                        <button
                          onClick={() => handleRoleChange(user, user.role)}
                          className="w-[35px] h-[35px] rounded-lg bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white"
                          title="Edit User"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={() => handleDeleteUser(user)}
                          className="w-[35px] h-[35px] rounded-lg bg-red-600 hover:bg-red-700 flex items-center justify-center text-white"
                          title="Delete User"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="py-[30px] text-center text-gray-500"
                    >
                      No users found
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

function UserStatCard({ title, value, icon, color }) {
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