import { Link, Routes, Route, Navigate } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import CategoryPage from './CategoryPage';
import { getRole } from '../utils/auth';

export default function AdminDashboard() {
	const role = getRole();
	if (role !== 'ADMIN') return <Navigate to="/" replace />;

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
			<div className="flex">
				{/* Sidebar */}
				<aside className="w-64 bg-white shadow-xl border-r border-gray-200 min-h-screen">
					<div className="p-6">
						<div className="flex items-center space-x-3 mb-8">
							<div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
								<span className="text-white font-bold text-lg">⚙️</span>
							</div>
							<h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
						</div>
						
						<nav className="space-y-2">
							<Link 
								to="users" 
								className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
							>
								<span className="text-xl">👥</span>
								<span className="font-medium group-hover:translate-x-1 transition-transform duration-200">User Management</span>
							</Link>
							<Link 
								to="categories" 
								className="flex items-center space-x-3 px-4 py-3 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 group"
							>
								<span className="text-xl">📂</span>
								<span className="font-medium group-hover:translate-x-1 transition-transform duration-200">Categories</span>
							</Link>
						</nav>
					</div>
				</aside>

				{/* Main Content */}
				<main className="flex-1 p-8">
					<Routes>
						<Route path="users" element={<AdminUsers />} />
						<Route path="categories" element={<CategoryPage />} />
						<Route index element={
							<div className="max-w-4xl mx-auto">
								<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
									<div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
										<h1 className="text-3xl font-bold text-white">Welcome, Admin</h1>
										<p className="text-blue-100 mt-2">Manage your platform from the admin dashboard</p>
									</div>
									<div className="p-8">
										<div className="grid md:grid-cols-2 gap-6">
											<div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
												<div className="flex items-center space-x-4">
													<div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
														<span className="text-white text-2xl">👥</span>
													</div>
													<div>
														<h3 className="text-lg font-semibold text-gray-800">User Management</h3>
														<p className="text-gray-600">Manage user accounts, reset passwords, and view user activity</p>
													</div>
												</div>
												<Link 
													to="users" 
													className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
												>
													Go to Users <span className="ml-1">→</span>
												</Link>
											</div>

											<div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
												<div className="flex items-center space-x-4">
													<div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
														<span className="text-white text-2xl">📂</span>
													</div>
													<div>
														<h3 className="text-lg font-semibold text-gray-800">Categories</h3>
														<p className="text-gray-600">Manage service categories and organize your platform content</p>
													</div>
												</div>
												<Link 
													to="categories" 
													className="inline-flex items-center mt-4 text-green-600 hover:text-green-800 font-medium transition-colors duration-200"
												>
													Go to Categories <span className="ml-1">→</span>
												</Link>
											</div>
										</div>
									</div>
								</div>
							</div>
						} />
					</Routes>
				</main>
			</div>
		</div>
	);
}