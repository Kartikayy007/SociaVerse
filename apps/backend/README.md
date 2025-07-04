# SociaVerse Backend

Backend API for the SociaVerse virtual world platform, built with Express.js, Prisma, PostgreSQL, and Socket.IO.

## Features

- **RESTful API** for space management, user authentication, and data operations
- **Real-time functionality** with Socket.IO for live position updates, chat, and interactions
- **Database management** with Prisma ORM and PostgreSQL
- **Authentication integration** with Supabase
- **Spatial data handling** for virtual world navigation
- **Permission system** for space access control

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase project (for authentication)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Update `.env` with your configuration:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/sociaverse"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET="your-jwt-secret-here"

# CORS
FRONTEND_URL="http://localhost:3000"
```

3. Set up the database:
```bash
# Push the schema to your database
npm run db:push

# Generate Prisma client
npx prisma generate
```

4. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /sync-user` - Sync user data with database
- `POST /webhook` - Handle Supabase auth webhooks
- `GET /profile` - Get user profile

### Space Routes (`/api/spaces`)

- `GET /` - List spaces with filtering and pagination
- `GET /:identifier` - Get space by ID or slug
- `POST /` - Create new space
- `PUT /:id` - Update space
- `DELETE /:id` - Delete space
- `POST /:id/join` - Join a space
- `POST /:id/leave` - Leave a space
- `PUT /:id/position` - Update user position in space

### User Routes (`/api/users`)

- `GET /spaces` - Get user's spaces
- `GET /history` - Get user's space history
- `GET /favorites` - Get favorite spaces
- `POST /favorites/:spaceId` - Add space to favorites
- `DELETE /favorites/:spaceId` - Remove from favorites
- `GET /stats` - Get user statistics

## Socket.IO Events

### Client to Server

- `join-space` - Join a virtual space
- `update-position` - Update user position
- `send-message` - Send chat message
- `interact-object` - Interact with space objects
- `use-portal` - Use portal to travel between spaces

### Server to Client

- `space-joined` - Confirmation of joining space
- `user-joined` - Another user joined the space
- `user-left` - User left the space
- `position-updated` - User position updated
- `message-received` - New chat message
- `message-sent` - Message send confirmation
- `object-interacted` - Object interaction event
- `portal-traversed` - Portal usage result
- `error` - Error messages

## Database Schema

The database uses the following main models:

- **User** - User accounts synced with Supabase
- **Space** - Virtual worlds/maps
- **UserPosition** - Real-time user positions in spaces
- **SpaceObject** - Interactive objects within spaces
- **SpacePortal** - Connections between spaces
- **SpacePermission** - Access control for spaces
- **SpaceInvitation** - Invite system for private spaces
- **UserSpaceHistory** - User visit history and favorites
- **SpaceChatMessage** - Chat messages within spaces

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push      # Push schema changes
npm run db:studio    # Open Prisma Studio

# Generate Prisma client
npx prisma generate
```

## Environment Configuration

### Database Setup

1. Create a PostgreSQL database
2. Update `DATABASE_URL` in `.env`
3. Run `npm run db:push` to create tables

### Supabase Integration

1. Create a Supabase project
2. Copy the project URL and service role key
3. Update environment variables
4. Set up authentication in your frontend

## Real-time Features

The backend supports real-time interactions through Socket.IO:

- **Live user positions** - See other users moving in real-time
- **Instant chat** - Send and receive messages immediately
- **Object interactions** - Real-time object state changes
- **Portal travel** - Seamless movement between spaces
- **Presence awareness** - Know who's online in each space

## Security Features

- **JWT token validation** through Supabase
- **Rate limiting** to prevent abuse
- **CORS protection** for cross-origin requests
- **Input validation** with Zod schemas
- **Permission-based access** control for spaces
- **Password protection** for private spaces

## Production Deployment

1. Set up PostgreSQL database
2. Configure environment variables
3. Build the application: `npm run build`
4. Start with: `npm start`
5. Set up reverse proxy (nginx) for production
6. Configure SSL certificates
7. Set up monitoring and logging
