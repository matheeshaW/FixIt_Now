import { useState } from 'react';
import api from '../services/api';

export default function RegisterPage() {
	const [form, setForm] = useState({ fullName: '', email: '', phone: '', role: 'CUSTOMER', password: '' });
	const [errors, setErrors] = useState({});
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [submitting, setSubmitting] = useState(false);

	const validators = {
		fullName: (v) => {
			if (!v?.trim()) return 'Full name is required';
			if (v.trim().length < 2) return 'Full name must be at least 2 characters';
			return '';
		},
		email: (v) => {
			if (!v) return 'Email is required';
			const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return re.test(v) ? '' : 'Enter a valid email address';
		},
		phone: (v) => {
			if (!v) return '';
			const re = /^[0-9+\-()\s]{7,20}$/;
			return re.test(v) ? '' : 'Enter a valid phone number';
		},
		role: (v) => (!v ? 'Role is required' : ''),
		password: (v) => {
			if (!v) return 'Password is required';
			if (v.length < 8) return 'Password must be at least 8 characters';
			if (!/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/[0-9]/.test(v)) return 'Use upper, lower, and a number';
			return '';
		},
	};

	const validateField = (name, value) => {
		const msg = validators[name] ? validators[name](value) : '';
		setErrors((prev) => ({ ...prev, [name]: msg }));
		return msg;
	};

	const validateAll = () => {
		const nextErrors = Object.keys(form).reduce((acc, k) => {
			acc[k] = validators[k] ? validators[k](form[k]) : '';
			return acc;
		}, {});
		setErrors(nextErrors);
		return Object.values(nextErrors).every((m) => !m);
	};

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((f) => ({ ...f, [name]: value }));
		validateField(name, value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError(''); setSuccess('');
		if (!validateAll()) return;
		setSubmitting(true);
		try {
			await api.post('/api/auth/register', form);
			setSuccess('Registered successfully. You can now log in.');
			setForm({ fullName: '', email: '', phone: '', role: 'CUSTOMER', password: '' });
			setErrors({});
		} catch (err) {
			setError(err.response?.data?.message || 'Registration failed');
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
			<form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-6 rounded shadow">
				<h1 className="text-2xl font-semibold mb-4">Register</h1>
				{error && <div className="text-red-600 mb-2">{error}</div>}
				{success && <div className="text-green-600 mb-2">{success}</div>}

				<label className="block mb-2 text-sm">Full Name</label>
				<input name="fullName" value={form.fullName} onChange={handleChange} className={`w-full border p-2 rounded ${errors.fullName ? 'border-red-500' : ''}`} required />
				{errors.fullName && <div className="text-red-600 text-sm mt-1">{errors.fullName}</div>}

				<label className="block mb-2 text-sm mt-3">Email</label>
				<input type="email" name="email" value={form.email} onChange={handleChange} className={`w-full border p-2 rounded ${errors.email ? 'border-red-500' : ''}`} required />
				{errors.email && <div className="text-red-600 text-sm mt-1">{errors.email}</div>}

				<label className="block mb-2 text-sm mt-3">Phone</label>
				<input name="phone" value={form.phone} onChange={handleChange} className={`w-full border p-2 rounded ${errors.phone ? 'border-red-500' : ''}`} placeholder="Optional" />
				{errors.phone && <div className="text-red-600 text-sm mt-1">{errors.phone}</div>}

				<label className="block mb-2 text-sm mt-3">Role</label>
				<select name="role" value={form.role} onChange={handleChange} className={`w-full border p-2 rounded ${errors.role ? 'border-red-500' : ''}`} required>
					<option value="CUSTOMER">Customer</option>
					<option value="PROVIDER">Provider</option>
					<option value="ADMIN">Admin</option>
				</select>
				{errors.role && <div className="text-red-600 text-sm mt-1">{errors.role}</div>}

				<label className="block mb-2 text-sm mt-3">Password</label>
				<input type="password" name="password" value={form.password} onChange={handleChange} className={`w-full border p-2 rounded ${errors.password ? 'border-red-500' : ''}`} required />
				{errors.password && <div className="text-red-600 text-sm mt-1">{errors.password}</div>}

				<button disabled={submitting} className="w-full bg-blue-600 text-white py-2 rounded mt-4 disabled:opacity-60">{submitting ? 'Submitting...' : 'Register'}</button>
			</form>
		</div>
	);
}


