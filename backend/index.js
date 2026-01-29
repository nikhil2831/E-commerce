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

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5173',
    'https://e-commerce-plum-kappa-97.vercel.app',
    'https://e-commerce-ep29-pn08m1zcd-nikhil2831s-projects.vercel.app',
    'https://e-commerce-kk9kxsuhm-nikhil2831s-projects.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));


const uploadsDir = "./uploads/images";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

// Health check route
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



app.use("/images", express.static("uploads/images"));


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

// Admin schema
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

// Admin authentication middleware
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

// Admin login
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

// Add product (admin only)
app.post("/addproduct", fetchAdmin, async (req, res) => {
  try {
    const { name, image, category, new_price, old_price } = req.body;

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

// Remove product 
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

// Get all products
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

// Get products by category
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

// User schema
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

// User signup
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

// User login
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

// User authentication middleware
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

// New collections (latest 8 products)
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

// Popular in women
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

// Popular in men
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

// Popular in kids
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

// Add to cart
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

// Remove from cart
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

// Get cart data
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

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    details: error.message,
  });
});

// Seed endpoint removed - use admin panel to add products manually

// 404 handler
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
    ]
  });
});

// Start server
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