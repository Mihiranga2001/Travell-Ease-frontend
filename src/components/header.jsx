import logo from "../assets/Travell-logo-transparent.png";
import defaultImage from "../assets/default.jpg";

export default function Header() {
  return (
    <header className="bg-blue-500 h-20 flex items-center justify-between px-10">
      <img src={logo} alt="Travell Ease" className="h-16" />

      <nav className="flex gap-6 text-white text-xl font-semibold">
        <a href="#">Home</a>
        <a href="#">Places</a>
        <a href="#">About</a>
        <a href="#">Contact</a>
      </nav>

      <img
        src={defaultImage} // Replace with the actual image URL or path to your default"
        alt="profile"
        className="w-12 h-12 rounded-full"
      />
    </header>
  );
}
