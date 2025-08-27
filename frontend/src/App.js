import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import ProfilePage from './pages/ProfilePage';
import CategoryPage from './pages/CategoryPage';

function App() {
	const token = localStorage.getItem('token');
	return (
		<BrowserRouter>
			<nav className="p-4 bg-gray-800 text-white flex gap-4">
				<Link to="/">Home</Link>
				<Link to="/register">Register</Link>
				<Link to="/login">Login</Link>
				{token && <Link to="/profile">Profile</Link>}
				<Link to="/categories">Categories</Link>
			</nav>
			<Routes>
				<Route path="/" element={<div className="p-6">Welcome to FixIt Now</div>} />
				<Route path="/register" element={<RegisterPage />} />
				<Route path="/login" element={<LoginPage />} />
				<Route path="/profile" element={<ProfilePage />} />
				<Route path="/categories" element={<CategoryPage />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;

