# Online Book Store Frontend 📚

A modern, responsive React-based frontend for an online book store application. This UI provides a complete e-commerce experience with user authentication, product browsing, shopping cart, order management, and admin dashboard functionality.

## 🌟 Features

### User Features
- **User Authentication** - Secure login and registration with JWT token management
- **Password Recovery** - Forgot password functionality with email verification
- **Book Browsing** - Browse and search through available books with detailed information
- **Book Details** - View comprehensive information about individual books
- **Shopping Cart** - Add/remove books, manage quantities, and view cart summary
- **Checkout Process** - Streamlined checkout with address management and payment integration
- **Order History** - View past orders and order details
- **User Profile** - Manage user information and preferences
- **Address Management** - Save and manage multiple delivery addresses

### Admin Features
- **Admin Dashboard** - Centralized admin control panel
- **Book Management** - Add, edit, and delete books from inventory
- **Order Monitoring** - Track and manage customer orders
- **User Management** - View and manage user accounts

### UI/UX
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Toast Notifications** - Real-time feedback for user actions
- **Protected Routes** - Role-based access control (User/Admin)
- **Navigation Bar** - Dynamic navbar with cart count and user menu

## 🏗️ Architecture & Tech Stack

### Frontend Technology
- **React** (v19.2.4) - UI library
- **React Router DOM** (v7.13.2) - Client-side routing
- **Axios** (v1.14.0) - HTTP client for API calls
- **CSS3** - Styling and responsive design

### Key Libraries
- **React Testing Library** - Component testing
- **Web Vitals** - Performance monitoring

### Backend Integration
- **Spring Boot REST API** - Backend server running on `http://localhost:8080`
- **JWT Authentication** - Secure token-based authentication
- **RESTful API Integration** - Axios-based API communication

## 📁 Project Structure

```
bookstore-frontend/
├── public/                    # Static assets
│   ├── index.html            # Main HTML file
│   ├── manifest.json         # PWA manifest
│   └── robots.txt            # SEO robots file
│
├── src/
│   ├── api/                  # API integration layer
│   │   ├── axios.js          # Axios instance with JWT interceptor
│   │   ├── addressApi.js     # Address management APIs
│   │   ├── cartApi.js        # Shopping cart APIs
│   │   └── paymentApi.js     # Payment processing APIs
│   │
│   ├── components/           # Reusable React components
│   │   ├── Navbar.js         # Navigation bar with user menu
│   │   ├── ProtectedRoute.js # Route protection & role-based access
│   │   └── ToastContainer.js # Notification toast display
│   │
│   ├── context/              # React Context API
│   │   └── NotificationContext.js # Global notification state
│   │
│   ├── pages/                # Page components (route-based)
│   │   ├── LandingPage.js    # Home page
│   │   ├── LoginPage.js      # User login
│   │   ├── RegisterPage.js   # User registration
│   │   ├── ForgotPassword.js # Password recovery
│   │   ├── BooksPage.js      # Book listing & browsing
│   │   ├── BookDetailPage.js # Individual book details
│   │   ├── CartPage.js       # Shopping cart
│   │   ├── CheckoutPage.js   # Checkout process
│   │   ├── OrdersPage.js     # Order history
│   │   ├── ProfilePage.js    # User profile management
│   │   ├── AddressPage.js    # Address management
│   │   └── AdminDashboard.js # Admin control panel
│   │
│   ├── styles/               # CSS stylesheets
│   │   ├── global.css        # Global styles
│   │   ├── Navbar.css        # Navigation styling
│   │   ├── Auth.css          # Login/Register styling
│   │   ├── Books.css         # Books page styling
│   │   ├── LandingPage.css   # Landing page styling
│   │   ├── Cart.css          # Cart page styling
│   │   ├── Checkout.css      # Checkout styling
│   │   ├── Address.css       # Address page styling
│   │   ├── Orders.css        # Orders page styling
│   │   ├── Profile.css       # Profile page styling
│   │   ├── Admin.css         # Admin dashboard styling
│   │   └── Toast.css         # Toast notification styling
│   │
│   ├── App.js               # Main app component with routing
│   ├── index.js             # React DOM render entry point
│   ├── index.css            # Root styles
│   └── reportWebVitals.js   # Performance monitoring
│
├── package.json             # Dependencies and scripts
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **npm** or **yarn** package manager
- **Spring Boot Backend** running on `http://localhost:8080`

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Online-Book-Store-Frontend.git
   cd Online-Book-Store-Frontend/bookstore-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Backend URL** (if needed)
   - The app connects to Spring Boot backend at `http://localhost:8080`
   - To change the backend URL, edit [src/api/axios.js](src/api/axios.js)
   - Update the `baseURL` in the axios configuration

4. **Start the development server**
   ```bash
   npm start
   ```
   - Application opens at `http://localhost:3000`
   - Hot-reload enabled for development

### Available Scripts

```bash
# Start development server with hot reload
npm start

# Build optimized production bundle
npm run build

# Run tests in watch mode
npm test

# Eject configuration (cannot be undone)
npm run eject
```

## 🔐 Authentication & Authorization

### JWT Token Management
- **Token Storage** - JWT tokens stored in `localStorage`
- **Automatic Header Injection** - Axios interceptor automatically adds `Authorization: Bearer <token>` header
- **Protected Routes** - Routes wrapped with `ProtectedRoute` component require valid token
- **Role-Based Access** - Admin routes check user role (`ADMIN` vs regular `USER`)

### User Roles
- **USER** - Regular customer with access to browse books and place orders
- **ADMIN** - Administrator with access to admin dashboard and management features

### Authentication Flow
1. User logs in via `LoginPage` → Backend validates credentials
2. Backend returns JWT token and user role
3. Frontend stores token and role in `localStorage`
4. Token included in all subsequent API requests via axios interceptor
5. On logout, token is removed from storage

## 📋 Pages & Components Overview

### Public Pages (No Authentication Required)
- **Landing Page** (`/`) - Welcome page with featured books and call-to-action
- **Login Page** (`/login`) - User authentication
- **Register Page** (`/register`) - New user account creation
- **Forgot Password** (`/forgot-password`) - Password recovery flow

### Protected Pages (Authentication Required)
- **Books Page** (`/books`) - Browse all available books with filtering/sorting
- **Book Detail Page** (`/books/:id`) - Detailed view of individual book with reviews
- **Cart Page** (`/cart`) - Shopping cart with quantity management
- **Checkout Page** (`/checkout`) - Order finalization and payment processing
- **Orders Page** (`/orders`) - View order history and order details
- **Profile Page** (`/profile`) - User profile information management
- **Address Page** (`/address`) - Manage delivery addresses

### Admin Pages (Admin Only)
- **Admin Dashboard** (`/admin`) - Admin control panel for managing books and orders

## 🧩 Components

### Navbar Component
- Displays navigation links based on user authentication status
- Shows user name and role
- Cart count display (updated in real-time)
- Mobile responsive sidebar menu
- Logout functionality

**Location:** [src/components/Navbar.js](src/components/Navbar.js)

### ProtectedRoute Component
- Wrapper component for protecting routes
- Checks for valid JWT token in localStorage
- Redirects unauthenticated users to login page
- Supports admin-only routes with role validation
- If admin-only route accessed by non-admin, redirects to books page

**Location:** [src/components/ProtectedRoute.js](src/components/ProtectedRoute.js)

### ToastContainer Component
- Displays toast notifications for user feedback
- Shows success, error, warning, and info messages
- Auto-dismisses after configurable duration
- Global notification system via Context API

**Location:** [src/components/ToastContainer.js](src/components/ToastContainer.js)

## 🔌 API Integration

### Axios Configuration
- Base URL: `http://localhost:8080`
- Request interceptor adds JWT token to all requests
- Response interceptor handles common errors
- Automatic token injection eliminates manual header management

**Location:** [src/api/axios.js](src/api/axios.js)

### API Modules

#### Cart API (`cartApi.js`)
- `getCart()` - Retrieve current user's cart
- `addToCart(bookId, quantity)` - Add items to cart
- `updateCartItem(cartItemId, quantity)` - Update item quantity
- `removeFromCart(cartItemId)` - Remove item from cart

#### Address API (`addressApi.js`)
- `getAddresses()` - Get user's saved addresses
- `addAddress(addressData)` - Add new address
- `updateAddress(id, addressData)` - Update existing address
- `deleteAddress(id)` - Delete address

#### Payment API (`paymentApi.js`)
- `processPayment(paymentData)` - Process payment and create order
- `getOrderDetails(orderId)` - Get specific order details
- `getOrders()` - Get all user orders

## 🎯 Styling & Responsive Design

### CSS Organization
- **global.css** - Global styles, variables, and reset rules
- **Component-specific CSS** - Each major component has its own CSS file
- **Mobile-first approach** - Responsive design using media queries
- **Consistent theming** - Shared color palette and typography

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 📡 Data Flow

```
User Interaction
    ↓
Component Update/State Change
    ↓
API Call via Axios
    ↓
Request Interceptor (Adds Token)
    ↓
Backend Processing
    ↓
Response/Error Handling
    ↓
Update Component State
    ↓
Toast Notification via Context
    ↓
UI Update
```

## 🐛 Error Handling

- **API Errors** - Display error toasts with user-friendly messages
- **Authentication Failures** - Redirect to login with error message
- **Network Issues** - Graceful error messages with retry options
- **Validation Errors** - Display field-level validation messages

## 📦 Dependencies Overview

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI library |
| react-dom | ^19.2.4 | React DOM rendering |
| react-router-dom | ^7.13.2 | Client-side routing |
| axios | ^1.14.0 | HTTP client |
| @testing-library/react | ^16.3.2 | Component testing |
| @testing-library/jest-dom | ^6.9.1 | Jest DOM testing utilities |
| web-vitals | ^2.1.4 | Performance monitoring |

## 🧪 Testing

Run tests in watch mode:
```bash
npm test
```

Tests use React Testing Library for component testing. Test files are located next to their respective components.

## 🚢 Production Build

Generate optimized production bundle:
```bash
npm run build
```

Creates an optimized build in the `build/` folder:
- Minified JavaScript
- Optimized images
- CSS bundling
- Ready for deployment

## 📝 Environment Configuration

### Development
- Backend URL: `http://localhost:8080`
- React Dev Server: `http://localhost:3000`
- Hot reload enabled

### Production
To prepare for production deployment:
1. Update backend URL in [src/api/axios.js](src/api/axios.js) to your production API endpoint
2. Run `npm run build`
3. Deploy the `build/` folder to your hosting service

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [Axios Documentation](https://axios-http.com)
- [MDN Web Docs](https://developer.mozilla.org)

## 🔗 Related Projects

- **Backend Repository** - Spring Boot API server (include link to backend repo)
- **Database Schema** - (include link if available)

## 📧 Contact & Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Contact: [your-email@example.com]

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ✅ Checklist for Production

Before pushing to production:
- [ ] Update backend URL to production endpoint
- [ ] Test all authentication flows
- [ ] Verify all API endpoints are working
- [ ] Test on multiple devices and browsers
- [ ] Run `npm run build` and test production build
- [ ] Set up proper error logging
- [ ] Configure CORS settings on backend
- [ ] Test payment integration
- [ ] Verify data encryption for sensitive information
- [ ] Set up CI/CD pipeline

---

