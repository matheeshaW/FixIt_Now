import { useEffect, useState } from 'react';
import api from '../services/api';

export default function ProfilePage() {
	const [profile, setProfile] = useState(null);
	const [fullName, setFullName] = useState('');
	const [phone, setPhone] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [message, setMessage] = useState('');
	const [errors, setErrors] = useState({ fullName: '', phone: '', newPassword: '' });

	useEffect(() => {
		const fetchProfile = async () => {
			const res = await api.get('/api/users/me');
			setProfile(res.data);
			setFullName(res.data.fullName || '');
			setPhone(res.data.phone || '');
		};
		fetchProfile();
	}, []);

	const validateProfile = () => {
		const next = { fullName: '', phone: '', newPassword: '' };
		if (!fullName.trim()) next.fullName = 'Full name is required';
		else if (fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters';
		if (phone) {
			const re = /^[0-9+\-()\s]{7,20}$/;
			if (!re.test(phone)) next.phone = 'Enter a valid phone number';
		}
		setErrors(next);
		return !next.fullName && !next.phone;
	};

	const validatePassword = () => {
		if (!newPassword) return 'Password is required';
		if (newPassword.length < 8) return 'Password must be at least 8 characters';
		if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) return 'Use upper, lower, and a number';
		return '';
	};

	const handleUpdate = async (e) => {
		e.preventDefault();
		if (!validateProfile()) return;
		if (!window.confirm('Save profile changes?')) return;
		await api.put('/api/users/me', { fullName, phone });
		setMessage('Profile updated');
	};

	const handleResetPassword = async (e) => {
		e.preventDefault();
		const pwdError = validatePassword();
		setErrors((prev) => ({ ...prev, newPassword: pwdError }));
		if (pwdError) return;
		if (!window.confirm('Reset your password now?')) return;
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
				<form noValidate onSubmit={handleUpdate}>
					<div className="mb-3">
						<label className="block text-sm mb-1">Full Name</label>
						<input className={`w-full border p-2 rounded ${errors.fullName ? 'border-red-500' : ''}`} value={fullName} onChange={(e)=>setFullName(e.target.value)} />
						{errors.fullName && <div className="text-red-600 text-sm mt-1">{errors.fullName}</div>}
					</div>
					<div className="mb-3">
						<label className="block text-sm mb-1">Email</label>
						<input className="w-full border p-2 rounded bg-gray-100" value={profile.email} readOnly />
					</div>
					<div className="mb-4">
						<label className="block text-sm mb-1">Phone</label>
						<input className={`w-full border p-2 rounded ${errors.phone ? 'border-red-500' : ''}`} value={phone} onChange={(e)=>setPhone(e.target.value)} />
						{errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
					</div>
					<button className="bg-blue-600 text-white px-4 py-2 rounded">Update</button>
				</form>
			</div>

			<div className="bg-white rounded shadow p-4">
				<h2 className="font-semibold mb-3">Reset Password</h2>
				<form noValidate onSubmit={handleResetPassword}>
					<input type="password" className={`w-full border p-2 rounded mb-1 ${errors.newPassword ? 'border-red-500' : ''}`} placeholder="New password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
					{errors.newPassword && <div className="text-red-600 text-sm mb-2">{errors.newPassword}</div>}
					<button className="bg-gray-800 text-white px-4 py-2 rounded">Reset Password</button>
				</form>
			</div>
		</div>
	);
}


