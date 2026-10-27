import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { FiHeart, FiShoppingCart, FiChevronLeft, FiChevronRight, FiCheck } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCurrency } from '../context/CurrencyContext';
import { notify } from '../utils/notify';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { formatPrice } = useCurrency();

    const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

    const productImages = product ? [
        product.image,
        product.image?.replace('w=800', 'w=800&sat=100'),
        product.image?.replace('w=800', 'w=800&bright=-10'),
        product.image?.replace('w=800', 'w=800&con=20')
    ] : [];

    const sizes = ['5', '6', '7', '8', '9', '10'];

    useEffect(() => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/products/${id}`);
                if (response.data.success) {
                    const foundProduct = response.data.product;
                    setProduct(foundProduct);

                    const relatedResponse = await api.get('/products');
                    if (relatedResponse.data.success) {
                        const filtered = relatedResponse.data.products
                            .filter(p => p._id !== foundProduct._id &&
                                (p.category === foundProduct.category || p.metal === foundProduct.metal))
                            .slice(0, 4);
                        setRelatedProducts(filtered);
                    }
                } else {
                    navigate('/shop');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
                notify.error('Failed to load product');
                navigate('/shop');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id, navigate]);

    const handleAddToCart = () => {
        if ((product.category === 'rings' || product.category === 'bracelets') && !selectedSize) {
            // 👇 Swap for inline validation later if you want
            notify.error('Please select a size');
            return;
        }

        // ✅ CartContext fires the success toast — do NOT fire another one here
        addToCart(product, selectedSize, quantity);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleBuyNow = () => {
        if ((product.category === 'rings' || product.category === 'bracelets') && !selectedSize) {
            notify.error('Please select a size');
            return;
        }

        // ✅ Silent add — no duplicate toast, just navigate
        addToCart(product, selectedSize, quantity);
        navigate('/checkout');
    };

    const handleWishlistToggle = () => {
        // ✅ Silent — the heart icon fill is the feedback
        if (isWishlisted) {
            removeFromWishlist(product._id || product.id);
        } else {
            addToWishlist(product);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-serif mb-3">Product not found</h2>
                    <Link to="/shop" className="text-yellow-500 hover:text-yellow-600 transition">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-cream">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Breadcrumb */}
                <nav className="flex mb-8 text-sm">
                    <Link to="/" className="text-gray-500 hover:text-yellow-500 transition">Home</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to="/shop" className="text-gray-500 hover:text-yellow-500 transition">Shop</Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <Link to={`/category/${product.category}`} className="text-gray-500 hover:text-yellow-500 transition capitalize">
                        {product.category}
                    </Link>
                    <span className="mx-2 text-gray-400">/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                {/* Main Product Section */}
               <div className="card-warm p-6 md:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column - Images */}
                        <div>
                            <div className="relative aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                                <motion.img
                                    key={selectedImage}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                    src={productImages[selectedImage] || product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />

                                <button
                                    onClick={() => setSelectedImage(prev => (prev > 0 ? prev - 1 : productImages.length - 1))}
                                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                                >
                                    <FiChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setSelectedImage(prev => (prev < productImages.length - 1 ? prev + 1 : 0))}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition"
                                >
                                    <FiChevronRight size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {productImages.map((img, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition ${selectedImage === index ? 'border-yellow-500' : 'border-transparent hover:border-yellow-500/40'
                                            }`}
                                    >
                                        <img src={img || product.image} alt={`${product.name} view ${index + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Column - Product Info */}
                        <div>
                            <h1 className="font-serif text-3xl md:text-4xl mb-2">{product.name}</h1>
                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-2xl font-bold text-gray-900">{formatPrice(product.price)}</span>
                                {!product.inStock && (
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-2 mb-6">
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <svg key={star} className="w-5 h-5 text-yellow-500 fill-current" viewBox="0 0 24 24">
                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                        </svg>
                                    ))}
                                </div>
                                <span className="text-gray-600">(12 reviews)</span>
                            </div>

                            <p className="text-gray-600 mb-6">{product.description}</p>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Metal Type</h3>
                                <div className="flex items-center space-x-2">
                                    <span className="px-4 py-2 bg-cream-deep/60 border border-yellow-500/15 rounded-lg capitalize">{product.metal?.replace('-', ' ') || 'N/A'}</span>
                                </div>
                            </div>

                            {(product.category === 'rings' || product.category === 'bracelets') && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-semibold">Select Size</h3>
                                        <button className="text-sm text-yellow-500 hover:text-yellow-600 transition">
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-12 h-12 rounded-full border-2 transition ${selectedSize === size
                                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700 shadow-warm-sm'
                                                    : 'border-yellow-500/20 hover:border-yellow-500'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="font-semibold mb-2">Quantity</h3>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="w-10 h-10 border border-yellow-500/20 rounded-lg hover:bg-yellow-50 hover:border-yellow-500/40 transition"
                                    >
                                        -
                                    </button>
                                    <span className="w-12 text-center font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="w-10 h-10 border border-yellow-500/20 rounded-lg hover:bg-yellow-50 hover:border-yellow-500/40 transition"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className="flex-1 bg-yellow-500 text-gray-900 px-4 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition disabled:bg-gray-300 disabled:cursor-not-allowed relative overflow-hidden text-sm sm:text-base"
                                >
                                    <AnimatePresence mode="wait">
                                        {addedToCart ? (
                                            <motion.span
                                                key="success"
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                className="flex items-center justify-center"
                                            >
                                                <FiCheck className="mr-2" /> Added!
                                            </motion.span>
                                        ) : (
                                            <motion.span
                                                key="add"
                                                initial={{ opacity: 0, y: -20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 20 }}
                                                className="flex items-center justify-center"
                                            >
                                                <FiShoppingCart className="mr-2" /> Add to Cart
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </button>

                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.inStock}
                                    className="flex-1 bg-gray-900 text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 hover:shadow-warm transition-all disabled:bg-gray-300 disabled:cursor-not-allowed text-sm sm:text-base"
                                >
                                    Buy Now
                                </button>

                                <button 
                                    onClick={handleWishlistToggle}
                                    className={`sm:w-auto px-4 py-3 border rounded-lg transition flex items-center justify-center ${
                                        isWishlisted 
                                            ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100' 
                                            : 'border-yellow-500/20 hover:bg-yellow-50 hover:border-yellow-500/40'
                                    }`}
                                >
                                    <FiHeart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                                </button>
                            </div>

                            <div className="mt-8 pt-8 border-t">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">SKU:</span>
                                        <span className="ml-2 font-medium">JWL-{product._id?.slice(-4) || product.id}0{product._id?.slice(-4) || product.id}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Category:</span>
                                        <span className="ml-2 font-medium capitalize">{product.category}</span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Availability:</span>
                                        <span className={`ml-2 font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Metal:</span>
                                        <span className="ml-2 font-medium capitalize">{product.metal?.replace('-', ' ') || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <div className="text-center mb-8">
                            <p className="text-xs tracking-[0.35em] uppercase text-yellow-600 mb-3 font-light">
                                Complete the Look
                            </p>
                            <h2 className="font-serif text-3xl md:text-4xl mb-4">You May Also Like</h2>
                            <div className="mx-auto h-px w-20 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct._id || relatedProduct.id}
                                    to={`/product/${relatedProduct._id || relatedProduct.id}`}
                                    className="card-warm overflow-hidden hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
                                >
                                    <img
                                        src={relatedProduct.image}
                                        alt={relatedProduct.name}
                                        className="w-full h-48 object-cover"
                                    />
                                    <div className="p-4">
                                        <h3 className="font-serif font-semibold mb-2">{relatedProduct.name}</h3>
                                        <p className="text-yellow-600 font-bold">{formatPrice(relatedProduct.price)}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;