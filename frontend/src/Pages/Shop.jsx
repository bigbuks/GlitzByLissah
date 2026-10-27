import React, { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FiFilter, FiGrid, FiList } from 'react-icons/fi';
import { useSearchParams, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
// import { products } from '../assets/products';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { notify } from '../utils/notify';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;
  
  const [filters, setFilters] = useState({
    categories: [],
    metals: [],
    priceRange: null,
    inStock: false,
    sortBy: 'featured'
  });

  const { addToCart } = useCart();

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/products');
        if (response.data.success) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        notify.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

   // Function to handle add to cart with size check
  const handleAddToCart = (product) => {
    // Rings need a size — direct the user to the product page
    if (product.category.toLowerCase() === 'rings') {
      notify.info('Please select a size on the product page');
      return;
    }

    // CartContext fires the navbar bounce — no toast needed
    addToCart(product, null, 1);
  };

  // Filter and sort products with search
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Apply search filter
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(lowercaseQuery) ||
        (product.description && product.description.toLowerCase().includes(lowercaseQuery)) ||
        product.category.toLowerCase().includes(lowercaseQuery) ||
        (product.metal && product.metal.toLowerCase().includes(lowercaseQuery))
      );
    }

    // Filter by categories
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => filters.categories.includes(p.category));
    }

    // Filter by metals
    if (filters.metals.length > 0) {
      filtered = filtered.filter(p => filters.metals.includes(p.metal));
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(p => 
        p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }

    // Filter by stock
    if (filters.inStock) {
      filtered = filtered.filter(p => p.inStock);
    }

    // Sort products
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

    // Reset to page 1 when filters change
    setCurrentPage(1);
    
    return filtered;
  }, [filters, searchQuery, products]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  // Handle page changes - FIXED: scrolls to top properly
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top with a slight delay to ensure the page has rendered
    setTimeout(() => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
            {/* Page Header */}
      <div className="panel-frosted">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-serif text-4xl mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'Shop Our Collection'}
          </h1>
          <p className="text-gray-600">
            {searchQuery 
              ? `Found ${filteredProducts.length} matching pieces`
              : `Discover ${filteredProducts.length} beautiful pieces`
            }
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile Filter Button and View Toggle */}
        <div className="flex justify-between items-center mb-6 lg:hidden">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-warm-sm border border-yellow-500/10"
          >
            <FiFilter />
            <span>Filters</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-white'}`}
            >
              <FiGrid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-white'}`}
            >
              <FiList size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filter Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <FilterSidebar
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              setFilters={setFilters}
            />
          </div>

          {/* Mobile Filter Sidebar */}
          <FilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
            filters={filters}
            setFilters={setFilters}
          />

          {/* Products Grid */}
          <div className="flex-1">
            {/* Desktop toolbar */}
            <div className="hidden lg:flex justify-between items-center mb-6">
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
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-yellow-500 text-white' : 'bg-white border'}`}
                >
                  <FiGrid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-yellow-500 text-white' : 'bg-white border'}`}
                >
                  <FiList size={20} />
                </button>
              </div>
            </div>

            {/* Products */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  {searchQuery 
                    ? `No products found matching "${searchQuery}"`
                    : 'No products found matching your filters.'
                  }
                </p>
                <button
                  onClick={() => {
                    setFilters({
                      categories: [],
                      metals: [],
                      priceRange: null,
                      inStock: false,
                      sortBy: 'featured'
                    });
                    if (searchQuery) {
                      window.location.href = '/shop';
                    }
                  }}
                  className="mt-4 text-yellow-500 hover:text-yellow-600 transition"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
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
                  {currentProducts.map((product, index) => (
                    <motion.div
                      key={product._id || product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {viewMode === 'grid' ? (
                        <ProductCard product={product} />
                      ) : (
                        <div className="card-warm p-4 flex space-x-4">
                          <Link to={`/product/${product._id || product.id}`} className="flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-32 h-32 object-cover rounded hover:opacity-90 transition"
                            />
                          </Link>
                          <div className="flex-1">
                            <Link to={`/product/${product._id || product.id}`} className="hover:text-yellow-500 transition">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12 space-x-2">
                    <button
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border rounded transition ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-yellow-500 hover:text-white hover:border-yellow-500'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' ? goToPage(page) : null}
                        disabled={page === '...'}
                        className={`px-4 py-2 border rounded transition ${
                          page === '...'
                            ? 'bg-white text-gray-600 cursor-default'
                            : currentPage === page
                            ? 'bg-yellow-500 text-white border-yellow-500'
                            : 'hover:bg-yellow-500 hover:text-white hover:border-yellow-500'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-4 py-2 border rounded transition ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-yellow-500 hover:text-white hover:border-yellow-500'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;