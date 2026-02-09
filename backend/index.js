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
const bcrypt = require("bcrypt");

// JWT Secrets
const JWT_SECRET = process.env.JWT_SECRET || "secret_ecom_unified_auth";
const SALT_ROUNDS = 10;

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
        signup: "/signup (POST - users only)",
        login: "/login (POST - unified for admin & user)",
        adminDashboard: "/admin/dashboard (GET - protected)",
        userHome: "/user/home (GET - protected)"
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
  stock: {
    type: Number,
    default: 0,
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

// Address Schema
const Address = mongoose.model("Address", {
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  pincode: {
    type: String,
    required: true,
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

// Order Schema
const Order = mongoose.model("Order", {
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
  },
  products: [{
    productId: Number,
    name: String,
    quantity: Number,
    price: Number,
    image: String,
  }],
  address: {
    name: String,
    phone: String,
    address: String,
    city: String,
    pincode: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending',
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  date: {
    type: Date,
    default: Date.now,
  },
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
    const decoded = jwt.verify(token, JWT_SECRET);
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

// Admin-only middleware (checks if user has admin role)
const fetchAdmin = async (req, res, next) => {
  const token = req.header("auth-token");

  if (!token) {
    return res.status(401).json({
      success: false,
      errors: "Access denied. Admin authentication required."
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        errors: "Access denied. Admin privileges required."
      });
    }
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error("Admin token verification error:", error);
    res.status(401).json({
      success: false,
      errors: "Invalid or expired admin token"
    });
  }
};

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
    console.log("Product saved successfully by admin:", req.user.id, product);

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

// Unified User schema (for both users and admins)
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
    minlength: 8,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
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

// Create default admin on server startup
const createDefaultAdmin = async () => {
  try {
    const adminEmail = "nikhiladmin@gmail.com";
    const adminPassword = "adminnikhil";

    // Check if default admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("✅ Default admin already exists");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

    // Create default admin
    const defaultAdmin = new User({
      name: "Nikhil Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "admin",
      cartData: {}
    });

    await defaultAdmin.save();
    console.log("\n🎉 Default Admin Created Successfully!");
    console.log("====================================");
    console.log("   Email: nikhiladmin@gmail.com");
    console.log("   Password: adminnikhil");
    console.log("====================================\n");
  } catch (error) {
    console.error("Error creating default admin:", error);
  }
};

// Call createDefaultAdmin after mongoose connection
mongoose.connection.once('open', () => {
  createDefaultAdmin();
});

// User signup (only for regular users, admins are created manually)
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        errors: "All fields are required",
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        errors: "Invalid email format",
      });
    }

    // Password length validation (minimum 8 characters)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        errors: "Password must be at least 8 characters long",
      });
    }

    // Password match validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        errors: "Passwords do not match",
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errors: "User already exists with this email address",
      });
    }

    // Hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Initialize empty cart
    let cart = {};
    for (let i = 0; i <= 300; i++) {
      cart[i] = 0;
    }

    const user = new User({
      name: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user", // Signup is only for regular users
      cartData: cart,
    });

    await user.save();

    const data = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    console.log("User registered successfully:", user.email);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        errors: "Invalid email or password",
      });
    }

    const data = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" });

    console.log("User logged in successfully:", user.email);
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
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

// Protected route: Admin Dashboard
app.get("/admin/dashboard", fetchAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    const productCount = await Product.countDocuments();
    const userCount = await User.countDocuments({ role: "user" });

    res.json({
      success: true,
      message: "Admin dashboard accessed",
      admin: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      stats: {
        totalProducts: productCount,
        totalUsers: userCount,
      }
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to load admin dashboard"
    });
  }
});

// Protected route: User Home
app.get("/user/home", fetchUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({
      success: true,
      message: "User home accessed",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }
    });
  } catch (error) {
    console.error("User home error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to load user home"
    });
  }
});

// Endpoint to create admin (run once to set up admin)
app.post("/create-admin", async (req, res) => {
  try {
    const { name, email, password, secretKey } = req.body;

    // Secret key to prevent unauthorized admin creation
    if (secretKey !== process.env.ADMIN_SECRET_KEY && secretKey !== "INDRAMART_ADMIN_SECRET_2024") {
      return res.status(403).json({
        success: false,
        errors: "Unauthorized admin creation attempt"
      });
    }

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        errors: "User already exists with this email"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const admin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      cartData: {}
    });

    await admin.save();
    console.log("Admin created successfully:", admin.email);

    res.json({
      success: true,
      message: "Admin account created successfully",
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error("Create admin error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to create admin account"
    });
  }
});

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

// ==================== ADDRESS ENDPOINTS ====================

// Add new address
app.post("/address", fetchUser, async (req, res) => {
  try {
    const { name, phone, address, city, pincode, isDefault } = req.body;

    if (!name || !phone || !address || !city || !pincode) {
      return res.status(400).json({
        success: false,
        errors: "All address fields are required",
      });
    }

    // If this is marked as default, unset other defaults
    if (isDefault) {
      await Address.updateMany(
        { userId: req.user.id },
        { isDefault: false }
      );
    }

    const newAddress = new Address({
      userId: req.user.id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      isDefault: isDefault || false,
    });

    await newAddress.save();
    console.log(`Address saved for user ${req.user.id}`);

    res.json({
      success: true,
      message: "Address saved successfully",
      address: newAddress,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to save address",
      details: error.message,
    });
  }
});

// Get user addresses
app.get("/addresses", fetchUser, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({
      success: true,
      addresses,
    });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get addresses",
    });
  }
});

// ==================== ORDER ENDPOINTS ====================

// Generate unique order ID
const generateOrderId = () => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${randomStr}`.toUpperCase();
};

// Create order
app.post("/order", fetchUser, async (req, res) => {
  try {
    const { products, address } = req.body;

    if (!products || products.length === 0) {
      return res.status(400).json({
        success: false,
        errors: "Products are required",
      });
    }

    if (!address || !address.name || !address.phone || !address.address || !address.city || !address.pincode) {
      return res.status(400).json({
        success: false,
        errors: "Complete address is required",
      });
    }

    // Validate stock and calculate total
    let totalAmount = 0;
    const orderProducts = [];

    for (const item of products) {
      const product = await Product.findOne({ id: item.productId });

      if (!product) {
        return res.status(400).json({
          success: false,
          errors: `Product with ID ${item.productId} not found`,
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          errors: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        });
      }

      orderProducts.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        price: product.new_price,
        image: product.image,
      });

      totalAmount += product.new_price * item.quantity;
    }

    // Reduce stock for each product
    for (const item of products) {
      await Product.findOneAndUpdate(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    // Clear user's cart
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: {} }
    );

    // Create order
    const order = new Order({
      orderId: generateOrderId(),
      userId: req.user.id,
      products: orderProducts,
      address: {
        name: address.name,
        phone: address.phone,
        address: address.address,
        city: address.city,
        pincode: address.pincode,
      },
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'pending',
    });

    await order.save();
    console.log(`Order ${order.orderId} created for user ${req.user.id}`);

    res.json({
      success: true,
      message: "Order placed successfully",
      order: {
        orderId: order.orderId,
        totalAmount: order.totalAmount,
        orderStatus: order.orderStatus,
      },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to create order",
      details: error.message,
    });
  }
});

// Get user's orders
app.get("/orders", fetchUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ date: -1 });
    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get orders",
    });
  }
});

// ==================== ADMIN ENDPOINTS ====================

// Admin dashboard stats
app.get("/admin/stats", fetchAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const totalUsers = await User.countDocuments({ role: "user" });
    const totalOrders = await Order.countDocuments();
    const orders = await Order.find({});

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const pendingOrders = await Order.countDocuments({ orderStatus: "pending" });
    const lowStockProducts = await Product.countDocuments({ stock: { $lt: 10, $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ stock: 0 });

    res.json({
      success: true,
      stats: {
        totalProducts,
        totalUsers,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        outOfStockProducts,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get admin stats",
    });
  }
});

// Get all orders (admin)
app.get("/admin/orders", fetchAdmin, async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });

    // Get user info for each order
    const ordersWithUsers = await Promise.all(orders.map(async (order) => {
      const user = await User.findById(order.userId).select('name email');
      return {
        ...order.toObject(),
        user: user ? { name: user.name, email: user.email } : null,
      };
    }));

    res.json({
      success: true,
      orders: ordersWithUsers,
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get orders",
    });
  }
});

// Update order status (admin)
app.put("/admin/order/:orderId", fetchAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus, paymentStatus } = req.body;

    const updateData = {};
    if (orderStatus) updateData.orderStatus = orderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await Order.findOneAndUpdate(
      { orderId },
      updateData,
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        errors: "Order not found",
      });
    }

    console.log(`Order ${orderId} updated by admin`);
    res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to update order",
    });
  }
});

// Get all users (admin)
app.get("/admin/users", fetchAdmin, async (req, res) => {
  try {
    const users = await User.find({ role: "user" })
      .select('-password -cartData')
      .sort({ date: -1 });

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get users",
    });
  }
});

// Get low stock products (admin)
app.get("/admin/low-stock", fetchAdmin, async (req, res) => {
  try {
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } }).sort({ stock: 1 });
    res.json({
      success: true,
      products: lowStockProducts,
    });
  } catch (error) {
    console.error("Get low stock error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to get low stock products",
    });
  }
});

// Update product (admin)
app.put("/product/:id", fetchAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, new_price, old_price, stock, category, available } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (new_price !== undefined) updateData.new_price = Number(new_price);
    if (old_price !== undefined) updateData.old_price = Number(old_price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (category) updateData.category = category.toLowerCase().trim();
    if (available !== undefined) updateData.available = available;

    const product = await Product.findOneAndUpdate(
      { id: Number(id) },
      updateData,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        errors: "Product not found",
      });
    }

    console.log(`Product ${id} updated by admin`);
    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      errors: "Failed to update product",
    });
  }
});

// ==================== END NEW ENDPOINTS ====================

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