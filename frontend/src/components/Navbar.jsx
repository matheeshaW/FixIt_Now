import { Link, useNavigate } from 'react-router-dom';
import { getRole, isLoggedIn, logout } from '../utils/auth';
import logo from '../assets/images/fixitnowlogo.png';

export default function Navbar() {
	const navigate = useNavigate();
	const loggedIn = isLoggedIn();
	const role = getRole();

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
		<nav className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 shadow-lg border-b border-blue-700">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="flex items-center space-x-4">
						<Link to="/" className="flex items-center space-x-3 group">
							<img src={logo} alt="FixIt Now" className="h-10 w-auto transition-transform group-hover:scale-105" />
							<span className="text-2xl font-bold text-white group-hover:text-blue-200 transition-colors">FixIt Now</span>
						</Link>
					</div>
					<div className="flex items-center space-x-6">
						{loggedIn && (
							<>
								<Link to="/profile" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-700/50 hover:scale-105">
									👤 Profile
								</Link>
								{role === 'ADMIN' && (
									<Link to="/admin" className="text-white hover:text-blue-200 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-700/50 hover:scale-105">
										⚙️ Admin Dashboard
									</Link>
								)}
								<button 
									onClick={handleLogout} 
									className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
								>
									🚪 Logout
								</button>
							</>
						)}
						{!loggedIn && (
							<>
								<Link to="/register" className="text-white hover:text-blue-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-blue-700/50 hover:scale-105">
									📝 Register
								</Link>
								<Link to="/login" className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg">
									🔑 Login
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}