import { Link } from "react-router-dom";

export default function UserData() {
  return (
    <div className="flex items-center gap-4 text-primary">
      <Link to="/login" className="hover:text-white transition">
        Login
      </Link>

      <Link
        to="/register"
        className="bg-white text-accent px-4 py-2 rounded-full hover:bg-gray-200 transition"
      >
        Register
      </Link>
    </div>
  );
}