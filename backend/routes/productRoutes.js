import express from 'express';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';
import admin from '../middleware/admin.js';

const router = express.Router();

// ✅ GET all products (Public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET category counts (Public)
// ⚠️ MUST be above /:id — otherwise Express treats "categories" as an ID
router.get('/categories/counts', async (req, res) => {
  try {
    const counts = await Product.aggregate([
      {
        $group: {
          _id: { $toLower: '$category' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Transform array → { rings: 24, necklaces: 18, ... }
    const result = counts.reduce((acc, { _id, count }) => {
      if (_id) acc[_id] = count;
      return acc;
    }, {});

    res.json({ success: true, counts: result });
  } catch (error) {
    console.error('❌ Error fetching category counts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET products by category (Public)
router.get('/category/:category', async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Error fetching products by category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ GET product by ID (Public)
// ⚠️ Must be LAST among GET routes — it's a catch-all
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ POST create product (Admin only)
router.post('/', auth, admin, async (req, res) => {
  try {
    const { name, description, price, category, metal, image, images, sizes, inStock, isBestSeller } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      metal,
      image,
      images: images || [],
      sizes: sizes || [],
      inStock: inStock !== undefined ? inStock : true,
      isBestSeller: isBestSeller || false,
    });

    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ PUT update product (Admin only)
router.put('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ✅ DELETE product (Admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;