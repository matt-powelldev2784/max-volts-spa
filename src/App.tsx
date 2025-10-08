import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Welcome to Max Volts SPA
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            React 19 + Modern Stack
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded">
              <strong className="text-blue-700">React 19 RC</strong>
            </div>
            <div className="bg-green-50 p-3 rounded">
              <strong className="text-green-700">React Router</strong>
            </div>
            <div className="bg-purple-50 p-3 rounded">
              <strong className="text-purple-700">Tailwind CSS</strong>
            </div>
            <div className="bg-yellow-50 p-3 rounded">
              <strong className="text-yellow-700">Vitest</strong>
            </div>
            <div className="bg-red-50 p-3 rounded">
              <strong className="text-red-700">Testing Library</strong>
            </div>
            <div className="bg-indigo-50 p-3 rounded">
              <strong className="text-indigo-700">Prettier + ESLint</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          About
        </h1>
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            This is a modern React SPA built with the latest tools and best
            practices.
          </p>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="text-xl font-bold text-gray-800">
              Max Volts SPA
            </Link>
            <div className="space-x-6">
              <Link
                to="/"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                About
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
