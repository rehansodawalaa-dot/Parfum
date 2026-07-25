# Deployment Guide — Parfum

## Architecture

```
Frontend  →  Vercel          (free — CDN, auto-deploys from GitHub)
Backend   →  Hostinger       (Node.js Web App — Express API)
Database  →  MongoDB Atlas   (free 512MB — external cloud database)
Payments  →  Razorpay        (test keys → live keys when ready)
```

---

## Step 1 — MongoDB Atlas (Database)

MongoDB does not run on Hostinger's managed plans — Atlas is the standard
production solution for MongoDB and is free up to 512MB.

1. Go to https://cloud.mongodb.com and sign up (free)
2. Click **"Build a Database"** → choose **M0 Free Tier**
3. Select region: **Mumbai (ap-south-1)** — closest to India
4. Create a **database user** (save the username and password)
5. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
   - Hostinger's backend has a dynamic IP, so open access is required
6. Click **Connect** → **Drivers** → select **Node.js** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/parfumdb?retryWrites=true&w=majority
   ```
7. Replace `<user>` and `<password>` with your credentials
8. Keep this string — you'll need it in Step 2

---

## Step 2 — Deploy Backend on Hostinger

### 2a — Buy a plan

You need the **Business** plan or higher (₹249/mo) which includes Node.js Web Apps.
URL: https://www.hostinger.com/in/web-apps-hosting/expressjs-hosting

### 2b — Create a Node.js Web App in hPanel

1. Log in to **hPanel** → go to **Websites** → **Add Website**
2. Choose **Node.js** as the type
3. Connect your GitHub repo: `rohan-0690/Parfum`
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install --omit=dev`
   - **Start Command:** `npm start`
   - **Node version:** 20

### 2c — Set Environment Variables in hPanel

In your Node.js app settings → **Environment Variables**, add each one:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | your Atlas connection string from Step 1 |
| `JWT_SECRET` | random 32+ char string (see tip below) |
| `JWT_EXPIRES_IN` | `7d` |
| `RAZORPAY_KEY_ID` | from Razorpay dashboard (rzp_test_* or rzp_live_*) |
| `RAZORPAY_KEY_SECRET` | from Razorpay dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | from Razorpay dashboard |
| `FRONTEND_URL` | your Vercel URL e.g. `https://parfum.vercel.app` |
| `ADMIN_EMAIL` | your admin email |

> **Tip — generate a JWT secret:**
> Run this in any terminal:
> ```
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 2d — Deploy

Click **Deploy**. Hostinger will pull from GitHub, run `npm install`, and start the server.

Your backend URL will be something like:
```
https://parfum-backend.hostinger.app
```
(or a custom domain if you set one up)

### 2e — Verify it's working

Open in your browser:
```
https://parfum-backend.hostinger.app/health
```
You should see:
```json
{ "status": "ok", "timestamp": "..." }
```

---

## Step 3 — Deploy Frontend on Vercel

Your frontend is already linked to Vercel (project: `parfum`).

### 3a — Set Environment Variables in Vercel

Go to https://vercel.com → your `parfum` project → **Settings** → **Environment Variables**

Add these:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://parfum-backend.hostinger.app/api` |
| `VITE_RAZORPAY_KEY_ID` | your Razorpay publishable key |

### 3b — Redeploy

Go to **Deployments** → click the three dots on the latest deployment → **Redeploy**.

Or just push a commit to `main` — Vercel auto-deploys on every push.

Your frontend will be live at:
```
https://parfum.vercel.app
```

---

## Step 4 — Connect Frontend URL to Backend (CORS)

1. Go back to **hPanel** → your Node.js app → **Environment Variables**
2. Set `FRONTEND_URL` to your exact Vercel URL:
   ```
   https://parfum.vercel.app
   ```
   No trailing slash. If you have a custom domain, use that instead.
3. Click **Save** — the app will restart automatically

> **Multiple frontend URLs** (e.g. Vercel preview + custom domain) are supported
> by comma-separating them:
> ```
> FRONTEND_URL=https://parfum.vercel.app,https://www.yourstore.com
> ```

---

## Step 5 — Set Up Razorpay Webhook

1. Log in to https://dashboard.razorpay.com
2. Go to **Settings** → **Webhooks** → **Add New Webhook**
3. Set **Webhook URL** to:
   ```
   https://parfum-backend.hostinger.app/api/webhooks/razorpay
   ```
4. Set a **Webhook Secret** (any strong password) — copy it
5. Select these events:
   - `payment.captured`
   - `payment.failed`
   - `refund.created`
6. Click **Save**
7. Add the same secret to your backend env var `RAZORPAY_WEBHOOK_SECRET`

---

## Step 6 — Create Your Admin Account

After deploying, register an account on the live site normally, then elevate it to admin:

1. Go to **MongoDB Atlas** → **Browse Collections** → `parfumdb` → `users`
2. Find your user document
3. Change `"role": "user"` → `"role": "admin"`
4. Save

---

## Step 7 — Go Live with Razorpay

When you're ready to accept real payments:

1. Log in to https://dashboard.razorpay.com
2. Complete KYC (business verification)
3. Go to **Settings** → **API Keys** → **Generate Live Keys**
4. In hPanel, update these env vars:
   - `RAZORPAY_KEY_ID` → `rzp_live_xxxxxxxxxxxx`
   - `RAZORPAY_KEY_SECRET` → your live secret
5. In Vercel, update:
   - `VITE_RAZORPAY_KEY_ID` → `rzp_live_xxxxxxxxxxxx`
6. Redeploy both

---

## Custom Domain (Optional)

If you have a domain (e.g. `yourstore.com`):

**Frontend (Vercel):**
1. Vercel → your project → **Settings** → **Domains** → Add `www.yourstore.com`
2. Follow the DNS instructions

**Backend (Hostinger):**
1. hPanel → your Node.js app → **Domains** → Add `api.yourstore.com`
2. Update `FRONTEND_URL` to `https://www.yourstore.com`
3. Update `VITE_API_URL` in Vercel to `https://api.yourstore.com/api`

---

## Troubleshooting

**Backend shows error on Hostinger:**
- hPanel → your app → **Logs** — check for missing env vars
- Make sure `MONGODB_URI` is correct and Atlas allows all IPs (`0.0.0.0/0`)

**Frontend shows blank page:**
- Check that `VITE_API_URL` is set in Vercel and points to your Hostinger backend
- Make sure `frontend/vercel.json` has the rewrite rule (already in repo)

**CORS errors in browser:**
- `FRONTEND_URL` in Hostinger must exactly match your Vercel URL (no trailing slash)
- If using a custom domain, add it to `FRONTEND_URL` (comma-separated)

**Razorpay payment fails:**
- Verify the webhook URL is correct in the Razorpay dashboard
- Check `RAZORPAY_WEBHOOK_SECRET` matches on both sides
- Test mode requires `rzp_test_*` keys; live mode requires `rzp_live_*` keys
