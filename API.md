# NearSalon API Documentation

## Base URL
```
Production: https://api.nearsalon.com
Development: http://localhost:5000/api
```

## Authentication

All authenticated endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Error description"
    }
  ]
}
```

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Rate Limits

- **General API**: 100 requests per 15 minutes
- **OTP Endpoints**: 5 requests per 15 minutes
- **Auth Endpoints**: 10 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

---

## Authentication Endpoints

### Send OTP

Send an OTP to the user's phone number.

**Endpoint:** `POST /auth/send-otp`

**Rate Limit:** 5 per 15 minutes

**Request:**
```json
{
  "phoneNumber": "+1234567890"
}
```

**Validation:**
- `phoneNumber`: Required, valid phone format

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "expiresIn": "10 minutes",
  "otp": "123456"
}
```

**Note:** `otp` field is only present in development mode.

**Errors:**
- `400` - Invalid phone number format
- `429` - Too many OTP requests

---

### Verify OTP

Verify OTP and receive authentication token.

**Endpoint:** `POST /auth/verify-otp`

**Rate Limit:** 10 per 15 minutes

**Request:**
```json
{
  "phoneNumber": "+1234567890",
  "otp": "123456"
}
```

**Validation:**
- `phoneNumber`: Required, valid phone format
- `otp`: Required, exactly 6 digits

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "+1234567890",
      "name": null,
      "email": null,
      "isVerified": true
    }
  }
}
```

**Errors:**
- `400` - Invalid OTP or OTP expired
- `400` - Too many failed attempts

---

### Get Profile

Get current user's profile.

**Endpoint:** `GET /auth/profile`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com",
      "isVerified": true,
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

**Errors:**
- `401` - Unauthorized (missing or invalid token)
- `404` - User not found

---

### Update Profile

Update user profile information.

**Endpoint:** `PUT /auth/profile`

**Authentication:** Required

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "phoneNumber": "+1234567890",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

---

## Salon Endpoints

### Get Salons

Get list of salons with optional filtering by location and search term.

**Endpoint:** `GET /salons`

**Authentication:** Not required

**Query Parameters:**
- `latitude` (optional): Latitude coordinate (-90 to 90)
- `longitude` (optional): Longitude coordinate (-180 to 180)
- `radius` (optional): Search radius in km (1-100, default: 10)
- `search` (optional): Search by salon name, city, or description
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (1-100, default: 20)

**Example Request:**
```
GET /salons?latitude=40.7128&longitude=-74.0060&radius=10&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "salons": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Glamour Studio",
        "description": "Welcome to Glamour Studio...",
        "address": "1234 Main Street",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "phoneNumber": "+12125551234",
        "email": "info@glamourstudio.com",
        "rating": 4.50,
        "totalReviews": 150,
        "imageUrl": "https://picsum.photos/seed/GlamourStudio/400/300",
        "openingTime": "09:00:00",
        "closingTime": "21:00:00",
        "isActive": true,
        "distance": "2.35",
        "services": [
          {
            "id": "...",
            "name": "Haircut - Women",
            "price": 45.00,
            "duration": 45,
            "category": "haircut"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15
    }
  }
}
```

**Notes:**
- If location is provided, results include `distance` field and are sorted by distance
- If no location is provided, results are sorted by rating

---

### Get Salon by ID

Get detailed information about a specific salon.

**Endpoint:** `GET /salons/:id`

**Authentication:** Not required

**Path Parameters:**
- `id`: Salon UUID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "salon": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Glamour Studio",
      "description": "Welcome to Glamour Studio, your premier destination...",
      "address": "1234 Main Street",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "phoneNumber": "+12125551234",
      "email": "info@glamourstudio.com",
      "rating": 4.50,
      "totalReviews": 150,
      "imageUrl": "https://picsum.photos/seed/GlamourStudio/400/300",
      "openingTime": "09:00:00",
      "closingTime": "21:00:00",
      "services": [...]
    }
  }
}
```

**Errors:**
- `404` - Salon not found

---

### Get Salon Services

Get all services offered by a salon.

**Endpoint:** `GET /salons/:id/services`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "salonId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Haircut - Women",
        "description": "Professional haircut service...",
        "price": 45.00,
        "duration": 45,
        "category": "haircut",
        "isActive": true
      }
    ]
  }
}
```

---

### Get Available Time Slots

Get available booking slots for a salon on a specific date.

**Endpoint:** `GET /salons/:id/slots`

**Authentication:** Not required

**Query Parameters:**
- `date`: Date in YYYY-MM-DD format

**Example Request:**
```
GET /salons/550e8400-e29b-41d4-a716-446655440000/slots?date=2024-01-15
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-15",
    "slots": [
      "09:00", "09:30", "10:00", "10:30", "11:00",
      "11:30", "12:00", "12:30", "13:00", "13:30",
      "14:00", "14:30", "15:00", "15:30", "16:00"
    ],
    "salonHours": {
      "opening": "09:00:00",
      "closing": "21:00:00"
    }
  }
}
```

---

## Booking Endpoints

All booking endpoints require authentication.

### Create Booking

Create a new appointment booking.

**Endpoint:** `POST /bookings`

**Authentication:** Required

**Request:**
```json
{
  "salonId": "550e8400-e29b-41d4-a716-446655440000",
  "serviceId": "550e8400-e29b-41d4-a716-446655440001",
  "bookingDate": "2024-01-15",
  "bookingTime": "14:30",
  "paymentMethod": "online",
  "notes": "Please use organic products"
}
```

**Validation:**
- `salonId`: Required, valid UUID
- `serviceId`: Required, valid UUID
- `bookingDate`: Required, valid date (YYYY-MM-DD)
- `bookingTime`: Required, valid time (HH:MM)
- `paymentMethod`: Required, either "online" or "at_shop"
- `notes`: Optional, max 500 characters

**Success Response (201):**
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "booking": {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "userId": "...",
      "salonId": "...",
      "serviceId": "...",
      "bookingDate": "2024-01-15",
      "bookingTime": "14:30:00",
      "status": "pending",
      "totalAmount": 45.00,
      "paymentMethod": "online",
      "paymentStatus": "pending",
      "confirmationCode": "AB12CD34",
      "notes": "Please use organic products"
    }
  }
}
```

**Errors:**
- `404` - Salon or service not found
- `409` - Time slot already booked

---

### Get User Bookings

Get all bookings for the authenticated user.

**Endpoint:** `GET /bookings`

**Authentication:** Required

**Query Parameters:**
- `status` (optional): Filter by status (pending, confirmed, completed, cancelled)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "...",
        "bookingDate": "2024-01-15",
        "bookingTime": "14:30:00",
        "status": "confirmed",
        "totalAmount": 45.00,
        "paymentMethod": "online",
        "paymentStatus": "paid",
        "confirmationCode": "AB12CD34",
        "salon": {
          "id": "...",
          "name": "Glamour Studio",
          "address": "1234 Main Street",
          "city": "New York",
          "phoneNumber": "+12125551234"
        },
        "service": {
          "id": "...",
          "name": "Haircut - Women",
          "price": 45.00,
          "duration": 45
        },
        "payment": {
          "id": "...",
          "status": "success",
          "transactionId": "TXN1234567890"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5
    }
  }
}
```

---

### Get Booking by ID

Get details of a specific booking.

**Endpoint:** `GET /bookings/:id`

**Authentication:** Required

**Path Parameters:**
- `id`: Booking UUID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "booking": {
      "id": "...",
      "bookingDate": "2024-01-15",
      "bookingTime": "14:30:00",
      "status": "confirmed",
      "totalAmount": 45.00,
      "confirmationCode": "AB12CD34",
      "salon": {...},
      "service": {...},
      "payment": {...}
    }
  }
}
```

**Errors:**
- `404` - Booking not found

---

### Cancel Booking

Cancel an existing booking.

**Endpoint:** `PATCH /bookings/:id/cancel`

**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "booking": {
      "id": "...",
      "status": "cancelled",
      "paymentStatus": "refunded"
    }
  }
}
```

**Errors:**
- `404` - Booking not found
- `400` - Booking already cancelled
- `400` - Cannot cancel completed booking

---

## Payment Endpoints

### Process Payment

Process payment for a booking.

**Endpoint:** `POST /payments/process`

**Authentication:** Required

**Request:**
```json
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440002",
  "paymentMethod": "online"
}
```

**Validation:**
- `bookingId`: Required, valid UUID
- `paymentMethod`: Required, either "online" or "at_shop"

**Success Response - Online Payment (200):**
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "payment": {
      "id": "...",
      "bookingId": "...",
      "amount": 45.00,
      "paymentMethod": "online",
      "status": "success",
      "transactionId": "TXN1640000000ABC123",
      "paidAt": "2024-01-15T14:25:00.000Z"
    },
    "booking": {
      "id": "...",
      "confirmationCode": "AB12CD34",
      "status": "confirmed",
      "paymentStatus": "paid"
    }
  }
}
```

**Success Response - Pay at Shop (200):**
```json
{
  "success": true,
  "message": "Booking confirmed. Pay at shop.",
  "data": {
    "payment": {
      "id": "...",
      "status": "pending",
      "paymentMethod": "at_shop"
    },
    "booking": {
      "id": "...",
      "confirmationCode": "AB12CD34",
      "status": "confirmed",
      "paymentMethod": "at_shop"
    }
  }
}
```

**Error Response - Payment Failed (400):**
```json
{
  "success": false,
  "message": "Payment failed",
  "data": {
    "payment": {
      "status": "failed"
    },
    "reason": "Payment declined by bank"
  }
}
```

**Other Errors:**
- `404` - Booking not found
- `400` - Booking already paid

---

### Get Payment by Booking

Get payment details for a booking.

**Endpoint:** `GET /payments/booking/:bookingId`

**Authentication:** Required

**Path Parameters:**
- `bookingId`: Booking UUID

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": "...",
      "bookingId": "...",
      "amount": 45.00,
      "paymentMethod": "online",
      "status": "success",
      "transactionId": "TXN1640000000ABC123",
      "paidAt": "2024-01-15T14:25:00.000Z",
      "gatewayResponse": {
        "code": "200",
        "message": "Payment processed successfully"
      }
    }
  }
}
```

**Errors:**
- `404` - Booking or payment not found

---

## Webhook Endpoints

### Health Check

Check API health status.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 3600.5
}
```

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| `AUTH_001` | Authentication required | No token provided |
| `AUTH_002` | Invalid token | Token is malformed or invalid |
| `AUTH_003` | Token expired | JWT token has expired |
| `OTP_001` | Invalid OTP | OTP is incorrect |
| `OTP_002` | OTP expired | OTP validity period has passed |
| `OTP_003` | Too many attempts | OTP verification attempts exceeded |
| `BOOK_001` | Slot unavailable | Time slot already booked |
| `PAY_001` | Payment failed | Payment gateway declined |
| `VAL_001` | Validation error | Input validation failed |

---

## Changelog

### Version 1.0.0 (2024-01-15)
- Initial API release
- Authentication with OTP
- Salon search and filtering
- Booking system
- Mock payment processing
