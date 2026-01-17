// One-time script to seed products into database
require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGODB_URI;

mongoose.connect(mongoURI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Product Schema (same as in index.js)
const Product = mongoose.model("Product", {
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

const sampleProducts = [
  // Women's Products (1-12)
  { id: 1, name: "Striped Flutter Sleeve Peplum Blouse", category: "women", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=500&fit=crop", new_price: 50, old_price: 80 },
  { id: 2, name: "Elegant Floral Summer Dress", category: "women", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop", new_price: 85, old_price: 120 },
  { id: 3, name: "Casual Cotton Maxi Dress", category: "women", image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop", new_price: 60, old_price: 100 },
  { id: 4, name: "Designer Party Wear Gown", category: "women", image: "https://images.unsplash.com/photo-1518622358385-8ea7d0794bf6?w=400&h=500&fit=crop", new_price: 100, old_price: 150 },
  { id: 5, name: "Trendy Crop Top Collection", category: "women", image: "https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=400&h=500&fit=crop", new_price: 45, old_price: 70 },
  { id: 6, name: "Stylish Denim Jacket", category: "women", image: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&h=500&fit=crop", new_price: 85, old_price: 120 },
  { id: 7, name: "Printed Chiffon Top", category: "women", image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop", new_price: 55, old_price: 85 },
  { id: 8, name: "Bohemian Style Skirt", category: "women", image: "https://images.unsplash.com/photo-1583496661160-fb5886a0uj?w=400&h=500&fit=crop", new_price: 65, old_price: 95 },
  { id: 9, name: "Classic Formal Blazer", category: "women", image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=400&h=500&fit=crop", new_price: 120, old_price: 180 },
  { id: 10, name: "Cozy Knit Sweater", category: "women", image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop", new_price: 75, old_price: 110 },
  { id: 11, name: "Silk Evening Blouse", category: "women", image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&h=500&fit=crop", new_price: 90, old_price: 130 },
  { id: 12, name: "Vintage Lace Dress", category: "women", image: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop", new_price: 110, old_price: 160 },
  
  // Men's Products (13-24)
  { id: 13, name: "Classic Fit Cotton Shirt", category: "men", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=500&fit=crop", new_price: 55, old_price: 85 },
  { id: 14, name: "Slim Fit Formal Trousers", category: "men", image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop", new_price: 70, old_price: 100 },
  { id: 15, name: "Premium Leather Jacket", category: "men", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop", new_price: 150, old_price: 220 },
  { id: 16, name: "Casual Denim Jeans", category: "men", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop", new_price: 65, old_price: 95 },
  { id: 17, name: "Sports Polo T-Shirt", category: "men", image: "https://images.unsplash.com/photo-1625910513413-5fc4e5e98859?w=400&h=500&fit=crop", new_price: 40, old_price: 60 },
  { id: 18, name: "Business Casual Blazer", category: "men", image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop", new_price: 130, old_price: 190 },
  { id: 19, name: "Cotton Chino Pants", category: "men", image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop", new_price: 60, old_price: 90 },
  { id: 20, name: "Graphic Print Hoodie", category: "men", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop", new_price: 75, old_price: 110 },
  { id: 21, name: "Striped Formal Shirt", category: "men", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop", new_price: 50, old_price: 75 },
  { id: 22, name: "Summer Shorts Collection", category: "men", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop", new_price: 45, old_price: 65 },
  { id: 23, name: "Wool Blend Overcoat", category: "men", image: "https://images.unsplash.com/photo-1544923246-77307dd62897?w=400&h=500&fit=crop", new_price: 180, old_price: 250 },
  { id: 24, name: "Casual Linen Shirt", category: "men", image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=400&h=500&fit=crop", new_price: 55, old_price: 80 },
  
  // Kids Products (25-36)
  { id: 25, name: "Cute Cartoon T-Shirt", category: "kid", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop", new_price: 25, old_price: 40 },
  { id: 26, name: "Colorful Summer Dress", category: "kid", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400&h=500&fit=crop", new_price: 35, old_price: 55 },
  { id: 27, name: "Denim Dungarees", category: "kid", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=500&fit=crop", new_price: 40, old_price: 60 },
  { id: 28, name: "Superhero Print Jacket", category: "kid", image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&h=500&fit=crop", new_price: 50, old_price: 75 },
  { id: 29, name: "Floral Party Frock", category: "kid", image: "https://images.unsplash.com/photo-1543854589-fdd815cd3893?w=400&h=500&fit=crop", new_price: 45, old_price: 70 },
  { id: 30, name: "Sporty Track Suit", category: "kid", image: "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=400&h=500&fit=crop", new_price: 55, old_price: 85 },
  { id: 31, name: "Cozy Winter Sweater", category: "kid", image: "https://images.unsplash.com/photo-1445796886651-d31a2c15f3ce?w=400&h=500&fit=crop", new_price: 40, old_price: 60 },
  { id: 32, name: "Printed Cotton Shorts", category: "kid", image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&h=500&fit=crop", new_price: 25, old_price: 40 },
  { id: 33, name: "School Uniform Set", category: "kid", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=500&fit=crop", new_price: 60, old_price: 90 },
  { id: 34, name: "Casual Hoodie Collection", category: "kid", image: "https://images.unsplash.com/photo-1560506840-ec148e82a604?w=400&h=500&fit=crop", new_price: 45, old_price: 70 },
  { id: 35, name: "Princess Costume Dress", category: "kid", image: "https://images.unsplash.com/photo-1476234251651-f353703a034d?w=400&h=500&fit=crop", new_price: 65, old_price: 100 },
  { id: 36, name: "Adventure Explorer Set", category: "kid", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=500&fit=crop", new_price: 50, old_price: 80 },
];

async function seedDatabase() {
  try {
    // Check current count
    const currentCount = await Product.countDocuments();
    console.log(`📊 Current products in database: ${currentCount}`);

    if (currentCount > 0) {
      console.log('🗑️ Clearing existing products...');
      await Product.deleteMany({});
    }

    console.log('🌱 Seeding products...');
    await Product.insertMany(sampleProducts);
    
    const newCount = await Product.countDocuments();
    console.log(`✅ Successfully seeded ${newCount} products!`);
    
    // Verify by category
    const women = await Product.countDocuments({ category: 'women' });
    const men = await Product.countDocuments({ category: 'men' });
    const kids = await Product.countDocuments({ category: 'kid' });
    
    console.log(`   👩 Women: ${women} products`);
    console.log(`   👨 Men: ${men} products`);
    console.log(`   👶 Kids: ${kids} products`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('📴 Database connection closed.');
    process.exit(0);
  }
}

seedDatabase();
