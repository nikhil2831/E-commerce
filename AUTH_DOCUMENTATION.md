# Authentication System Documentation

## Overview

This e-commerce application uses a unified authentication system where both admins and regular users share a single login page. The system uses:

- **bcrypt** for password hashing (no plain text passwords stored)
- **JWT (JSON Web Tokens)** for session management
- **Role-based access control** (admin/user roles)

## Database Schema

### User Model

```javascript
{
  name: String,          // User's full name
  email: String,         // Unique email (lowercase)
  password: String,      // bcrypt hashed password
  role: String,          // "admin" or "user"
  cartData: Object,      // Shopping cart data
  date: Date             // Account creation date
}
```

## API Endpoints

### Authentication Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/signup` | POST | Create new user account | Public |
| `/login` | POST | Login for both admin and user | Public |
| `/create-admin` | POST | Create admin account (protected) | Secret Key |

### Protected Endpoints

| Endpoint | Method | Description | Access |
|----------|--------|-------------|--------|
| `/admin/dashboard` | GET | Admin dashboard data | Admin only |
| `/user/home` | GET | User home data | Authenticated users |
| `/addproduct` | POST | Add new product | Admin only |
| `/removeproduct` | POST | Remove product | Admin only |
| `/addtocart` | POST | Add item to cart | Authenticated users |
| `/removefromcart` | POST | Remove item from cart | Authenticated users |
| `/getcart` | POST | Get cart data | Authenticated users |

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- bcrypt (password hashing)
- jsonwebtoken (JWT authentication)
- mongoose (MongoDB ORM)
- express (web framework)
- cors (cross-origin requests)
- dotenv (environment variables)

### 2. Environment Variables

Create a `.env` file in the `backend` folder:

```env
PORT=4000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
ADMIN_SECRET_KEY=INDRAMART_ADMIN_SECRET_2024
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:5173
```

### 3. Create Admin Account

Run the admin creation script:

```bash
cd backend
node scripts/createAdmin.js
```

Follow the prompts to enter:
- Admin name
- Admin email
- Password (min 8 characters)
- Confirm password

### 4. Start the Backend Server

```bash
cd backend
npm start
```

### 5. Start the Frontend (User E-commerce Site)

```bash
cd frontend
npm install
npm start
```

The frontend will run on http://localhost:3000

### 6. Start the Admin Panel

```bash
cd admin
npm install
npm run dev
```

The admin panel will run on http://localhost:5173

## Authentication Flow

### Login Flow

1. User enters email and password on the login page
2. Frontend sends POST request to `/login`
3. Backend:
   - Validates email format
   - Finds user by email
   - Compares password using bcrypt
   - Generates JWT token with user ID and role
4. Frontend receives token and user info
5. Based on role:
   - **admin**: Redirects to Admin Dashboard (http://localhost:5173)
   - **user**: Redirects to E-commerce Site (http://localhost:3000)

### Signup Flow (Users Only)

1. User fills signup form with:
   - Name
   - Email
   - Password (min 8 characters)
   - Confirm Password
2. Frontend sends POST request to `/signup`
3. Backend:
   - Validates all fields
   - Checks email format
   - Ensures password >= 8 characters
   - Verifies passwords match
   - Checks for duplicate emails
   - Hashes password with bcrypt
   - Creates user with role="user"
   - Returns JWT token
4. User is created and can login

### Token Storage

- **Frontend (User)**: `localStorage.setItem('auth-token', token)`
- **Admin Panel**: `localStorage.setItem('auth-token', token)`
- **User Info**: `localStorage.setItem('user-info', JSON.stringify(user))`

### Protected Route Access

Include the token in request headers:

```javascript
fetch('/protected-endpoint', {
  headers: {
    'auth-token': localStorage.getItem('auth-token'),
    'Content-Type': 'application/json'
  }
})
```

## Security Features

### Password Security
- All passwords are hashed using bcrypt with 10 salt rounds
- Plain text passwords are NEVER stored
- Password comparison uses bcrypt.compare()

### Input Validation
- Email format validation (regex)
- Minimum password length: 8 characters
- Password confirmation match check
- Duplicate email prevention

### JWT Security
- Tokens expire after 7 days
- Tokens include user ID and role
- Separate middleware for user/admin verification

### Role-Based Access
- Admin routes check for `role === 'admin'`
- User routes check for valid token
- Unauthorized access returns 403 Forbidden

## Error Handling

### Common Error Responses

```javascript
// Invalid credentials
{ success: false, errors: "Invalid email or password" }

// Missing fields
{ success: false, errors: "All fields are required" }

// Invalid email format
{ success: false, errors: "Invalid email format" }

// Password too short
{ success: false, errors: "Password must be at least 8 characters long" }

// Duplicate email
{ success: false, errors: "User already exists with this email address" }

// Access denied (admin routes)
{ success: false, errors: "Access denied. Admin privileges required." }
```

## Creating Admin Accounts

Admin accounts can only be created through:

1. **Script Method** (Recommended):
   ```bash
   node scripts/createAdmin.js
   ```

2. **API Method** (with secret key):
   ```javascript
   fetch('/create-admin', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       name: 'Admin Name',
       email: 'admin@example.com',
       password: 'securepassword123',
       secretKey: 'INDRAMART_ADMIN_SECRET_2024'
     })
   })
   ```

## Testing the System

1. **Create an admin account** using the script
2. **Start all servers** (backend, frontend, admin)
3. **Test user signup** at http://localhost:3000/login
4. **Test user login** - should redirect to e-commerce site
5. **Test admin login** - should redirect to admin panel
6. **Verify protected routes** work correctly

## Troubleshooting

### "Invalid email or password"
- Ensure the email/password are correct
- Check if the user exists in the database
- Verify the password meets minimum requirements

### "Access denied. Admin privileges required."
- The logged-in user doesn't have admin role
- Create an admin account using the script

### Token expired
- Login again to get a new token
- Tokens are valid for 7 days

### CORS errors
- Ensure the frontend URL is in the CORS whitelist
- Check the backend CORS configuration

## File Structure

```
backend/
├── index.js              # Main server file with auth endpoints
├── package.json          # Dependencies including bcrypt
├── .env                  # Environment variables
└── scripts/
    └── createAdmin.js    # Admin creation script

frontend/
├── src/
│   ├── Pages/
│   │   └── LoginSignup.jsx    # Unified login/signup page
│   └── Context/
│       └── ShopContext.jsx    # Auth state management

admin/
├── src/
│   ├── App.jsx                # Admin app with auth check
│   └── Components/
│       └── AdminLogin/
│           └── AdminLogin.jsx  # Admin login component
```
