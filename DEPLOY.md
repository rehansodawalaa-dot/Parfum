# Deployment Guide — Parfum

## Architecture
```
Frontend  →  Vercel       (free)
Backend   →  Render       (free)
Database  →  MongoDB Atlas (free 512MB)
```

---

## Step 1 — MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and sign up (free)
2. Click **"Build a Database"** → choose **M0 Free Tier** → region: Mumbai (ap-south-1)
3. Create a username + password (save these)
4. Under **Network Access** → Add IP Address → **Allow Access from Anywhere** (0.0.0.0/0)
5. Click **Connect** → **Drivers** → copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/parfumdb?retryWrites=true&w=majority
   ```
6. Replace `<user>` and `<password>` with your credentials

---

## Step 2 — Push to GitHub

```bash
# From the project root (Perfume Site folder)
git init
git add .
git commit -m "Initial commit — Parfum e-commerce"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/parfum.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy Backend on Render

1. Go to https://render.com → Sign up with GitHub
2. Click **"New +"** → **Web Service**
3. Connect your GitHub repo
4. Configure:
   - **Name:** `parfum-backend`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

5. Add Environment Variables (click "Add Environment Variable" for each):

   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `5000` |
   | `MONGODB_URI` | your Atlas connection string |
   | `JWT_SECRET` | any random 32+ char string e.g. `xK9mP2qR8vL5nT3wY7uA1cE4hJ6bF0dG` |
   | `JWT_EXPIRES_IN` | `7d` |
   | `RAZORPAY_KEY_ID` | from Razorpay dashboard (or leave blank for demo) |
   | `RAZORPAY_KEY_SECRET` | from Razorpay dashboard (or leave blank for demo) |
   | `RAZORPAY_WEBHOOK_SECRET` | from Razorpay dashboard (or leave blank for demo) |
   | `FRONTEND_URL` | your Vercel URL (add after Step 4, e.g. `https://parfum.vercel.app`) |

6. Click **"Create Web Service"**
7. Wait ~3 minutes. Copy your backend URL:
   ```
   https://parfum-backend.onrender.com
   ```

---

## Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **"Add New Project"** → Import your GitHub repo
3. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite (auto-detected)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. Add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://parfum-backend.onrender.com/api` |
   | `VITE_RAZORPAY_KEY_ID` | your Razorpay publishable key (or leave blank) |

5. Click **"Deploy"**
6. Your site is live at: `https://parfum-xxxx.vercel.app`

---

## Step 5 — Connect Frontend URL to Backend

1. Go back to Render → your backend service → **Environment**
2. Update `FRONTEND_URL` to your Vercel URL: `https://parfum-xxxx.vercel.app`
3. Click **"Save Changes"** — Render will redeploy automatically

---

## Step 6 — Create Admin Account

Once deployed, create your admin user via the MongoDB Atlas UI:

1. Go to Atlas → **Browse Collections** → `parfumdb` → `users`
2. Find your registered user document
3. Change `"role": "user"` → `"role": "admin"`
4. Save

Or use the Atlas shell:
```js
db.users.updateOne(
  { email: "admin@parfum.com" },
  { $set: { role: "admin" } }
)
```

---

## Demo Credentials (Frontend Only — No Backend Needed)

These work without any backend setup:

| Account | Email | Password |
|---------|-------|----------|
| 👤 User  | `user@parfum.com`  | `User@1234`  |
| 🔑 Admin | `admin@parfum.com` | `Admin@1234` |

---

## Razorpay Setup (Payments)

1. Sign up at https://razorpay.com
2. Go to **Settings → API Keys** → Generate Test Keys
3. Copy `Key ID` and `Key Secret` into your env vars
4. For webhooks: **Settings → Webhooks** → Add URL:
   ```
   https://parfum-backend.onrender.com/api/webhooks/razorpay
   ```
   Select events: `payment.captured`, `payment.failed`, `refund.created`

---

## Troubleshooting

**Backend shows "Application Error" on Render:**
- Check Render logs → likely a missing env var
- Make sure `MONGODB_URI` is correct and Atlas allows all IPs

**Frontend shows blank page on Vercel:**
- Check that `VITE_API_URL` is set correctly
- Make sure `vercel.json` has the rewrite rule (already configured)

**CORS errors in browser:**
- Make sure `FRONTEND_URL` in Render matches your exact Vercel URL (no trailing slash)

**Render free tier sleeps after 15 min inactivity:**
- First request after sleep takes ~30 seconds (cold start)
- Upgrade to Render Starter ($7/mo) to avoid this
