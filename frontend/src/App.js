import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProviderDashboard from "./pages/ProviderDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route
              path="/"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center max-w-4xl mx-auto px-6">
                    <h1 className="text-6xl font-bold text-gray-800 mb-6">
                      Welcome to{" "}
                      <span className="text-blue-600">FixIt Now</span>
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                      Your trusted local service marketplace. Connect with
                      skilled professionals or offer your services to help
                      others in your community.
                    </p>
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-4xl mb-4">🔧</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Find Services
                        </h3>
                        <p className="text-gray-600">
                          Discover skilled professionals for all your repair and
                          maintenance needs.
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-4xl mb-4">💼</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Offer Services
                        </h3>
                        <p className="text-gray-600">
                          Share your expertise and help others while earning
                          money.
                        </p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <div className="text-4xl mb-4">🤝</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                          Trust & Safety
                        </h3>
                        <p className="text-gray-600">
                          Verified professionals and secure transactions for
                          peace of mind.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/provider/*" element={<ProviderDashboard />} />
            <Route path="/customer/*" element={<CustomerDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
