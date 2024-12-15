import { Router, Response, Request, RequestHandler } from 'express';
import { Profile, VALID_AVATARS } from '../models/Profile';
import authMiddleware, { AuthRequest } from '../middleware/authMiddleware';
import { User } from '../models/User';
import mongoose from 'mongoose';

const router = Router();

const createProfile: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        const { avatar, bio } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        // Validate bio length if provided
        if (bio && bio.length > 500) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Bio cannot exceed 500 characters' 
            });
        }

        // Validate avatar
        if (!avatar || !VALID_AVATARS.includes(avatar)) {
            return res.status(400).json({ 
                status: 'error', 
                message: `Invalid avatar. Please choose from: ${VALID_AVATARS.join(', ')}` 
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ status: 'error', message: 'User not found' });
        }

        const existingProfile = await Profile.findOne({ userId });
        if (existingProfile) {
            return res.status(400).json({ status: 'error', message: 'Profile already exists' });
        }

        const profile = new Profile({
            userId,
            avatar,
            bio: bio || '',
            username: user.username
        });

        await profile.save();
        return res.status(201).json({ status: 'success', data: profile });
    } catch (error) {
        console.error('Create profile error:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

const updateProfile: RequestHandler = async (req: AuthRequest, res: Response) => {
    try {
        const { bio, username, avatar } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ status: 'error', message: 'Unauthorized' });
        }

        // Validate avatar if provided
        if (avatar && !VALID_AVATARS.includes(avatar)) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Please select a valid avatar' 
            });
        }

        // Input validation
        if (bio && bio.length > 500) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Bio cannot exceed 500 characters' 
            });
        }

        if (username) {
            // Check username format
            if (username.length < 3 || username.length > 30) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Username must be between 3 and 30 characters' 
                });
            }

            // Check if username is already taken
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ 
                    status: 'error', 
                    message: 'Username already taken' 
                });
            }
        }

        const profile = await Profile.findOne({ userId });
        if (!profile) {
            return res.status(404).json({ status: 'error', message: 'Profile not found' });
        }

        if (bio) profile.bio = bio;
        if (username) {
            profile.username = username;
            await User.findByIdAndUpdate(userId, { username });
        }
        if (avatar) profile.avatar = avatar;

        await profile.save();
        return res.status(200).json({ status: 'success', data: profile });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            message: 'Server error',
            error: (error as Error).message
        });
    }
};

const getProfile: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'User ID is required' 
            });
        }

        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                status: 'error', 
                message: 'Invalid user ID format' 
            });
        }

        const profile = await Profile.findOne({ userId })
            .populate('userId', 'username email')
            .select('-__v');

        if (!profile) {
            return res.status(404).json({ 
                status: 'error', 
                message: 'Profile not found' 
            });
        }

        return res.status(200).json({
            status: 'success',
            data: profile.toObject() // Use toObject() to convert mongoose document to plain object
        });
    } catch (error) {
        if (error instanceof mongoose.Error) {
            return res.status(400).json({
                status: 'error',
                message: 'Database error',
                error: error.message
            });
        }
        return res.status(500).json({
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