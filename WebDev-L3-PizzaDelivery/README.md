# Crust & Craft — Full-Stack Pizza Delivery & Inventory Platform

A production-grade, full-stack MERN pizza ordering and real-time inventory management platform built with React.js, Node.js + Express.js, MongoDB, Socket.IO, and Razorpay test-mode payment gateway integration.

---

## 🍕 Project Overview

Crust & Craft provides an end-to-end pizza ordering experience with distinct customer and restaurant administrator portals. Customers can register, verify their email, customize their pizza through an interactive 4-step wizard with real-time ingredient stock checks, execute secure payments via Razorpay, and watch live status updates as their pizza transitions through the kitchen and out for delivery. 

Restaurant administrators have an isolated management portal featuring real-time stock monitoring with automatic decrements, manual restock controls, configurable safety thresholds with automated email warnings powered by `node-cron`, and live order dispatch controls.

---

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, Axios, Socket.IO Client, React Router v6
- **Backend**: Node.js, Express.js (ES Modules), MongoDB (Mongoose), Socket.IO, JWT (`jsonwebtoken`), `bcryptjs`, Nodemailer, `node-cron`, Razorpay Node SDK
- **Database**: MongoDB (Local or MongoDB Atlas)
- **Payment Gateway**: Razorpay (Test Mode Integration)
- **Real-Time Layer**: WebSockets via Socket.IO

---

## ✅ Feature Checklist

### User Side
- [x] **User Registration with Email Verification**: Secure signup flow generating cryptographic tokens with time-limited activation links dispatched via Nodemailer.
- [x] **JWT Authorization**: Authenticated access for protected user routes using JSON Web Tokens.
- [x] **Forgot Password Flow**: Password reset system with secure single-use email reset links and expiry windows.
- [x] **Pizza Varieties Dashboard**: Curated menu displaying artisanal pizza recipes with Unsplash photography, vegetarian indicators, best-seller tags, and quick order / customize options.
- [x] **Interactive 4-Step Custom Pizza Builder**:
  - **Step 1**: Choose a pizza base (5 options: Classic Hand-Tossed, Thin Crust, Pan Pizza, Cheese Stuffed Crust, Gluten-Free Crust)
  - **Step 2**: Choose a sauce (5 options: Classic Marinara, Spicy Arrabiata, Creamy Garlic Alfredo, Smoky BBQ Sauce, Basil Pesto)
  - **Step 3**: Choose a cheese type (Mozzarella, Aged Cheddar, Parmesan Reggiano, Smoked Gouda, Vegan Mozzarella)
  - **Step 4**: Choose vegetables (multi-select: Bell Peppers, Sliced Mushrooms, Red Onions, Black Olives, Jalapeños, Sweet Corn, Fresh Baby Spinach, Cherry Tomatoes)
  - *Dynamic Price Calculator*: Real-time pricing with crust size multiplier (Regular / Medium / Large) and quantity selector.
  - *Live Inventory Check*: Out-of-stock ingredients are dynamically disabled with visual indicators.
- [x] **Order Summary Page**: Detailed itemized invoice breakdown (base ingredients, toppings, GST tax, delivery fee) and customer address capture.
- [x] **Razorpay Checkout Integration**: Razorpay test-mode checkout gateway with verification signature validation and test simulation mode.
- [x] **Real-Time Order Tracking**: Multi-step visual progress stepper (`Order Received` &rarr; `In Kitchen` &rarr; `Sent to Delivery` &rarr; `Delivered`) updating instantly via WebSockets without page refreshes.

### Admin Side
- [x] **Isolated Admin Login**: Dedicated administrative portal (`/admin/login`) strictly partitioned from customer registration.
- [x] **Live Inventory Dashboard**: Real-time stock overview of all 4 categories (pizza bases, sauces, cheeses, vegetables).
- [x] **Automatic Stock Decrement**: Automatic deduction of inventory quantities upon confirmed payment for each component selected in an order.
- [x] **Manual Stock Management**: Quick increment/decrement buttons (`+1`, `+10`, `-1`, `-5`) and full modal editor for quantity and alert thresholds.
- [x] **Automated Low-Stock Email Notifications**: Scheduled background audit job using `node-cron` (runs every 30 minutes) querying items where `stock <= threshold` and dispatching HTML email alerts to the administrator. Includes manual on-demand trigger.
- [x] **Order Management Panel**: Real-time tabular dispatcher displaying customer details, item specifications, and instant order status mutation.
- [x] **Bidirectional WebSocket Sync**: Admin status changes broadcast in real time to the customer dashboard.

---

## 📁 Repository Structure

```
WebDev-L3-PizzaDelivery/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Inventory.js
│   │   ├── Order.js
│   │   ├── Pizza.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── inventoryRoutes.js
│   │   ├── orderRoutes.js
│   │   └── pizzaRoutes.js
│   ├── utils/
│   │   ├── cronJobs.js
│   │   ├── emailService.js
│   │   └── seed.js
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Footer.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── SocketContext.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboardPage.jsx
│   │   │   │   └── AdminLoginPage.jsx
│   │   │   ├── CustomPizzaBuilderPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── OrderSummaryPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   ├── UserDashboardPage.jsx
│   │   │   └── VerifyEmailPage.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
│
└── README.md
```

---

## ⚙️ Setup and Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB (Local instance running at `mongodb://127.0.0.1:27017` or a free MongoDB Atlas connection string)

### 2. Backend Installation

```bash
cd WebDev-L3-PizzaDelivery/backend
npm install
```

#### Seed Initial Database (Admin, 5 Bases, 5 Sauces, Cheeses, Veggies, Pizzas)
```bash
npm run seed
```

#### Run Backend Server
```bash
npm start
```
The backend server starts on port `5000` (or your configured `PORT`).

---

### 3. Frontend Installation

```bash
cd WebDev-L3-PizzaDelivery/frontend
npm install
```

#### Run Frontend Development Server
```bash
npm run dev
```
The client will be running at `http://localhost:5173`.

---

## 🔐 Environment Variables (`.env`)

The project contains pre-created `.env` files in both `backend` and `frontend`. You can add your actual production / test keys in these files:

### Backend: `WebDev-L3-PizzaDelivery/backend/.env`

| Variable Key | Purpose | Default / Example Value |
|---|---|---|
| `PORT` | Express HTTP server port | `5000` |
| `CLIENT_URL` | Allowed CORS origin for frontend | `http://localhost:5173` |
| `MONGO_URI` | MongoDB connection URI | `mongodb://127.0.0.1:27017/pizzadelivery` or your Atlas cluster URL |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | `supersecretpizzatokenkey1234567890` |
| `RAZORPAY_KEY_ID` | Razorpay Test Key ID from Razorpay Dashboard | `rzp_test_...` |
| `RAZORPAY_KEY_SECRET` | Razorpay Secret Key | `...` |
| `EMAIL_SERVICE` | Nodemailer service provider | `gmail` |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Gmail address for sending verification & alerts | `your_email@gmail.com` |
| `EMAIL_PASS` | Gmail 16-character App Password | `your_app_password` |
| `ADMIN_EMAIL` | Target email receiving low-stock alerts | `admin@pizzadelivery.com` |
| `ADMIN_DEFAULT_PASSWORD` | Seeded admin account password | `Admin@12345` |
| `INVENTORY_ALERT_THRESHOLD` | Default safety inventory threshold | `20` |

### Frontend: `WebDev-L3-PizzaDelivery/frontend/.env`

| Variable Key | Purpose | Default Value |
|---|---|---|
| `VITE_API_URL` | Backend REST API endpoint | `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | WebSocket Socket.IO server URL | `http://localhost:5000` |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay Test Key ID | `rzp_test_...` |

---

## 🔑 Default Administrator Credentials

Once `npm run seed` is executed, the following credentials are ready for use at `/admin/login`:

- **Admin Portal URL**: `http://localhost:5173/admin/login`
- **Email**: `admin@pizzadelivery.com`
- **Password**: `Admin@12345`

---

## 📡 REST API Reference

### Authentication (`/api/auth`)
- `POST /register`: Register a customer account and dispatch verification email.
- `POST /verify-email`: Activate account using token.
- `POST /login`: Authenticate verified customer and return JWT.
- `POST /admin/login`: Restricted authentication for `role: 'admin'`.
- `POST /forgot-password`: Dispatch password reset email.
- `POST /reset-password`: Set new password with valid reset token.
- `GET /me`: Fetch authenticated user profile.

### Inventory (`/api/inventory`)
- `GET /`: Retrieve all bases, sauces, cheeses, and vegetables with stock levels.
- `PUT /:id/stock`: Update stock quantity (Admin).
- `PUT /:id/threshold`: Update low-stock threshold (Admin).
- `PUT /:id`: Edit ingredient name, price, stock, or threshold (Admin).
- `POST /check-alerts`: Trigger manual node-cron inventory stock audit (Admin).

### Orders (`/api/orders`)
- `POST /create-razorpay-order`: Initialize Razorpay payment order.
- `POST /verify-and-place`: Verify signature, place order, and decrement ingredient stock.
- `GET /my-orders`: Retrieve authenticated customer's order history.
- `GET /admin/all`: Retrieve all customer orders (Admin).
- `PUT /:id/status`: Update order status with real-time WebSocket broadcast (Admin).
