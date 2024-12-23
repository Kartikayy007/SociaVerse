import { Router, Response } from 'express';
import { Space } from '../models/Space';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
// import mongoose from 'mongoose';

const router = Router();

// Create Space
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, isPrivate } = req.body;
    const ownerId = req.user?.id;

    if (!name || !description) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Name and description are required' 
      });
      return;
    }

    const space = new Space({
      name,
      description,
      isPrivate,
      ownerId
    });

    await space.save();
    res.status(201).json({ status: 'success', data: space });
  } catch (error) {
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
      $or: [
        { ownerId: userId },
        { isPrivate: false }
      ]
    }).sort({ lastVisited: -1 });

    res.status(200).json({ status: 'success', data: spaces });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: (error as Error).message
    });
  }
});

// Get Space by ID
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const space = await Space.findById(req.params.id);
    if (!space) {
      res.status(404).json({ status: 'error', message: 'Space not found' });
      return;
    }
    
    space.lastVisited = new Date();
    await space.save();

    res.status(200).json({ status: 'success', data: space });
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

export default router;