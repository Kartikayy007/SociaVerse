import { Router, Response } from 'express';
import { Space, SpaceType, MemberRole } from '../models/Space';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import { validateCreateSpace } from '../middleware/validators';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';



const router = Router();

// Create Space
router.post('/', 
  authMiddleware, 
  validateCreateSpace,
  async (req: AuthRequest, res: Response) => {
    // const session = await startSession();
    // session.startTransaction();
    console.log("SS")
    const inviteCode = uuidv4().substr(0, 8).toUpperCase();

    try {
      const { name, description, type, maxMembers } = req.body;
      const ownerId = req.user?.id;
      console.log("A")
      console.log(mongoose.connection.readyState)
      const space = new Space({
        name,
        description,
        type: type || SpaceType.PRIVATE,
        maxMembers: maxMembers || 100,
        ownerId,
        inviteCode,
        members: [{
          userId: ownerId,
          role: MemberRole.OWNER,
          joinedAt: new Date()
        }]
      });
      console.log("C")
      await space.save();
      console.log("B")
      // await session.commitTransaction();
      res.status(201).json({ status: 'success', data: space });
    } catch (error) {
      // await session.abortTransaction();
      res.status(500).json({
        status: 'error',
        message: (error as Error).message
      });
    } finally {
      // session.endSession();
    }
});

// Get All Spaces with Pagination
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const userId = req.user?.id;

    const [spaces, total] = await Promise.all([
      Space.find({
        'members.userId': userId
      })
        .sort({ lastActivity: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('onlineMembers', 'username'),
      Space.countDocuments({ 'members.userId': userId })
    ]);

    res.status(200).json({
      status: 'success',
      data: spaces,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Join Space
router.post('/:id/join', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const space = await Space.findById(req.params.id);
    
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }

    if (space.memberCount >= space.maxMembers) {
      res.status(400).json({ status: 'error', message: 'Space is full' });
      return;
    }

    const existingMember = space.members.find(m => m.userId.toString() === userId);
    if (existingMember) {
      res.status(400).json({ status: 'error', message: 'Already a member' });
      return;
    }

    space.members.push({
      userId: userId as any,
      role: MemberRole.MEMBER,
      joinedAt: new Date()
    });

    space.lastActivity = new Date();
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
router.post('/join-by-code/:code', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const space = await Space.findOne({ inviteCode: req.params.code });
    
    if (!space || !userId) {
      res.status(404).json({ status: 'error', message: 'Invalid invite code or user' });
      return;
    }

    const isMember = space.members.some(member => 
      member.userId.toString() === userId.toString()
    );

    if (isMember) {
      res.status(400).json({ status: 'error', message: 'Already a member' });
      return;
    }

    // Create new member with complete object structure
    const newMember = {
      userId: new mongoose.Types.ObjectId(userId),
      role: MemberRole.MEMBER,
      joinedAt: new Date()
    };

    // Update using findOneAndUpdate to ensure atomic operation
    const updatedSpace = await Space.findOneAndUpdate(
      { _id: space._id },
      { 
        $push: { members: newMember },
        $set: { lastActivity: new Date() }
      },
      { new: true, runValidators: true }
    );

    if (!updatedSpace) {
      res.status(500).json({ status: 'error', message: 'Failed to update space' });
      return;
    }

    res.status(200).json({ status: 'success', data: updatedSpace });
  } catch (error) {
    console.error('Join space error:', error);
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