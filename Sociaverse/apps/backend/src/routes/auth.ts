import { Router } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
     res.status(400).json({
      status: 'error',
      message: 'All fields are required'
    });
    return;
  }

  try {
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
       
      res.status(400).json({
        status: 'error',
        message: 'User already exists'
      });
      return;
    }

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

router.post('/signin', async (req, res) => {
  const { login, password } = req.body; 

  if (!login || !password) {
    res.status(400).json({
      status: 'error',
      message: 'All fields are required'
    });
    return;
  }

  try {
    const user = await User.findOne({
      $or: [
        { email: login },
        { username: login }
      ]
    });

    if (!user) {
      res.status(404).json({
        status: 'error',
        message: 'User not found'
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid credentials'
      });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Server error',
      error: (error as Error).message
    });
  }
});

export default router;