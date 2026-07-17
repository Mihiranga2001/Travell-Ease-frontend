import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("traveler");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function register(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhoneNumber = phoneNumber.trim();

    if (!trimmedName) {
      toast.error("Please enter your name");
      return;
    }

    if (trimmedName.length < 2) {
      toast.error("Name must contain at least 2 characters");
      return;
    }

    if (!trimmedEmail) {
      toast.error("Please enter your email");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(trimmedEmail)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must contain at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/users/register`,
        {
          name: trimmedName,
          email: trimmedEmail,
          password,
          role,
          phoneNumber: trimmedPhoneNumber,
        }
      );

      const token = response.data?.token;
      const user = response.data?.user;

      if (token && user) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role);

        toast.success("Registration successful");

        if (user.role === "admin") {
          navigate("/admin", { replace: true });
        } else if (user.role === "hotel_owner") {
          navigate("/hotel-owner", { replace: true });
        } else {
          navigate("/", { replace: true });
        }

        return;
      }

      toast.success("Registration successful. Please log in.");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Registration error:", error);

      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen bg-[url(/bg.jpg)] bg-center bg-cover bg-no-repeat flex">
      {/* Left Side */}
      <div className="hidden lg:flex w-[50%] min-h-screen justify-center items-center flex-col px-[40px]">
        <img
          src="/logo.png"
          alt="Smart AI Travel Platform Logo"
          className="w-[300px] h-[300px] mb-[20px] object-contain"
        />

        <h1 className="text-5xl text-orange text-shadow-accent text-shadow-2xl text-center font-bold">
          Discover Smarter. Travel Better.
        </h1>

        <p className="text-[30px] text-primary text-center italic mt-[20px]">
          Plan trips, book hotels, rent vehicles, connect with travelers,
          and explore Sri Lanka with AI-powered travel recommendations.
        </p>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-[50%] min-h-screen flex justify-center items-center px-[20px] py-[30px]">
        <form
          onSubmit={register}
          className="w-full max-w-[500px] min-h-[700px] backdrop-blur-lg shadow-2xl rounded-2xl flex flex-col justify-center items-center p-[30px]"
        >
          <h1 className="text-3xl text-accent font-bold mb-[25px] text-shadow-primary text-center">
            Create Account
          </h1>

          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            className="w-full h-[50px] mb-[15px] rounded-lg border border-accent p-[10px] text-[18px] focus:outline-none focus:ring-2 focus:ring-orange"
          />

          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email"
            autoComplete="email"
            className="w-full h-[50px] mb-[15px] rounded-lg border border-accent p-[10px] text-[18px] focus:outline-none focus:ring-2 focus:ring-orange"
          />

          <input
            type="text"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            placeholder="Your phone number"
            autoComplete="tel"
            className="w-full h-[50px] mb-[15px] rounded-lg border border-accent p-[10px] text-[18px] focus:outline-none focus:ring-2 focus:ring-orange"
          />

          <select
            value={role}
            onChange={(event) => setRole(event.target.value)}
            className="w-full h-[50px] mb-[15px] rounded-lg border border-accent p-[10px] text-[18px] bg-white focus:outline-none focus:ring-2 focus:ring-orange"
          >
            <option value="traveler">Traveler</option>
            <option value="hotel_owner">Hotel Owner</option>
            <option value="vehicle_company">Vehicle Company</option>
            <option value="guide">Travel Guide</option>
          </select>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create password"
            autoComplete="new-password"
            className="w-full h-[50px] mb-[15px] rounded-lg border border-accent p-[10px] text-[18px] focus:outline-none focus:ring-2 focus:ring-orange"
          />

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm password"
            autoComplete="new-password"
            className="w-full h-[50px] mb-[20px] rounded-lg border border-accent p-[10px] text-[18px] focus:outline-none focus:ring-2 focus:ring-orange"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full h-[50px] mb-[20px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <button
            type="button"
            className="w-full h-[50px] bg-accent text-white font-bold text-[20px] rounded-lg border-[2px] border-accent hover:bg-transparent hover:text-accent transition"
          >
            Register with <FcGoogle className="inline ml-2 mb-1" />
          </button>

          <p className="text-primary not-italic mt-[20px] text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-orange italic">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}