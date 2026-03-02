# 🚚 Transport Load Management System — Backend

A production-ready REST API built with **Node.js + Express + TypeScript + TypeORM + MySQL**.

---

## 📁 Project Structure

```
src/
├── config/
│   └── database.ts          # TypeORM + MySQL connection
├── entities/
│   ├── User.ts              # User entity (all roles)
│   ├── Load.ts              # Transport load entity
│   ├── OtpToken.ts          # OTP verification tokens
│   └── Notification.ts      # In-app notifications
├── middlewares/
│   ├── auth.middleware.ts   # JWT authenticate + role authorize
│   ├── validate.middleware.ts
│   └── error.middleware.ts
├── controllers/             # Route handlers
├── services/                # Business logic layer
├── routes/                  # Express routers
├── utils/
│   ├── jwt.ts               # Token generation/verification
│   ├── otp.ts               # OTP generation + mock SMS
│   └── response.ts          # Standardized API responses
├── types/
│   └── index.ts             # Enums + shared interfaces
└── index.ts                 # App entry point
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env` with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_NAME=tlms_db
JWT_SECRET=your_secret_key
```

### 3. Create MySQL database
```sql
CREATE DATABASE tlms_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Run in development
```bash
npm run dev
```
TypeORM `synchronize: true` auto-creates all tables on first run.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🔐 Authentication Flow

```
1. POST /api/auth/request-otp  →  Send mobile number
                                   OTP logged to console (mock)
2. POST /api/auth/verify-otp   →  Send mobile + OTP
                                   Receive JWT token
3. Use JWT in all protected routes:
   Authorization: Bearer <token>
```

---

## 👥 User Roles

| Role | Value | Description |
|------|-------|-------------|
| Super Admin | `super_admin` | Full platform control |
| Seller | `seller` | Posts and manages own loads |
| Transporter | `transporter` | Browses and accepts loads |

---

## 📡 API Endpoints

### Auth
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/auth/request-otp` | Public | Request OTP |
| POST | `/api/auth/verify-otp` | Public | Verify OTP → get JWT |
| GET | `/api/auth/profile` | All | Get own profile |
| PATCH | `/api/auth/profile` | All | Update name |

### Loads
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/api/loads` | Seller | Create new load |
| GET | `/api/loads/my` | Seller | Own loads |
| PATCH | `/api/loads/:id/complete` | Seller / Admin | Mark completed |
| GET | `/api/loads/available` | Transporter | Browse available loads |
| GET | `/api/loads/assigned` | Transporter | Accepted loads |
| PATCH | `/api/loads/:id/accept` | Transporter | Accept a load |
| GET | `/api/loads` | Admin | All loads |
| PUT | `/api/loads/:id` | Admin | Edit any load |
| DELETE | `/api/loads/:id` | Admin | Delete load |
| GET | `/api/loads/:id` | All | Load detail |

### Notifications
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/notifications` | All | Get own notifications |
| PATCH | `/api/notifications/:id/read` | All | Mark one read |
| PATCH | `/api/notifications/read-all` | All | Mark all read |

### Admin
| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/api/admin/stats` | Admin | System stats |
| GET | `/api/admin/users` | Admin | All users |
| GET | `/api/admin/users/:id` | Admin | Single user |
| PATCH | `/api/admin/users/:id/role` | Admin | Change role |
| PATCH | `/api/admin/users/:id/toggle-status` | Admin | Activate/deactivate |
| DELETE | `/api/admin/users/:id` | Admin | Delete user |

---

## 📦 Load Status Flow

```
AVAILABLE  →  ACCEPTED  →  COMPLETED
  (Seller)    (Transporter)  (Seller/Admin)
```

---

## 🔔 Notification Triggers

| Event | Who gets notified |
|-------|-------------------|
| Transporter accepts a load | Seller |
| Load marked as completed | Transporter |

---

## 🧪 Quick Test (curl)

```bash
# 1. Request OTP
curl -X POST http://localhost:3000/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "role": "seller"}'

# 2. Verify OTP (check console for the OTP code)
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9876543210", "otp": "123456"}'

# 3. Create a load (use token from step 2)
curl -X POST http://localhost:3000/api/loads \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Mumbai",
    "destination": "Delhi",
    "materialDescription": "Electronic goods",
    "weight": 500,
    "price": 15000,
    "pickupDate": "2025-02-01"
  }'
```

---

## 🏭 Production Notes

- Replace mock OTP in `src/utils/otp.ts` with Twilio / MSG91 / AWS SNS
- Set `synchronize: false` and use migrations in production
- Use a strong `JWT_SECRET` (32+ random chars)
- Add rate limiting with `express-rate-limit`
- Enable HTTPS via reverse proxy (nginx)
