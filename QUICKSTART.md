# Quick Start Guide

Get NearSalon up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ OR Docker installed

## Option 1: Docker (Easiest - Recommended)

```bash
# 1. Clone and navigate
git clone <repository-url>
cd nearsalon

# 2. Copy environment file
cp .env.example .env

# 3. Start everything with Docker
docker-compose up --build

# 4. Access the app
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

That's it! The app is now running with a seeded database of 20 salons.

## Option 2: Local Development

### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Setup environment
cp ../.env.example .env

# 4. Configure database in .env
# For PostgreSQL:
DATABASE_URL=postgresql://username:password@localhost:5432/nearsalon
# For SQLite (easier for testing):
DATABASE_URL=sqlite:./database.sqlite

# 5. Run migrations and seed
npm run migrate
npm run seed

# 6. Start server
npm run dev

# Server runs on http://localhost:5000
```

### Frontend (in a new terminal)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Start dev server
npm start

# App opens at http://localhost:3000
```

## Using the Application

### 1. Login
- Go to http://localhost:3000
- Enter any phone number (e.g., `+1234567890`)
- Click "Send OTP"

### 2. Enter OTP
- In development mode, OTP is always `123456`
- Click "Verify OTP"

### 3. Find Salons
- Allow location access when prompted (or search manually)
- Browse 20 seeded salons near you

### 4. Book an Appointment
- Click on any salon
- Choose a service
- Select date and time
- Choose payment method:
  - **Online**: Mock payment (90% success rate)
  - **Pay at Shop**: Instant confirmation

### 5. View Bookings
- Click "My Bookings" in the header
- View, filter, or cancel your bookings

## Test Data

The seed data includes:

- **20 salons** across major US cities
- **8-12 services per salon**
- Service categories: haircut, coloring, styling, treatment, nails, facial, waxing, makeup, beard
- Price range: $15 - $150
- Sample users can be created by logging in with any phone number

## API Testing

### Health Check
```bash
curl http://localhost:5000/health
```

### Send OTP
```bash
curl -X POST http://localhost:5000/api/auth/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "+1234567890"}'
```

### Get Salons (no auth needed)
```bash
curl http://localhost:5000/api/salons
```

### Get Salons Near Location
```bash
curl "http://localhost:5000/api/salons?latitude=40.7128&longitude=-74.0060&radius=10"
```

## Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Common Commands

```bash
# View Docker logs
docker-compose logs -f

# Stop Docker containers
docker-compose down

# Rebuild and restart
docker-compose up --build

# Reset database (Docker)
docker-compose down -v
docker-compose up --build

# Reset database (Local)
cd backend
npm run migrate
npm run seed
```

## Troubleshooting

### Port already in use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Or use SQLite instead (in backend/.env):
DATABASE_URL=sqlite:./database.sqlite
```

### Cannot access location
- Allow location permission in browser
- Or manually search by city name

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [API.md](API.md) for API reference
- See [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment

## Need Help?

- GitHub Issues: [repository-url]/issues
- Email: support@nearsalon.com

---

**Development Mode Features:**
- OTP is always `123456`
- Mock payment gateway (90% success rate)
- Detailed error messages
- No SMS/email notifications (console logs only)
- CORS enabled for localhost:3000
