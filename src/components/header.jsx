import { useState } from "react";
import { Link } from "react-router-dom";

import { LuListCollapse } from "react-icons/lu";
import { FiHome, FiUsers, FiPhone, FiLogIn } from "react-icons/fi";
import { FaHotel, FaCarSide, FaUserTie, FaRobot } from "react-icons/fa";
import { MdTravelExplore } from "react-icons/md";

export default function Header() {
  const [sideBarOpen, setSideBarOpen] = useState(false);

  const navLinks = [
    {
      name: "Home",
      path: "/",
      icon: <FiHome />,
    },
    {
      name: "Discover",
      path: "/places",
      icon: <MdTravelExplore />,
    },
    {
      name: "Hotels",
      path: "/hotels",
      icon: <FaHotel />,
    },
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
    {
      name: "Contact",
      path: "/contact",
      icon: <FiPhone />,
    },
  ];

  return (
    <header className="w-full h-[100px] bg-accent flex items-center px-6 relative shadow-md z-10">
      {/* Mobile Menu Button */}
      <LuListCollapse
        onClick={() => setSideBarOpen(true)}
        className="text-white text-3xl mr-4 lg:hidden cursor-pointer"
      />

      {/* Logo */}
      <Link to="/" className="h-full flex items-center shrink-0">
        <img
          src="/logo.png"
          className="h-[90px] object-contain"
          alt="Travel Ease Logo"
        />
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex flex-1 items-center justify-start ml-10 gap-6 text-white text-lg">
        {navLinks.map((link, index) => (
          <Link
            key={index}
            to={link.path}
            className="flex items-center gap-2 whitespace-nowrap hover:text-orange-300 transition"
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        ))}
      </nav>

      {/* Desktop Login/Register */}
      <div className="hidden lg:flex items-center gap-5 ml-auto text-white text-lg">
        <Link
          to="/login"
          className="flex items-center gap-2 hover:text-orange-300 transition"
        >
          <FiLogIn />
          Login
        </Link>

        <Link
          to="/register"
          className="bg-white text-accent px-6 py-3 rounded-full hover:bg-orange-100 transition"
        >
          Register
        </Link>
      </div>

      {/* Mobile Sidebar */}
      {sideBarOpen && (
        <div className="fixed lg:hidden w-full h-screen top-0 left-0 bg-black/50 z-20">
          <div className="w-[280px] h-screen bg-white flex flex-col">
            {/* Sidebar Header */}
            <div className="w-full h-[100px] bg-accent flex justify-between items-center px-4">
              <img
                src="/logo.png"
                className="h-[90px] object-contain"
                alt="Travel Ease Logo"
              />

              <LuListCollapse
                onClick={() => setSideBarOpen(false)}
                className="text-white text-3xl cursor-pointer rotate-180"
              />
            </div>

            {/* Sidebar Links */}
            <div className="w-full flex flex-col text-lg text-gray-700 gap-5 mt-10 pl-6">
              {navLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  onClick={() => setSideBarOpen(false)}
                  className="flex items-center gap-3 hover:text-accent transition"
                >
                  <span className="text-xl">{link.icon}</span>
                  {link.name}
                </Link>
              ))}

              <hr className="w-[85%] border-gray-300 my-2" />

              <Link
                to="/login"
                onClick={() => setSideBarOpen(false)}
                className="flex items-center gap-3 hover:text-accent transition"
              >
                <FiLogIn className="text-xl" />
                Login
              </Link>

              <Link
                to="/register"
                onClick={() => setSideBarOpen(false)}
                className="w-[180px] text-center bg-accent text-white px-5 py-3 rounded-full hover:bg-blue-900 transition"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}