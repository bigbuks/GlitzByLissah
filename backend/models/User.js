import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false, // ✅ Changed from true
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false, // ✅ Changed from true
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  cartItems: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
      size: { type: String, default: null },
      quantity: { type: Number, default: 1 },
    },
  ],
  // Wishlist items
  wishlistItems: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Add this to handle population properly
userSchema.set('strictPopulate', false);

const User = mongoose.model('User', userSchema);
export default User;