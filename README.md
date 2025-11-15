# BookMySaloon 💈

A modern salon booking platform where users can discover nearby salons, browse services, and book appointments with ease.

## ✨ Features

### 🛒 Smart Cart System
- Add multiple services from any salon to your cart
- Adjust quantities and remove items easily
- Real-time total calculation
- Cart persists across sessions

### 👨👩 Gender-Specific Services
- Services categorized for Men, Women, and Unisex
- Clear visual separation with icons
- Tailored browsing experience

### 💳 Flexible Payment
- **Pay at Shop**: Book now, pay later at the salon
- **Online Payment**: Complete payment online (ready for integration)

### 🔍 Smart Search & Filter
- Find salons near you
- Search by name or location
- Distance-based filtering

### 📅 Date/Time Validation
- Prevents booking past dates
- Validates time slots
- Up to 90 days advance booking

### 🎨 Modern UI
- Purple-to-pink gradient theme
- Smooth animations and transitions
- Fully responsive design
- Mobile-friendly interface

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm
- Git

### Local Development

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd nearsalon
```

2. **Setup Backend**
```bash
cd backend
npm install
cp .env.example .env
npm run migrate
npm run seed
npm run dev
```

Backend runs on http://localhost:5000

3. **Setup Frontend** (new terminal)
```bash
cd frontend
npm install
cp .env.example .env.local
npm start
```

Frontend runs on http://localhost:3000

4. **Test the Application**
- Open http://localhost:3000
- Register with any phone number
- Use any 6-digit OTP (all accepted in dev mode)
- Browse salons and create bookings

## 📦 Project Structure

```
nearsalon/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # Sequelize models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth, validation
│   │   └── seeds/        # Database seeding
│   └── package.json
├── frontend/             # React application
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React Context (Auth, Cart)
│   │   ├── services/     # API calls
│   │   └── styles/       # CSS files
│   └── package.json
└── docs/                 # Documentation
```

## 🔧 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (dev) / PostgreSQL (production)
- **ORM**: Sequelize
- **Auth**: JWT + OTP
- **Security**: Helmet, CORS, Rate Limiting

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **State**: Context API
- **HTTP**: Axios
- **Styling**: CSS3 with custom properties

## 🚀 Production Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete deployment instructions.

**Quick Deploy**:
1. Deploy backend to Render (with PostgreSQL)
2. Deploy frontend to Vercel
3. Configure environment variables
4. Run migrations and seed data

**Expected URLs**:
- Frontend: https://bookmysaloon.vercel.app
- Backend: https://bookmysaloon-backend.onrender.com

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DATABASE_URL=sqlite:./database.sqlite
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🎉 Getting Started is Easy!

```bash
# Backend
cd backend && npm install && npm run migrate && npm run seed && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm start
```

Open http://localhost:3000 and start booking! 💇‍♂️💅

## 📚 Documentation

- [CODE_CHANGES_SUMMARY.md](./CODE_CHANGES_SUMMARY.md) - All code changes
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Production deployment

---

**BookMySaloon Team** - Built with ❤️ using React and Node.js
