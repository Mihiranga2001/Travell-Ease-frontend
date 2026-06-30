export default function Header() {
  return (
    <header className="bg-accent h-20 flex items-center justify-between px-10 shadow-md">
      <img src="/logo.png" alt="Travell Ease" className="h-16" />

      <nav className="flex gap-6 text-primary text-xl font-semibold">
        <a href="#" className="hover:text-orange transition-colors">
          Home
        </a>
        <a href="#" className="hover:text-orange transition-colors">
          Places
        </a>
        <a href="#" className="hover:text-orange transition-colors">
          About
        </a>
        <a href="#" className="hover:text-orange transition-colors">
          Contact
        </a>
      </nav>

      <img
        src="/default.jpg"
        alt="profile"
        className="w-12 h-12 rounded-full object-cover border-2 border-orange"
      />
    </header>
  );
}