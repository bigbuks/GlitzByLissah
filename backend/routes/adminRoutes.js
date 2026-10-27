import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import { Resend } from 'resend';
import { admin } from '../middleware/auth.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';
import { orderStatusUpdateEmail } from '../utils/emailTemplates.js';
import CustomInquiry from '../models/CustomInquiry.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// APPLY ADMIN MIDDLEWARE TO ALL ROUTES
// ==========================================
router.use(admin);

// ==========================================
// DASHBOARD STATS
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments();

    // Total revenue (only paid orders)
    const paidOrders = await Order.find({ paymentStatus: 'Paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);

    // Recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalProducts,
        totalUsers,
        totalRevenue,
      },
      recentOrders,
      ordersByStatus,
    });
  } catch (error) {
    console.error('❌ Error fetching stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET ALL ORDERS
// ==========================================
router.get('/orders', async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status && status !== 'All') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    res.json({ success: true, orders });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// UPDATE ORDER STATUS (+ Send Email)
// ==========================================
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, trackingNumber } = req.body;

    const validStatuses = [
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid order status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Save old status to check if it changed
    const oldStatus = order.orderStatus;

    order.orderStatus = orderStatus;
    if (trackingNumber !== undefined) {
      order.trackingNumber = trackingNumber;
    }

    await order.save();
    console.log('✅ Order status updated:', order._id, '→', orderStatus);

    // ✅ SEND STATUS UPDATE EMAIL (only if status actually changed)
    if (oldStatus !== orderStatus) {
      try {
        await resend.emails.send({
          from: 'GlitzByLissah <onboarding@resend.dev>',
          to: order.address.email,
          subject: `Order #${order._id
            .toString()
            .slice(-8)
            .toUpperCase()} - ${orderStatus}`,
          html: orderStatusUpdateEmail(order, orderStatus),
        });
        console.log('📧 Status email sent to:', order.address.email);
      } catch (emailError) {
        console.error('⚠️ Failed to send status email:', emailError.message);
        // Don't fail the request if email fails
      }
    }

    res.json({ success: true, order });
  } catch (error) {
    console.error('❌ Error updating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET ALL PRODUCTS (Admin view)
// ==========================================
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// CREATE PRODUCT
// ==========================================
router.post('/products', async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      metal,
      image,
      images,
      sizes,
      inStock,
      isBestSeller,
    } = req.body;

    if (!name || !description || !price || !category || !metal || !image) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Auto-generate numeric id
    const lastProduct = await Product.findOne().sort({ id: -1 });
    const newId = lastProduct?.id ? lastProduct.id + 1 : 1;

    const product = new Product({
      id: newId,
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

// ==========================================
// UPDATE PRODUCT
// ==========================================
router.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, product });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// DELETE PRODUCT
// ==========================================
router.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET ALL USERS
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// UPLOAD IMAGE TO CLOUDINARY
// ==========================================
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files allowed'), false);
    }
  },
});

router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64 data URI
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'glitzbylissah/products',
      resource_type: 'image',
      transformation: [
        { width: 1000, height: 1000, crop: 'limit' }, // Max 1000x1000
        { quality: 'auto:good' }, // Auto optimize
      ],
    });

    res.json({
      success: true,
      url: result.secure_url,
    });
  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// ==========================================
// CUSTOM INQUIRIES — LIST ALL
// ==========================================
router.get('/custom-inquiries', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status && status !== 'all' ? { status } : {};
    const inquiries = await CustomInquiry.find(query).sort({ createdAt: -1 });
    res.json({ success: true, inquiries });
  } catch (error) {
    console.error('❌ Error fetching inquiries:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// CUSTOM INQUIRIES — GET ONE
// ==========================================
router.get('/custom-inquiries/:id', async (req, res) => {
  try {
    const inquiry = await CustomInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    res.json({ success: true, inquiry });
  } catch (error) {
    console.error('❌ Error fetching inquiry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// CUSTOM INQUIRIES — UPDATE STATUS/NOTES
// ==========================================
router.put('/custom-inquiries/:id', async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const inquiry = await CustomInquiry.findById(req.params.id);
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });
    if (status) inquiry.status = status;
    if (adminNotes !== undefined) inquiry.adminNotes = adminNotes;
    await inquiry.save();
    res.json({ success: true, inquiry });
  } catch (error) {
    console.error('❌ Error updating inquiry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;