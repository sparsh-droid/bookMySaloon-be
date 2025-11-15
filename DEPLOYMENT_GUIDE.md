# BookMySaloon - Complete Deployment Guide

## 🚀 Production Deployment Instructions

This guide covers deploying BookMySaloon to free hosting services:
- **Backend**: Render.com (with PostgreSQL)
- **Frontend**: Vercel

---

## 📋 Prerequisites

1. GitHub account
2. Render.com account (free tier)
3. Vercel account (free tier)
4. Git installed locally

---

## 🔧 Part 1: Backend Deployment on Render

### Step 1: Push Code to GitHub

```bash
cd /home/hstpl_lap_137/Documents/nearsalon
git init
git add .
git commit -m "Initial commit - BookMySaloon"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create PostgreSQL Database on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **PostgreSQL**
3. Configure:
   - **Name**: `bookmysaloon-db`
   - **Database**: `bookmysaloon`
   - **User**: `bookmysaloon_user`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. **Save the Internal Database URL** (shown after creation)

### Step 3: Deploy Backend Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `bookmysaloon-backend`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. **Environment Variables** - Add these:
   ```
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<paste-internal-database-url-from-step-2>
   JWT_SECRET=<generate-random-string-32-chars>
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=*
   ```

5. Click **Create Web Service**
6. Wait for deployment (5-10 minutes)
7. **Save your backend URL**: `https://bookmysaloon-backend.onrender.com`

### Step 4: Run Database Migrations

1. In Render dashboard, go to your web service
2. Click **Shell** tab
3. Run:
   ```bash
   npm run migrate
   npm run seed
   ```

---

## 🎨 Part 2: Frontend Deployment on Vercel

### Step 1: Prepare Frontend Environment

1. Create `.env.production` in `frontend/` directory:
   ```bash
   REACT_APP_API_URL=https://bookmysaloon-backend.onrender.com/api
   ```

2. Commit and push:
   ```bash
   git add .
   git commit -m "Add production env config"
   git push
   ```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. **Environment Variables**:
   ```
   REACT_APP_API_URL=https://bookmysaloon-backend.onrender.com/api
   ```

6. Click **Deploy**
7. Wait for deployment (2-3 minutes)
8. **Save your frontend URL**: `https://bookmysaloon.vercel.app`

### Step 3: Update Backend CORS

1. Go back to Render dashboard
2. Open backend web service
3. Go to **Environment** tab
4. Update `CORS_ORIGIN`:
   ```
   CORS_ORIGIN=https://bookmysaloon.vercel.app
   ```
5. Save changes (service will redeploy)

---

## 🧪 Part 3: Testing

### Test Backend API

```bash
# Health check
curl https://bookmysaloon-backend.onrender.com/health

# Get salons
curl https://bookmysaloon-backend.onrender.com/api/salons
```

### Test Frontend

1. Open `https://bookmysaloon.vercel.app`
2. Register a new account
3. Browse salons
4. Add services to cart
5. Create a booking with "Pay at Shop"
6. Verify confirmation page

---

## 📝 Test Credentials

After deployment, create a test account:

**Phone Number**: +919876543210
**OTP**: Any 6 digits (in development, all OTPs are accepted)

Or use the registration form with:
- Name: Test User
- Phone: +919876543210
- Email: test@bookmysaloon.com

---

## 🔗 Live URLs (Template)

Replace these after deployment:

- **Frontend**: https://bookmysaloon.vercel.app
- **Backend API**: https://bookmysaloon-backend.onrender.com
- **API Docs**: https://bookmysaloon-backend.onrender.com/api

---

## 📊 Sample API Requests

### 1. Register User
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210"
  }'
```

### 2. Login (Request OTP)
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210"
  }'
```

### 3. Verify OTP
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'
```

### 4. Get Salons
```bash
curl https://bookmysaloon-backend.onrender.com/api/salons
```

### 5. Get Salon Details
```bash
curl https://bookmysaloon-backend.onrender.com/api/salons/<salon-id>
```

### 6. Create Booking (with Auth)
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "salonId": "<salon-id>",
    "services": [
      {
        "serviceId": "<service-id>",
        "quantity": 1
      }
    ],
    "bookingDate": "2025-12-01",
    "bookingTime": "10:00",
    "paymentMethod": "at_shop",
    "notes": "Test booking"
  }'
```

---

## 🔍 Troubleshooting

### Backend Issues

1. **500 Error**: Check Render logs
   - Go to Render dashboard → Your service → Logs tab
   - Look for database connection errors

2. **Database Connection Failed**:
   - Verify DATABASE_URL is correct
   - Ensure database is in same region as web service

3. **Migrations Failed**:
   ```bash
   # In Render shell
   npm run migrate
   ```

### Frontend Issues

1. **API Calls Failing**:
   - Check REACT_APP_API_URL is correct
   - Verify CORS is configured on backend

2. **Build Failed**:
   - Check build logs in Vercel
   - Ensure all dependencies are in package.json

### CORS Issues

If you see CORS errors in browser console:
1. Go to Render → Backend service → Environment
2. Update CORS_ORIGIN to match your Vercel domain
3. Save and redeploy

---

## 🎯 Important Notes

1. **Free Tier Limitations**:
   - Render: Service spins down after 15 min inactivity (first request may be slow)
   - Vercel: Unlimited bandwidth on free tier
   - PostgreSQL: 256 MB storage on free tier

2. **Database Seeding**:
   - Run `npm run seed` only once after deployment
   - Already includes 50 Indian salons with services

3. **Environment Variables**:
   - Never commit .env files to Git
   - Always use platform-specific environment settings

4. **JWT Secret**:
   - Generate a strong random secret: `openssl rand -base64 32`
   - Different for each environment

---

## 📞 Support

For issues or questions:
- Check Render logs for backend errors
- Check Vercel logs for frontend errors
- Verify environment variables are set correctly

---

## ✅ Deployment Checklist

Backend:
- [ ] PostgreSQL database created on Render
- [ ] Backend web service deployed
- [ ] Environment variables configured
- [ ] Database migrated
- [ ] Database seeded
- [ ] Health check passing

Frontend:
- [ ] Environment variables configured
- [ ] Deployed to Vercel
- [ ] Can access homepage
- [ ] API calls working

Integration:
- [ ] CORS configured correctly
- [ ] Can register/login
- [ ] Can browse salons
- [ ] Can create bookings
- [ ] Confirmation page works

---

## 🎉 You're Done!

Your BookMySaloon app is now live in production!

**Share these URLs with users:**
- Web App: https://bookmysaloon.vercel.app
- API: https://bookmysaloon-backend.onrender.com/api
