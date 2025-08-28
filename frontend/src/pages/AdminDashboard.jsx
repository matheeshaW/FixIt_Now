import { Link, Routes, Route, Navigate } from 'react-router-dom';
import AdminUsers from './AdminUsers';
import CategoryPage from './CategoryPage';
import { getRole } from '../utils/auth';

export default function AdminDashboard() {
	const role = getRole();
	if (role !== 'ADMIN') return <Navigate to="/" replace />;

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="flex">
				<aside className="w-64 bg-white border-r min-h-[calc(100vh-64px)] p-4">
					<nav className="space-y-2">
						<Link to="users" className="block px-3 py-2 rounded hover:bg-gray-100">Users</Link>
						<Link to="categories" className="block px-3 py-2 rounded hover:bg-gray-100">Categories</Link>
					</nav>
				</aside>
				<main className="flex-1 p-6">
					<Routes>
						<Route path="users" element={<AdminUsers />} />
						<Route path="categories" element={<CategoryPage />} />
						<Route index element={<div>Welcome, Admin</div>} />
					</Routes>
				</main>
			</div>
		</div>
	);
}


