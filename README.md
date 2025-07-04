# **SociaVerse (Collaborative Virtual Space Application)**

## **🚀 Project Status**

**Current Version**: Development Phase
**Last Updated**: July 3, 2025

### ✅ **Completed**
- **Backend Infrastructure**: Express.js server with TypeScript, Supabase auth, Prisma ORM
- **Database Schema**: Complete spatial/gaming models (Users, Spaces, Positions, Objects, etc.)
- **Authentication**: Supabase integration with JWT middleware
- **API Routes**: Comprehensive REST endpoints for spaces, auth, and users
- **Real-time**: Socket.IO setup for multiplayer functionality
- **Frontend Setup**: Next.js 15 with shadcn/ui components and Supabase auth
- **Security**: Helmet, CORS, rate limiting, and validation with Zod

### 🔄 **In Progress**
- Database connection and migrations
- Frontend-backend integration
- Real-time position updates testing

### 📋 **Next Steps**
1. **Setup**: Follow `SUPABASE_SETUP.md` for credentials
2. **Database**: Run Prisma migrations
3. **Integration**: Connect frontend to backend APIs
4. **Testing**: Validate real-time functionality

---

**Overview**

This project aims to create a collaborative virtual space platform inspired by interactive 2D environments like Gather. Users can create, customise, and interact in virtual spaces with features including video calling, live chat, and an integrated whiteboard.

**Core Features**

## **1. Authentication & Authorisation**

**Description**

JWT-based authorisation system that ensures secure user authentication and controlled access to application features.

**Key Features**

•	User registration with email/password

•	Login and logout functionality

•	Persistent sessions with refresh tokens

## **2. Creating, Deleting, and Customising Spaces**

**Description**

Users can create virtual spaces, customise their appearance, and manage members.

**Key Features**

•	Create and delete spaces

•	Customise space with themes, icons, and layouts

•	Manage members (add, invite, or remove users)

•	Assign roles within the space (e.g., moderator)

•	Space privacy options: Public, Private, or Invite-only

## **3. Video Calling and Live Chats**

**Description**

Real-time communication features enabling users to interact through video calls and text chat within the same space.

**Key Features**

•	**Video Calling**: Peer-to-peer or group video calls using WebRTC

•	**Live Chat**: Persistent chat integrated into each space

•	**Presence Indicators**: Show which members are online in the space

•	**Typing Indicators**: Display when a user is typing in the chat

•	**Notifications**: Notify users when someone joins, leaves, or sends a message

•	**Message Reactions**: Users can react to messages with emojis

## **4. Integrated Whiteboard**

**Description**

An interactive whiteboard for collaborative brainstorming, drawing, and note-taking.

**Key Features**

•	Freehand drawing tools with colour and thickness options

•	Adding shapes, text, and images

•	Real-time updates: Multiple users can collaborate simultaneously

•	Save and export whiteboard content as an image or PDF

•	Layer management for complex whiteboards (e.g., move/lock elements)

•	Templates for common tasks (e.g., mind maps, workflows)

**Additional Features to Implement**

## **5. Spatial Audio**

**Description**

Spatial audio system that adjusts sound based on users' virtual proximity to enhance immersion.

**Key Features**

•	Volume based on distance

•	Directional audio (left or right based on position in space)

•	Mute and unmute options for individuals

## **6. Interactive Avatars**

**Description**

Customisable avatars for user representation in the virtual space.

**Key Features**

•	Choose from a given set of Preset of avatars

•	Ability to move avatars around the space

•	Interaction triggers (e.g., tap a user to send a message)

## **7. File Sharing**

**Description**

Simple file sharing system for collaboration in chats and spaces.

**Key Features**

•	Drag-and-drop file upload

•	File preview for common formats (e.g., PDFs, images)

•	Download files directly from the chat or space

## **8. Task Management**

**Description**

Built-in task management system for space collaboration.

**Key Features**

•	Create and assign tasks to users in the space

•	Track task progress with deadlines and completion status

•	Integrate with the whiteboard for visual task management

## **9. Polls and Voting**

**Description**

Real-time polling system for group decision-making.

**Key Features**

•	Create polls within the chat or space

•	Track live results

•	Anonymous or public voting options

## **10. Moderation Tools**

**Description**

Administrative tools for effective space management.

**Key Features**

•	Mute or kick disruptive users

•	Restrict chat or video access for specific users

•	Audit logs for tracking activity in the space

## **11. Gamification**

**Description**

Engagement features to encourage active participation.

**Key Features**

•	Achievements for specific actions (e.g., creating 10 spaces, participating in 5 video calls)

•	Leaderboards for active users

•	Virtual currency or points for engagement

## **12. Integrations with Third-Party Tools**

**Description**

Integration with popular productivity tools.

**Key Features**

•	Google Calendar: Schedule events and meetings in spaces

•	Google Drive/Dropbox: Import and share documents

•	Slack/Discord: Send updates to external channels

## **Future Enhancements**

•	**AI-powered features**:

•	Real-time transcription for video calls

- Screen sharing capabilities for presentations and collaboration
- Global accessibility through multiple language support
- **Mobile Support**