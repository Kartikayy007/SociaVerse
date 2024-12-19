import { Router, Response, Request, RequestHandler } from 'express';
import { Profile, VALID_AVATARS } from '../models/Profile';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = Router();

const createProfile: RequestHandler = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { avatar, bio } = req.body;
        const userId = req.user?.id;

        if (!userId) {
             res.status(401).json({ status: 'error', message: 'Unauthorized' });
             return;
        }
  
        if (bio && bio.length > 500) {
             res.status(400).json({ 
                status: 'error', 
                message: 'Bio cannot exceed 500 characters' 
            });
            return;
        }

        if (!avatar || !VALID_AVATARS.includes(avatar)) {
             res.status(400).json({ 
                status: 'error', 
                message: `Invalid avatar. Please choose from: ${VALID_AVATARS.join(', ')}` 
            });
            return;
        }

        const user = await User.findById(userId);
        if (!user) {
             res.status(404).json({ status: 'error', message: 'User not found' });
             return;
        }

        const existingProfile = await Profile.findOne({ userId });
        if (existingProfile) {
             res.status(400).json({ status: 'error', message: 'Profile already exists' });
             return;
        }

        const profile = new Profile({
            userId,
            avatar,
            bio: bio || '',
            username: user.username
        });

        await profile.save();
         res.status(201).json({ status: 'success', data: profile });
    } catch (error) {
        console.error('Create profile error:', error);
         res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

const updateProfile: RequestHandler = async (req: AuthRequest, res: Response):Promise<void> => {
    try {
        const { bio, username, avatar } = req.body;
        const userId = req.user?.id;

        if (!userId) {
             res.status(401).json({ status: 'error', message: 'Unauthorized' });
             return;
        }

        // Validate avatar if provided
        if (avatar && !VALID_AVATARS.includes(avatar)) {
             res.status(400).json({ 
                status: 'error', 
                message: 'Please select a valid avatar' 
            });
            return;
        }

        // Input validation
        if (bio && bio.length > 500) {
             res.status(400).json({ 
                status: 'error', 
                message: 'Bio cannot exceed 500 characters' 
            });
            return;
        }

        if (username) {
            if (username.length < 3 || username.length > 30) {
                 res.status(400).json({ 
                    status: 'error', 
                    message: 'Username must be between 3 and 30 characters' 
                });
                return;
            }

            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                 res.status(400).json({ 
                    status: 'error', 
                    message: 'Username already taken' 
                });
                return;
            }
        }

        const profile = await Profile.findOne({ userId });
        if (!profile) {
             res.status(404).json({ status: 'error', message: 'Profile not found' });
             return;
        }

        if (bio) profile.bio = bio;
        if (username) {
            profile.username = username;
            await User.findByIdAndUpdate(userId, { username });
        }
        if (avatar) profile.avatar = avatar;

        await profile.save();
         res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
         res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

const getProfile: RequestHandler = async (req: Request, res: Response):Promise<void> => {
    try {
        const { userId } = req.params;

        if (!userId) {
             res.status(400).json({ 
                status: 'error', 
                message: 'User ID is required' 
            });
            return;
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
             res.status(400).json({ 
                status: 'error', 
                message: 'Invalid user ID format' 
            });
            return;
        }

        const profile = await Profile.findOne({ userId })
            .populate('userId', 'username email')
            .select('-__v');

        if (!profile) {
             res.status(404).json({ 
                status: 'error', 
                message: 'Profile not found' 
            });
            return;
        }

         res.status(200).json({
            status: 'success',
            data: profile.toObject() 
        });
    } catch (error) {
        if (error instanceof mongoose.Error) {
             res.status(400).json({
                status: 'error',
                message: 'Database error',
                error: error.message
            });
            return;
        }
        res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

router.post('/', authMiddleware, createProfile);
router.put('/', authMiddleware, updateProfile);
router.get('/:userId', getProfile);

export default router;