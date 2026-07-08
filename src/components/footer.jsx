import { Link } from "react-router-dom";
import {
  FaFacebookF,
  FaInstagram,
  FaYoutube,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaPlaneDeparture,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand */}
          <div>
            <Link to="/" className="inline-flex items-center gap-3 mb-5">
              <img
                src="/logo.png"
                alt="Travel Ease Logo"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="text-gray-300 leading-7 mb-6">
              Travel Ease helps travelers discover destinations, book hotels,
              rent vehicles, find guides, and plan trips with smart AI support.
            </p>

            <div className="flex items-center gap-3">
              <SocialIcon icon={<FaFacebookF />} />
              <SocialIcon icon={<FaInstagram />} />
              <SocialIcon icon={<FaYoutube />} />
              <SocialIcon icon={<FaLinkedinIn />} />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-5 text-white">Quick Links</h3>

            <ul className="space-y-3 text-gray-300">
              <FooterLink to="/" text="Home" />
              <FooterLink to="/discover" text="Discover" />
              <FooterLink to="/hotels" text="Hotels" />
              <FooterLink to="/vehicles" text="Vehicles" />
              <FooterLink to="/guides" text="Travel Guides" />
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-bold mb-5 text-white">Services</h3>

            <ul className="space-y-3 text-gray-300">
              <FooterLink to="/ai-planner" text="AI Trip Planner" />
              <FooterLink to="/community" text="Travel Community" />
              <FooterLink to="/hotel-owner" text="Hotel Owner" />
              <FooterLink to="/vehicle-owner" text="Vehicle Rental" />
              <FooterLink to="/guide-register" text="Become a Guide" />
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xl font-bold mb-5 text-white">Contact Us</h3>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="text-orange mt-1" />
                <p>Sri Lanka</p>
              </div>

              <div className="flex items-center gap-3">
                <FaPhoneAlt className="text-orange" />
                <p>+94 77 000 0000</p>
              </div>

              <div className="flex items-center gap-3">
                <FaEnvelope className="text-orange" />
                <p>support@travelease.com</p>
              </div>
            </div>

            <Link
              to="/contact"
              className="inline-flex items-center gap-2 mt-6 bg-orange text-white px-5 py-3 rounded-full font-semibold hover:bg-white hover:text-accent transition"
            >
              <FaPlaneDeparture />
              Contact Now
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © {currentYear} Travel Ease. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link to="/privacy-policy" className="hover:text-orange transition">
              Privacy Policy
            </Link>

            <Link to="/terms" className="hover:text-orange transition">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, text }) {
  return (
    <li>
      <Link to={to} className="hover:text-orange transition">
        {text}
      </Link>
    </li>
  );
}

function SocialIcon({ icon }) {
  return (
    <a
      href="#"
      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-orange transition"
    >
      {icon}
    </a>
  );
}