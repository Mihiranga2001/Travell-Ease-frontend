import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Hello React
        </h1>

        <p className="text-gray-600 mb-6">
          This is a basic Tailwind CSS page.
        </p>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Click Me
        </button>
      </div>
    </div>
  );
}

export default App;