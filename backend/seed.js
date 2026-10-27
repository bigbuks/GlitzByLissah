import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';
import connectDB from './config/mongodb.js';

dotenv.config();

const products = [
  {
    id: 1,
    name: "Diamond Solitaire Ring",
    description: "A stunning 1-carat diamond solitaire ring in 18k gold. Perfect for engagements and special occasions.",
    price: 2999,
    category: "rings",
    metal: "gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["5", "6", "7", "8", "9", "10"],
    inStock: true,
    isBestSeller: true,
  },
  {
    id: 2,
    name: "Gold Chain Necklace",
    description: "Elegant 18k gold chain necklace. A timeless piece for any jewelry collection.",
    price: 1899,
    category: "necklaces",
    metal: "gold",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: [],
    inStock: true,
    isBestSeller: false,
  },
  {
    id: 3,
    name: "Pearl Earrings",
    description: "Classic pearl earrings with 14k gold settings. Elegant and timeless.",
    price: 899,
    category: "earrings",
    metal: "gold",
    image: "https://images.unsplash.com/photo-1635767798638-3e25273a8236?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: [],
    inStock: true,
    isBestSeller: false,
  },
  {
    id: 4,
    name: "Silver Bracelet",
    description: "Sterling silver bracelet with a modern minimalist design. Perfect for everyday wear.",
    price: 599,
    category: "bracelets",
    metal: "silver",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["6", "7", "8"],
    inStock: true,
    isBestSeller: false,
  },
  {
    id: 5,
    name: "Rose Gold Wedding Band",
    description: "Elegant rose gold wedding band with a polished finish. A symbol of eternal love.",
    price: 1499,
    category: "rings",
    metal: "rose-gold",
    image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: ["5", "6", "7", "8", "9", "10"],
    inStock: true,
    isBestSeller: false,
  },
  {
    id: 6,
    name: "Platinum Necklace",
    description: "Stunning platinum necklace with a diamond pendant. A statement piece for special occasions.",
    price: 3499,
    category: "necklaces",
    metal: "platinum",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    images: [],
    sizes: [],
    inStock: true,
    isBestSeller: false,
  },
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Clear existing products (optional)
    await Product.deleteMany({});
    console.log('🗑️ Existing products cleared');

    // Insert products
    const insertedProducts = await Product.insertMany(products);
    console.log(`✅ ${insertedProducts.length} products added to database`);

    // Log product IDs for testing
    console.log('\n📦 Product IDs for testing:');
    insertedProducts.forEach((p) => {
      console.log(`- ${p.name}: ${p._id}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();