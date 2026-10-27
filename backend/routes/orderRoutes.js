import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Resend } from 'resend';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import auth from '../middleware/auth.js';
import { orderConfirmationEmail } from '../utils/emailTemplates.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// PLACE ORDER (Guest + Logged-in)
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { items, address, paymentMethod, total, paymentReference } = req.body;

    let userId = null;
    const token = req.headers.authorization?.split(' ')[1];

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log('🔑 User authenticated:', userId);
      } catch (error) {
        console.log('⚠️ Invalid token, continuing as guest');
      }
    } else {
      console.log('👤 Guest checkout');
    }

    console.log('📦 New order request:', { userId, items: items.length, paymentMethod, total });

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    const orderItems = [];
    for (const item of items) {
      const productId =
        typeof item.productId === 'number'
          ? item.productId.toString()
          : item.productId;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        size: item.size || null,
        image: product.image,
      });
    }

    const order = new Order({
      user: userId,
      items: orderItems,
      total,
      address,
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid',
      orderStatus: 'Processing',
      paymentReference: paymentReference || null,
    });

    await order.save();
    console.log('✅ Order created:', order._id);

    // ✅ SEND ORDER CONFIRMATION EMAIL
        // ✅ SEND ORDER CONFIRMATION EMAIL
    try {
      await resend.emails.send({
        from: 'GlitzByLissah <onboarding@resend.dev>',
        to: address.email,
        subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()}`,
        html: orderConfirmationEmail(order),
      }, {
        idempotencyKey: `order-confirm/${paymentReference || order._id}` // ✅ PREVENTS DUPLICATE EMAILS
      });
      console.log('📧 Confirmation email sent to:', address.email);
    } catch (emailError) {
      console.error('⚠️ Failed to send confirmation email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        items: order.items,
        total: order.total,
        address: order.address,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GUEST ORDER TRACKING — STEP 1: REQUEST OTP
// ==========================================
router.post('/track/request', async (req, res) => {
  try {
    const { email, orderId } = req.body;

    if (!email || !orderId) {
      return res.status(400).json({ message: 'Email and Order ID required' });
    }

    const cleanOrderId = orderId.replace('#', '').trim().toUpperCase();
    const orders = await Order.find({ 'address.email': email });

    const order = orders.find((o) => {
      const fullId = o._id.toString().toUpperCase();
      const shortId = fullId.slice(-8);
      return (
        shortId === cleanOrderId ||
        fullId === cleanOrderId ||
        o._id.toString() === orderId
      );
    });

    if (!order) {
      return res
        .status(404)
        .json({ message: 'Order not found. Check your email and order ID.' });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();

    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    const { error } = await resend.emails.send({
      from: 'GlitzByLissah <onboarding@resend.dev>',
      to: email,
      subject: 'Track Your Order',
      html: `
        <div style="font-family: sans-serif; max-width: 500px;">
          <h2>Track Your Order</h2>
          <p>Your verification code is:</p>
          <h1 style="color: #eab308; letter-spacing: 8px;">${otpCode}</h1>
          <p>This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('❌ Resend error:', error);
      return res.status(500).json({ message: 'Failed to send email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('❌ Error requesting OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GUEST ORDER TRACKING — STEP 2: VERIFY OTP
// ==========================================
router.post('/track/verify', async (req, res) => {
  try {
    const { email, otp, orderId } = req.body;

    if (!email || !otp || !orderId) {
      return res
        .status(400)
        .json({ message: 'Email, OTP, and Order ID required' });
    }

    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    await Otp.deleteOne({ _id: validOtp._id });

    const cleanOrderId = orderId.replace('#', '').trim().toUpperCase();
    const orders = await Order.find({ 'address.email': email });

    const order = orders.find((o) => {
      const fullId = o._id.toString().toUpperCase();
      const shortId = fullId.slice(-8);
      return (
        shortId === cleanOrderId ||
        fullId === cleanOrderId ||
        o._id.toString() === orderId
      );
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        items: order.items,
        total: order.total,
        address: order.address,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('❌ Error verifying OTP:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET USER'S ORDERS (including guest orders by email)
// ==========================================
router.get('/my-orders', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const orders = await Order.find({
      $or: [
        { user: userId },
        { user: null, 'address.email': user.email },
      ],
    })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');

    console.log(
      `📋 Found ${orders.length} orders for user: ${user.email} (${userId})`
    );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// GET SINGLE ORDER BY ID (Protected)
// ==========================================
router.get('/:orderId', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { user: userId },
        { user: null, 'address.email': user.email },
      ],
    }).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('❌ Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==========================================
// CANCEL ORDER (Protected)
// ==========================================
router.put('/:orderId/cancel', auth, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { user: userId },
        { user: null, 'address.email': user.email },
      ],
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.orderStatus !== 'Processing') {
      return res.status(400).json({ message: 'Order cannot be cancelled' });
    }

    order.orderStatus = 'Cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;