# Crust & Craft — Full-Stack Pizza Delivery & Inventory Platform

A production-grade, full-stack MERN pizza ordering and real-time inventory management platform built with React.js, Node.js + Express.js, MongoDB, Socket.IO, and Razorpay test-mode payment gateway integration.

---

## 🍕 Project Overview

Crust & Craft provides an end-to-end pizza ordering experience with distinct customer and restaurant administrator portals. Customers can register, verify their email, customize their pizza through an interactive 4-step wizard with real-time ingredient stock checks, execute secure payments via Razorpay, and watch live status updates as their pizza transitions through the kitchen and out for delivery. 

Restaurant administrators have an isolated management portal featuring real-time stock monitoring with automatic decrements, manual restock controls, configurable safety thresholds with automated email warnings powered by `node-cron`, and live order dispatch controls.

The entire project is organized inside the `WebDev-L3-PizzaDelivery` directory:
- `WebDev-L3-PizzaDelivery/backend`
- `WebDev-L3-PizzaDelivery/frontend`

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

## ⚙️ Quick Start

### Backend
```bash
cd WebDev-L3-PizzaDelivery/backend
npm install
npm run seed
npm start
```

### Frontend
```bash
cd WebDev-L3-PizzaDelivery/frontend
npm install
npm run dev
```

---

## 🔑 Default Administrator Credentials

- **Admin Portal**: `http://localhost:5173/admin/login`
- **Email**: `admin@pizzadelivery.com`
- **Password**: `Admin@12345`

For complete documentation, see [WebDev-L3-PizzaDelivery/README.md](WebDev-L3-PizzaDelivery/README.md).
