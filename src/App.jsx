import './App.css'
import Header from "./components/Header";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from './pages/loginPage';
import AdminPage from './pages/adminPage';
import HotelOwnerPage from './pages/hotelOwnerPage';
import RegisterPage from './pages/registerPage';
import HomePage from './pages/homePage';
import DiscoverPage from './pages/discoverPage';
import HotelPage from './pages/hotelsPage';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Toaster position="top-right"/>
        <Routes>
          <Route path="/*" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
          <Route path="/hotel-owner/*" element={<HotelOwnerPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/Places" element={<DiscoverPage />} />
          <Route path="/hotels" element={<HotelPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;