import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { useCart } from '../context/CartContext';
import { notify } from '../utils/notify';
import api from '../utils/api';

const Category = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    metals: [],
    priceRange: null,
    inStock: false,
    sortBy: 'featured'
  });

  const { addToCart } = useCart();

  // ✅ Fetch products by category from backend
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/products/category/${categoryName}`);
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching category products:', error);
        notify.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [categoryName]);

  // Format category name
  const formatCategoryName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (filters.metals.length > 0) {
      filtered = filtered.filter(p => filters.metals.includes(p.metal));
    }

    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }

    if (filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, filters]);

    const handleAddToCart = (product) => {
    // Rings need a size — direct the user to the product page
    if (product.category.toLowerCase() === 'rings') {
      notify.info('Please select a size on the product page');
      return;
    }

    // CartContext fires the navbar bounce — no toast needed
    addToCart(product, null, 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Page Header */}
      <div className="panel-frosted">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-serif text-4xl mb-2">{formatCategoryName(categoryName)}</h1>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Filter Sidebar */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              setFilters={setFilters}
              hideCategoryFilter={true}
            />
          </div>

          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
            hideCategoryFilter={true}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {/* View toggle and sort */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Sort by:</span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                     className="border border-yellow-500/15 bg-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded border transition ${viewMode === 'grid' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-yellow-500/15 hover:border-yellow-500/40'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded border transition ${viewMode === 'list' ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-white border-yellow-500/15 hover:border-yellow-500/40'}`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="card-warm text-center py-16 px-6">
                <p className="text-gray-500 text-lg mb-2">No products found in this category.</p>
                <p className="text-gray-400 text-sm mb-6">
                  Try browsing our full collection instead.
                </p>
                <Link
                  to="/shop"
                  className="inline-block bg-yellow-500 text-gray-900 px-6 py-2.5 rounded-full font-semibold hover:bg-yellow-400 transition"
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-4'
                }
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {viewMode === 'grid' ? (
                      <ProductCard product={product} />
                    ) : (
                        <div className="card-warm p-4 flex space-x-4">
                        <Link to={`/product/${product._id}`} className="flex-shrink-0">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-32 h-32 object-cover rounded hover:opacity-90 transition"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/product/${product._id}`} className="hover:text-yellow-500 transition">
                            <h3 className="font-serif text-lg mb-2">{product.name}</h3>
                          </Link>
                          <p className="text-gray-600 text-sm mb-2">{product.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-xl font-semibold">${product.price}</span>
                            <button 
                              onClick={() => handleAddToCart(product)}
                              className="bg-yellow-500 text-gray-900 px-4 py-1 rounded hover:bg-yellow-400 transition"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Category;