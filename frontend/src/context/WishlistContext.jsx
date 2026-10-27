import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';
import { notify } from '../utils/notify';

const WishlistContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // ==========================================
  // FETCH WISHLIST FROM BACKEND
  // ==========================================
  const fetchWishlist = async () => {
    const token = localStorage.getItem('token');

    // Guest wishlist
    if (!token) {
      const guestWishlist = JSON.parse(
        localStorage.getItem('guestWishlist') || '[]'
      );
      setWishlistItems(guestWishlist);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get('/wishlist');
      if (response.data.success) {
        setWishlistItems(response.data.wishlistItems || []);
      }
    } catch (error) {
      console.error(
        '❌ Error fetching wishlist:',
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Load wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, []);

  // Update count whenever items change
  useEffect(() => {
    setWishlistCount(wishlistItems.length);
  }, [wishlistItems]);

  // ==========================================
  // ADD TO WISHLIST
  // ==========================================
  const addToWishlist = async (product) => {
    const productId = product._id || product.id;

    if (!productId) {
      notify.error('Unable to add to wishlist');
      return;
    }

    const token = localStorage.getItem('token');

    // ==========================================
    // GUEST USER
    // ==========================================
    if (!token) {
      setWishlistItems((prevItems) => {
        // Already in wishlist?
        if (prevItems.some((item) => (item._id || item.id) === productId)) {
          return prevItems;
        }

        const newItems = [
          ...prevItems,
          {
            _id: productId,
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            metal: product.metal,
            inStock: product.inStock,
          },
        ];

        // ✅ Save to localStorage
        localStorage.setItem('guestWishlist', JSON.stringify(newItems));

        return newItems;
      });

      // Silent — the filled heart icon is the feedback
      return;
    }

    // ==========================================
    // LOGGED-IN USER
    // ==========================================
    try {
      const response = await api.post('/wishlist/add', { productId });

      if (response.data.success) {
        setWishlistItems(response.data.wishlistItems || []);
        // Silent — the filled heart icon is the feedback
      }
    } catch (error) {
      console.error(
        '❌ Error adding to wishlist:',
        error.response?.data || error.message
      );
      notify.error('Failed to add to wishlist');
    }
  };

  // ==========================================
  // REMOVE FROM WISHLIST
  // ==========================================
  const removeFromWishlist = async (productId) => {
    const token = localStorage.getItem('token');

    // ==========================================
    // GUEST USER
    // ==========================================
    if (!token) {
      setWishlistItems((prevItems) => {
        const newItems = prevItems.filter(
          (item) => (item._id || item.id) !== productId
        );

        localStorage.setItem('guestWishlist', JSON.stringify(newItems));

        return newItems;
      });

      // Silent — heart unfilling is the feedback
      return;
    }

    // ==========================================
    // LOGGED-IN USER
    // ==========================================
    try {
      const response = await api.delete('/wishlist/remove', {
        data: { productId },
      });

      if (response.data.success) {
        setWishlistItems(response.data.wishlistItems || []);
        // Silent
      }
    } catch (error) {
      console.error(
        '❌ Error removing from wishlist:',
        error.response?.data || error.message
      );
      notify.error('Failed to remove from wishlist');
    }
  };

  // ==========================================
  // CHECK IF IN WISHLIST
  // ==========================================
  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => (item._id || item.id) === productId);
  };

  // ==========================================
  // MERGE GUEST WISHLIST AFTER LOGIN
  // ==========================================
  const mergeGuestWishlist = async () => {
    const guestWishlist = JSON.parse(
      localStorage.getItem('guestWishlist') || '[]'
    );

    if (guestWishlist.length === 0) {
      return;
    }

    try {
      for (const item of guestWishlist) {
        const productId = item._id || item.id;
        if (!productId) continue;

        await api.post('/wishlist/add', { productId });
      }

      // ✅ Clear guest wishlist after successful merge
      localStorage.removeItem('guestWishlist');

      // ✅ Fetch updated wishlist from backend
      await fetchWishlist();

      // Silent — wishlist badge updating is the feedback
    } catch (error) {
      console.error(
        '❌ Error merging wishlist:',
        error.response?.data || error.message
      );
      // Silent fail — user's normal wishlist still works
    }
  };

  // ==========================================
  // CLEAR WISHLIST
  // ==========================================
  const clearWishlist = async () => {
    const token = localStorage.getItem('token');

    // Guest wishlist
    if (!token) {
      localStorage.removeItem('guestWishlist');
      setWishlistItems([]);
      return;
    }

    // Logged-in user
    try {
      const response = await api.delete('/wishlist/clear');

      if (response.data.success) {
        setWishlistItems([]);
      }
    } catch (error) {
      console.error(
        '❌ Error clearing wishlist:',
        error.response?.data || error.message
      );
      notify.error('Failed to clear wishlist');
      // ✅ Refetch to restore the correct state
      await fetchWishlist();
    }
  };

  const value = {
    wishlistItems,
    wishlistCount,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    fetchWishlist,
    mergeGuestWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};