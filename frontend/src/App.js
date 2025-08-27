import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import AdminDashboard from './pages/AdminDashboard';
import Navbar from './components/Navbar';

function App() {
	return (
		<BrowserRouter>
			<Navbar />
			<Routes>
				<Route path="/" element={<div className="p-6">Welcome to FixIt Now</div>} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/admin/*" element={<AdminDashboard />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

