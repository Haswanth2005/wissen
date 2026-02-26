# 🏢 Wissen Seat Booking System

> **Smart, efficient seat reservation system for modern workspaces** - Intelligent workspace management for global distributed teams at Wissen Technology.

[![Next.js](https://img.shields.io/badge/Next.js-15.2-black?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://www.prisma.io)

---

## ✨ Features

- 🎯 **Intelligent Seat Booking** - Smart allocation with batch-based scheduling
- 📅 **Calendar-based Selection** - Intuitive date picker with 14-day advance booking window
- 👥 **Batch Management** - Organize teams into Batch A & Batch B with designated seat allocation
- 🔓 **Floating Seats** - Flexible seating unlocked daily at 3 PM for non-batch days
- 📊 **Real-time Dashboard** - Track bookings, occupancy, and workspace analytics
- 🔐 **Role-based Access** - Admin and employee roles with permission management
- 🌙 **Dark Mode** - Beautiful, modern dark theme UI with smooth animations
- ⚡ **Real-time Updates** - Live seat availability and booking status

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Next.js Frontend (TypeScript)          │
│  ┌─────────────┐ ┌──────────────┐ ┌─────────────────────┐  │
│  │  Dashboard  │ │  Book Seats  │ │  Admin Controls     │  │
│  └─────────────┘ └──────────────┘ └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                REST API Routes (Next.js API)                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐  │
│  │  Auth    │ │ Bookings │ │  Seats   │ │ Admin Users  │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Prisma ORM + Database Layer                   │
│  Users | Bookings | Seats | Admin Logs                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite or PostgreSQL

### Installation

1. **Clone the repository**

```bash
git clone <repository>
cd has
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env.local
```

Add your database connection string to `.env.local`

4. **Initialize the database**

```bash
npx prisma db push
npx prisma db seed
```

5. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

---

## 📋 Project Structure

```
has/
├── app/
│   ├── page.tsx              # Home/Landing page
│   ├── landing.tsx           # Landing page content
│   ├── login/                # Authentication
│   ├── dashboard/            # Main dashboard & features
│   │   ├── book/            # Seat booking interface
│   │   ├── bookings/        # View bookings
│   │   └── admin/           # Admin controls
│   └── api/                  # REST API endpoints
│       ├── auth/            # Login/Register
│       ├── bookings/        # Booking operations
│       ├── seats/           # Seat availability
│       └── admin/           # Admin endpoints
├── components/
│   ├── Calendar.tsx         # Date selection calendar
│   ├── Sidebar.tsx          # Navigation sidebar
│   └── ui/                  # Reusable UI components
├── context/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   ├── auth.ts             # Auth utilities
│   ├── scheduling.ts       # Booking logic
│   └── utils.ts            # Helper functions
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Demo data seeding
└── public/
    └── assets/             # Images and logos
```

---

## 🎮 Usage

### For Employees

1. **Login** with your credentials
2. **View Dashboard** - Check today's seat status and upcoming bookings
3. **Book a Seat** - Select date from calendar and choose available seat
4. **Manage Bookings** - View, modify, or cancel your reservations

### For Admins

1. **User Management** - Add/remove employees and manage roles
2. **Seat Configuration** - Set up designated and floating seats
3. **Analytics** - View occupancy reports and usage patterns
4. **Settings** - Configure batch schedules and unlock times

---

## 🔐 Booking Rules

| Rule               | Details                                                 |
| ------------------ | ------------------------------------------------------- |
| **Advance Window** | Book up to 14 days in advance                           |
| **Batch Days**     | Batch A & B have designated seat days (alternate weeks) |
| **Floating Seats** | Available only on non-batch days, unlocked at 3 PM      |
| **Weekends**       | Closed - no seat bookings available                     |
| **Cancellation**   | Can cancel anytime before the booking date              |

---

## 📦 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Custom CSS
- **Database**: Prisma ORM, SQLite/PostgreSQL
- **Authentication**: JWT, bcryptjs
- **API**: RESTful routes with Next.js API handlers
- **Animations**: Framer Motion, Tailwind animations
- **Icons**: Lucide React

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/login         # Login user
POST   /api/auth/register      # Register new user
POST   /api/auth/logout        # Logout user
```

### Bookings

```
GET    /api/bookings           # Get user bookings
GET    /api/bookings?upcoming  # Get upcoming bookings
POST   /api/bookings           # Create booking
POST   /api/bookings/:id/cancel # Cancel booking
```

### Seats

```
GET    /api/seats?date=YYYY-MM-DD  # Get available seats for date
```

### Admin

```
GET    /api/admin/users        # List all users
GET    /api/admin/config       # Get system configuration
POST   /api/admin/users        # Manage users
```

---

## 🧪 Local Development

### Running with hot reload

```bash
npm run dev
```

### Building for production

```bash
npm run build
npm start
```

### Database commands

```bash
npx prisma studio          # Open Prisma Studio GUI
npx prisma migrate dev     # Create new migration
npx prisma db seed         # Seed demo data
```

---

## 📊 Dashboard Views

### Main Dashboard

- **Today's Status** - Current seat booking status
- **Quick Info** - Batch info, unlock times, advance window
- **Upcoming Bookings** - Next 5 scheduled bookings

### Seat Booking

- **Calendar** - Interactive date selector (left sidebar)
- **Designated Seats** - D01-D40 grid (batch-specific)
- **Floating Seats** - F01-F10 grid (time-based availability)
- **Legend** - Color-coded seat status

### My Bookings

- **Active Bookings** - Current and upcoming reservations
- **Booking Details** - Seat number, date, type
- **Quick Actions** - Cancel or modify bookings

---

## 👤 Demo Credentials

| Role               | Email              | Password   |
| ------------------ | ------------------ | ---------- |
| Admin              | `admin@wissen.com` | `admin123` |
| Employee (Batch A) | `alice@wissen.com` | `emp123`   |

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Deploy to Railway/Render

1. Push code to GitHub
2. Connect repository to platform
3. Set environment variables
4. Deploy

---

## 📝 Environment Variables

```env
# Database
DATABASE_URL=file:./dev.db

# JWT
JWT_SECRET=your-secret-key-here

# App
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is proprietary software of Wissen Technology. All rights reserved.

---

## 📞 Support

For issues, questions, or feedback:

- 📧 Email: support@wissen.com
- 💬 Slack: #seat-booking-support
- 🐛 Report bugs: [GitHub Issues](https://github.com/wissen/seat-booking/issues)

---

**Built with ❤️ by Wissen Technology**
