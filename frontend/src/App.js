import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={<div className="p-6">Welcome to FixIt Now</div>}
        />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/provider/*" element={<ProviderDashboard />} />
        <Route path="/customer/*" element={<CustomerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
