import { Router, Response } from 'express';
import { Space } from '../models/Space';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Create Space
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description, isPublic } = req.body;
    const ownerId = req.user?.id;

    if (!name || !description) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and description are required' 
      });
      return;
    }

    const space = await Space.create({
      name,
      description,
      isPublic,
      ownerId,
      members: [ownerId] // Add owner as first member
    });

    res.status(201).json({ status: 'success', data: space });
  } catch (error) {
    console.error('Space creation error:', error);
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get All Spaces
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const spaces = await Space.find({
      members: userId  // Only fetch spaces where user is a member
    }).sort({ lastVisited: -1 });

    res.status(200).json({ status: 'success', data: spaces });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Join Space
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const space = await Space.findById(req.params.id);
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }

    if (space.members.includes(userId as any)) {
      res.status(400).json({ status: 'error', message: 'Already a member' });
      return;
    }

    space.members.push(userId as any);
    await space.save();

    res.status(200).json({ status: 'success', data: space });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Join Space with Invite Code
router.post('/join-by-code/:code', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const space = await Space.findOne({ inviteCode: req.params.code });
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Invalid invite code' });
      return;
    }

    if (space.members.includes(userId as any)) {
      res.status(400).json({ status: 'error', message: 'Already a member' });
      return;
    }

    space.members.push(userId as any);
    await space.save();

    res.status(200).json({ status: 'success', data: space });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Leave Space
router.post('/:id/leave', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const space = await Space.findById(req.params.id);
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }

    if (space.ownerId.toString() === userId) {
      res.status(400).json({ status: 'error', message: 'Owner cannot leave space' });
      return;
    }

    space.members = space.members.filter(memberId => memberId.toString() !== userId);
    await space.save();

    res.status(200).json({ status: 'success', message: 'Left space successfully' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get Space by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const space = await Space.findById(req.params.id)
      .populate('onlineMembers', 'username')
      .populate('members', 'username');

    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }
    
    space.lastVisited = new Date();
    await space.save();

    res.status(200).json({ 
      status: 'success', 
      data: {
        ...space.toObject(),
        onlineMembersCount: space.onlineMembers.length,
        totalMembersCount: space.members.length
      } 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Update Space
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPrivate } = req.body;
    const space = await Space.findOneAndUpdate(
      { _id: req.params.id, ownerId: req.user?.id },
      { name, description, isPrivate },
      { new: true }
    );

    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found or unauthorized' });
      return;
    }

    res.status(200).json({ status: 'success', data: space });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Delete Space
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const space = await Space.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user?.id
    });

    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found or unauthorized' });
      return;
    }

    res.status(200).json({ status: 'success', message: 'Space deleted successfully' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Update online status
router.post('/:id/online', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const space = await Space.findById(req.params.id);
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }

    if (!space.onlineMembers.includes(userId as any)) {
      space.onlineMembers.push(userId as any);
      await space.save();
    }

    res.status(200).json({ 
      status: 'success', 
      data: { onlineCount: space.onlineMembers.length } 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Update offline status
router.post('/:id/offline', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const space = await Space.findById(req.params.id);
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }

    space.onlineMembers = space.onlineMembers.filter(
      memberId => memberId.toString() !== userId
    );
    await space.save();

    res.status(200).json({ 
      status: 'success', 
      data: { onlineCount: space.onlineMembers.length } 
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

export default router;