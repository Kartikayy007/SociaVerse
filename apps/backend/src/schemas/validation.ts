import { z } from 'zod';

// Space creation/update schemas
export const createSpaceSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(true),
  password: z.string().optional()
});

export const updateSpaceSchema = createSpaceSchema.partial();

// Position update schema
export const updatePositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  velocityX: z.number().optional(),
  velocityY: z.number().optional(),
  direction: z.number().min(0).max(360).optional(),
  avatarState: z.enum(['idle', 'walking', 'running', 'sitting']).optional()
});

// Space object schemas
export const createSpaceObjectSchema = z.object({
  name: z.string().min(1).max(100),
  objectType: z.enum(['furniture', 'portal', 'npc', 'collectible', 'decoration']),
  x: z.number(),
  y: z.number(),
  z: z.number().optional(),
  width: z.number().int().min(1).max(500).default(32),
  height: z.number().int().min(1).max(500).default(32),
  spriteUrl: z.string().url().optional(),
  animationData: z.record(z.any()).optional(),
  isInteractive: z.boolean().default(false),
  interactionType: z.enum(['click', 'touch', 'collision']).optional(),
  interactionData: z.record(z.any()).optional(),
  isSolid: z.boolean().default(false)
});

export const updateSpaceObjectSchema = createSpaceObjectSchema.partial();

// Chat message schema
export const sendMessageSchema = z.object({
  content: z.string().min(1).max(1000),
  messageType: z.enum(['text', 'emote']).default('text'),
  x: z.number().optional(),
  y: z.number().optional(),
  isProximityBased: z.boolean().default(false)
});

// Space invitation schema
export const createInvitationSchema = z.object({
  email: z.string().email().optional(),
  maxUses: z.number().int().min(1).max(100).default(1),
  expiresAt: z.string().datetime().optional()
});

// Permission schemas
export const grantPermissionSchema = z.object({
  userId: z.string().uuid(),
  permissionType: z.enum(['ADMIN', 'MODERATOR', 'BUILDER', 'VISITOR']),
  expiresAt: z.string().datetime().optional()
});

// Query schemas
export const spaceQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  search: z.string().optional(),
  isPublic: z.string().transform(val => val === 'true').optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalVisits', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type CreateSpaceInput = z.infer<typeof createSpaceSchema>;
export type UpdateSpaceInput = z.infer<typeof updateSpaceSchema>;
export type UpdatePositionInput = z.infer<typeof updatePositionSchema>;
export type CreateSpaceObjectInput = z.infer<typeof createSpaceObjectSchema>;
export type UpdateSpaceObjectInput = z.infer<typeof updateSpaceObjectSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;
export type GrantPermissionInput = z.infer<typeof grantPermissionSchema>;
export type SpaceQueryInput = z.infer<typeof spaceQuerySchema>;
