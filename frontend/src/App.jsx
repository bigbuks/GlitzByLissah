import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { CurrencyProvider } from './context/CurrencyContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './Pages/Home';
import Shop from './Pages/Shop';
import ProductDetails from './Pages/ProductDetails';
import Category from './Pages/Category';
import CategoriesPage from './Pages/CategoriesPage';
import Checkout from './Pages/Checkout';
import WishlistPage from './Pages/WishlistPage';
import OrderConfirmation from './Pages/OrderConfirmation';
import Cart from './Pages/Cart';
import Orders from './Pages/Orders';
import OrderDetails from './Pages/OrderDetails';
import PasswordlessLogin from './Pages/PasswordlessLogin';
import TrackOrder from './Pages/TrackOrder';
import MyAccount from './Pages/MyAccount';
import About from './Pages/About';
import Contact from './Pages/Contact';
import CustomJewelry from './Pages/CustomJewelry';
import PageBackground from './components/PageBackground';

// ==========================================
// ADMIN IMPORTS
// ==========================================
import AdminLayout from './Pages/admin/AdminLayout';
import Dashboard from './Pages/admin/Dashboard';
import AdminOrders from './Pages/admin/AdminOrders';
import AdminOrderDetails from './Pages/admin/AdminOrderDetails';
import AdminProducts from './Pages/admin/AdminProducts';
import AdminUsers from './Pages/admin/AdminUsers';
import AdminLogin from './Pages/admin/AdminLogin';
import AdminCustomInquiries from './Pages/admin/AdminCustomInquiries';

function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <CurrencyProvider>
          <div className="min-h-screen flex flex-col">
            <PageBackground />
            <ScrollToTop />
            <Routes>
              {/* ========================================== */}
              {/* ADMIN ROUTES — No navbar/footer */}
              {/* ========================================== */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="orders/:orderId" element={<AdminOrderDetails />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="custom-inquiries" element={<AdminCustomInquiries />} />
              </Route>

              {/* ========================================== */}
              {/* STORE ROUTES — With navbar/footer */}
              {/* ========================================== */}
              <Route
                path="*"
                element={
                  <>
                    <Navbar />
                    <main className="flex-grow">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/categories" element={<CategoriesPage />} />
                        <Route path="/category/:categoryName" element={<Category />} />
                        <Route path="/product/:id" element={<ProductDetails />} />
                        <Route path="/custom" element={<CustomJewelry />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/wishlist" element={<WishlistPage />} />
                        <Route path="/order-confirmation" element={<OrderConfirmation />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/login" element={<PasswordlessLogin />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/orders/:orderId" element={<OrderDetails />} />
                        <Route path="/track-order" element={<TrackOrder />} />
                        <Route path="/account" element={<MyAccount />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/contact" element={<Contact />} />
                      </Routes>
                    </main>
                    <Footer />
                  </>
                }
              />
            </Routes>

            <Toaster
              position="bottom-right"
              expand={false}
              richColors
              closeButton
              duration={3000}
              toastOptions={{
                style: {
                  fontFamily: "'Outfit', sans-serif",
                  borderRadius: '14px',
                  padding: '14px 16px',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                  backdropFilter: 'blur(8px)',
                },
              }}
            />
          </div>
        </CurrencyProvider>
      </WishlistProvider>
    </CartProvider>
  );
}

export default App;