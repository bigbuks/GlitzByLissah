import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Resend } from 'resend';
import CustomInquiry from '../models/CustomInquiry.js';
import {
  customInquiryAdminEmail,
  customInquiryCustomerEmail,
} from '../utils/customInquiryEmails.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// ==========================================
// PUBLIC: POST /api/custom-inquiries
// (Customer submits the form — no auth required)
// ==========================================
router.post('/', async (req, res) => {
  try {
    const {
      name, email, phone, type, budget, currency,
      vision, images, timeline, preferredDate,
    } = req.body;

    if (!name || !email || !type || !budget || !vision || !timeline) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please enter a valid email' });
    }

    let parsedDate = null;
    if (timeline === 'specific-date' && preferredDate) {
      parsedDate = new Date(preferredDate);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ message: 'Please enter a valid date' });
      }
    }

    const inquiry = new CustomInquiry({
      name,
      email,
      phone: phone || '',
      type,
      budget,
      currency: currency || 'USD',
      vision,
      images: Array.isArray(images) ? images : [],
      timeline,
      preferredDate: parsedDate,
    });

    await inquiry.save();
    console.log('✅ Custom inquiry created:', inquiry._id);

    // ==========================================
    // ADMIN NOTIFICATION
    // ==========================================
    try {
      await resend.emails.send({
        from: 'GlitzByLissah <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL || 'support@glitzbylissah.com',
        reply_to: email,
        subject: `New Custom Inquiry — ${name}`,
        html: customInquiryAdminEmail(inquiry),
      });
      console.log(`📧 Admin email sent → ${process.env.ADMIN_EMAIL || 'support@glitzbylissah.com'}`);
    } catch (emailError) {
      console.error('⚠️ Admin email failed:', emailError.message || emailError);
    }

    // ==========================================
    // CUSTOMER ACKNOWLEDGMENT
    // ==========================================
    try {
      await resend.emails.send({
        from: 'GlitzByLissah <onboarding@resend.dev>',
        to: email,
        subject: 'We received your custom inquiry',
        html: customInquiryCustomerEmail(inquiry),
      });
      console.log(`📧 Customer email sent → ${email}`);
    } catch (emailError) {
      console.error(`⚠️ Customer email failed (to: ${email}):`, emailError.message || emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry received. We will reach out within 24 hours.',
      inquiryId: inquiry._id,
    });
  } catch (error) {
    console.error('❌ Error creating inquiry:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;