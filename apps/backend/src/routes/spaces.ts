import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  createSpaceSchema,
  updateSpaceSchema,
  spaceQuerySchema,
  updatePositionSchema
} from '../schemas/validation';
import { nanoid } from 'nanoid';
import bcrypt from 'bcryptjs';

const router = Router();

// Helper function to generate a unique slug from space name
async function generateUniqueSlug(name: string): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  let slug = baseSlug || 'space'; // Fallback if name produces empty slug
  let counter = 0;
  
  // Keep trying until we find a unique slug
  while (await prisma.space.findUnique({ where: { slug } })) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  
  return slug;
}

// Get all spaces with filtering and pagination
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    const query = spaceQuerySchema.parse(req.query);
    
    const where: any = {};
    
    // Apply filters
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }
    
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    
    // Only show public spaces or spaces the user has access to
    const userAccessWhere = req.user ? [
      { isPublic: true },
      { creatorId: req.user.id },
      { 
        permissions: { 
          some: { 
            userId: req.user.id,
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: new Date() } }
            ]
          } 
        }
      }
    ] : [{ isPublic: true }];

    if (!query.isPublic) {
      where.OR = userAccessWhere;
    }

    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where,
        include: {
          creator: { select: { id: true, email: true } },
          userPositions: {
            where: { isOnline: true },
            select: { id: true }
          }
        },
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit
      }),
      prisma.space.count({ where })
    ]);

    // Transform spaces to include currentUserCount
    const transformedSpaces = spaces.map(space => ({
      ...space,
      currentUserCount: space.userPositions.length,
      userPositions: space.userPositions.map(pos => ({
        id: pos.id,
        x: 0, // Default values since we only selected id
        y: 0,
        user: { id: '', email: '' }
      }))
    }));

    res.json({
      spaces: transformedSpaces,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit)
    });
  } catch (error) {
    console.error('Error fetching spaces:', error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

// Get a specific space by ID or slug
router.get('/:identifier', async (req: AuthenticatedRequest, res) => {
  try {
    const { identifier } = req.params;
    
    // Check if identifier is UUID or slug
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
    
    const space = await prisma.space.findUnique({
      where: isUuid ? { id: identifier } : { slug: identifier },
      include: {
        creator: { select: { id: true, email: true } },
        objects: true,
        userPositions: {
          where: { isOnline: true },
          include: { user: { select: { id: true, email: true } } }
        },
        permissions: {
          where: { userId: req.user!.id },
          take: 1
        }
      }
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Check if user has access to private space
    if (!space.isPublic && space.creatorId !== req.user!.id && space.permissions.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update total visits and last activity
    await prisma.space.update({
      where: { id: space.id },
      data: {
        totalVisits: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    res.json(space);
  } catch (error) {
    console.error('Error fetching space:', error);
    res.status(500).json({ error: 'Failed to fetch space' });
  }
});

// Create a new space
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    const data = createSpaceSchema.parse(req.body);
    
    // Generate unique slug from name
    const slug = await generateUniqueSlug(data.name);

    // Hash password if provided
    let passwordHash = undefined;
    if (data.password) {
      passwordHash = await bcrypt.hash(data.password, 10);
    }

    // Remove password from data before creating space
    const { password, ...spaceData } = data;

    // Create space with generated slug and default values
    const space = await prisma.space.create({
      data: {
        ...spaceData,
        slug,
        passwordHash,
        creatorId: req.user!.id,
        worldType: 'indoor', // Default value
        theme: 'modern', // Default value
        ambientSounds: []
      },
      include: {
        creator: { select: { id: true, email: true } }
      }
    });

    // Grant owner permission
    await prisma.spacePermission.create({
      data: {
        spaceId: space.id,
        userId: req.user!.id,
        permissionType: 'OWNER',
        grantedBy: req.user!.id
      }
    });

    res.status(201).json(space);
  } catch (error) {
    console.error('Error creating space:', error);
    res.status(500).json({ error: 'Failed to create space' });
  }
});

// Update a space
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const data = updateSpaceSchema.parse(req.body);

    // Check if user owns the space or has admin permission
    const space = await prisma.space.findUnique({
      where: { id },
      include: {
        permissions: {
          where: { 
            userId: req.user!.id,
            permissionType: { in: ['OWNER', 'ADMIN'] }
          }
        }
      }
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.creatorId !== req.user!.id && space.permissions.length === 0) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Generate new slug if name is being changed
    let updateData: any = { ...data };
    if (data.name && data.name !== space.name) {
      updateData.slug = await generateUniqueSlug(data.name);
    }

    // Hash password if provided
    let passwordHash = space.passwordHash;
    if (data.password !== undefined) {
      passwordHash = data.password ? await bcrypt.hash(data.password, 10) : null;
    }

    // Remove password from data before updating space
    const { password, ...spaceData } = updateData;

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        ...spaceData,
        passwordHash,
        updatedAt: new Date()
      },
      include: {
        creator: { select: { id: true, email: true } }
      }
    });

    res.json(updatedSpace);
  } catch (error) {
    console.error('Error updating space:', error);
    res.status(500).json({ error: 'Failed to update space' });
  }
});

// Delete a space
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const space = await prisma.space.findUnique({
      where: { id },
      select: { creatorId: true }
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    if (space.creatorId !== req.user!.id) {
      return res.status(403).json({ error: 'Only space owner can delete the space' });
    }

    await prisma.space.delete({ where: { id } });

    res.json({ message: 'Space deleted successfully' });
  } catch (error) {
    console.error('Error deleting space:', error);
    res.status(500).json({ error: 'Failed to delete space' });
  }
});

// Join a space (create/update user position)
router.post('/:id/join', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const space = await prisma.space.findUnique({
      where: { id },
      select: { 
        id: true, 
        isPublic: true, 
        passwordHash: true, 
        maxUsers: true,
        currentUserCount: true,
        creatorId: true,
        permissions: {
          where: { userId: req.user!.id }
        }
      }
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Check access permissions
    if (!space.isPublic && space.creatorId !== req.user!.id && space.permissions.length === 0) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check password if required
    if (space.passwordHash && (!password || !await bcrypt.compare(password, space.passwordHash))) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Check max users limit
    if (space.currentUserCount >= space.maxUsers) {
      return res.status(429).json({ error: 'Space is full' });
    }

    // Create or update user position
    const position = await prisma.userPosition.upsert({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      },
      update: {
        isOnline: true,
        joinedAt: new Date(),
        lastUpdate: new Date()
      },
      create: {
        userId: req.user!.id,
        spaceId: id,
        x: 0,
        y: 0
      },
      include: {
        user: { select: { id: true, email: true } }
      }
    });

    // Update space user count and last activity
    await prisma.space.update({
      where: { id },
      data: {
        currentUserCount: { increment: 1 },
        lastActivityAt: new Date()
      }
    });

    // Update user history
    await prisma.userSpaceHistory.upsert({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      },
      update: {
        lastVisitedAt: new Date(),
        totalVisits: { increment: 1 }
      },
      create: {
        userId: req.user!.id,
        spaceId: id
      }
    });

    res.json(position);
  } catch (error) {
    console.error('Error joining space:', error);
    res.status(500).json({ error: 'Failed to join space' });
  }
});

// Leave a space
router.post('/:id/leave', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const position = await prisma.userPosition.findUnique({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      }
    });

    if (!position) {
      return res.status(404).json({ error: 'Not in this space' });
    }

    // Update position to offline
    await prisma.userPosition.update({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      },
      data: { isOnline: false }
    });

    // Decrease space user count
    await prisma.space.update({
      where: { id },
      data: { currentUserCount: { decrement: 1 } }
    });

    res.json({ message: 'Left space successfully' });
  } catch (error) {
    console.error('Error leaving space:', error);
    res.status(500).json({ error: 'Failed to leave space' });
  }
});

// Update user position in space
router.put('/:id/position', async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const data = updatePositionSchema.parse(req.body);

    const position = await prisma.userPosition.findUnique({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      }
    });

    if (!position || !position.isOnline) {
      return res.status(404).json({ error: 'Not in this space' });
    }

    const updatedPosition = await prisma.userPosition.update({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId: id
        }
      },
      data: {
        ...data,
        lastUpdate: new Date()
      }
    });

    res.json(updatedPosition);
  } catch (error) {
    console.error('Error updating position:', error);
    res.status(500).json({ error: 'Failed to update position' });
  }
});

export default router;
