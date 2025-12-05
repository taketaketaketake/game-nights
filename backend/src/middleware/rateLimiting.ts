import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// General API rate limit
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Strict limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per 15 minutes
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Authentication rate limit exceeded',
      message: 'Too many login attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Moderate limiter for game actions
export const gameLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 game actions per minute
  message: {
    error: 'Too many game actions from this IP, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Game action rate limit exceeded',
      message: 'Too many game actions from this IP, please slow down.',
      retryAfter: '1 minute'
    });
  }
});

// Very strict limiter for sensitive operations (user creation, password reset)
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 sensitive operations per hour
  message: {
    error: 'Too many sensitive operations from this IP, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Sensitive operation rate limit exceeded',
      message: 'Too many sensitive operations from this IP, please try again later.',
      retryAfter: '1 hour'
    });
  }
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 uploads per 15 minutes
  message: {
    error: 'Too many file uploads from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Upload rate limit exceeded',
      message: 'Too many file uploads from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});