import express from 'express'
import { RtcTokenBuilder, RtcRole } from 'agora-token'
import { authMiddleware } from '../middleware/auth'
import { z } from 'zod'

const router = express.Router()

// Validation schema for token generation
const generateTokenSchema = z.object({
  channelName: z.string().min(1, 'Channel name is required'),
  uid: z.number().int().min(0, 'UID must be a non-negative integer').optional(),
  role: z.enum(['publisher', 'subscriber']).default('publisher')
})

// Generate Agora RTC token
router.post('/token', authMiddleware, async (req, res) => {
  try {
    // Validate request body
    const result = generateTokenSchema.safeParse(req.body)
    if (!result.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: result.error.errors
      })
    }

    const { channelName, uid = 0, role } = result.data

    // Check if Agora credentials are configured
    const appId = process.env.AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_CERTIFICATE

    if (!appId || !appCertificate) {
      return res.status(500).json({
        error: 'Agora credentials not configured',
        message: 'Please set AGORA_APP_ID and AGORA_APP_CERTIFICATE in environment variables'
      })
    }

    // Determine role
    const agoraRole = role === 'publisher' ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER

    // Token expiry time (24 hours from now)
    const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + (24 * 3600)

    // Generate token
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      agoraRole,
      expirationTimeInSeconds,
      expirationTimeInSeconds // privilegeExpire - same as token expiry
    )

    res.json({
      success: true,
      token,
      appId,
      channelName,
      uid,
      role,
      expiresAt: new Date(expirationTimeInSeconds * 1000).toISOString()
    })

  } catch (error) {
    console.error('Error generating Agora token:', error)
    res.status(500).json({
      error: 'Failed to generate token',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
})

// Get Agora app configuration (just the app ID, not the certificate)
router.get('/config', authMiddleware, (req, res) => {
  const appId = process.env.AGORA_APP_ID

  if (!appId) {
    return res.status(500).json({
      error: 'Agora not configured',
      message: 'AGORA_APP_ID not set'
    })
  }

  res.json({
    success: true,
    appId
  })
})

export default router
