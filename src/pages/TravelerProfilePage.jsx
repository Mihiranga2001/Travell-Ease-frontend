import { Link, Navigate } from "react-router-dom";
import {
  FaCalendarCheck,
  FaCar,
  FaEnvelope,
  FaHotel,
  FaPhoneAlt,
  FaUser,
} from "react-icons/fa";

import Header from "../components/header";
import Footer from "../components/footer";
import {
  getDisplayName,
  getInitials,
  getProfileImage,
  getRoleLabel,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  resolveAssetUrl,
} from "../utils/travelApi";

export default function TravelerProfilePage() {
  const user = getStoredUser();
  const token = getStoredToken();
  const role = getStoredRole();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const image = resolveAssetUrl(getProfileImage(user));

  return (
    <div className="min-h-screen bg-primary text-secondary">
      <Header />

      <main className="mx-auto max-w-6xl px-6 py-12 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
          <div className="h-40 bg-accent" />

          <div className="px-6 pb-8 md:px-10">
            <div className="-mt-16 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-end">
                {image ? (
                  <img
                    src={image}
                    alt="Traveler profile"
                    className="h-32 w-32 rounded-full border-4 border-white bg-white object-cover shadow-lg"
                  />
                ) : (
                  <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-orange text-4xl font-bold text-white shadow-lg">
                    {getInitials(user)}
                  </div>
                )}

                <div className="pb-2">
                  <h1 className="text-3xl font-bold">{getDisplayName(user)}</h1>
                  <p className="mt-1 text-gray-500">{getRoleLabel(role)}</p>
                </div>
              </div>

              <Link
                to="/my-bookings"
                className="mb-2 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-orange"
              >
                <FaCalendarCheck /> View My Bookings
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_0.8fr]">
              <section className="rounded-2xl border border-gray-200 p-6">
                <h2 className="mb-5 text-xl font-bold">Account Information</h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <ProfileInfo
                    icon={<FaUser />}
                    label="Full Name"
                    value={getDisplayName(user)}
                  />
                  <ProfileInfo
                    icon={<FaEnvelope />}
                    label="Email Address"
                    value={user.email || "Not available"}
                  />
                  <ProfileInfo
                    icon={<FaPhoneAlt />}
                    label="Phone Number"
                    value={
                      user.phoneNumber ||
                      user.phone ||
                      user.contactNumber ||
                      "Not available"
                    }
                  />
                  <ProfileInfo
                    icon={<FaUser />}
                    label="Account Type"
                    value={getRoleLabel(role)}
                  />
                </div>
              </section>

              <section className="rounded-2xl bg-gray-50 p-6">
                <h2 className="mb-5 text-xl font-bold">Quick Actions</h2>
                <div className="space-y-3">
                  <QuickLink
                    to="/hotels"
                    icon={<FaHotel />}
                    title="Book a Hotel"
                    text="Browse approved accommodation and room types."
                  />
                  <QuickLink
                    to="/vehicles"
                    icon={<FaCar />}
                    title="Hire a Vehicle"
                    text="Compare approved rental vehicles and prices."
                  />
                  <QuickLink
                    to="/my-bookings"
                    icon={<FaCalendarCheck />}
                    title="Manage Bookings"
                    text="Track, cancel and review your travel services."
                  />
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function ProfileInfo({ icon, label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 p-4">
      <p className="mb-2 flex items-center gap-2 text-sm text-gray-500">
        <span className="text-orange">{icon}</span> {label}
      </p>
      <p className="break-words font-semibold text-secondary">{value}</p>
    </div>
  );
}

function QuickLink({ to, icon, title, text }) {
  return (
    <Link
      to={to}
      className="flex items-start gap-4 rounded-xl bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent text-white">
        {icon}
      </span>
      <span>
        <span className="block font-bold">{title}</span>
        <span className="mt-1 block text-sm leading-5 text-gray-500">{text}</span>
      </span>
    </Link>
  );
}
