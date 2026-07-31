import { useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { LuListCollapse } from "react-icons/lu";
import {
  FiBookOpen,
  FiChevronDown,
  FiHome,
  FiLogIn,
  FiLogOut,
  FiPhone,
  FiSettings,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import {
  FaCarSide,
  FaHotel,
  FaRobot,
  FaUserTie,
} from "react-icons/fa";
import { MdTravelExplore } from "react-icons/md";

import {
  clearStoredAuth,
  getDashboardPath,
  getDisplayName,
  getInitials,
  getProfileImage,
  getRoleLabel,
  getStoredRole,
  getStoredToken,
  getStoredUser,
  resolveAssetUrl,
} from "../utils/travelApi";

const NAV_LINKS = [
  { name: "Home", path: "/", icon: <FiHome /> },
  {
    name: "Discover",
    path: "/places",
    icon: <MdTravelExplore />,
  },
  { name: "Hotels", path: "/hotels", icon: <FaHotel /> },
  {
    name: "Vehicles",
    path: "/vehicles",
    icon: <FaCarSide />,
  },
  {
    name: "Guides",
    path: "/travel-guides",
    icon: <FaUserTie />,
  },
  {
    name: "AI Planner",
    path: "/ai-planner",
    icon: <FaRobot />,
  },
  {
    name: "Community",
    path: "/community",
    icon: <FiUsers />,
  },
  { name: "Contact", path: "/contact", icon: <FiPhone /> },
];

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(() => getStoredUser());
  const profileMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const token = getStoredToken();
  const role = getStoredRole();
  const isAuthenticated = Boolean(token && user);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const profileImage = resolveAssetUrl(getProfileImage(user));
  const dashboardPath = getDashboardPath(role);

  useEffect(() => {
    setUser(getStoredUser());
    setProfileMenuOpen(false);
    setSideBarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function refreshAuth() {
      setUser(getStoredUser());
    }

    window.addEventListener("storage", refreshAuth);
    window.addEventListener("auth-changed", refreshAuth);

    return () => {
      window.removeEventListener("storage", refreshAuth);
      window.removeEventListener("auth-changed", refreshAuth);
    };
  }, []);

  useEffect(() => {
    function closeProfileMenu(event) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeProfileMenu);

    return () => {
      document.removeEventListener("mousedown", closeProfileMenu);
    };
  }, []);

  function logout() {
    clearStoredAuth();
    setUser(null);
    setProfileMenuOpen(false);
    setSideBarOpen(false);
    navigate("/login", { replace: true });
  }

  return (
    <header className="relative z-50 flex h-[100px] w-full items-center bg-accent px-5 shadow-md lg:px-8">
      <button
        type="button"
        onClick={() => setSideBarOpen(true)}
        className="mr-4 text-3xl text-white lg:hidden"
        aria-label="Open navigation menu"
      >
        <LuListCollapse />
      </button>

      <Link to="/" className="flex h-full shrink-0 items-center">
        <img
          src="/logo.png"
          className="h-[88px] w-auto object-contain"
          alt="Travel Ease"
        />
      </Link>

      <nav className="ml-8 hidden flex-1 items-center gap-5 text-base text-white xl:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/"}
            className={({ isActive }) =>
              `flex items-center gap-2 whitespace-nowrap rounded-lg px-2 py-2 transition ${
                isActive
                  ? "bg-white/15 text-white"
                  : "hover:text-orange"
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="ml-auto hidden items-center lg:flex">
        {isAuthenticated ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              type="button"
              onClick={() => setProfileMenuOpen((open) => !open)}
              className="flex min-w-[205px] items-center gap-3 rounded-full border border-white/20 bg-white/10 py-2 pl-2 pr-4 text-left text-white transition hover:bg-white/20"
              aria-expanded={profileMenuOpen}
              aria-haspopup="menu"
            >
              <ProfileAvatar
                image={profileImage}
                initials={getInitials(user)}
                className="h-11 w-11"
              />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {displayName}
                </span>
                <span className="block truncate text-xs text-white/70">
                  {getRoleLabel(role)}
                </span>
              </span>

              <FiChevronDown
                className={`shrink-0 transition ${
                  profileMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileMenuOpen && (
              <div className="absolute right-0 top-[calc(100%+12px)] w-[290px] overflow-hidden rounded-2xl border border-gray-100 bg-white text-gray-700 shadow-2xl">
                <div className="border-b border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-3">
                    <ProfileAvatar
                      image={profileImage}
                      initials={getInitials(user)}
                      className="h-12 w-12"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-bold text-secondary">
                        {displayName}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {user?.email || "Signed-in account"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <ProfileMenuLink
                    to="/profile"
                    icon={<FiUser />}
                    label="My Profile"
                    onClick={() => setProfileMenuOpen(false)}
                  />

                  <ProfileMenuLink
                    to="/my-bookings"
                    icon={<FiBookOpen />}
                    label="My Bookings"
                    onClick={() => setProfileMenuOpen(false)}
                  />

                  <ProfileMenuLink
                    to={dashboardPath}
                    icon={<FiSettings />}
                    label={
                      dashboardPath === "/my-bookings"
                        ? "Booking Dashboard"
                        : "Management Dashboard"
                    }
                    onClick={() => setProfileMenuOpen(false)}
                  />
                </div>

                <div className="border-t border-gray-100 p-2">
                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FiLogOut />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-4 text-white">
            <Link
              to="/login"
              className="flex items-center gap-2 transition hover:text-orange"
            >
              <FiLogIn />
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-3 font-semibold text-accent transition hover:bg-orange hover:text-white"
            >
              Register
            </Link>
          </div>
        )}
      </div>

      {sideBarOpen && (
        <div className="fixed inset-0 z-[70] bg-black/55 lg:hidden">
          <aside className="flex h-full w-[300px] max-w-[88vw] flex-col overflow-y-auto bg-white shadow-2xl">
            <div className="flex h-[100px] items-center justify-between bg-accent px-4">
              <img
                src="/logo.png"
                className="h-[84px] object-contain"
                alt="Travel Ease"
              />

              <button
                type="button"
                onClick={() => setSideBarOpen(false)}
                className="text-3xl text-white"
                aria-label="Close navigation menu"
              >
                <FiX />
              </button>
            </div>

            {isAuthenticated && (
              <div className="border-b border-gray-100 bg-gray-50 p-5">
                <div className="flex items-center gap-3">
                  <ProfileAvatar
                    image={profileImage}
                    initials={getInitials(user)}
                    className="h-14 w-14"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-bold text-secondary">
                      {displayName}
                    </p>
                    <p className="truncate text-sm text-gray-500">
                      {getRoleLabel(role)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-2 p-5 text-gray-700">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === "/"}
                  onClick={() => setSideBarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                      isActive
                        ? "bg-accent text-white"
                        : "hover:bg-gray-100 hover:text-accent"
                    }`
                  }
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.name}
                </NavLink>
              ))}

              <hr className="my-3 border-gray-200" />

              {isAuthenticated ? (
                <>
                  <MobileAccountLink
                    to="/profile"
                    icon={<FiUser />}
                    label="My Profile"
                    onClick={() => setSideBarOpen(false)}
                  />
                  <MobileAccountLink
                    to="/my-bookings"
                    icon={<FiBookOpen />}
                    label="My Bookings"
                    onClick={() => setSideBarOpen(false)}
                  />
                  <MobileAccountLink
                    to={dashboardPath}
                    icon={<FiSettings />}
                    label="Dashboard"
                    onClick={() => setSideBarOpen(false)}
                  />
                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-left font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <FiLogOut className="text-xl" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setSideBarOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-gray-100 hover:text-accent"
                  >
                    <FiLogIn className="text-xl" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setSideBarOpen(false)}
                    className="rounded-full bg-accent px-5 py-3 text-center font-semibold text-white"
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </aside>

          <button
            type="button"
            onClick={() => setSideBarOpen(false)}
            className="absolute inset-y-0 right-0 left-[300px]"
            aria-label="Close navigation overlay"
          />
        </div>
      )}
    </header>
  );
}

function ProfileAvatar({ image, initials, className }) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [image]);

  if (image && !imageFailed) {
    return (
      <img
        src={image}
        alt="User profile"
        onError={() => setImageFailed(true)}
        className={`${className} shrink-0 rounded-full border-2 border-white/70 object-cover shadow-sm`}
      />
    );
  }

  return (
    <span
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-orange font-bold text-white shadow-sm`}
    >
      {initials}
    </span>
  );
}

function ProfileMenuLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition hover:bg-gray-50 hover:text-accent"
    >
      <span className="text-lg text-accent">{icon}</span>
      {label}
    </Link>
  );
}

function MobileAccountLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100 hover:text-accent"
    >
      <span className="text-xl">{icon}</span>
      {label}
    </Link>
  );
}
