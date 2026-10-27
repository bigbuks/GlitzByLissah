import React from 'react';
import { FiX } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';

const FilterSidebar = ({ isOpen, onClose, filters, setFilters, hideCategoryFilter = false }) => {
  
  const categories = ['rings', 'necklaces', 'earrings', 'bracelets'];
  const metals = ['gold', 'silver', 'platinum', 'rose-gold'];
  const priceRanges = [
    { label: 'Under $500', min: 0, max: 500 },
    { label: '$500 - $1000', min: 500, max: 1000 },
    { label: '$1000 - $2000', min: 1000, max: 2000 },
    { label: '$2000 - $5000', min: 2000, max: 5000 },
    { label: '$5000+', min: 5000, max: 100000 }
  ];

  const handleCategoryChange = (category) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleMetalChange = (metal) => {
    setFilters(prev => ({
      ...prev,
      metals: prev.metals.includes(metal)
        ? prev.metals.filter(m => m !== metal)
        : [...prev.metals, metal]
    }));
  };

  // ✅ CHANGED: Price range now toggles on/off like a checkbox
  const handlePriceChange = (range) => {
    setFilters(prev => {
      const isSelected = prev.priceRange?.min === range.min && prev.priceRange?.max === range.max;
      // If already selected, uncheck it (set to null)
      // Otherwise, select the new range
      return {
        ...prev,
        priceRange: isSelected ? null : range
      };
    });
  };

  const handleAvailabilityChange = () => {
    setFilters(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      metals: [],
      priceRange: null,
      inStock: false,
      sortBy: 'featured'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-white z-50 overflow-y-auto lg:static lg:translate-x-0 lg:w-64 lg:z-0"
          >
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6 lg:hidden">
                <h2 className="font-serif text-xl">Filters</h2>
                <button onClick={onClose} className="p-2">
                  <FiX size={20} />
                </button>
              </div>

              {/* Clear filters button */}
              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-yellow-500 transition mb-6"
              >
                Clear all filters
              </button>

              {/* Categories filter */}
              {!hideCategoryFilter && (
                <div className="mb-8">
                  <h3 className="font-serif text-lg mb-4">Categories</h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category)}
                          onChange={() => handleCategoryChange(category)}
                          className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                        />
                        <span className="text-gray-700 group-hover:text-yellow-500 transition capitalize">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Metal type filter */}
              <div className="mb-8">
                <h3 className="font-serif text-lg mb-4">Metal Type</h3>
                <div className="space-y-3">
                  {metals.map(metal => (
                    <label key={metal} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.metals.includes(metal)}
                        onChange={() => handleMetalChange(metal)}
                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-gray-700 group-hover:text-yellow-500 transition capitalize">
                        {metal.replace('-', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ✅ CHANGED: Price range now uses checkboxes */}
              <div className="mb-8">
                <h3 className="font-serif text-lg mb-4">Price Range</h3>
                <div className="space-y-3">
                  {priceRanges.map(range => (
                    <label key={range.label} className="flex items-center space-x-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max}
                        onChange={() => handlePriceChange(range)}
                        className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                      />
                      <span className="text-gray-700 group-hover:text-yellow-500 transition">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability filter */}
              <div className="mb-8">
                <h3 className="font-serif text-lg mb-4">Availability</h3>
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={handleAvailabilityChange}
                    className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                  />
                  <span className="text-gray-700 group-hover:text-yellow-500 transition">
                    In stock only
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;