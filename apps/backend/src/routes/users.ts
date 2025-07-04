import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get user's spaces
router.get('/spaces', async (req: AuthenticatedRequest, res) => {
  try {
    const spaces = await prisma.space.findMany({
      where: {
        OR: [
          { creatorId: req.user!.id },
          { 
            permissions: { 
              some: { 
                userId: req.user!.id,
                OR: [
                  { expiresAt: null },
                  { expiresAt: { gt: new Date() } }
                ]
              } 
            } 
          }
        ]
      },
      include: {
        creator: { select: { id: true, email: true } },
        permissions: {
          where: { userId: req.user!.id },
          select: { permissionType: true }
        },
        _count: { select: { userPositions: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json(spaces);
  } catch (error) {
    console.error('Error fetching user spaces:', error);
    res.status(500).json({ error: 'Failed to fetch spaces' });
  }
});

// Get user's space history
router.get('/history', async (req: AuthenticatedRequest, res) => {
  try {
    const history = await prisma.userSpaceHistory.findMany({
      where: { userId: req.user!.id },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            slug: true,
            worldType: true,
            theme: true,
            backgroundImageUrl: true,
            isPublic: true
          }
        }
      },
      orderBy: { lastVisitedAt: 'desc' },
      take: 50
    });

    res.json(history);
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Get user's favorite spaces
router.get('/favorites', async (req: AuthenticatedRequest, res) => {
  try {
    const favorites = await prisma.userSpaceHistory.findMany({
      where: { 
        userId: req.user!.id,
        favorite: true
      },
      include: {
        space: {
          select: {
            id: true,
            name: true,
            slug: true,
            worldType: true,
            theme: true,
            backgroundImageUrl: true,
            isPublic: true,
            currentUserCount: true,
            maxUsers: true
          }
        }
      },
      orderBy: { lastVisitedAt: 'desc' }
    });

    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Toggle favorite space
router.post('/favorites/:spaceId', async (req: AuthenticatedRequest, res) => {
  try {
    const { spaceId } = req.params;

    // Check if space exists
    const space = await prisma.space.findUnique({
      where: { id: spaceId },
      select: { id: true }
    });

    if (!space) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Find or create history record
    const history = await prisma.userSpaceHistory.upsert({
      where: {
        userId_spaceId: {
          userId: req.user!.id,
          spaceId
        }
      },
      update: {
        favorite: true
      },
      create: {
        userId: req.user!.id,
        spaceId,
        favorite: true
      }
    });

    res.json(history);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({ error: 'Failed to add to favorites' });
  }
});

// Remove from favorites
router.delete('/favorites/:spaceId', async (req: AuthenticatedRequest, res) => {
  try {
    const { spaceId } = req.params;

    await prisma.userSpaceHistory.updateMany({
      where: {
        userId: req.user!.id,
        spaceId
      },
      data: {
        favorite: false
      }
    });

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({ error: 'Failed to remove from favorites' });
  }
});

// Get user stats
router.get('/stats', async (req: AuthenticatedRequest, res) => {
  try {
    const [spacesCreated, totalVisits, totalTimeSpent, favoriteSpaces] = await Promise.all([
      prisma.space.count({
        where: { creatorId: req.user!.id }
      }),
      prisma.userSpaceHistory.aggregate({
        where: { userId: req.user!.id },
        _sum: { totalVisits: true }
      }),
      prisma.userSpaceHistory.aggregate({
        where: { userId: req.user!.id },
        _sum: { totalTimeSpent: true }
      }),
      prisma.userSpaceHistory.count({
        where: { 
          userId: req.user!.id,
          favorite: true 
        }
      })
    ]);

    const stats = {
      spacesCreated,
      totalVisits: totalVisits._sum.totalVisits || 0,
      totalTimeSpent: totalTimeSpent._sum.totalTimeSpent || 0,
      favoriteSpaces
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

export default router;
