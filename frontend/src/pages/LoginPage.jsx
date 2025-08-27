import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getRole } from '../utils/auth';

export default function LoginPage() {
	const [form, setForm] = useState({ email: '', password: '' });
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		try {
			const res = await api.post('/api/auth/login', form);
			localStorage.setItem('token', res.data.token);
			const role = getRole();
			if (role === 'ADMIN') navigate('/admin');
			else if (role === 'PROVIDER') navigate('/profile');
			else navigate('/');
		} catch (err) {
			setError('Invalid credentials');
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
				<h1 className="text-2xl font-semibold mb-4">Login</h1>
				{error && <div className="text-red-600 mb-2">{error}</div>}

				<label className="block mb-2 text-sm">Email</label>
				<input type="email" name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded mb-3" required />

				<label className="block mb-2 text-sm">Password</label>
				<input type="password" name="password" value={form.password} onChange={handleChange} className="w-full border p-2 rounded mb-4" required />

				<button className="w-full bg-blue-600 text-white py-2 rounded">Login</button>
			</form>
		</div>
	);
}


