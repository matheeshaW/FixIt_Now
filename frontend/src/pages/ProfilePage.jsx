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

	if (!profile) return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="text-center">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
				<p className="text-gray-600">Loading your profile...</p>
			</div>
		</div>
	);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
			<div className="max-w-4xl mx-auto px-6">
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					<div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
						<h1 className="text-3xl font-bold text-white">My Profile</h1>
						<p className="text-blue-100 mt-2">Manage your account information and settings</p>
					</div>
					
					<div className="p-8">
						{message && (
							<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
								{message}
							</div>
						)}

						<div className="grid md:grid-cols-2 gap-8">
							{/* Profile Information */}
							<div className="space-y-6">
								<h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
									👤 Personal Information
								</h2>
								<form noValidate onSubmit={handleUpdate} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
										<input 
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
												errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`} 
											value={fullName} 
											onChange={(e)=>setFullName(e.target.value)} 
										/>
										{errors.fullName && <div className="text-red-600 text-sm mt-1">{errors.fullName}</div>}
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
										<input 
											className="w-full px-4 py-3 border rounded-lg bg-gray-100 text-gray-600" 
											value={profile.email} 
											readOnly 
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
										<input 
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
												errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`} 
											value={phone} 
											onChange={(e)=>setPhone(e.target.value)} 
										/>
										{errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}
									</div>
									<button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
										💾 Update Profile
									</button>
								</form>
							</div>

							{/* Password Reset */}
							<div className="space-y-6">
								<h2 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
									🔒 Security
								</h2>
								<form noValidate onSubmit={handleResetPassword} className="space-y-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
										<input 
											type="password" 
											className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
												errors.newPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
											}`} 
											placeholder="Enter new password" 
											value={newPassword} 
											onChange={(e)=>setNewPassword(e.target.value)} 
										/>
										{errors.newPassword && <div className="text-red-600 text-sm mt-1">{errors.newPassword}</div>}
									</div>
									<button className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg">
										🔄 Reset Password
									</button>
								</form>

								{/* Account Info */}
								<div className="bg-gray-50 rounded-lg p-4">
									<h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
									<div className="space-y-2 text-sm text-gray-600">
										<div className="flex justify-between">
											<span>Role:</span>
											<span className="font-medium capitalize">{profile.role.toLowerCase()}</span>
										</div>
										<div className="flex justify-between">
											<span>Member since:</span>
											<span className="font-medium">
												{new Date(profile.createdAt).toLocaleDateString()}
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}