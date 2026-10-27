import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// ✅ Get Cart
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.cartItems || user.cartItems.length === 0) {
      return res.json({ success: true, cartItems: [] });
    }

    const cartItems = [];
    for (const item of user.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          metal: product.metal,
          size: item.size,
          quantity: item.quantity,
          inStock: product.inStock,
        });
      }
    }

    res.json({ success: true, cartItems });
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Add to Cart
router.post('/add', auth, async (req, res) => {
  try {
    console.log('🟢 CART ADD REQUEST');
    console.log('User ID:', req.user.id);
    console.log('Request body:', req.body);

    const { productId, size, quantity } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.cartItems) user.cartItems = [];

    const existingItemIndex = user.cartItems.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (existingItemIndex > -1) {
      user.cartItems[existingItemIndex].quantity += quantity;
    } else {
      user.cartItems.push({ productId, size, quantity });
    }

    await user.save();

    const cartItems = [];
    for (const item of user.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          metal: product.metal,
          size: item.size,
          quantity: item.quantity,
          inStock: product.inStock,
        });
      }
    }

    res.json({ success: true, cartItems });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Update Quantity
router.put('/update', auth, async (req, res) => {
  try {
    const { productId, size, quantity } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.cartItems) {
      user.cartItems = [];
    }

    const itemIndex = user.cartItems.findIndex(
      item => item.productId.toString() === productId && item.size === size
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      user.cartItems.splice(itemIndex, 1);
    } else {
      user.cartItems[itemIndex].quantity = quantity;
    }

    await user.save();

    const cartItems = [];
    for (const item of user.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          metal: product.metal,
          size: item.size,
          quantity: item.quantity,
          inStock: product.inStock,
        });
      }
    }

    res.json({ success: true, cartItems });
  } catch (error) {
    console.error('Error updating cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Remove from Cart
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId, size } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.cartItems) {
      user.cartItems = [];
    }

    user.cartItems = user.cartItems.filter(
      item => !(item.productId.toString() === productId && item.size === size)
    );

    await user.save();

    const cartItems = [];
    for (const item of user.cartItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        cartItems.push({
          id: product._id,
          name: product.name,
          price: product.price,
          image: product.image,
          category: product.category,
          metal: product.metal,
          size: item.size,
          quantity: item.quantity,
          inStock: product.inStock,
        });
      }
    }

    res.json({ success: true, cartItems });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ Clear Cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cartItems = [];
    await user.save();

    res.json({ success: true, cartItems: [] });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;