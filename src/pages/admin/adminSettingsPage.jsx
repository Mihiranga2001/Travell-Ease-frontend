import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaCog,
  FaUserShield,
  FaBell,
  FaLock,
  FaDatabase,
  FaRobot,
  FaSave,
  FaEye,
  FaEyeSlash,
  FaSignOutAlt,
} from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";

const API_URL = "http://localhost:3000/api";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [adminProfile, setAdminProfile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    location: "",
    profilePhoto: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [systemSettings, setSystemSettings] = useState({
    hotelApprovalRequired: true,
    vehicleApprovalRequired: true,
    guideApprovalRequired: true,
    mediaApprovalRequired: true,
    reviewModerationEnabled: true,
    aiMonitoringEnabled: true,
    fakeReviewDetectionEnabled: true,
    sentimentAnalysisEnabled: true,
    imageRecognitionEnabled: true,
    safetyAlertEnabled: true,
    emailNotifications: true,
    bookingNotifications: true,
    adminAlerts: true,
  });

  function getAuthHeader() {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  function getLoggedUserFromStorage() {
    try {
      const user = localStorage.getItem("user");

      if (user) {
        return JSON.parse(user);
      }

      return null;
    } catch {
      return null;
    }
  }

  async function loadAdminProfile() {
    try {
      setLoading(true);

      const localUser = getLoggedUserFromStorage();

      if (localUser) {
        setAdminProfile(localUser);

        setProfileForm({
          name: localUser.name || "",
          email: localUser.email || "",
          phoneNumber: localUser.phoneNumber || "",
          location: localUser.location || "",
          profilePhoto: localUser.profilePhoto || "",
        });
      }

      try {
        const response = await axios.get(`${API_URL}/users/me`, getAuthHeader());

        const userData = response.data.user || response.data.data || response.data;

        setAdminProfile(userData);

        setProfileForm({
          name: userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || "",
          location: userData.location || "",
          profilePhoto: userData.profilePhoto || "",
        });

        localStorage.setItem("user", JSON.stringify(userData));
      } catch {
        console.log("GET /users/me not available. Using local storage user data.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminProfile();
  }, []);

  function handleProfileChange(e) {
    const { name, value } = e.target;

    setProfileForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handlePasswordChange(e) {
    const { name, value } = e.target;

    setPasswordForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSystemSettingChange(e) {
    const { name, checked } = e.target;

    setSystemSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      if (!profileForm.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!profileForm.email.trim()) {
        toast.error("Email is required");
        return;
      }

      const userId = adminProfile?._id || adminProfile?.id;

      if (!userId) {
        toast.error("Admin user ID not found. Please login again.");
        return;
      }

      const response = await axios.put(
        `${API_URL}/users/${userId}`,
        profileForm,
        getAuthHeader()
      );

      const updatedUser =
        response.data.user || response.data.data || {
          ...adminProfile,
          ...profileForm,
        };

      localStorage.setItem("user", JSON.stringify(updatedUser));
      setAdminProfile(updatedUser);

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    try {
      if (!passwordForm.currentPassword.trim()) {
        toast.error("Current password is required");
        return;
      }

      if (!passwordForm.newPassword.trim()) {
        toast.error("New password is required");
        return;
      }

      if (passwordForm.newPassword.length < 6) {
        toast.error("New password must be at least 6 characters");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        toast.error("New password and confirm password do not match");
        return;
      }

      const userId = adminProfile?._id || adminProfile?.id;

      try {
        await axios.put(
          `${API_URL}/users/${userId}/password`,
          passwordForm,
          getAuthHeader()
        );
      } catch {
        toast.error(
          "Password API is not created yet. Add backend route: PUT /api/users/:id/password"
        );
        return;
      }

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("Password changed successfully");
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to change password");
    }
  }

  function handleSaveSystemSettings() {
    localStorage.setItem(
      "travelEaseSystemSettings",
      JSON.stringify(systemSettings)
    );

    toast.success("System settings saved locally");
  }

  function handleLoadSystemSettings() {
    try {
      const savedSettings = localStorage.getItem("travelEaseSystemSettings");

      if (savedSettings) {
        setSystemSettings(JSON.parse(savedSettings));
        toast.success("Saved settings loaded");
      } else {
        toast("No saved settings found");
      }
    } catch {
      toast.error("Failed to load saved settings");
    }
  }

  function handleLogout() {
    const confirmLogout = window.confirm("Are you sure you want to logout?");

    if (!confirmLogout) return;

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.href = "/login";
  }

  return (
    <div className="w-full min-h-screen bg-white p-[25px] text-gray-800 overflow-y-auto">
      {/* Header */}
      <div className="w-full flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px] mb-[25px]">
        <div>
          <h1 className="text-3xl font-bold text-accent">Settings</h1>
          <p className="text-gray-500 mt-[5px]">
            Manage admin profile, password, approval rules, notifications and
            AI feature settings.
          </p>
        </div>

        <div className="flex gap-[10px]">
          <button
            onClick={loadAdminProfile}
            className="flex items-center gap-[8px] bg-white text-accent px-[18px] py-[10px] rounded-lg font-semibold border border-accent hover:bg-accent hover:text-white transition"
          >
            <FiRefreshCw />
            Refresh
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-[8px] bg-red-600 text-white px-[18px] py-[10px] rounded-lg font-semibold hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {loading && (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 rounded-xl p-[15px] mb-[20px]">
          Loading settings...
        </div>
      )}

      {/* Settings Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-[20px] mb-[25px]">
        <SettingsCard
          title="Admin Profile"
          value={adminProfile?.name || "Admin"}
          icon={<FaUserShield />}
          color="bg-blue-600"
        />

        <SettingsCard
          title="Approval Rules"
          value="Enabled"
          icon={<FaCog />}
          color="bg-green-600"
        />

        <SettingsCard
          title="AI Monitoring"
          value={systemSettings.aiMonitoringEnabled ? "Active" : "Disabled"}
          icon={<FaRobot />}
          color="bg-purple-600"
        />

        <SettingsCard
          title="Notifications"
          value={systemSettings.emailNotifications ? "On" : "Off"}
          icon={<FaBell />}
          color="bg-orange"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px] mb-[25px]">
        {/* Profile Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[10px] mb-[20px]">
            <FaUserShield className="text-2xl text-accent" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Admin Profile
              </h2>
              <p className="text-sm text-gray-500">
                Update your admin account information.
              </p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[15px]">
              <InputField
                label="Name"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Admin name"
              />

              <InputField
                label="Email"
                name="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                placeholder="admin@example.com"
              />

              <InputField
                label="Phone Number"
                name="phoneNumber"
                value={profileForm.phoneNumber}
                onChange={handleProfileChange}
                placeholder="0771234567"
              />

              <InputField
                label="Location"
                name="location"
                value={profileForm.location}
                onChange={handleProfileChange}
                placeholder="Colombo"
              />

              <div className="md:col-span-2">
                <InputField
                  label="Profile Photo URL"
                  name="profilePhoto"
                  value={profileForm.profilePhoto}
                  onChange={handleProfileChange}
                  placeholder="Paste profile photo URL"
                />
              </div>
            </div>

            {profileForm.profilePhoto && (
              <div className="mt-[15px]">
                <p className="text-sm font-semibold text-gray-700 mb-[8px]">
                  Profile Preview
                </p>
                <img
                  src={profileForm.profilePhoto}
                  alt="Admin profile"
                  className="w-[90px] h-[90px] rounded-full object-cover border"
                />
              </div>
            )}

            <div className="flex justify-end mt-[20px]">
              <button
                type="submit"
                className="flex items-center gap-[8px] px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
              >
                <FaSave />
                Save Profile
              </button>
            </div>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[10px] mb-[20px]">
            <FaLock className="text-2xl text-accent" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Security Settings
              </h2>
              <p className="text-sm text-gray-500">
                Change your admin account password.
              </p>
            </div>
          </div>

          <form onSubmit={handleChangePassword}>
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
            />

            <PasswordField
              label="New Password"
              name="newPassword"
              value={passwordForm.newPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
            />

            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange}
              showPassword={showPassword}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="flex items-center gap-[8px] text-accent font-semibold mt-[5px]"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
              {showPassword ? "Hide Passwords" : "Show Passwords"}
            </button>

            <div className="flex justify-end mt-[20px]">
              <button
                type="submit"
                className="flex items-center gap-[8px] px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
              >
                <FaSave />
                Change Password
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Approval Settings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-[25px] mb-[25px]">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[10px] mb-[20px]">
            <FaDatabase className="text-2xl text-accent" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Approval Settings
              </h2>
              <p className="text-sm text-gray-500">
                Control which content requires admin approval.
              </p>
            </div>
          </div>

          <div className="space-y-[12px]">
            <ToggleSetting
              label="Hotel Approval Required"
              description="Hotels must be approved before appearing publicly."
              name="hotelApprovalRequired"
              checked={systemSettings.hotelApprovalRequired}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Vehicle Approval Required"
              description="Vehicles must be approved before appearing publicly."
              name="vehicleApprovalRequired"
              checked={systemSettings.vehicleApprovalRequired}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Guide Approval Required"
              description="Travel guide profiles must be approved by admin."
              name="guideApprovalRequired"
              checked={systemSettings.guideApprovalRequired}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Media Approval Required"
              description="Traveler photos and videos require admin approval."
              name="mediaApprovalRequired"
              checked={systemSettings.mediaApprovalRequired}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Review Moderation"
              description="Admin can moderate inappropriate or fake reviews."
              name="reviewModerationEnabled"
              checked={systemSettings.reviewModerationEnabled}
              onChange={handleSystemSettingChange}
            />
          </div>
        </div>

        {/* AI Settings */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
          <div className="flex items-center gap-[10px] mb-[20px]">
            <FaRobot className="text-2xl text-accent" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                AI Feature Settings
              </h2>
              <p className="text-sm text-gray-500">
                Enable or disable AI monitoring and recommendation features.
              </p>
            </div>
          </div>

          <div className="space-y-[12px]">
            <ToggleSetting
              label="AI Monitoring"
              description="Monitor fake reviews, safety risks and AI alerts."
              name="aiMonitoringEnabled"
              checked={systemSettings.aiMonitoringEnabled}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Fake Review Detection"
              description="Use AI/NLP to detect spam or fake reviews."
              name="fakeReviewDetectionEnabled"
              checked={systemSettings.fakeReviewDetectionEnabled}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Sentiment Analysis"
              description="Analyze positive, neutral and negative reviews."
              name="sentimentAnalysisEnabled"
              checked={systemSettings.sentimentAnalysisEnabled}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Image Recognition"
              description="Analyze travel photos using AI image recognition."
              name="imageRecognitionEnabled"
              checked={systemSettings.imageRecognitionEnabled}
              onChange={handleSystemSettingChange}
            />

            <ToggleSetting
              label="Safety Alerts"
              description="Enable travel safety and weather warning alerts."
              name="safetyAlertEnabled"
              checked={systemSettings.safetyAlertEnabled}
              onChange={handleSystemSettingChange}
            />
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] mb-[25px]">
        <div className="flex items-center gap-[10px] mb-[20px]">
          <FaBell className="text-2xl text-accent" />
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Notification Settings
            </h2>
            <p className="text-sm text-gray-500">
              Manage admin notification preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-[15px]">
          <ToggleSetting
            label="Email Notifications"
            description="Receive system emails and admin updates."
            name="emailNotifications"
            checked={systemSettings.emailNotifications}
            onChange={handleSystemSettingChange}
          />

          <ToggleSetting
            label="Booking Notifications"
            description="Receive hotel, vehicle and guide booking updates."
            name="bookingNotifications"
            checked={systemSettings.bookingNotifications}
            onChange={handleSystemSettingChange}
          />

          <ToggleSetting
            label="Admin Alerts"
            description="Receive approval, review and AI alert notifications."
            name="adminAlerts"
            checked={systemSettings.adminAlerts}
            onChange={handleSystemSettingChange}
          />
        </div>
      </div>

      {/* Save Settings */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px]">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-[15px]">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Save System Settings
            </h2>
            <p className="text-sm text-gray-500 mt-[5px]">
              These system settings are saved locally now. Later, you can save
              them in MongoDB using a settings API.
            </p>
          </div>

          <div className="flex gap-[10px]">
            <button
              onClick={handleLoadSystemSettings}
              className="flex items-center gap-[8px] px-[18px] py-[10px] rounded-lg bg-white text-accent font-semibold border border-accent hover:bg-accent hover:text-white transition"
            >
              <FiRefreshCw />
              Load Saved
            </button>

            <button
              onClick={handleSaveSystemSettings}
              className="flex items-center gap-[8px] px-[18px] py-[10px] rounded-lg bg-accent text-white font-semibold border border-accent hover:bg-transparent hover:text-accent transition"
            >
              <FaSave />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, value, icon, color }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-[20px] flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <h2 className="text-xl font-bold text-gray-800 mt-[6px] break-words">
          {value}
        </h2>
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

function PasswordField({ label, name, value, onChange, showPassword }) {
  return (
    <div className="mb-[15px]">
      <label className="block text-sm font-semibold text-gray-700 mb-[6px]">
        {label}
      </label>

      <input
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="w-full h-[45px] border border-gray-300 rounded-lg px-[12px] focus:outline-none focus:ring-2 focus:ring-accent"
      />
    </div>
  );
}

function ToggleSetting({ label, description, name, checked, onChange }) {
  return (
    <div className="border border-gray-200 rounded-xl p-[15px] flex items-center justify-between gap-[15px]">
      <div>
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mt-[3px]">{description}</p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-[48px] h-[26px] bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-[22px]"></div>
      </label>
    </div>
  );
}