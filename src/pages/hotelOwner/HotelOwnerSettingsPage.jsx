import { useMemo } from "react";
import { FaEnvelope, FaIdBadge, FaUser } from "react-icons/fa";
import { API_URL } from "./hotelApi";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
}

export default function HotelOwnerSettingsPage() {
  const user = useMemo(readStoredUser, []);

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px]">
        <h1 className="text-3xl font-bold text-accent">Settings</h1>
        <p className="mt-[5px] text-gray-500">
          Review the account and application settings used by the hotel-owner area.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-2">
        <section className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <h2 className="mb-[18px] text-xl font-bold text-gray-800">Account Information</h2>
          <SettingRow icon={<FaUser />} label="Name" value={user?.name || "Not available"} />
          <SettingRow icon={<FaEnvelope />} label="Email" value={user?.email || "Not available"} />
          <SettingRow icon={<FaIdBadge />} label="Role" value={user?.role || localStorage.getItem("role") || "Not available"} />
          <p className="mt-[18px] rounded-lg bg-blue-50 p-[12px] text-sm text-blue-700">
            Connect this page to your existing user-profile update endpoint before enabling editable account fields.
          </p>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-[20px] shadow-md">
          <h2 className="mb-[18px] text-xl font-bold text-gray-800">Application Connection</h2>
          <SettingRow icon={<FaIdBadge />} label="API Base URL" value={API_URL} />
          <SettingRow icon={<FaIdBadge />} label="Authentication" value={localStorage.getItem("token") ? "Token available" : "Token missing"} />
          <p className="mt-[18px] text-sm leading-6 text-gray-500">
            Set either VITE_BACKEND_URL or VITE_API_URL. The included API helper accepts a server origin or a URL that already ends with /api.
          </p>
        </section>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, value }) {
  return (
    <div className="mb-[10px] flex items-start gap-[12px] rounded-xl bg-gray-50 p-[13px] last:mb-0">
      <span className="mt-[2px] text-accent">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-[3px] break-words font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
