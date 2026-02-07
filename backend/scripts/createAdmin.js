/**
 * Admin Account Creation Script
 * 
 * This script creates an admin account with a bcrypt hashed password.
 * Admin accounts cannot be created through the signup API endpoint.
 * 
 * Usage: node scripts/createAdmin.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const readline = require('readline');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nikhilkumar805544_db_user:nikhil2831@cluster0.s5drxs6.mongodb.net/e-commerce?retryWrites=true&w=majority";
const SALT_ROUNDS = 10;

// User schema (same as in index.js)
const UserSchema = new mongoose.Schema({
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

const User = mongoose.model("Users", UserSchema);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
};

async function createAdmin() {
  console.log('\n========================================');
  console.log('     INDRAMART Admin Account Setup      ');
  console.log('========================================\n');

  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    // Get admin details
    const name = await question('Enter admin name: ');
    const email = await question('Enter admin email: ');
    const password = await question('Enter admin password (min 8 characters): ');
    const confirmPassword = await question('Confirm password: ');

    // Validation
    if (!name || !email || !password) {
      console.log('\n❌ Error: All fields are required');
      process.exit(1);
    }

    if (password.length < 8) {
      console.log('\n❌ Error: Password must be at least 8 characters');
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.log('\n❌ Error: Passwords do not match');
      process.exit(1);
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('\n❌ Error: Invalid email format');
      process.exit(1);
    }

    // Check if admin already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log('\n❌ Error: A user with this email already exists');
      process.exit(1);
    }

    // Hash password
    console.log('\nHashing password...');
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create admin
    const admin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: 'admin',
      cartData: {}
    });

    await admin.save();

    console.log('\n========================================');
    console.log('✅ Admin account created successfully!');
    console.log('========================================');
    console.log(`   Name:  ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role:  ${admin.role}`);
    console.log('========================================\n');

  } catch (error) {
    console.error('\n❌ Error creating admin:', error.message);
  } finally {
    rl.close();
    await mongoose.connection.close();
    process.exit(0);
  }
}

// Run the script
createAdmin();
