import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { User } from '../models/User';
import { generateToken } from '../middleware/auth';
import { env } from '../config/env';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { name, email, password } = parseResult.data;

    // Check if email already registered
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'An account with this email address already exists.' });
      return;
    }

    // Hash password with salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Secure role assignment: always customer for public registration
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'customer',
    });

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: parseResult.error.errors.map((e) => e.message).join(', '),
      });
      return;
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user || !user.passwordHash) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(200).json({
      message: 'Signed in successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required.' });
      return;
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

import { OAuth2Client } from 'google-auth-library';

const googleClient = new OAuth2Client();

/**
 * Google OAuth Single Sign-On Handler
 * Verifies Google ID token server-side via google-auth-library OAuth2Client,
 * verifies audience against GOOGLE_CLIENT_ID, checks email_verified,
 * links existing accounts safely (preserving role), or provisions new customers.
 */
export const googleAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      res.status(400).json({ message: 'Google credential ID token is required.' });
      return;
    }

    if (!env.GOOGLE_CLIENT_ID) {
      res.status(503).json({
        status: 'BLOCKED_PENDING_CONFIG',
        message: 'Google Sign-In is blocked pending configuration. Please set GOOGLE_CLIENT_ID in server/.env.',
      });
      return;
    }

    // Verify token cryptographically with Google's official library
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyError: any) {
      res.status(401).json({
        message: 'Invalid or expired Google authentication token.',
        details: verifyError.message,
      });
      return;
    }

    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ message: 'Missing token payload from Google.' });
      return;
    }

    if (payload.aud !== env.GOOGLE_CLIENT_ID) {
      res.status(401).json({ message: 'Google token audience mismatch with configured Client ID.' });
      return;
    }

    const emailVerified = payload.email_verified === true;
    if (!emailVerified || !payload.email) {
      res.status(400).json({ message: 'Google account email is not verified.' });
      return;
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || email.split('@')[0];
    const googleId = payload.sub;

    let user = await User.findOne({ email });

    if (user) {
      // Link Google identity if not present, preserving existing role
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Provision as customer (CRITICAL: never auto-grant administrator role)
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        role: 'customer',
      });
    }

    const token = generateToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    res.status(200).json({
      message: 'Signed in with Google successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

