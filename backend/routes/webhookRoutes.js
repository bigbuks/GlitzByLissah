import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { orderConfirmationEmail } from '../utils/emailTemplates.js';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// POST /api/webhooks/paystack
// Fires when Paystack confirms a payment.
// This is the SAFETY NET — if the frontend's
// placeOrder ever fails, this creates the order.
// ==========================================
router.post('/paystack', async (req, res) => {
  // ==========================================
  // 1. VERIFY SIGNATURE
  // ==========================================
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(req.body) // req.body is a Buffer here (express.raw)
    .digest('hex');

  const signature = req.headers['x-paystack-signature'];

  if (hash !== signature) {
    console.error('❌ Webhook signature mismatch — rejecting');
    return res.status(401).json({ message: 'Invalid signature' });
  }

  // ==========================================
  // 2. PARSE PAYLOAD
  // ==========================================
  let event;
  try {
    event = JSON.parse(req.body.toString());
  } catch (err) {
    console.error('❌ Invalid JSON in webhook body:', err.message);
    return res.status(400).json({ message: 'Invalid JSON' });
  }

  console.log('📨 Paystack webhook received:', event.event);

  // ==========================================
  // 3. HANDLE charge.success
  // ==========================================
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;

    try {
      // ==========================================
      // 3a. IDEMPOTENCY — check if order exists
      // ==========================================
      let order = await Order.findOne({ paymentReference: reference });

      if (!order) {
        // ✅ Wait 2 seconds to let the frontend finish saving its order
        console.log(`⏳ Webhook arrived first. Waiting 2s for frontend...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check the database one more time
        order = await Order.findOne({ paymentReference: reference });
      }

      if (order) {
        // Order already exists (created by frontend) — just confirm it's paid
        console.log(`✅ Order already exists for ref ${reference} — confirming payment`);

        if (order.paymentStatus !== 'Paid') {
          order.paymentStatus = 'Paid';
          if (order.orderStatus === 'Pending') order.orderStatus = 'Processing';
          await order.save();
        } else {
          console.log('ℹ️ Order already marked Paid — no action needed');
        }

        return res.status(200).json({ success: true, message: 'Already processed' });
      }

      // ==========================================
      // 3b. ORDER DOESN'T EXIST — create from webhook metadata
      // This means frontend placeOrder failed silently
      // ==========================================
      console.log(`⚠️ No order found for ref ${reference} — creating from webhook`);

      if (!metadata || !metadata.items || metadata.items.length === 0) {
        console.error('❌ Webhook metadata missing items — cannot create order');
        return res.status(200).json({ success: true, message: 'Insufficient metadata to create order' });
      }

      // Build order items from product IDs
      const orderItems = [];
      for (const item of metadata.items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          console.error(`⚠️ Product not found: ${item.productId}`);
          continue;
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

      if (orderItems.length === 0) {
        console.error('❌ No valid items — cannot create order');
        return res.status(200).json({ success: true, message: 'No valid items' });
      }

      // Create the order
      order = new Order({
        user: null, // guest unless we add user tracking to metadata
        items: orderItems,
        total: amount / 100, // Paystack amount is in kobo (or cents)
        address: {
          firstName: metadata.name?.split(' ')[0] || '',
          lastName: metadata.name?.split(' ').slice(1).join(' ') || '',
          email: event.data.customer?.email || metadata.email || '',
          phone: metadata.phone || '',
          street: metadata.address || '',
          city: metadata.city || '',
          state: metadata.state || '',
          zipCode: metadata.zipCode || '',
          country: metadata.country || 'Nigeria',
        },
        paymentMethod: 'Paystack',
        paymentStatus: 'Paid',
        orderStatus: 'Processing',
        paymentReference: reference,
      });

      // ✅ Catch duplicate key errors here to handle race conditions
      try {
        await order.save();
        console.log(`✅ Order created from webhook: ${order._id}`);

        // Send confirmation email (ONLY IN RECOVERY PATH)
              // Send confirmation email (ONLY IN RECOVERY PATH)
      try {
        await resend.emails.send({
          from: 'GlitzByLissah <onboarding@resend.dev>',
          to: order.address.email,
          subject: `Order Confirmed - #${order._id.toString().slice(-8).toUpperCase()}`,
          html: orderConfirmationEmail(order),
        }, {
          idempotencyKey: `order-confirm/${reference}` // ✅ PREVENTS DUPLICATE EMAILS
        });
        console.log('📧 Confirmation email sent (webhook recovery)');
      } catch (emailErr) {
        console.error('⚠️ Email failed:', emailErr.message);
      }

        return res.status(200).json({ success: true, message: 'Order created' });

      } catch (dbError) {
        // If the frontend won the race, we'll hit a duplicate key error here (code 11000)
        if (dbError.code === 11000) {
          console.log('ℹ️ Frontend beat the webhook to it — duplicate ignored.');
          return res.status(200).json({ success: true, message: 'Duplicate ignored' });
        }
        throw dbError; // Throw other errors up to the main catch block
      }
    } catch (err) {
      console.error('❌ Webhook order processing error:', err);
      // Return 200 anyway — Paystack will keep retrying otherwise
      return res.status(200).json({ success: false, message: 'Internal error' });
    }
  }

  // ==========================================
  // 4. OTHER EVENTS — acknowledge but ignore
  // ==========================================
  console.log(`ℹ️ Unhandled event: ${event.event} — ignoring`);
  res.status(200).json({ success: true, message: 'Event ignored' });
});

export default router;