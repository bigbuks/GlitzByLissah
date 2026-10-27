import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
const user = await User.findOne({ email: 'badmanbuks7@gmail.com' });
console.log('Found:', user ? 'yes' : 'no');
if (user) {
  console.log('email:', user.email);
  console.log('isAdmin:', user.isAdmin);
  console.log('hasPassword:', !!user.password);
}
process.exit(0);

