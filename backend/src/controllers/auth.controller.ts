import { Request, Response } from 'express';
import User from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiError, ApiResponse } from '../utils/apiResponse';
import { generateToken } from '../utils/jwt';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new ApiError(400, 'User already exists'); // Handled by asyncHandler
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // The pre-save hook in User model will hash this automatically
  });

  const token = generateToken(user._id as any);

  res.status(201).json(new ApiResponse(201, 'User registered successfully', {
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  }));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateToken(user._id as any);

  res.status(200).json(new ApiResponse(200, 'Login successful', {
    _id: user._id,
    name: user.name,
    email: user.email,
    token,
  }));
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = req.user; // Attached by the 'protect' middleware
  
  res.status(200).json(new ApiResponse(200, 'User profile fetched', {
    _id: user._id,
    name: user.name,
    email: user.email,
  }));
});