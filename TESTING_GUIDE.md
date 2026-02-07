# Testing Guide - Authentication System

## Default Credentials

### Admin Account
- **Email**: `nikhiladmin@gmail.com`
- **Password**: `adminnikhil`
- **Access**: Admin Dashboard

### Test User Account (Create via Signup)
- Create your own user account through signup
- **Access**: E-commerce Website

---

## Step-by-Step Testing

### Step 1: Start the Backend Server

```bash
cd backend
npm start
```

✅ You should see: "Default Admin Created Successfully!" message (first time only)

### Step 2: Start the Frontend (User E-commerce Site)

```bash
cd frontend
npm start
```

Opens at: http://localhost:3000

### Step 3: Start the Admin Panel

```bash
cd admin
npm run dev
```

Opens at: http://localhost:5173

---

## Test Scenario 1: Admin Login ✅

1. Open http://localhost:3000/login
2. Enter credentials:
   - Email: `nikhiladmin@gmail.com`
   - Password: `adminnikhil`
3. Click "Continue"
4. ✅ **Expected**: You will be redirected to **Admin Dashboard** (http://localhost:5173)
5. ✅ You can now:
   - Add products
   - Remove products
   - View all products

---

## Test Scenario 2: User Signup ✅

1. Open http://localhost:3000/login
2. Click "Signup Here"
3. Fill the form:
   - Name: `Test User`
   - Email: `testuser@gmail.com`
   - Password: `user12345678` (minimum 8 characters)
   - Confirm Password: `user12345678`
4. Click "Continue"
5. ✅ **Expected**: "Account created successfully! Please login."
6. You'll be redirected to login page

---

## Test Scenario 3: User Login ✅

1. At http://localhost:3000/login
2. Enter the user credentials you created:
   - Email: `testuser@gmail.com`
   - Password: `user12345678`
3. Click "Continue"
4. ✅ **Expected**: You will stay on **E-commerce Website** (http://localhost:3000)
5. ✅ You can now:
   - Browse products
   - Add items to cart
   - View cart
   - Shop normally

---

## Test Scenario 4: Role-Based Redirection ✅

### When Admin Logs In:
- Login at: http://localhost:3000/login
- Credentials: `nikhiladmin@gmail.com` / `adminnikhil`
- **Redirects to**: http://localhost:5173 (Admin Panel)

### When User Logs In:
- Login at: http://localhost:3000/login  
- Credentials: `testuser@gmail.com` / `user12345678`
- **Stays at**: http://localhost:3000 (E-commerce Site)

---

## Test Scenario 5: Admin Panel Direct Login ✅

1. Open http://localhost:5173
2. You'll see admin login screen
3. Enter admin credentials:
   - Email: `nikhiladmin@gmail.com`
   - Password: `adminnikhil`
4. ✅ **Expected**: Admin dashboard opens
5. Try with user credentials:
   - Email: `testuser@gmail.com`
   - Password: `user12345678`
6. ✅ **Expected**: Error "Access denied. Admin privileges required."

---

## Test Scenario 6: Security Features ✅

### Test Password Requirements:
1. Try signup with password less than 8 characters
2. ✅ **Expected**: Error "Password must be at least 8 characters long"

### Test Password Confirmation:
1. Try signup with mismatched passwords
2. ✅ **Expected**: Error "Passwords do not match"

### Test Duplicate Email:
1. Try signup with existing email (`nikhiladmin@gmail.com`)
2. ✅ **Expected**: Error "User already exists with this email address"

### Test Invalid Email:
1. Try login with invalid email format (`admin@` or `test`)
2. ✅ **Expected**: Error "Invalid email format"

---

## Visual Verification

### Admin Dashboard (http://localhost:5173):
- ✅ Sidebar with "Add Product" and "Product List"
- ✅ Can upload product images
- ✅ Can add new products
- ✅ Can delete products
- ✅ Shows admin name in navbar

### User E-commerce Site (http://localhost:3000):
- ✅ Home page with products
- ✅ Navigation menu (Shop, Men, Women, Kids)
- ✅ Cart icon in navbar
- ✅ Can add products to cart
- ✅ Can view/modify cart
- ✅ Shows user info in navbar

---

## Quick Test Checklist

- [ ] Backend starts without errors
- [ ] Default admin created successfully
- [ ] Frontend starts on port 3000
- [ ] Admin panel starts on port 5173
- [ ] Admin login redirects to admin panel
- [ ] User signup works with validation
- [ ] User login stays on e-commerce site
- [ ] Admin can add/remove products
- [ ] User can browse and add to cart
- [ ] Password is encrypted (check MongoDB - no plain text)
- [ ] Role-based access control works
- [ ] Logout works for both admin and user

---

## Troubleshooting

### Issue: "Access denied. Admin privileges required"
- **Cause**: Trying to access admin panel with user account
- **Solution**: Use admin credentials: `nikhiladmin@gmail.com` / `adminnikhil`

### Issue: "Invalid email or password"
- **Cause**: Wrong credentials or user doesn't exist
- **Solution**: 
  - For admin: Use `nikhiladmin@gmail.com` / `adminnikhil`
  - For user: Create account via signup first

### Issue: "User already exists with this email address"
- **Cause**: Email already registered
- **Solution**: Use different email or login with existing account

### Issue: Backend not connecting to MongoDB
- **Cause**: Internet or MongoDB Atlas issue
- **Solution**: Check internet connection and MongoDB Atlas IP whitelist

---

## Summary

✅ **One Login Page** - Both admin and users use same login
✅ **Role-Based Redirection** - Admin → Dashboard, User → E-commerce
✅ **Signup Only for Users** - Admin created on server startup
✅ **Bcrypt Password Hashing** - No plain text passwords
✅ **JWT Authentication** - Secure token-based sessions
✅ **Validation** - Email format, password length, duplicate checks

Happy Testing! 🎉
