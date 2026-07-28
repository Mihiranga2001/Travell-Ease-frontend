import { useMemo } from "react";
import { FaBuilding, FaEnvelope, FaIdCard, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
import { MdSettings } from "react-icons/md";

export default function VehicleCompanySettingsPage() {
  const user = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")) || {}; }
    catch { return {}; }
  }, []);

  const rows = [
    { label: "Company / Account Name", value: user.companyName || user.name || "Not available", icon: <FaBuilding/> },
    { label: "Email", value: user.email || "Not available", icon: <FaEnvelope/> },
    { label: "Contact Number", value: user.phoneNumber || user.contactNumber || "Not available", icon: <FaPhoneAlt/> },
    { label: "Account Role", value: user.role || localStorage.getItem("role") || "vehicle_company", icon: <FaShieldAlt/> },
    { label: "User ID", value: user._id || user.id || user.userId || "Not available", icon: <FaIdCard/> },
  ];

  return (
    <div className="min-h-screen w-full overflow-y-auto bg-white p-[25px] pt-[75px] text-gray-800 lg:pt-[25px]">
      <div className="mb-[25px]"><h1 className="text-3xl font-bold text-accent">Company Settings</h1><p className="mt-[5px] text-gray-500">View the account information used by the vehicle-company module.</p></div>
      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-[22px] shadow-md xl:col-span-2">
          <h2 className="mb-[18px] text-xl font-bold">Account Information</h2>
          <div className="space-y-[12px]">{rows.map((row) => <div key={row.label} className="flex items-start gap-[12px] rounded-xl bg-gray-50 p-[14px]"><span className="mt-[3px] text-accent">{row.icon}</span><div className="min-w-0"><p className="text-xs text-gray-400">{row.label}</p><p className="break-all font-semibold text-gray-700">{row.value}</p></div></div>)}</div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-[22px] shadow-md"><div className="mb-[15px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-accent text-2xl text-white"><MdSettings/></div><h2 className="text-xl font-bold">Profile Updates</h2><p className="mt-[8px] leading-7 text-gray-500">Company name, email and contact information are read from the logged-in User account. Update them through your main user-profile page so the JWT and database remain consistent.</p></div>
      </div>
    </div>
  );
}
