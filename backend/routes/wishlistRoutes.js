import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const router = express.Router();

// ==========================================
// GET WISHLIST
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlistItems');

    if (!user || !user.wishlistItems || user.wishlistItems.length === 0) {
      return res.json({ success: true, wishlistItems: [] });
    }

    // Format items with product details
    const wishlistItems = user.wishlistItems
      .filter((product) => product) // Remove any deleted products
      .map((product) => ({
        _id: product._id,
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        category: product.category,
        metal: product.metal,
        inStock: product.inStock,
      }));

    res.json({ success: true, wishlistItems });
  } catch (error) {
    console.error('❌ Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// ADD TO WISHLIST
// ==========================================
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);

    if (!user.wishlistItems) user.wishlistItems = [];

    // Check if already in wishlist
    const alreadyIn = user.wishlistItems.some(
      (id) => id.toString() === productId
    );

    if (!alreadyIn) {
      user.wishlistItems.push(productId);
      await user.save();
    }

    // Return updated wishlist with product details
    const updated = await User.findById(req.user.id).populate('wishlistItems');
    const wishlistItems = updated.wishlistItems
      .filter((p) => p)
      .map((p) => ({
        _id: p._id,
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        metal: p.metal,
        inStock: p.inStock,
      }));

    res.json({ success: true, wishlistItems });
  } catch (error) {
    console.error('❌ Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// REMOVE FROM WISHLIST
// ==========================================
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    const user = await User.findById(req.user.id);

    if (!user.wishlistItems) {
      user.wishlistItems = [];
    }

    user.wishlistItems = user.wishlistItems.filter(
      (id) => id.toString() !== productId
    );

    await user.save();

    // Return updated wishlist
    const updated = await User.findById(req.user.id).populate('wishlistItems');
    const wishlistItems = updated.wishlistItems
      .filter((p) => p)
      .map((p) => ({
        _id: p._id,
        id: p._id,
        name: p.name,
        price: p.price,
        image: p.image,
        category: p.category,
        metal: p.metal,
        inStock: p.inStock,
      }));

    res.json({ success: true, wishlistItems });
  } catch (error) {
    console.error('❌ Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// CLEAR WISHLIST
// ==========================================
router.delete('/clear', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlistItems = [];
    await user.save();

    res.json({ success: true, wishlistItems: [] });
  } catch (error) {
    console.error('❌ Error clearing wishlist:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;