# Parfum — Premium Fragrance E-Commerce

A production-ready, luxury perfume e-commerce frontend built with React + Vite + Tailwind CSS, paired with a Node.js/Express/MongoDB backend with Razorpay payments.

---

## Folder Structure

```
/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/     # Navbar, Footer, ProductCard, StarRating, ProtectedRoute
│   │   ├── pages/          # Home, Shop, ProductDetail, Cart, Checkout, Login, Signup
│   │   ├── store/          # Zustand stores (cart, auth)
│   │   ├── data/           # Sample product catalogue & testimonials
│   │   ├── lib/            # Axios instance
│   │   ├── utils/          # formatPrice, discountPercent, etc.
│   │   └── index.css       # Tailwind + Google Fonts + component classes
│   └── vercel.json         # SPA rewrite rule for Vercel
│
└── backend/                # Node.js + Express + MongoDB
    └── src/
        ├── config/         # DB connection, Razorpay instance
        ├── controllers/    # auth, user, payment, webhook, admin
        ├── middleware/     # JWT auth, error handler, validator
        ├── models/         # User, Transaction (Mongoose)
        └── routes/         # auth, user, payment, admin, webhook
```

---

## Running Locally

### Frontend

```bash
cd frontend
cp .env.example .env          # fill in VITE_API_URL and VITE_RAZORPAY_KEY_ID
npm install
npm run dev                   # http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env          # fill in MONGODB_URI, JWT_SECRET, RAZORPAY_* keys
npm install
npm run dev                   # http://localhost:5000
```

---

## Environment Variables

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL (e.g. `http://localhost:5000/api`) |
| `VITE_RAZORPAY_KEY_ID` | Razorpay publishable key (safe to expose) |

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Min 32-char random string |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `RAZORPAY_KEY_ID` | From Razorpay dashboard |
| `RAZORPAY_KEY_SECRET` | From Razorpay dashboard (keep secret) |
| `RAZORPAY_WEBHOOK_SECRET` | Set in Razorpay dashboard → Webhooks |
| `FRONTEND_URL` | For CORS (e.g. `https://yoursite.vercel.app`) |

---

## Deployment

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import in Vercel, set root to `frontend/`
3. Add env vars in Vercel dashboard
4. `vercel.json` handles SPA routing automatically

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new Web Service on Render
3. Build command: `npm install` · Start command: `npm start`
4. Add all env vars from `render.yaml`

---

## Payment Flow (Razorpay)

```
User clicks Pay
  → POST /api/payments/create-order   (backend creates Razorpay order)
  → Razorpay Checkout opens in browser
  → User pays (UPI / card / net banking)
  → handler() fires with payment IDs
  → POST /api/payments/verify         (backend verifies HMAC signature)
  → Razorpay webhook fires            (authoritative confirmation)
  → POST /api/webhooks/razorpay       (backend verifies webhook signature)
  → User plan / order status updated
```

All payment logic is transparent — no hidden charges, no dark patterns.

---

## Pages

| Route | Page |
|---|---|
| `/` | Home — hero, categories, best sellers, testimonials, newsletter |
| `/shop` | Product listing with filters (category, fragrance type, brand, price) |
| `/product/:slug` | Product detail — gallery, fragrance notes, reviews, related |
| `/cart` | Cart with quantity controls and order summary |
| `/checkout` | Address form + Razorpay checkout |
| `/login` | Sign in |
| `/signup` | Create account with password strength indicator |
