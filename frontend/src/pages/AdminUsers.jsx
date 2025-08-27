import { useEffect, useState } from 'react';
import api from '../services/api';

export default function AdminUsers() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const fetchUsers = async () => {
		try {
			setLoading(true);
			const res = await api.get('/api/users');
			setUsers(res.data);
		} catch (e) {
			setError('Failed to load users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => { fetchUsers(); }, []);

	const resetPassword = async (userId) => {
		const newPassword = prompt('Enter new password');
		if (!newPassword) return;
		await api.post(`/api/users/${userId}/reset-password`, { newPassword });
		alert('Password reset');
	};

	const deleteUser = async (userId) => {
		if (!window.confirm('Delete this user?')) return;
		await api.delete(`/api/users/${userId}`);
		setUsers(users.filter(u => u.userId !== userId));
	};

	if (loading) return <div>Loading...</div>;
	if (error) return <div className="text-red-600">{error}</div>;

	return (
		<div>
			<h1 className="text-xl font-semibold mb-4">Users</h1>
			<div className="overflow-x-auto">
				<table className="min-w-full bg-white rounded shadow">
					<thead>
						<tr className="bg-gray-100 text-left">
							<th className="p-2">ID</th>
							<th className="p-2">Name</th>
							<th className="p-2">Email</th>
							<th className="p-2">Role</th>
							<th className="p-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.map(u => (
							<tr key={u.userId} className="border-t">
								<td className="p-2">{u.userId}</td>
								<td className="p-2">{u.fullName}</td>
								<td className="p-2">{u.email}</td>
								<td className="p-2">{u.role}</td>
								<td className="p-2 space-x-2">
									<button onClick={() => resetPassword(u.userId)} className="px-3 py-1 bg-yellow-500 text-white rounded">Reset Password</button>
									<button onClick={() => deleteUser(u.userId)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}


