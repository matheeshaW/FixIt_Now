import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
	const [profile, setProfile] = useState(null);
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [message, setMessage] = useState('');

	useEffect(() => {
		const fetchProfile = async () => {
			const res = await api.get('/api/users/me');
			setProfile(res.data);
			setFullName(res.data.fullName || '');
			setPhone(res.data.phone || '');
		};
		fetchProfile();
	}, []);

	const handleUpdate = async (e) => {
		e.preventDefault();
		await api.put('/api/users/me', { fullName, phone });
		setMessage('Profile updated');
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		if (!newPassword) return;
		await api.post('/api/users/me/reset-password', { newPassword });
		setMessage('Password reset');
		setNewPassword('');
	};

	if (!profile) return <div className="p-6">Loading...</div>;

	return (
		<div className="max-w-2xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">My Profile</h1>
			{message && <div className="text-green-600 mb-2">{message}</div>}
			<div className="bg-white rounded shadow p-4 mb-6">
				<form onSubmit={handleUpdate}>
					<div className="mb-3">
						<label className="block text-sm mb-1">Full Name</label>
						<input className="w-full border p-2 rounded" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
					</div>
					<div className="mb-3">
						<label className="block text-sm mb-1">Email</label>
						<input className="w-full border p-2 rounded bg-gray-100" value={profile.email} readOnly />
					</div>
					<div className="mb-4">
						<label className="block text-sm mb-1">Phone</label>
						<input className="w-full border p-2 rounded" value={phone} onChange={(e)=>setPhone(e.target.value)} />
					</div>
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
				</form>
			</div>

			<div className="bg-white rounded shadow p-4">
				<h2 className="font-semibold mb-3">Reset Password</h2>
				<form onSubmit={handleResetPassword}>
					<input type="password" className="w-full border p-2 rounded mb-3" placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
					<button className="bg-gray-800 text-white px-4 py-2 rounded">Reset Password</button>
				</form>
			</div>
		</div>
	);
}


