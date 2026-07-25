# Hostinger Deployment Guide — Parfum

## Architecture
```
Frontend  →  Hostinger Web Apps (Vite/React)   — your domain e.g. parfum.com
Backend   →  Hostinger Web Apps (Node/Express) — subdomain e.g. api.parfum.com
Database  →  MongoDB Atlas (free, external)
Payments  →  Razorpay (keys stored as env vars)
```

---

## Step 1 — MongoDB Atlas (Database)

You must do this first — you need the connection string before deploying the backend.

1. Go to https://cloud.mongodb.com and sign up (free)
2. Click **"Build a Database"** → **M0 Free Tier** → Region: **Mumbai (ap-south-1)**
3. Create a **username + password** — save these somewhere safe
4. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   *(Hostinger's outbound IPs are dynamic so this is required)*
5. Click **Connect** → **Drivers** → copy your connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/parfumdb?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<password>` with your actual credentials — keep this string handy

---

## Step 2 — Deploy the Backend (Node.js/Express)

### 2a — Create a Node.js Web App on Hostinger

1. Log in to **hPanel** → go to **Websites**
2. Click **"Add website"** (or use an existing one for a subdomain like `api.parfum.com`)
3. In your website dashboard → find **"Web Apps"** or **"Node.js"** section
4. Click **"Create application"** or **"Add Node.js App"**

### 2b — Connect GitHub

1. Choose **"Import from GitHub"**
2. Authorize Hostinger to access your GitHub account
3. Select repository: **`rohan-0690/Parfum`**
4. Set the following:

   | Setting | Value |
   |---------|-------|
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Build Command** | `npm install` |
   | **Start Command** | `npm start` |
   | **Node Version** | `18` or higher |

### 2c — Add Environment Variables

In the same setup screen (or after under **Environment Variables**), add:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` *(Hostinger assigns the port — check their docs, some use 3000)* |
| `MONGODB_URI` | your Atlas connection string from Step 1 |
| `JWT_SECRET` | any random 32+ character string e.g. `xK9mP2qR8vL5nT3wY7uA1cE4hJ6bF0dG` |
| `JWT_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | your Razorpay Key ID (from Razorpay dashboard) |
| `RAZORPAY_KEY_SECRET` | your Razorpay Key Secret |
| `RAZORPAY_WEBHOOK_SECRET` | your Razorpay Webhook Secret |
| `FRONTEND_URL` | your frontend domain e.g. `https://parfum.com` |
| `ADMIN_EMAIL` | your admin email |

### 2d — Deploy

Click **Deploy** and wait ~2 minutes. Once live, note your backend URL:
```
https://api.parfum.com   (if you set up a subdomain)
```
or whatever Hostinger assigns. Test it:
```
https://your-backend-url/health
```
Should return: `{"status":"ok","timestamp":"..."}`

---

## Step 3 — Deploy the Frontend (React/Vite)

### 3a — Create another Web App (or use main domain)

1. In hPanel → **Websites** → your main domain (e.g. `parfum.com`)
2. Go to **Web Apps** → **Create application**

### 3b — Connect GitHub (same repo, different subfolder)

| Setting | Value |
|---------|-------|
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Output Directory** | `dist` |
| **Framework** | Vite (auto-detected) |

### 3c — Add Environment Variables

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://your-backend-url/api` |
| `VITE_RAZORPAY_KEY_ID` | your Razorpay publishable Key ID |

### 3d — Deploy

Click **Deploy**. Your site goes live at your domain.

---

## Step 4 — Update Backend CORS

Once your frontend URL is live, go back to the backend environment variables and update:

```
FRONTEND_URL = https://parfum.com   (your actual domain, no trailing slash)
```

Trigger a redeploy. This ensures CORS only allows your real domain.

---

## Step 5 — Set Up Razorpay Webhook

1. Go to https://dashboard.razorpay.com → **Settings** → **Webhooks**
2. Click **Add New Webhook**
3. Set URL:
   ```
   https://your-backend-url/api/webhooks/razorpay
   ```
4. Select events:
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `refund.created`
5. Set a **Secret** — copy it and add it as `RAZORPAY_WEBHOOK_SECRET` in your backend env vars
6. Save

---

## Step 6 — Create Admin Account

After your first signup on the live site:

1. Go to MongoDB Atlas → **Browse Collections** → `parfumdb` → `users`
2. Find your user document
3. Change `"role": "user"` → `"role": "admin"`
4. Save

---

## Step 7 — Go Live with Razorpay

By default Razorpay keys starting with `rzp_test_` are test mode.

When ready for real payments:
1. Complete Razorpay KYC at https://dashboard.razorpay.com
2. Get your **Live** keys (`rzp_live_...`)
3. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in both:
   - Backend env vars (hPanel)
   - Frontend env vars (`VITE_RAZORPAY_KEY_ID`)
4. Redeploy both apps

---

## Troubleshooting

**Backend not starting:**
- Check hPanel logs → most likely a missing env var
- Make sure `MONGODB_URI` is correct and Atlas allows all IPs (0.0.0.0/0)
- Verify Node version is 18+

**Frontend shows blank page / 404 on refresh:**
- The `public/_redirects` file and `public/.htaccess` in the repo handle SPA routing
- Make sure Hostinger is serving from the `dist/` output directory

**CORS errors in browser console:**
- Make sure `FRONTEND_URL` in backend env vars exactly matches your frontend domain
- No trailing slash: `https://parfum.com` ✅ not `https://parfum.com/` ❌

**Razorpay checkout not opening:**
- Check browser console for errors
- Make sure `VITE_RAZORPAY_KEY_ID` is set in frontend env vars
- Make sure the backend `/api/payments/create-order` endpoint is reachable

**MongoDB connection refused:**
- Go to Atlas → Network Access → confirm `0.0.0.0/0` is added
- Double-check the username/password in the connection string (special chars need URL encoding)

---

## Auto-deploy on Git Push

Once connected, every push to `main` triggers an automatic rebuild and redeploy on Hostinger — no manual steps needed.
