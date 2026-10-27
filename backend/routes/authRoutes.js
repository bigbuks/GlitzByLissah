import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import express from 'express';
import { Resend } from 'resend';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Otp from '../models/Otp.js';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Generate 6-digit code
    const otpCode = crypto.randomInt(100000, 999999).toString();

    // Save to DB (overwrite any existing OTP for this email)
    await Otp.findOneAndUpdate(
      { email },
      { otp: otpCode, createdAt: new Date() },
      { upsert: true, returnDocument: 'after' }
    );

    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'GlitzByLissah <onboarding@resend.dev>',
      to: email,
      subject: 'Your Login Code',
      html: `<p>Your verification code is: <strong>${otpCode}</strong></p><p>It expires in 10 minutes.</p>`,
    });

    if (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to send email' });
    }

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Verify OTP & Login/Signup
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

  try {
    // Check if OTP matches and is still valid
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    // OTP is valid. Delete it so it can't be reused.
    await Otp.deleteOne({ _id: validOtp._id });

    // Find user or create a new one (Passwordless Auto-Signup)
    let user = await User.findOne({ email });
    if (!user) {
      // Auto-generate a name from the email
      const nameFromEmail = email
        .split('@')[0]
        .split(/[._-]/)
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      user = await User.create({ email, name: nameFromEmail });
    }

    // Generate your app's JWT token
    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ==========================================
// 3. ADMIN LOGIN (Email + Password)
// ==========================================
router.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    // ✅ Find user by email only (admins are those with a password set)
    const user = await User.findOne({ email });

    // ✅ Reject if no user OR no password (password presence = admin)
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // ✅ Generate admin JWT
    const token = jwt.sign(
      { id: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' } // Shorter for admin
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: true,
      },
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;