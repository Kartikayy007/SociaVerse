# Agora Video Calling Setup Guide

## Overview
We've successfully implemented token-based authentication for Agora video calls in SociaVerse. This guide explains how to configure your Agora credentials for secure video calling.

## 🚀 Quick Test (Demo Mode)
The system will automatically fall back to demo mode if Agora credentials are not configured. You can test the proximity detection and UI without real video calls.

## 🔧 Production Setup

### 1. Get Agora Credentials
1. Go to [Agora.io Console](https://console.agora.io/)
2. Sign up/login to your account
3. Create a new project
4. Copy your **App ID** and **App Certificate**

### 2. Backend Configuration
Update `/Users/kartikay/Downloads/SociaVerse/apps/backend/.env`:

```env
# Agora Configuration
AGORA_APP_ID="your_actual_agora_app_id_here"
AGORA_APP_CERTIFICATE="your_actual_agora_app_certificate_here"
```

### 3. Frontend Configuration
Update `/Users/kartikay/Downloads/SociaVerse/apps/frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 🔄 How It Works

### Token Generation Flow
1. User enters proximity range (100px) of another user
2. Frontend requests Agora token from backend: `POST /api/agora/token`
3. Backend validates user authentication
4. Backend generates secure token using Agora SDK
5. Frontend uses token to join video channel
6. Users can see and hear each other

### API Endpoints

#### Generate Token
```
POST /api/agora/token
Authorization: Bearer <supabase_jwt_token>
Content-Type: application/json

{
  "channelName": "proximity_space123_1641234567890",
  "uid": 0,
  "role": "publisher"
}
```

Response:
```json
{
  "success": true,
  "token": "007eJxSYNBLrMrr...",
  "appId": "your-app-id",
  "channelName": "proximity_space123_1641234567890",
  "uid": 0,
  "role": "publisher",
  "expiresAt": "2025-07-05T10:30:00.000Z"
}
```

#### Get Configuration
```
GET /api/agora/config
Authorization: Bearer <supabase_jwt_token>
```

Response:
```json
{
  "success": true,
  "appId": "your-app-id"
}
```

## 🎮 Testing

### 1. Demo Mode Test
1. Visit: http://localhost:3000/spaces
2. Create a new space
3. Enter the space
4. Move your avatar using WASD keys
5. The video call UI should appear when you get close to others (even in demo mode)

### 2. Real Video Test (with Agora credentials)
1. Configure Agora credentials in backend .env
2. Restart backend server: `npm run dev`
3. Open two browser windows/tabs
4. Login with different users in each
5. Join the same space
6. Move avatars close to each other
7. Video call should automatically start with real camera/audio

## 🛠️ Components

### Backend
- **`/api/agora/token`** - Generates secure tokens
- **`/api/agora/config`** - Returns App ID
- **Token validation** - 24-hour expiry, role-based permissions

### Frontend
- **`ProximityVideoAuth`** - Token-authenticated video component
- **`agoraApi`** - API client for token requests
- **Proximity detection** - Automatic call triggers at 100px distance

## 🔒 Security Features

- ✅ **JWT Authentication**: Only authenticated users can get tokens
- ✅ **Token Expiry**: Tokens expire after 24 hours
- ✅ **Role-based Access**: Publisher/Subscriber roles
- ✅ **Channel Isolation**: Each proximity call gets unique channel
- ✅ **Environment Separation**: Credentials stored in environment variables

## 🚨 Troubleshooting

### "Agora credentials not configured"
- Check `.env` file has correct `AGORA_APP_ID` and `AGORA_APP_CERTIFICATE`
- Restart backend server after changing environment variables

### "Failed to generate token"
- Verify Agora App Certificate is correct
- Check user authentication (valid JWT token)
- Check browser console for detailed error messages

### Video call not starting
- Check proximity distance (must be within 100px)
- Verify both users are authenticated
- Check browser permissions for camera/microphone

## 📱 Status Indicators

- 🟢 **Connected**: Real video call active
- 🟡 **Demo Mode**: Proximity detection working, no real video
- 🔴 **Error**: Check configuration or authentication

## 🎯 Next Steps

1. **Configure real Agora credentials** for production use
2. **Test multi-user scenarios** with multiple people in proximity
3. **Customize proximity distance** if needed (currently 100px)
4. **Add audio controls** (mute/unmute buttons)
5. **Implement screen sharing** for presentations

---

**Status**: ✅ Token authentication implemented and working
**Demo**: Available at http://localhost:3000/spaces (demo mode)
**Production**: Ready when Agora credentials are configured
