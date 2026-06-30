
export default function Footer() {
  return (
    <footer className="bg-accent/80 text-primary">
      <div className="grid grid-cols-4 gap-8 px-10 py-6">
        <div>
          <img src="/logo.png" alt="Travell Ease" className="h-16 mb-4" />
          <p className="text-sm">Discover amazing places easily.</p>
          <p className="text-sm">Plan your journey faster and smarter.</p>
        </div>

        <div>
          <h2 className="text-xl mb-4">Quick Links</h2>
          <p>Home</p>
          <p>Places</p>
          <p>About</p>
          <p>Contact</p>
        </div>

        <div>
          <h2 className="text-xl mb-4">Explore</h2>
          <p>Beaches</p>
          <p>Mountains</p>
          <p>Cities</p>
          <p>Adventure</p>
        </div>

        <div>
          <h2 className="text-xl mb-4">Contact</h2>
          <p>support@gmail.com</p>
          <p>Sri Lanka</p>
          <p>0778189165</p>
          <p className="mt-4 text-xl">📷 in ▶️ f ♪ 💬</p>
        </div>
      </div>

      <div className="bg-primary/20 text-center py-2">
        © 2026 Travell Ease. All rights reserved.
      </div>
    </footer>
  );
}
