require('dotenv').config();
const port = process.env.PORT || 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// Security & Performance Middleware
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));

// Ensure uploads directory exists
const uploadsDir = "./uploads/images";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nikhilkumar805544_db_user:nikhil2831@cluster0.s5drxs6.mongodb.net/e-commerce?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    console.log("\n⚠️  WARNING: MongoDB connection failed!");
    console.log("The server will continue to run, but database operations will fail.");
    console.log("Please check:");
    console.log("1. Internet connection");
    console.log("2. MongoDB Atlas credentials");
    console.log("3. IP whitelist in MongoDB Atlas\n");
  });

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce Backend API",
    status: "Server is running successfully",
    endpoints: {
      products: "/allproducts",
      upload: "/upload",
      newCollections: "/newcollections",
      popularInWomen: "/popularinwomen",
      popularInMen: "/popularinmen",
      popularInKids: "/popularinkids",
      auth: {
        signup: "/signup",
        login: "/login"
      }
    }
  });
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: "./uploads/images",
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

app.use("/images", express.static("uploads/images"));

// Image Upload Endpoint
app.post("/upload", upload.single("product"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: 0,
      error: "No file uploaded"
    });
  }

  res.json({
    success: 1,
    image_url: `http://localhost:${port}/images/${req.file.filename}`,
  });
});

// Product Schema
const Product = mongoose.model("Product", {
  id: {
    type: Number,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  image: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  new_price: {
    type: Number,
    required: true,
    min: 0,
  },
  old_price: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  available: {
    type: Boolean,
    default: true,
  },
});

// Admin Schema
const Admin = mongoose.model("Admin", {
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "admin",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Admin Middleware
const fetchAdmin = async (req, res, next) => {
  const token = req.header("admin-token");
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      errors: "Access denied. Admin authentication required." 
    });
  }

  try {
    const decoded = jwt.verify(token, "secret_admin_ecom");
    req.admin = decoded.admin;
    next();
  } catch (error) {
    console.error("Admin token verification error:", error);
    res.status(401).json({ 
      success: false,
      errors: "Invalid or expired admin token" 
    });
  }
};

// Admin Login
app.post("/admin/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errors: "Email and password are required",
      });
    }

    let admin = await Admin.findOne({ email: email.toLowerCase() });
    
    // Create default admin if not exists
    if (!admin && email === "admin@indramart.com" && password === "admin123") {
      admin = new Admin({
        name: "Admin",
        email: "admin@indramart.com",
        password: "admin123",
        role: "admin"
      });
      await admin.save();
      console.log("Default admin created");
    }

    if (!admin) {
      return res.status(401).json({
        success: false,
        errors: "Invalid email or password",
      });
    }

    const passwordMatch = password === admin.password;
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        errors: "Invalid email or password",
      });
    }

    const data = {
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    };

    const token = jwt.sign(data, "secret_admin_ecom", { expiresIn: "7d" });
    
    console.log("Admin logged in successfully:", admin.email);
    res.json({ 
      success: true, 
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      }
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      errors: "Internal server error",
      details: error.message,
    });
  }
});

// Add Product (Protected - Admin Only)
app.post("/addproduct", fetchAdmin, async (req, res) => {
  try {
    const { name, image, category, new_price, old_price } = req.body;

    // Validation
    if (!name || !image || !category || !new_price || !old_price) {
      return res.status(400).json({
        success: false,
        error: "All fields are required",
      });
    }

    const lastProduct = await Product.findOne().sort({ id: -1 });
    const id = lastProduct ? lastProduct.id + 1 : 1;

    const product = new Product({
      id,
      name: name.trim(),
      image,
      category: category.toLowerCase().trim(),
      new_price: Number(new_price),
      old_price: Number(old_price),
    });

    await product.save();
    console.log("Product saved successfully by admin:", req.admin.email, product);

    res.json({
      success: true,
      product: product,
      message: "Product added successfully",
    });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add product",
      details: error.message,
    });
  }
});

// Remove Product (Protected - Admin Only)
app.post("/removeproduct", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: "Product ID is required",
      });
    }

    const deletedProduct = await Product.findOneAndDelete({ id: Number(id) });
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    console.log("Product deleted successfully:", deletedProduct);
    res.json({
      success: true,
      product: deletedProduct,
      message: "Product removed successfully",
    });
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({
      success: false,
      error: "Failed to remove product",
      details: error.message,
    });
  }
});

// Get All Products
app.get("/allproducts", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ date: -1 });
    console.log(`Fetched ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch products",
      details: error.message,
    });
  }
});

// Get Products by Category
app.get("/products/:category", async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    let products;
    
    if (category === "all") {
      products = await Product.find({}).sort({ date: -1 });
    } else {
      products = await Product.find({ 
        category: { $regex: new RegExp(category, 'i') } 
      }).sort({ date: -1 });
    }
    
    console.log(`Fetched ${products.length} products for category: ${category}`);
    res.json(products);
  } catch (error) {
    console.error(`Error fetching ${req.params.category} products:`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch ${req.params.category} products`,
      details: error.message,
    });
  }
});

// User Schema
const User = mongoose.model("Users", {
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  cartData: {
    type: Object,
    default: {},
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// User Signup
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        errors: "All fields are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        errors: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: "User already exists with this email address",
      });
    }

    // Initialize empty cart
    let cart = {};
    for (let i = 0; i <= 300; i++) {
      cart[i] = 0;
    }

    const user = new User({
      name: username.trim(),
      email: email.toLowerCase().trim(),
      password: password,
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom", { expiresIn: "7d" });
    
    console.log("User registered successfully:", user.email);
    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      errors: "Internal server error",
      details: error.message,
    });
  }
});

// User Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        errors: "Email and password are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        errors: "Invalid email or password",
      });
    }

    const passwordMatch = password === user.password; // In production, use bcrypt
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        errors: "Invalid email or password",
      });
    }

    const data = {
      user: {
        id: user.id,
      },
    };

    const token = jwt.sign(data, "secret_ecom", { expiresIn: "7d" });
    
    console.log("User logged in successfully:", user.email);
    res.json({ 
      success: true, 
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      errors: "Internal server error",
      details: error.message,
    });
  }
});

// Authentication Middleware
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  
  if (!token) {
    return res.status(401).json({ 
      success: false,
      errors: "Access denied. No token provided." 
    });
  }

  try {
    const decoded = jwt.verify(token, "secret_ecom");
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    res.status(401).json({ 
      success: false,
      errors: "Invalid or expired token" 
    });
  }
};

// New Collections (Latest 8 products)
app.get("/newcollections", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ date: -1 }).limit(8);
    console.log(`New collections fetched: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("New collections error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to fetch new collections",
      details: error.message,
    });
  }
});

// Popular in Women
app.get("/popularinwomen", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: { $regex: /women/i } 
    }).sort({ date: -1 }).limit(4);
    
    console.log(`Popular in women fetched: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Popular in women error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to fetch popular in women",
      details: error.message,
    });
  }
});

// Popular in Men
app.get("/popularinmen", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: { $regex: /men/i } 
    }).sort({ date: -1 }).limit(4);
    
    console.log(`Popular in men fetched: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Popular in men error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to fetch popular in men",
      details: error.message,
    });
  }
});

// Popular in Kids
app.get("/popularinkids", async (req, res) => {
  try {
    const products = await Product.find({ 
      category: { $regex: /kid/i } 
    }).sort({ date: -1 }).limit(4);
    
    console.log(`Popular in kids fetched: ${products.length} products`);
    res.json(products);
  } catch (error) {
    console.error("Popular in kids error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to fetch popular in kids",
      details: error.message,
    });
  }
});

// Add to Cart
app.post("/addtocart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        errors: "Item ID is required",
      });
    }

    const userData = await User.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({
        success: false,
        errors: "User not found",
      });
    }

    if (!userData.cartData[itemId]) {
      userData.cartData[itemId] = 0;
    }
    userData.cartData[itemId] += 1;

    await User.findOneAndUpdate(
      { _id: req.user.id }, 
      { cartData: userData.cartData }
    );

    console.log(`Added item ${itemId} to cart for user ${req.user.id}`);
    res.json({
      success: true,
      message: "Item added to cart",
      cartData: userData.cartData,
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to add item to cart",
      details: error.message,
    });
  }
});

// Remove from Cart
app.post("/removefromcart", fetchUser, async (req, res) => {
  try {
    const { itemId } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        errors: "Item ID is required",
      });
    }

    const userData = await User.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({
        success: false,
        errors: "User not found",
      });
    }

    if (userData.cartData[itemId] > 0) {
      userData.cartData[itemId] -= 1;
    }

    await User.findOneAndUpdate(
      { _id: req.user.id }, 
      { cartData: userData.cartData }
    );

    console.log(`Removed item ${itemId} from cart for user ${req.user.id}`);
    res.json({
      success: true,
      message: "Item removed from cart",
      cartData: userData.cartData,
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to remove item from cart",
      details: error.message,
    });
  }
});

// Get Cart Data
app.post("/getcart", fetchUser, async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.user.id });
    if (!userData) {
      return res.status(404).json({
        success: false,
        errors: "User not found",
      });
    }

    console.log(`Cart data fetched for user ${req.user.id}`);
    res.json(userData.cartData);
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get cart data",
      details: error.message,
    });
  }
});

// Global Error Handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    details: error.message,
  });
});

// Seed Sample Products (One-time use to populate database)
app.post("/seedproducts", fetchAdmin, async (req, res) => {
  try {
    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    if (existingProducts > 0) {
      return res.json({
        success: false,
        message: `Database already has ${existingProducts} products. Clear them first if you want to reseed.`
      });
    }

    const sampleProducts = [
      // Women's Products (1-12)
      { id: 1, name: "Striped Flutter Sleeve Peplum Blouse", category: "women", image: "https://i.ibb.co/qxKZqmy/product-1.png", new_price: 50, old_price: 80 },
      { id: 2, name: "Elegant Floral Summer Dress", category: "women", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 85, old_price: 120 },
      { id: 3, name: "Casual Cotton Maxi Dress", category: "women", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 60, old_price: 100 },
      { id: 4, name: "Designer Party Wear Gown", category: "women", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 100, old_price: 150 },
      { id: 5, name: "Trendy Crop Top Collection", category: "women", image: "https://i.ibb.co/9bPD8Xr/product-5.png", new_price: 45, old_price: 70 },
      { id: 6, name: "Stylish Denim Jacket", category: "women", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 85, old_price: 120 },
      { id: 7, name: "Printed Chiffon Top", category: "women", image: "https://i.ibb.co/qxKZqmy/product-1.png", new_price: 55, old_price: 85 },
      { id: 8, name: "Bohemian Style Skirt", category: "women", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 65, old_price: 95 },
      { id: 9, name: "Classic Formal Blazer", category: "women", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 120, old_price: 180 },
      { id: 10, name: "Cozy Knit Sweater", category: "women", image: "https://i.ibb.co/9bPD8Xr/product-5.png", new_price: 75, old_price: 110 },
      { id: 11, name: "Silk Evening Blouse", category: "women", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 90, old_price: 130 },
      { id: 12, name: "Vintage Lace Dress", category: "women", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 110, old_price: 160 },
      
      // Men's Products (13-24)
      { id: 13, name: "Classic Fit Cotton Shirt", category: "men", image: "https://i.ibb.co/RD2Hv7z/product-13.png", new_price: 55, old_price: 85 },
      { id: 14, name: "Slim Fit Formal Trousers", category: "men", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 70, old_price: 100 },
      { id: 15, name: "Premium Leather Jacket", category: "men", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 150, old_price: 220 },
      { id: 16, name: "Casual Denim Jeans", category: "men", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 65, old_price: 95 },
      { id: 17, name: "Sports Polo T-Shirt", category: "men", image: "https://i.ibb.co/RD2Hv7z/product-13.png", new_price: 40, old_price: 60 },
      { id: 18, name: "Business Casual Blazer", category: "men", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 130, old_price: 190 },
      { id: 19, name: "Cotton Chino Pants", category: "men", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 60, old_price: 90 },
      { id: 20, name: "Graphic Print Hoodie", category: "men", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 75, old_price: 110 },
      { id: 21, name: "Striped Formal Shirt", category: "men", image: "https://i.ibb.co/RD2Hv7z/product-13.png", new_price: 50, old_price: 75 },
      { id: 22, name: "Summer Shorts Collection", category: "men", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 45, old_price: 65 },
      { id: 23, name: "Wool Blend Overcoat", category: "men", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 180, old_price: 250 },
      { id: 24, name: "Casual Linen Shirt", category: "men", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 55, old_price: 80 },
      
      // Kids Products (25-36)
      { id: 25, name: "Cute Cartoon T-Shirt", category: "kid", image: "https://i.ibb.co/9bPD8Xr/product-5.png", new_price: 25, old_price: 40 },
      { id: 26, name: "Colorful Summer Dress", category: "kid", image: "https://i.ibb.co/qxKZqmy/product-1.png", new_price: 35, old_price: 55 },
      { id: 27, name: "Denim Dungarees", category: "kid", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 40, old_price: 60 },
      { id: 28, name: "Superhero Print Jacket", category: "kid", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 50, old_price: 75 },
      { id: 29, name: "Floral Party Frock", category: "kid", image: "https://i.ibb.co/qxKZqmy/product-1.png", new_price: 45, old_price: 70 },
      { id: 30, name: "Sporty Track Suit", category: "kid", image: "https://i.ibb.co/9bPD8Xr/product-5.png", new_price: 55, old_price: 85 },
      { id: 31, name: "Cozy Winter Sweater", category: "kid", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 40, old_price: 60 },
      { id: 32, name: "Printed Cotton Shorts", category: "kid", image: "https://i.ibb.co/d0h9R55/product-3.png", new_price: 25, old_price: 40 },
      { id: 33, name: "School Uniform Set", category: "kid", image: "https://i.ibb.co/qNQh1QP/product-4.png", new_price: 60, old_price: 90 },
      { id: 34, name: "Casual Hoodie Collection", category: "kid", image: "https://i.ibb.co/9bPD8Xr/product-5.png", new_price: 45, old_price: 70 },
      { id: 35, name: "Princess Costume Dress", category: "kid", image: "https://i.ibb.co/qxKZqmy/product-1.png", new_price: 65, old_price: 100 },
      { id: 36, name: "Adventure Explorer Set", category: "kid", image: "https://i.ibb.co/7nnqVnV/product-2.png", new_price: 50, old_price: 80 },
    ];

    await Product.insertMany(sampleProducts);
    
    res.json({
      success: true,
      message: `Successfully seeded ${sampleProducts.length} products!`,
      products: sampleProducts.length
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    res.status(500).json({
      success: false,
      error: "Failed to seed products",
      details: error.message
    });
  }
});

// 404 Handler - FIXED VERSION
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
    requestedPath: req.path,
    method: req.method,
    availableRoutes: [
      "GET /",
      "GET /allproducts",
      "GET /products/:category",
      "GET /newcollections",
      "GET /popularinwomen",
      "GET /popularinmen",
      "GET /popularinkids",
      "POST /addproduct",
      "POST /removeproduct",
      "POST /signup",
      "POST /login",
      "POST /addtocart",
      "POST /removefromcart",
      "POST /getcart",
      "POST /upload",
    ]
  });
});

// Start Server
app.listen(port, (error) => {
  if (!error) {
    console.log(`
    🚀 Server is running successfully!
    📡 Port: ${port}
    🌐 URL: http://localhost:${port}
    📅 Started at: ${new Date().toLocaleString()}
    `);
  } else {
    console.error("❌ Error occurred, server can't start:", error);
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  await mongoose.connection.close();
  console.log('📴 Database connection closed.');
  process.exit(0);
});