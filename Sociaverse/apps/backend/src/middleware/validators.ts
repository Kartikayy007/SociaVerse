import { body } from 'express-validator';
import { SpaceType } from '../models/Space';

export const validateCreateSpace = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be between 3 and 50 characters'),
  body('description')
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('type')
    .optional()
    .isIn(Object.values(SpaceType))
    .withMessage('Invalid space type'),
  body('maxMembers')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Max members must be between 1 and 1000')
];