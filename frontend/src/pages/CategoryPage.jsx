import { useEffect, useState } from 'react';
import api from '../services/api';


export default function CategoryPage() {
	const [categories, setCategories] = useState([]);
	const [form, setForm] = useState({ categoryName: '', description: '' });
	const [error, setError] = useState('');
	const [editingId, setEditingId] = useState(null);

	const fetchCategories = async () => {
		const res = await api.get('/api/categories');
		setCategories(res.data);
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleAdd = async (e) => {
		e.preventDefault();
		setError('');
		try {
			if (editingId) {
				if (!window.confirm('Update this category?')) return;
				await api.put(`/api/categories/${editingId}`, form);
			} else {
				await api.post('/api/categories', form);
			}
			setForm({ categoryName: '', description: '' });
			setEditingId(null);
			fetchCategories();
		} catch (err) {
			setError('Only admins can manage categories');
		}
	};

	const startEdit = (c) => {
		setEditingId(c.categoryId);
		setForm({ categoryName: c.categoryName || '', description: c.description || '' });
	};

	const handleDelete = async (id) => {
		if (!window.confirm('Delete this category?')) return;
		await api.delete(`/api/categories/${id}`);
		fetchCategories();
	};

	return (
		<div className="max-w-3xl mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">Service Categories</h1>
			{error && <div className="text-red-600 mb-2">{error}</div>}
			<div className="bg-white rounded shadow p-4 mb-6">
				<form onSubmit={handleAdd} className="grid grid-cols-1 gap-3">
					<input name="categoryName" value={form.categoryName} onChange={handleChange} placeholder="Category name" className="border p-2 rounded" />
					<textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 rounded" />
					<div className="flex gap-2">
						<button className="bg-blue-600 text-white px-4 py-2 rounded">{editingId ? 'Update Category' : 'Add Category'}</button>
						{editingId && (
							<button type="button" onClick={() => { setEditingId(null); setForm({ categoryName: '', description: '' }); }} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
						)}
					</div>
				</form>
			</div>

			<ul className="space-y-3">
				{categories.map((c) => (
					<li key={c.categoryId} className="bg-white p-4 rounded shadow">
						<div className="flex items-center justify-between">
							<div>
								<div className="font-semibold">{c.categoryName}</div>
								<div className="text-sm text-gray-600">{c.description}</div>
							</div>
							<div className="space-x-2">
								<button onClick={() => startEdit(c)} className="px-3 py-1 bg-yellow-500 text-white rounded">Edit</button>
								<button onClick={() => handleDelete(c.categoryId)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
							</div>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}


