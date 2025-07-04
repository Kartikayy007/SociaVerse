# SociaVerse Development Setup

Quick setup guide for developers getting started with SociaVerse.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Supabase account

## Quick Start

### 1. Clone and Install Dependencies

```bash
cd /Users/kartikay/Downloads/SociaVerse
npm install
```

### 2. Backend Setup

```bash
cd apps/backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials (see SUPABASE_SETUP.md)

# Generate Prisma client
npx prisma generate

# Run database migrations (when DB is ready)
npx prisma migrate dev --name init

# Start backend server
npm run dev
```

Backend will run on: http://localhost:3001

### 3. Frontend Setup

```bash
cd apps/frontend

# Install dependencies  
npm install

# Configure environment variables
cp .env.local.example .env.local
# Add your Supabase credentials

# Start frontend server
npm run dev
```

Frontend will run on: http://localhost:3000

## Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/sociaverseDB"
PORT=3001
NODE_ENV=development

SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
JWT_SECRET="your-jwt-secret"

FRONTEND_URL="http://localhost:3000"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

## Key Files

- `apps/backend/src/index.ts` - Main backend server
- `apps/backend/prisma/schema.prisma` - Database schema
- `apps/frontend/src/app/page.tsx` - Frontend home page
- `apps/frontend/src/contexts/AuthContext.tsx` - Authentication context

## Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npx prisma studio` - Open database GUI
- `npx prisma migrate dev` - Run database migrations

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Database Schema Overview

- **Users**: Authentication and user profiles
- **Spaces**: Virtual worlds/rooms with themes and settings
- **UserPositions**: Real-time user locations in spaces
- **SpaceObjects**: Interactive elements in spaces
- **SpacePermissions**: Role-based access control
- **SpaceInvitations**: Invite system for private spaces
- **SpaceChatMessages**: In-space messaging
- **UserSpaceHistory**: Track user space visits

## API Endpoints

### Authentication
- `POST /api/auth/verify` - Verify user token
- `GET /api/auth/user` - Get current user

### Spaces
- `GET /api/spaces` - List spaces with filtering
- `POST /api/spaces` - Create new space
- `GET /api/spaces/:id` - Get space details
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space
- `PUT /api/spaces/:id/position` - Update user position

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

## Real-time Events (Socket.IO)

- `join_space` - Join a space
- `leave_space` - Leave a space
- `position_update` - Update user position
- `chat_message` - Send chat message
- `object_interaction` - Interact with space objects

## Troubleshooting

### Backend Issues
- **Port in use**: Kill processes with `lsof -ti:3001 | xargs kill -9`
- **Database connection**: Verify DATABASE_URL and ensure PostgreSQL is running
- **Supabase auth**: Check SUPABASE_SERVICE_ROLE_KEY and JWT_SECRET

### Frontend Issues
- **Auth errors**: Verify Supabase credentials in .env.local
- **API connection**: Ensure backend is running on port 3001
- **Build errors**: Clear `.next` folder and rebuild

## Resources

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Project Changelog](./CHANGELOG.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Socket.IO Documentation](https://socket.io/docs)
