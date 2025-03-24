import { injectable } from 'inversify';
import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { APP_CONFIG } from '../config/app';

@injectable()
export class TokenService {
  generateToken(payload: Record<string, any>): string {
    if (!APP_CONFIG.jwtSecret) {
      throw new Error('JWT secret is not configured');
    }
    const options: SignOptions = {
      expiresIn: Number(APP_CONFIG.jwtExpiresIn) || '1h'
    };
    return jwt.sign(payload, APP_CONFIG.jwtSecret, options);
  }

  verifyToken(token: string): JwtPayload {
    if (!APP_CONFIG.jwtSecret) {
      throw new Error('JWT secret is not configured');
    }
    const decoded = jwt.verify(token, APP_CONFIG.jwtSecret);
    return decoded as JwtPayload;
  }

  generateRefreshToken(userId: string): string {
    if (!APP_CONFIG.jwtSecret) {
      throw new Error('JWT secret is not configured');
    }
    const options: SignOptions = {
      expiresIn: '7d' // Refresh tokens last longer
    };
    return jwt.sign({ userId }, APP_CONFIG.jwtSecret, options);
  }
} 