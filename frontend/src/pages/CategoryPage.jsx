import { useEffect, useState } from 'react';
import api from '../services/api';

export default function CategoryPage() {
	const [categories, setCategories] = useState([]);
	const [form, setForm] = useState({ categoryName: '', description: '' });
	const [error, setError] = useState('');
	const [editingId, setEditingId] = useState(null);
	const [errors, setErrors] = useState({ categoryName: '', description: '' });

	const fetchCategories = async () => {
		const res = await api.get('/api/categories');
		setCategories(res.data);
	};

	useEffect(() => {
		fetchCategories();
	}, []);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm({ ...form, [name]: value });
		validateField(name, value);
	};

	const validateField = (name, value) => {
		let msg = '';
		if (name === 'categoryName') {
			if (!value?.trim()) msg = 'Category name is required';
			else if (value.trim().length < 2) msg = 'Name must be at least 2 characters';
		}
		setErrors((prev) => ({ ...prev, [name]: msg }));
		return msg;
	};

	const validateAll = () => {
		const next = {
			categoryName: validateField('categoryName', form.categoryName),
			description: ''
		};
		return Object.values(next).every((v) => !v);
	};

	const handleAdd = async (e) => {
		e.preventDefault();
		setError('');
		if (!validateAll()) return;
		try {
			if (editingId) {
				if (!window.confirm('Update this category?')) return;
				await api.put(`/api/categories/${editingId}`, form);
			} else {
				await api.post('/api/categories', form);
			}
			setForm({ categoryName: '', description: '' });
			setEditingId(null);
			setErrors({ categoryName: '', description: '' });
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
		<div className="max-w-7xl mx-auto">
			<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
				<div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
					<h1 className="text-3xl font-bold text-white flex items-center">
						<span className="mr-3">📂</span>
						Service Categories
					</h1>
					<p className="text-green-100 mt-2">Manage service categories for your platform</p>
				</div>
				
				<div className="p-8">
					{error && (
						<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
							{error}
						</div>
					)}

					{/* Add/Edit Form */}
					<div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 mb-8 border border-gray-200">
						<h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
							<span className="mr-2">{editingId ? '✏️' : '➕'}</span>
							{editingId ? 'Edit Category' : 'Add New Category'}
						</h2>
						
						<form noValidate onSubmit={handleAdd} className="space-y-4">
							<div className="grid md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
									<input 
										name="categoryName" 
										value={form.categoryName} 
										onChange={handleChange} 
										placeholder="Enter category name" 
										className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
											errors.categoryName ? 'border-red-500 bg-red-50' : 'border-gray-300'
										}`} 
									/>
									{errors.categoryName && <div className="text-red-600 text-sm mt-1">{errors.categoryName}</div>}
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
									<textarea 
										name="description" 
										value={form.description} 
										onChange={handleChange} 
										placeholder="Enter category description" 
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none" 
										rows="3"
									/>
								</div>
							</div>
							
							<div className="flex gap-3">
								<button 
									type="submit"
									className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
								>
									{editingId ? '💾 Update Category' : '➕ Add Category'}
								</button>
								{editingId && (
									<button 
										type="button" 
										onClick={() => { setEditingId(null); setForm({ categoryName: '', description: '' }); }} 
										className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
									>
										❌ Cancel
									</button>
								)}
							</div>
						</form>
					</div>

					{/* Categories List */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-gray-800 flex items-center">
							<span className="mr-2">📋</span>
							All Categories ({categories.length})
						</h3>
						
						{categories.length === 0 ? (
							<div className="text-center py-12 bg-gray-50 rounded-xl">
								<div className="text-gray-400 text-6xl mb-4">📂</div>
								<h3 className="text-lg font-semibold text-gray-600 mb-2">No categories yet</h3>
								<p className="text-gray-500">Add your first service category to get started.</p>
							</div>
						) : (
							<div className="grid gap-4">
								{categories.map((c) => (
									<div key={c.categoryId} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-green-300">
										<div className="flex items-start justify-between">
											<div className="flex-1">
												<div className="flex items-center space-x-3 mb-2">
													<div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
														<span className="text-white text-lg">📂</span>
													</div>
													<h4 className="text-xl font-semibold text-gray-800">{c.categoryName}</h4>
												</div>
												{c.description && (
													<p className="text-gray-600 ml-13">{c.description}</p>
												)}
											</div>
											<div className="flex space-x-2 ml-4">
												<button 
													onClick={() => startEdit(c)} 
													className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
												>
													✏️ Edit
												</button>
												<button 
													onClick={() => handleDelete(c.categoryId)} 
													className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
												>
													🗑️ Delete
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}