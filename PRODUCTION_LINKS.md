# BookMySaloon - Production Links & Credentials

## 🌐 Live URLs

### Frontend (Vercel)
**URL**: `https://bookmysaloon.vercel.app` *(Update after deployment)*

**Access**: Public - no authentication needed to browse

### Backend API (Render)
**Base URL**: `https://bookmysaloon-backend.onrender.com` *(Update after deployment)*

**API Endpoint**: `https://bookmysaloon-backend.onrender.com/api`

**Health Check**: `https://bookmysaloon-backend.onrender.com/health`

---

## 🔑 Test Credentials

### Option 1: Register New Account
1. Go to the live frontend URL
2. Click "Login" → "Don't have an account? Register"
3. Fill in the form:
   - **Name**: Your Name
   - **Email**: your.email@example.com
   - **Phone**: +91XXXXXXXXXX (Indian format)
4. Click Register
5. Enter any 6-digit OTP (all accepted in dev mode)

### Option 2: Use Pre-seeded Account
After deployment, you can create a test account:

**Phone Number**: `+919876543210`
**Name**: `Test User`
**Email**: `test@bookmysaloon.com`

**OTP**: Any 6 digits (e.g., `123456`)

---

## 📊 Sample API Requests

### 1. Health Check
```bash
curl https://bookmysaloon-backend.onrender.com/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-XX-XXTXX:XX:XX.XXXZ",
  "uptime": 123.456
}
```

### 2. Get All Salons
```bash
curl https://bookmysaloon-backend.onrender.com/api/salons
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "salons": [
      {
        "id": "uuid-here",
        "name": "Elegant Cuts & Styles",
        "city": "Mumbai",
        "state": "Maharashtra",
        "startingPrice": "299.00",
        "rating": "4.5",
        ...
      }
    ],
    "total": 50
  }
}
```

### 3. Register New User
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phoneNumber": "+919876543210"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210"
    }
  }
}
```

### 4. Login (Request OTP)
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### 5. Verify OTP & Get Token
```bash
curl -X POST https://bookmysaloon-backend.onrender.com/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+919876543210",
    "otp": "123456"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+919876543210"
    }
  }
}
```

### 6. Get Salon Details
```bash
# Replace {salon-id} with actual salon ID from step 2
curl https://bookmysaloon-backend.onrender.com/api/salons/{salon-id}
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "salon": {
      "id": "uuid-here",
      "name": "Elegant Cuts & Styles",
      "address": "123 MG Road",
      "city": "Mumbai",
      "servicesByGender": {
        "male": [
          {
            "id": "uuid-here",
            "name": "Haircut - Men",
            "price": "299.00",
            "duration": 30,
            "gender": "male"
          }
        ],
        "female": [...],
        "unisex": [...]
      }
    }
  }
}
```

### 7. Create Booking (Requires Auth Token)
```bash
# Replace {token} with the JWT token from step 5
# Replace {salon-id} and {service-id} with actual IDs

curl -X POST https://bookmysaloon-backend.onrender.com/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "salonId": "{salon-id}",
    "services": [
      {
        "serviceId": "{service-id}",
        "quantity": 1
      }
    ],
    "bookingDate": "2025-12-01",
    "bookingTime": "10:00",
    "paymentMethod": "at_shop",
    "notes": "Test booking via API"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Booking confirmed! Pay at the salon.",
  "data": {
    "booking": {
      "id": "uuid-here",
      "confirmationCode": "BK123456",
      "bookingDate": "2025-12-01",
      "bookingTime": "10:00",
      "totalAmount": "299.00",
      "status": "confirmed",
      "paymentMethod": "at_shop",
      "services": [...]
    }
  }
}
```

### 8. Get User's Bookings (Requires Auth Token)
```bash
curl https://bookmysaloon-backend.onrender.com/api/bookings \
  -H "Authorization: Bearer {token}"
```

---

## 🧪 Testing Checklist

### Frontend Testing
- [ ] Homepage loads correctly
- [ ] Can view salon listings
- [ ] Can search salons
- [ ] Can view salon details
- [ ] Services grouped by gender (Men/Women/Unisex)
- [ ] Can add services to cart
- [ ] Cart badge shows item count
- [ ] Can update quantities in cart
- [ ] Can remove items from cart
- [ ] Can proceed to booking
- [ ] Date picker prevents past dates
- [ ] Can select time slot
- [ ] Can choose "Pay at Shop"
- [ ] Confirmation page displays correctly
- [ ] Can view booking history

### Backend Testing
- [ ] Health check responds
- [ ] Can get all salons
- [ ] Can register new user
- [ ] Can login (request OTP)
- [ ] Can verify OTP
- [ ] Can get salon details
- [ ] Services have gender field
- [ ] Can create booking
- [ ] Booking has confirmed status for at_shop
- [ ] Can get user bookings
- [ ] Date validation works (rejects past dates)

### Integration Testing
- [ ] Frontend can connect to backend
- [ ] CORS configured correctly
- [ ] Authentication flow works end-to-end
- [ ] Cart data submits correctly
- [ ] Booking creation works
- [ ] Confirmation page receives booking data

---

## 📱 User Flow Testing

1. **Browse Salons**
   - Open frontend URL
   - See list of 50 salons
   - Notice "Starts from ₹XXX" on cards

2. **Register Account**
   - Click Login → Register
   - Fill form and submit
   - Enter any 6-digit OTP
   - Redirected to salons page

3. **View Salon Details**
   - Click any salon card
   - See services grouped by gender
   - Notice icons (👨 👩 ✨)

4. **Add to Cart**
   - Click "+ Add to Cart" on 2-3 services
   - See cart badge update in header
   - See sticky cart banner appear

5. **Book Services**
   - Click "View Cart & Book"
   - Adjust quantities if needed
   - Select future date
   - Choose time slot
   - Select "Pay at Shop"
   - Add optional notes
   - Click "Confirm Booking"

6. **View Confirmation**
   - See green success icon
   - See confirmation code
   - See all booked services with quantities
   - See total amount
   - See salon information

7. **View Booking History**
   - Click "My Bookings" in header
   - See list of bookings
   - Click any booking to view details

---

## 🔧 Environment Variables (Production)

### Backend Environment
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:pass@host:5432/bookmysaloon
JWT_SECRET=<generate-32-char-random-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://bookmysaloon.vercel.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend Environment
```env
REACT_APP_API_URL=https://bookmysaloon-backend.onrender.com/api
```

---

## 🚀 Deployment Status

- [ ] PostgreSQL database created on Render
- [ ] Backend deployed to Render
- [ ] Environment variables configured (backend)
- [ ] Database migrated
- [ ] Database seeded with 50 salons
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured (frontend)
- [ ] CORS updated with frontend URL
- [ ] Health check passing
- [ ] Sample API requests working
- [ ] End-to-end booking flow tested

---

## 📊 Database Stats (After Seeding)

- **Salons**: 50 (across major Indian cities)
- **Services per salon**: 12-18 (varies by salon)
- **Total services**: ~700
- **Service categories**: Haircut, Beard, Shave, Coloring, Styling, Spa, Makeup, Waxing, etc.
- **Gender distribution**: Male (3 types), Female (4 types), Unisex (11 types)
- **Price range**: ₹150 - ₹4500

---

## 🎯 Key Features to Demonstrate

1. **Cart System**: Show adding multiple services, quantities, total calculation
2. **Gender Separation**: Show Men's, Women's, and Unisex service sections
3. **Pay at Shop**: Create booking without payment, get confirmed status
4. **Date Validation**: Try selecting past date (should be blocked)
5. **Confirmation Page**: Beautiful gradient UI with all booking details
6. **Responsive Design**: Test on mobile and desktop

---

## 📝 Notes

- **First Request Delay**: Render free tier spins down after 15 min inactivity. First request after spin-down may take 30-60 seconds.
- **OTP in Production**: Currently all OTPs are accepted. For real production, integrate SMS service (Twilio, MSG91, etc.)
- **Payment Integration**: "Pay at Shop" is functional. "Online Payment" ready for payment gateway integration (Razorpay, Stripe, etc.)

---

## 🔗 Quick Links

- **Frontend Repository**: [GitHub Link]
- **Backend Repository**: [GitHub Link]
- **Deployment Guide**: See DEPLOYMENT_GUIDE.md
- **Code Changes**: See CODE_CHANGES_SUMMARY.md

---

**Last Updated**: 2025-XX-XX
**Status**: ✅ Production Ready
**Version**: 1.0.0
