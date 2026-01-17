# INDRAMART E-Commerce Platform 🛍️

A full-stack e-commerce application with React frontend, admin panel, and Node.js backend with MongoDB.

## 🚀 Features

### Frontend (Customer Portal)
- ✅ User Authentication (Login/Signup)
- ✅ Browse products by category (Men, Women, Kids)
- ✅ Product details page
- ✅ Shopping cart with real-time synchronization
- ✅ Add/Remove items from cart (login required)
- ✅ Responsive design
- ✅ Protected routes

### Admin Panel
- ✅ Secure admin authentication
- ✅ Add new products with image upload
- ✅ View all products
- ✅ Delete products
- ✅ Protected admin routes
- ✅ Real-time product management

### Backend API
- ✅ RESTful API with Express.js
- ✅ MongoDB database integration
- ✅ JWT authentication for users and admins
- ✅ File upload for product images
- ✅ Cart management
- ✅ Product CRUD operations
- ✅ Error handling and validation

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
cd "C:\Users\nisha\OneDrive\Desktop\E-commerce"
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Configure MongoDB:**
- The backend is pre-configured with a MongoDB Atlas connection
- If you want to use your own database, update the connection string in `backend/index.js`

```javascript
mongoose.connect("your-mongodb-connection-string")
```

**Start the backend server:**
```bash
node index.js
```
Backend will run on: `http://localhost:4000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm start
```
Frontend will run on: `http://localhost:3000`

### 4. Admin Panel Setup
```bash
cd ../admin
npm install
npm run dev
```
Admin panel will run on: `http://localhost:5173` (or another port shown in terminal)

## 🔑 Default Credentials

### Admin Login
- **Email:** admin@indramart.com
- **Password:** admin123

### User Account
Create a new account through the signup page or use any test account you create.

## 📁 Project Structure

```
E-commerce/
├── backend/
│   ├── index.js              # Main server file
│   ├── package.json
│   └── uploads/
│       └── images/           # Uploaded product images
├── frontend/
│   ├── src/
│   │   ├── Components/       # React components
│   │   ├── Pages/           # Page components
│   │   ├── Context/         # React Context (ShopContext)
│   │   └── App.js
│   └── package.json
└── admin/
    ├── src/
    │   ├── Components/       # Admin components
    │   ├── Pages/           # Admin pages
    │   └── App.jsx
    └── package.json
```

## 🔄 API Endpoints

### Authentication
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /admin/login` - Admin login

### Products
- `GET /allproducts` - Get all products
- `GET /products/:category` - Get products by category
- `POST /addproduct` - Add new product (Admin only)
- `POST /removeproduct` - Delete product (Admin only)
- `GET /newcollections` - Get latest 8 products
- `GET /popularinwomen` - Get popular women's products
- `GET /popularinmen` - Get popular men's products
- `GET /popularinkids` - Get popular kids' products

### Cart
- `POST /addtocart` - Add item to cart (Auth required)
- `POST /removefromcart` - Remove item from cart (Auth required)
- `POST /getcart` - Get user's cart (Auth required)

### File Upload
- `POST /upload` - Upload product image

## 🔐 Authentication Flow

### User Authentication
1. User signs up or logs in through `/login` page
2. Backend generates JWT token
3. Token stored in localStorage as `auth-token`
4. Token sent with each request requiring authentication
5. User can logout which clears the token

### Admin Authentication
1. Admin logs in through admin panel
2. Backend generates separate JWT token with admin secret
3. Token stored as `admin-token`
4. All admin operations (add/remove products) require this token
5. Admin can logout from navbar

## 🛡️ Security Features

- JWT token authentication
- Password validation (min 6 characters)
- Email uniqueness validation
- Protected API routes
- File upload validation (only images)
- Token expiration (7 days)
- Admin and user separation

## 🎨 Key Features Explained

### Cart Synchronization
- Cart is stored in MongoDB for logged-in users
- Real-time sync between frontend and backend
- Cart persists across sessions
- Automatic cart loading on login

### Product Management
- Admins can add products with images
- Image upload with validation
- Automatic product ID generation
- Category-based filtering

### User Experience
- Login required for cart operations
- Automatic redirect to login if not authenticated
- Confirmation dialogs for important actions
- Loading states for async operations
- Error messages for failed operations

## 🚀 Usage Guide

### For Customers:
1. Browse products on homepage
2. Click on products to view details
3. **Login/Signup to add items to cart**
4. Manage cart items
5. View cart total
6. Logout when done

### For Admins:
1. Navigate to admin panel
2. **Login with admin credentials**
3. Add new products:
   - Upload product image
   - Enter product details
   - Select category
   - Set prices
4. View all products in list
5. Delete products if needed
6. Logout when done

## 🐛 Troubleshooting

### Backend not connecting to MongoDB?
- Check your internet connection
- Verify MongoDB Atlas credentials
- Check if IP is whitelisted in MongoDB Atlas

### Frontend can't connect to backend?
- Ensure backend is running on port 4000
- Check for CORS errors in console
- Verify API URLs in frontend code

### Admin panel not loading?
- Clear browser cache and localStorage
- Check if admin token is valid
- Restart admin dev server

### Cart not updating?
- Ensure you're logged in
- Check network tab for API errors
- Verify auth-token in localStorage

## 📝 Development Notes

### Adding New Features:
1. Backend: Add route in `backend/index.js`
2. Frontend: Update context or create new components
3. Test with both user and admin roles

### Database Schema:
- **Users:** name, email, password, cartData, date
- **Products:** id, name, image, category, new_price, old_price, date, available
- **Admin:** email, password, name, role, date

## 🤝 Contributing

This is a learning project. Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

This project is for educational purposes.

## 👨‍💻 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the code comments
3. Check browser console for errors
4. Verify backend logs

---

**Happy Shopping! 🛒**

Made with ❤️ using React, Node.js, and MongoDB
