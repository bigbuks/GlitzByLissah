import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const setAdminPassword = async () => {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    let user = await User.findOne({ email: ADMIN_EMAIL });

    if (user) {
      user.password = hashedPassword;
      // We no longer need isAdmin: true — password presence = admin
      await user.save();
      console.log(`✅ Updated admin: ${ADMIN_EMAIL}`);
    } else {
      user = await User.create({
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: 'Admin',
      });
      console.log(`✅ Created admin: ${ADMIN_EMAIL}`);
    }

    console.log(`\n🔑 Admin credentials set from .env`);
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   (Password is hidden — check your .env)`);
    console.log(`\n⚠️  Never commit .env to GitHub!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

setAdminPassword();