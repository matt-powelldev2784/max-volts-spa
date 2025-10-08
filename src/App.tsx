import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function Home() {
  return (
    <h1 className="text-4xl font-bold text-red-500 mb-8 text-center bg-yellow-200 p-4 rounded">
      Welcome to Max Volts SPA
    </h1>
  );
}

function About() {
  return (
    <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">About</h1>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
