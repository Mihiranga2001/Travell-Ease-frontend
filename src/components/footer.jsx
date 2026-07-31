import { Link } from "react-router-dom";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaPlaneDeparture,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-white">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="mb-5 inline-flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Travel Ease"
                className="h-14 w-auto object-contain"
              />
            </Link>

            <p className="mb-6 leading-7 text-gray-300">
              Travel Ease helps travelers discover destinations, book hotels,
              rent vehicles, find guides, and plan complete journeys in one
              place.
            </p>

            <div className="flex items-center gap-3">
              <SocialIcon href="#" label="Facebook" icon={<FaFacebookF />} />
              <SocialIcon href="#" label="Instagram" icon={<FaInstagram />} />
              <SocialIcon href="#" label="YouTube" icon={<FaYoutube />} />
              <SocialIcon href="#" label="LinkedIn" icon={<FaLinkedinIn />} />
            </div>
          </div>

          <FooterSection title="Quick Links">
            <FooterLink to="/" text="Home" />
            <FooterLink to="/places" text="Discover" />
            <FooterLink to="/hotels" text="Hotels" />
            <FooterLink to="/vehicles" text="Vehicles" />
            <FooterLink to="/travel-guides" text="Travel Guides" />
          </FooterSection>

          <FooterSection title="Traveler Services">
            <FooterLink to="/my-bookings" text="My Bookings" />
            <FooterLink to="/ai-planner" text="AI Trip Planner" />
            <FooterLink to="/community" text="Travel Community" />
            <FooterLink to="/hotel-owner" text="Hotel Owner Portal" />
            <FooterLink to="/vehicle-company" text="Vehicle Company Portal" />
          </FooterSection>

          <div>
            <h3 className="mb-5 text-xl font-bold">Contact Us</h3>

            <div className="space-y-4 text-gray-300">
              <div className="flex items-start gap-3">
                <FaMapMarkerAlt className="mt-1 text-orange" />
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
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange px-5 py-3 font-semibold text-white transition hover:bg-white hover:text-accent"
            >
              <FaPlaneDeparture />
              Contact Now
            </Link>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 md:flex-row">
          <p className="text-sm text-gray-400">
            © {currentYear} Travel Ease. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-gray-400">
            <Link to="/privacy-policy" className="transition hover:text-orange">
              Privacy Policy
            </Link>
            <Link to="/terms" className="transition hover:text-orange">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({ title, children }) {
  return (
    <div>
      <h3 className="mb-5 text-xl font-bold">{title}</h3>
      <ul className="space-y-3 text-gray-300">{children}</ul>
    </div>
  );
}

function FooterLink({ to, text }) {
  return (
    <li>
      <Link to={to} className="transition hover:text-orange">
        {text}
      </Link>
    </li>
  );
}

function SocialIcon({ href, label, icon }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-orange"
    >
      {icon}
    </a>
  );
}
