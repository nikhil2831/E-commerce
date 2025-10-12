const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const fs = require("fs");

// Middleware
app.use(express.json());
app.use(cors());

// Ensure uploads directory exists
const uploadsDir = "./uploads/images";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://indramart123:indramart805544@cluster0.1w47fjv.mongodb.net/e-commerce?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
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

// Add Product
app.post("/addproduct", async (req, res) => {
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
    console.log("Product saved successfully:", product);

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

// Remove Product
app.post("/removeproduct", async (req, res) => {
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