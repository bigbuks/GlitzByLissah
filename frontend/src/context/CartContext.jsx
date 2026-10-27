import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { notify } from '../utils/notify';

const CartContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH CART FROM BACKEND
  // ==========================================
  const fetchCart = async () => {
    const token = localStorage.getItem('token');

    // Guest cart
    if (!token) {
      const guestCart = JSON.parse(
        localStorage.getItem('guestCart') || '[]'
      );

      setCartItems(guestCart);
      return;
    }

    try {
      setLoading(true);

      const response = await api.get('/cart');

      if (response.data.success) {
        const items = response.data.cartItems.map(item => ({
          ...item,
          id: item.id || item._id,
        }));

        setCartItems(items);
      }
    } catch (error) {
      console.error(
        '❌ Error fetching cart:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD CART WHEN COMPONENT MOUNTS
  // ==========================================
  useEffect(() => {
    fetchCart();
  }, []);

  // ==========================================
  // UPDATE CART COUNT & TOTAL
  // ==========================================
  useEffect(() => {
    const count = cartItems.reduce(
      (total, item) => total + item.quantity,
      0
    );

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    setCartCount(count);
    setCartTotal(total);
  }, [cartItems]);

  // ==========================================
  // ADD TO CART
  // ==========================================
  const addToCart = async (product, size = null, quantity = 1) => {
    // Get MongoDB _id first, fallback to normal id
    const productId = product._id || product.id;

    const finalProductId =
      typeof productId === 'number'
        ? String(productId)
        : productId;

    // Make sure we actually have an ID
    if (!finalProductId) {
      console.error('❌ Product ID is missing!');
      notify.error('Unable to add product to cart');
      return;
    }

    const token = localStorage.getItem('token');

    // ==========================================
    // GUEST USER
    // ==========================================
    if (!token) {
      setCartItems(prevItems => {
        const existingItem = prevItems.find(
          item =>
            item.id === finalProductId &&
            item.size === size
        );

        let updatedItems;

        if (existingItem) {
          updatedItems = prevItems.map(item =>
            item.id === finalProductId &&
            item.size === size
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [
            ...prevItems,
            {
              id: finalProductId,
              name: product.name,
              price: product.price,
              image: product.image,
              size,
              quantity,
              category: product.category,
              metal: product.metal,
            },
          ];
        }

        // ✅ Save to localStorage inside the updater
        localStorage.setItem('guestCart', JSON.stringify(updatedItems));

        return updatedItems;
      });

      // ✅ Fire event for navbar bounce (replaces toast)
      window.dispatchEvent(
        new CustomEvent('cart:added', {
          detail: { name: product.name, quantity },
        })
      );
      return;
    }

    // ==========================================
    // LOGGED-IN USER
    // ==========================================

    // Update frontend immediately
    setCartItems(prevItems => {
      const existingItem = prevItems.find(
        item =>
          item.id === finalProductId &&
          item.size === size
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === finalProductId &&
          item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...prevItems,
        {
          id: finalProductId,
          name: product.name,
          price: product.price,
          image: product.image,
          size,
          quantity,
          category: product.category,
          metal: product.metal,
        },
      ];
    });

    // ==========================================
    // SYNC WITH BACKEND
    // ==========================================
    try {
      const response = await api.post('/cart/add', {
        productId: finalProductId,
        size,
        quantity,
      });

      if (response.data.success) {
        // ✅ Fire event for navbar bounce (replaces toast)
        window.dispatchEvent(
          new CustomEvent('cart:added', {
            detail: { name: product.name, quantity },
          })
        );
      }
    } catch (error) {
      console.error(
        '❌ Error syncing cart:',
        error.response?.data || error.message
      );
      notify.error('Failed to add to cart');
      // Restore cart from backend if request fails
      await fetchCart();
    }
  };

  // ==========================================
  // REMOVE FROM CART
  // ==========================================
  const removeFromCart = (productId, size) => {
    const token = localStorage.getItem('token');

    const finalProductId =
      typeof productId === 'number'
        ? String(productId)
        : productId;

    setCartItems(prevItems => {
      const newItems = prevItems.filter(
        item =>
          !(item.id === finalProductId && item.size === size)
      );

      // ✅ Save guest cart to localStorage
      if (!token) {
        localStorage.setItem('guestCart', JSON.stringify(newItems));
      }

      return newItems;
    });

    // Logged-in user: sync outside setState
    if (token) {
      api
        .delete('/cart/remove', {
          data: {
            productId: finalProductId,
            size,
          },
        })
        .catch(error => {
          console.error(
            '❌ Error removing from cart:',
            error.response?.data || error.message
          );

          fetchCart();
        });
    }
  };

  // ==========================================
  // UPDATE QUANTITY
  // ==========================================
  const updateQuantity = (productId, size, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, size);
      return;
    }

    const token = localStorage.getItem('token');

    const finalProductId =
      typeof productId === 'number'
        ? String(productId)
        : productId;

    // Update frontend AND save to localStorage for guests
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === finalProductId && item.size === size
          ? { ...item, quantity: newQuantity }
          : item
      );

      // ✅ Save guest cart to localStorage
      if (!token) {
        localStorage.setItem('guestCart', JSON.stringify(newItems));
      }

      return newItems;
    });

    // Logged-in user: sync with backend
    if (token) {
      api
        .put('/cart/update', {
          productId: finalProductId,
          size,
          quantity: newQuantity,
        })
        .catch(error => {
          console.error(
            '❌ Error updating quantity:',
            error.response?.data || error.message
          );

          fetchCart();
        });
    }
  };

  // ==========================================
  // CLEAR CART
  // ==========================================
  // eslint-disable-next-line no-unused-vars
  const clearCart = (silent = false) => {
    const token = localStorage.getItem('token');

    // Guest cart
    if (!token) {
      localStorage.removeItem('guestCart');
      setCartItems([]);
      return;
    }

    // Clear frontend
    setCartItems([]);

    // Clear backend
    api
      .delete('/cart/clear')
      .catch(error => {
        console.error(
          '❌ Error clearing cart:',
          error.response?.data || error.message
        );

        fetchCart();
      });
  };

  // ==========================================
  // MERGE GUEST CART AFTER LOGIN / REGISTER
  // ==========================================
  const mergeGuestCart = async () => {
    const guestCart = JSON.parse(
      localStorage.getItem('guestCart') || '[]'
    );

    if (guestCart.length === 0) {
      return;
    }

    try {
      for (const item of guestCart) {
        await api.post('/cart/add', {
          productId: item.id,
          size: item.size,
          quantity: item.quantity,
        });
      }

      // ✅ Clear guest cart after successful merge
      localStorage.removeItem('guestCart');

      // ✅ Fetch updated cart from backend
      await fetchCart();

      // Silent — the cart badge updating is the feedback
    } catch (error) {
      console.error(
        '❌ Error merging cart:',
        error.response?.data || error.message
      );

      notify.error('Could not sync cart');
    }
  };

  // ==========================================
  // CONTEXT VALUE
  // ==========================================
  const value = {
    cartItems,
    cartCount,
    cartTotal,
    isCartOpen,
    setIsCartOpen,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    fetchCart,
    mergeGuestCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};