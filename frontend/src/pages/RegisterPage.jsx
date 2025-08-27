import { useState } from 'react';
import api from '../services/api';

export default function RegisterPage() {
	const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'CUSTOMER', password: '' });
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(''); setSuccess('');
		try {
			await api.post('/api/auth/register', form);
			setSuccess('Registered successfully. You can now log in.');
			setForm({ fullName: '', email: '', phone: '', role: 'CUSTOMER', password: '' });
		} catch (err) {
			setError(err.response?.data?.message || 'Registration failed');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
				<h1 className="text-2xl font-semibold mb-4">Register</h1>
				{error && <div className="text-red-600 mb-2">{error}</div>}
				{success && <div className="text-green-600 mb-2">{success}</div>}

				<label className="block mb-2 text-sm">Full Name</label>
				<input name="fullName" value={form.fullName} onChange={handleChange} className="w-full border p-2 rounded mb-3" required />

				<label className="block mb-2 text-sm">Email</label>
				<input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded mb-3" required />

				<label className="block mb-2 text-sm">Phone</label>
				<input name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded mb-3" />

				<label className="block mb-2 text-sm">Role</label>
				<select name="role" value={form.role} onChange={handleChange} className="w-full border p-2 rounded mb-3">
					<option value="CUSTOMER">Customer</option>
					<option value="PROVIDER">Provider</option>
				</select>

				<label className="block mb-2 text-sm">Password</label>
				<input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded mb-4" required />

				<button className="w-full bg-blue-600 text-white py-2 rounded">Register</button>
			</form>
		</div>
	);
}


