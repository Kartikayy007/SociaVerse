import { Router, Response } from 'express';
import { Message } from '../models/Message';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';

const router = Router();

// Get messages for a space
router.get('/:spaceId', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const messages = await Message.find({ spaceId: req.params.spaceId })
      .populate('sender', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      status: 'success',
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

export default router;