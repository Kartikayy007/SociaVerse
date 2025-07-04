import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { createClient } from '@supabase/supabase-js';

const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Sync user data with our database after authentication
router.post('/sync-user', async (req, res) => {
  try {
    const { userId, email } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing user data' });
    }

    // Create or update user in our database
    const user = await prisma.user.upsert({
      where: { id: userId },
      update: { 
        email,
        updatedAt: new Date()
      },
      create: {
        id: userId,
        email
      }
    });

    res.json(user);
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: 'Failed to sync user data' });
  }
});

// Webhook endpoint for Supabase auth events
router.post('/webhook', async (req, res) => {
  try {
    const { type, record } = req.body;

    switch (type) {
      case 'INSERT':
        // New user created
        await prisma.user.upsert({
          where: { id: record.id },
          update: { 
            email: record.email,
            updatedAt: new Date()
          },
          create: {
            id: record.id,
            email: record.email
          }
        });
        break;

      case 'UPDATE':
        // User updated
        await prisma.user.update({
          where: { id: record.id },
          data: {
            email: record.email,
            updatedAt: new Date()
          }
        });
        break;

      case 'DELETE':
        // User deleted - handle cleanup
        await prisma.user.delete({
          where: { id: record.id }
        });
        break;
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user data from our database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        createdSpaces: {
          select: { id: true, name: true, slug: true, createdAt: true }
        },
        spaceHistory: {
          include: { space: { select: { id: true, name: true, slug: true } } },
          orderBy: { lastVisitedAt: 'desc' },
          take: 10
        }
      }
    });

    if (!userData) {
      // Sync user if not found
      const newUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email!
        },
        include: {
          createdSpaces: true,
          spaceHistory: true
        }
      });
      return res.json(newUser);
    }

    res.json(userData);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

export default router;
