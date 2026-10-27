// import React from 'react';
// // eslint-disable-next-line no-unused-vars
// import { motion, AnimatePresence } from 'framer-motion';
// import { FiX, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
// import { Link, useNavigate } from 'react-router-dom';
// import { useCart } from '../context/CartContext';

// const CartSidebar = () => {
//     const navigate = useNavigate();
//     const {
//         cartItems,
//         cartTotal,
//         isCartOpen,
//         setIsCartOpen,
//         removeFromCart,
//         updateQuantity
//     } = useCart();

//     const handleCheckout = () => {
//         setIsCartOpen(false);
//         navigate('/checkout');
//     };

//     // Different animations for mobile vs desktop
//     const sidebarVariants = {
//         hidden: {
//             x: '100%',
//             opacity: 0
//         },
//         visible: {
//             x: 0,
//             opacity: 1,
//             transition: {
//                 type: 'tween',
//                 duration: 0.3
//             }
//         },
//         exit: {
//             x: '100%',
//             opacity: 0,
//             transition: {
//                 type: 'tween',
//                 duration: 0.3
//             }
//         }
//     };

//     const fullscreenVariants = {
//         hidden: {
//             opacity: 0,
//             scale: 0.95
//         },
//         visible: {
//             opacity: 1,
//             scale: 1,
//             transition: {
//                 type: 'spring',
//                 damping: 25,
//                 stiffness: 300
//             }
//         },
//         exit: {
//             opacity: 0,
//             scale: 0.95,
//             transition: {
//                 duration: 0.2
//             }
//         }
//     };

//     return (
//         <AnimatePresence>
//             {isCartOpen && (
//                 <>
//                     {/* Backdrop */}
//                     <motion.div
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         onClick={() => setIsCartOpen(false)}
//                         className="fixed inset-0 bg-black bg-opacity-50 z-50"
//                     />

//                     {/* Cart Panel */}
//                     <motion.div
//                         variants={window.innerWidth >= 1024 ? fullscreenVariants : sidebarVariants}
//                         initial="hidden"
//                         animate="visible"
//                         exit="exit"
//                         className={`
//               fixed z-50 flex flex-col bg-white shadow-xl
              
//               // Mobile styles
//               right-0 top-0 h-full w-full max-w-md
              
//               // Desktop styles - Full screen with single column
//               lg:fixed lg:inset-0 lg:w-full lg:max-w-none lg:h-screen lg:rounded-none
//             `}
//                     >
//                         {/* Header */}
//                         <div className="flex items-center justify-between px-4 py-3 border-b lg:px-30 lg:py-4">
//                             <div className="flex items-center space-x-2">
//                                 <FiShoppingCart size={18} className="text-gray-700" />
//                                 <h2 className="font-serif text-lg lg:text-xl">
//                                     Your Cart <span className="text-gray-500 text-sm ml-1">({cartItems.length} items)</span>
//                                 </h2>
//                             </div>
//                             <button
//                                 onClick={() => setIsCartOpen(false)}
//                                 className="p-1.5 hover:bg-gray-100 rounded-full transition"
//                             >
//                                 <FiX size={18} />
//                             </button>
//                         </div>

//                         {/* Cart Items Container - Takes available space */}
//                         <div className="flex-1 overflow-y-auto bg-cream p-3 lg:p-6">
//                             {cartItems.length === 0 ? (
//                                 <div className="h-full flex flex-col items-center justify-center text-center">
//                                     <FiShoppingCart size={48} className="text-gray-300 mb-3" />
//                                     <p className="text-gray-500 text-base mb-4">Your cart is empty</p>
//                                     <button
//                                         onClick={() => {
//                                             setIsCartOpen(false);
//                                             navigate('/shop');
//                                         }}
//                                         className="bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition"
//                                     >
//                                         Continue Shopping
//                                     </button>
//                                 </div>
//                             ) : (
//                                 <div className="max-w-2xl mx-auto space-y-3">
//                                     {cartItems.map((item) => (
//                                         <motion.div
//                                             key={`${item.id}-${item.size}`}
//                                             initial={{ opacity: 0, y: 20 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             exit={{ opacity: 0, x: -100 }}
//                                             className="bg-white rounded-lg shadow-sm p-3 border"
//                                         >
//                                             <div className="flex space-x-3">
//                                                 {/* Product Image */}
//                                                 <Link
//                                                     to={`/product/${item.id}`}
//                                                     onClick={() => setIsCartOpen(false)}
//                                                     className="w-16 h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0"
//                                                 >
//                                                     <img
//                                                         src={item.image}
//                                                         alt={item.name}
//                                                         className="w-full h-full object-cover"
//                                                     />
//                                                 </Link>

//                                                 {/* Product Details */}
//                                                 <div className="flex-1">
//                                                     <div className="flex justify-between">
//                                                         <Link
//                                                             to={`/product/${item.id}`}
//                                                             onClick={() => setIsCartOpen(false)}
//                                                             className="font-serif font-medium hover:text-yellow-500 transition text-sm lg:text-base"
//                                                         >
//                                                             {item.name}
//                                                         </Link>
//                                                         <button
//                                                             onClick={() => removeFromCart(item.id, item.size)}
//                                                             className="text-gray-400 hover:text-red-500 transition ml-1"
//                                                         >
//                                                             <FiTrash2 size={14} />
//                                                         </button>
//                                                     </div>

//                                                     {item.size && (
//                                                         <p className="text-xs text-gray-500">Size: {item.size}</p>
//                                                     )}

//                                                     <div className="flex items-center justify-between mt-2">
//                                                         <div className="flex items-center border rounded-md">
//                                                             <button
//                                                                 onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}
//                                                                 className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-l-md transition text-sm"
//                                                             >
//                                                                 -
//                                                             </button>
//                                                             <span className="w-6 text-center text-xs">{item.quantity}</span>
//                                                             <button
//                                                                 onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}
//                                                                 className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-r-md transition text-sm"
//                                                             >
//                                                                 +
//                                                             </button>
//                                                         </div>
//                                                         <span className="font-medium text-sm">
//                                                             ${(item.price * item.quantity).toLocaleString()}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>

//                         {/* Footer - Fixed at bottom */}
//                         {cartItems.length > 0 && (
//                             <div className="border-t bg-white p-3">
//                                 <div className="max-w-2xl mx-auto">
//                                     <div className="flex justify-between items-center mb-2">
//                                         <span className="text-gray-600 text-xs">Subtotal</span>
//                                         <span className="font-bold text-base text-yellow-600">
//                                             ${cartTotal.toLocaleString()}
//                                         </span>
//                                     </div>
//                                     <p className="text-xs text-gray-500 mb-2">
//                                         Shipping and taxes calculated at checkout
//                                     </p>
//                                     <div className="flex flex-col lg:flex-row lg:space-x-2">
//                                         <button
//                                             onClick={handleCheckout}
//                                             className="flex-1 bg-yellow-500 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-yellow-400 transition mb-2 lg:mb-0"
//                                         >
//                                             Checkout
//                                         </button>
//                                         <button
//                                             onClick={() => setIsCartOpen(false)}
//                                             className="flex-1 border border-gray-300 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
//                                         >
//                                             Continue Shopping
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </motion.div>
//                 </>
//             )}
//         </AnimatePresence>
//     );
// };

// export default CartSidebar;