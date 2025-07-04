# SociaVerse - Virtual World Platform

## 🌟 Overview

SociaVerse is a collaborative virtual world platform that allows users to create, explore, and interact in 2D virtual spaces similar to games like Gather or Pokémon. Users can navigate through interconnected worlds, chat with others, interact with objects, and build their own virtual environments.

## 🏗️ Architecture

### Frontend (Next.js 15 + TypeScript)
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **Authentication**: Supabase Auth with OAuth (Google) support
- **State Management**: React Context for authentication
- **Real-time**: Socket.IO client for live interactions

### Backend (Express.js + TypeScript)
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase integration
- **Real-time**: Socket.IO for live position updates and chat
- **Security**: Helmet, CORS, rate limiting
- **Validation**: Zod schemas for type-safe APIs

## 🎮 Core Features

### 1. Virtual Spaces (Maps/Worlds)
- **Create custom spaces** with different themes (medieval, modern, futuristic, nature)
- **World types**: Indoor, outdoor, dungeon, city, forest
- **Customizable dimensions** and grid-based movement
- **Background images and tilesets** for visual customization
- **Ambient sounds and music** for immersive experience
- **Public/private spaces** with password protection
- **User capacity limits** (max users per space)

### 2. Real-time User Movement
- **2D coordinate system** (x, y, z) for positioning
- **Live position updates** via Socket.IO
- **Avatar states**: idle, walking, running, sitting
- **Direction tracking** for avatar orientation
- **Collision detection** with solid objects
- **Smooth movement** with velocity tracking

### 3. Interactive Objects
- **Object types**: Furniture, portals, NPCs, collectibles, decorations
- **Interactive elements** with click/touch/collision triggers
- **Custom properties** and animation data
- **Solid objects** that block movement
- **User-created content** with permission system

### 4. Portal System
- **Seamless travel** between different spaces
- **Portal types**: Doors, teleporters, stairs
- **Bidirectional connections** between worlds
- **Permission-based access** control
- **Custom animations** and visual effects

### 5. Social Features
- **Real-time chat** with proximity-based messaging
- **User presence** awareness (see who's online)
- **Space invitations** with unique codes
- **Permission system**: Owner, Admin, Moderator, Builder, Visitor
- **User history** and favorite spaces
- **Activity tracking** and statistics

### 6. Space Management
- **Space creation wizard** with templates
- **Permission management** for collaborative building
- **Space discovery** with search and filtering
- **Featured spaces** and recommendations
- **Analytics**: Visit counts, user engagement
- **Content moderation** tools

## 🛠️ Technical Implementation

### Database Schema
The platform uses a comprehensive PostgreSQL schema with the following key models:

- **Spaces**: Virtual world definitions with properties and settings
- **UserPositions**: Real-time user locations and states
- **SpaceObjects**: Interactive elements within spaces
- **SpacePortals**: Connections between different spaces
- **SpacePermissions**: Access control and role management
- **SpaceInvitations**: Invite system for private spaces
- **UserSpaceHistory**: Visit tracking and favorites
- **SpaceChatMessages**: In-space communication

### API Endpoints

#### Authentication (`/api/auth`)
- User synchronization with Supabase
- Profile management
- Webhook handling for auth events

#### Spaces (`/api/spaces`)
- CRUD operations for virtual spaces
- Join/leave space functionality
- Position updates and tracking
- Object and portal management

#### Users (`/api/users`)
- User space management
- History and favorites
- Statistics and analytics

### Real-time Events (Socket.IO)
- **join-space**: Enter a virtual space
- **update-position**: Live movement updates
- **send-message**: Chat communication
- **interact-object**: Object interactions
- **use-portal**: Portal traversal

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Supabase account

### Quick Start

1. **Clone and install dependencies**:
```bash
git clone <repository>
cd SociaVerse
npm install
```

2. **Set up environment variables**:

Frontend (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Backend (`.env`):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/sociaverse
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3001
FRONTEND_URL=http://localhost:3000
```

3. **Set up the database**:
```bash
cd apps/backend
npx prisma db push
npx prisma generate
```

4. **Start development servers**:
```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend  
cd apps/frontend
npm run dev
```

5. **Access the application**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/api/health

## 🎯 Use Cases

### 1. Virtual Offices
- Create office spaces for remote teams
- Meeting rooms and collaboration areas
- Private workspaces and common areas

### 2. Educational Environments
- Virtual classrooms and lecture halls
- Interactive learning spaces
- Student collaboration areas

### 3. Social Gatherings
- Virtual events and conferences
- Social spaces for communities
- Gaming and entertainment areas

### 4. Creative Collaboration
- Design studios and galleries
- Brainstorming and workshop spaces
- Art exhibitions and showcases

## 🔮 Future Enhancements

### Planned Features
- **3D world support** with Three.js integration
- **Voice chat** with spatial audio
- **Screen sharing** and presentation tools
- **Whiteboard integration** for collaboration
- **File sharing** and document management
- **Mobile app** for iOS and Android
- **VR/AR support** for immersive experiences
- **AI-powered NPCs** and chatbots
- **Blockchain integration** for virtual assets
- **Plugin system** for extensibility

### Technical Improvements
- **WebRTC** for peer-to-peer communication
- **Redis** for session management and caching
- **CDN integration** for asset delivery
- **Kubernetes** deployment for scalability
- **Monitoring** and analytics dashboard
- **Performance optimization** and caching
- **Security enhancements** and auditing

## 📝 Development Status

### ✅ Completed
- Basic authentication with Supabase
- Database schema and models
- RESTful API endpoints
- Real-time Socket.IO integration
- Frontend components and routing
- Space creation and management
- User position tracking
- Basic chat functionality

### 🚧 In Progress
- Database connection and migrations
- Complete Socket.IO event handlers
- Frontend space visualization
- Object interaction system
- Portal traversal mechanics

### 📋 Todo
- Complete frontend integration
- Chat system implementation
- Permission management UI
- Space discovery and search
- Mobile responsiveness
- Production deployment setup
- Testing and documentation

## 🤝 Contributing

This is a modern, scalable platform built with the latest web technologies. The codebase is designed to be maintainable and extensible, with clear separation of concerns and comprehensive type safety.

The platform is ready for further development and can be extended with additional features like 3D rendering, voice chat, and advanced collaboration tools to create a complete virtual world experience.
