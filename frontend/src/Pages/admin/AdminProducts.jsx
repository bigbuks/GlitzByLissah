import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiSave,
  FiUpload,
  FiLink,
  FiImage,
} from 'react-icons/fi';
import { notify } from '../../utils/notify';   // ✅ correct
import api from '../../utils/api';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const emptyForm = {
    name: '',
    description: '',
    price: '',
    category: 'rings',
    metal: 'gold',
    image: '',
    sizes: [],
    inStock: true,
    isBestSeller: false,
  };

  const [formData, setFormData] = useState(emptyForm);

  // ✅ Track image mode: 'url' or 'upload'
  const [imageMode, setImageMode] = useState('url');

  const fetchProducts = async () => {
    // ✅ Guard
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/admin/products');
      if (response.data.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('❌ Error:', error);
      if (
        error.response?.status !== 401 &&
        error.response?.status !== 403
      ) {
        notify.error('Failed to load products');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyForm);
    setImageMode('url');
    setIsModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || 'rings',
      metal: product.metal || 'gold',
      image: product.image || '',
      sizes: product.sizes || [],
      inStock: product.inStock !== undefined ? product.inStock : true,
      isBestSeller: product.isBestSeller || false,
    });
    setImageMode('url');
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // ==========================================
  // UPLOAD IMAGE FILE
  // ==========================================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      notify.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify.error('File too large. Max 5MB.');
      return;
    }

    setUploading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', file);

      const response = await api.post('/admin/upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setFormData((prev) => ({ ...prev, image: response.data.url }));
        notify.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      notify.error(
        error.response?.data?.message || 'Failed to upload image'
      );
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.image) {
      notify.error('Please provide an image (URL or upload)');
      return;
    }

    setSaving(true);

    try {
      if (editingProduct) {
        const response = await api.put(
          `/admin/products/${editingProduct._id}`,
          formData
        );
        if (response.data.success) {
          notify.success('Product updated');
        }
      } else {
        const response = await api.post('/admin/products', formData);
        if (response.data.success) {
          notify.success('Product created');
        }
      }

      setIsModalOpen(false);
      fetchProducts();
    } catch (error) {
      console.error('❌ Save error:', error);
      notify.error(
        error.response?.data?.message || 'Failed to save product'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      const response = await api.delete(`/admin/products/${id}`);
      if (response.data.success) {
        notify.success('Product deleted');
        fetchProducts();
      }
    } catch (error) {
      console.error('❌ Delete error:', error);
      notify.error('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="font-serif text-2xl lg:text-3xl">Products</h1>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-yellow-500 text-gray-900 px-5 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition"
        >
          <FiPlus size={18} />
          Add Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
          No products yet. Click "Add Product" to create one.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {products.map((product) => (
              <div
                key={product._id}
                className="p-4 lg:p-6 flex flex-wrap items-center gap-4 hover:bg-cream transition"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="flex-1 min-w-[200px]">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-gray-500 capitalize">
                    {product.category} • {product.metal}
                  </p>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500">Price:</span>{' '}
                  <span className="font-semibold text-yellow-600">
                    ${product.price}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      product.inStock
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <div className="flex gap-2 ml-auto">
                  <button
                    onClick={() => openEditModal(product)}
                    className="p-2 text-gray-500 hover:text-yellow-600 transition"
                  >
                    <FiEdit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product._id, product.name)}
                    className="p-2 text-gray-500 hover:text-red-500 transition"
                  >
                    <FiTrash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
              <h2 className="font-serif text-xl">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="rings">Rings</option>
                    <option value="necklaces">Necklaces</option>
                    <option value="earrings">Earrings</option>
                    <option value="bracelets">Bracelets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metal
                </label>
                <select
                  name="metal"
                  value={formData.metal}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="platinum">Platinum</option>
                  <option value="rose-gold">Rose Gold</option>
                </select>
              </div>

              {/* ========================================== */}
              {/* IMAGE SECTION WITH URL/UPLOAD TOGGLE */}
              {/* ========================================== */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Image
                </label>

                {/* Toggle */}
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setImageMode('url')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                      imageMode === 'url'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiLink size={16} />
                    Paste URL
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition ${
                      imageMode === 'upload'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <FiUpload size={16} />
                    Upload File
                  </button>
                </div>

                {/* URL Mode */}
                {imageMode === 'url' && (
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                )}

                {/* Upload Mode */}
                {imageMode === 'upload' && (
                  <div>
                    <label
                      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-8 cursor-pointer transition ${
                        uploading
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-300 hover:border-yellow-500 hover:bg-yellow-50'
                      }`}
                    >
                      {uploading ? (
                        <>
                          <svg
                            className="animate-spin h-8 w-8 text-yellow-500 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                          <p className="text-sm text-yellow-600">
                            Uploading...
                          </p>
                        </>
                      ) : (
                        <>
                          <FiImage size={32} className="text-gray-400 mb-2" />
                          <p className="text-sm text-gray-600 font-medium">
                            Click to select an image
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Max 5MB • JPG, PNG, WebP
                          </p>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Image Preview */}
                {formData.image && (
                  <div className="mt-3 flex items-center gap-3 p-3 bg-cream rounded-xl">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src =
                          'https://via.placeholder.com/64?text=Error';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">
                        Image Preview
                      </p>
                      <p className="text-xs text-gray-700 truncate">
                        {formData.image}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: '' }))
                      }
                      className="text-gray-400 hover:text-red-500 transition"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="inStock"
                    checked={formData.inStock}
                    onChange={handleChange}
                    className="w-4 h-4 text-yellow-500 rounded"
                  />
                  <span className="text-sm">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isBestSeller"
                    checked={formData.isBestSeller}
                    onChange={handleChange}
                    className="w-4 h-4 text-yellow-500 rounded"
                  />
                  <span className="text-sm">Best Seller</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 border border-gray-300 py-2.5 rounded-xl font-medium hover:bg-cream transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="flex-1 bg-yellow-500 text-gray-900 py-2.5 rounded-xl font-semibold hover:bg-yellow-400 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  ) : (
                    <>
                      <FiSave size={18} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;