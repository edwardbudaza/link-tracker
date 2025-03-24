import jwt from 'jsonwebtoken';
import { APP_CONFIG } from '../config/app';
import UserModel, { User } from '../models/User';
import { generateApiKey } from '../utils/apiKey';
import { injectable, inject } from 'inversify';
import { IAuthService } from '../interfaces/services/IAuthService';
import { IUserRepository } from '../interfaces/repositories/IUserRepository';
import { ILoggingService } from '../interfaces/services/ILoggingService';
import { TYPES } from '../di/types';
import { AuthTokens } from '../interfaces/auth/tokens';
import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { AuthError } from '../errors/AuthError';

type TokenPayload = {
  userId: string;
  email: string;
  role: string;
};

@injectable()
export class AuthService implements IAuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private readonly ACCESS_TOKEN_EXPIRY = '1h';
  private readonly REFRESH_TOKEN_EXPIRY = '7d';
  private readonly refreshTokens = new Set<string>();

  constructor(
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  async registerUser(email: string, password: string, name?: string): Promise<User> {
    try {
      console.log('AuthService: Checking for existing user:', email);
      const existingUser = await UserModel.findOne({ email });
      if (existingUser) {
        console.log('AuthService: User already exists');
        throw AuthError.duplicateUser();
      }

      console.log('AuthService: Creating new user with:', { email, name });
      const user = await UserModel.create({
        email,
        password,
        name,
        role: 'user',
        active: true
      });

      console.log('AuthService: User created successfully:', { userId: user._id });
      // Generate tokens but only return the user as per interface
      this.generateTokens(user);
      return user;
    } catch (error) {
      console.error('AuthService: Registration error details:', {
        name: error instanceof Error ? error.name : 'Unknown error',
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        stack: error instanceof Error ? error.stack : undefined
      });
      this.logger.error('Registration failed', error instanceof Error ? error : new Error('Unknown error'));
      throw error;
    }
  }

  async loginUser(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      console.log('AuthService: Attempting login for:', email);
      const user = await UserModel.findOne({ email });
      if (!user) {
        console.log('AuthService: User not found');
        throw AuthError.invalidCredentials();
      }

      console.log('AuthService: User found, comparing passwords');
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('AuthService: Invalid password');
        throw AuthError.invalidCredentials();
      }

      console.log('AuthService: Password valid, generating tokens');
      const tokens = this.generateTokens(user);
      return { user, tokens };
    } catch (error) {
      console.error('AuthService: Login error:', error);
      this.logger.error('Login failed', error as Error);
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      if (!this.refreshTokens.has(refreshToken)) {
        throw AuthError.invalidToken();
      }

      const decoded = jwt.verify(refreshToken, this.JWT_SECRET) as { userId: string };
      const user = await UserModel.findById(decoded.userId);
      
      if (!user) {
        throw AuthError.userNotFound();
      }

      this.refreshTokens.delete(refreshToken);
      return this.generateTokens(user);
    } catch (error) {
      this.logger.error('Token refresh failed', error as Error);
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    this.refreshTokens.delete(refreshToken);
  }

  async refreshApiKey(userId: string): Promise<string> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw AuthError.userNotFound();
      }

      const newApiKey = generateApiKey();
      user.apiKey = newApiKey;
      await user.save();

      return newApiKey;
    } catch (error) {
      this.logger.error('API key refresh failed', error as Error);
      throw error;
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET);
      if (typeof decoded === 'string' || !this.isTokenPayload(decoded)) {
        throw AuthError.invalidToken();
      }
      return decoded;
    } catch (error) {
      throw AuthError.invalidToken();
    }
  }

  private generateTokens(user: User): AuthTokens {
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      this.JWT_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    this.refreshTokens.add(refreshToken);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getExpirationSeconds(this.ACCESS_TOKEN_EXPIRY)
    };
  }

  private getExpirationSeconds(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([hmd])$/);
    if (!match) return 3600;

    const [, value, unit] = match;
    const multipliers: { [key: string]: number } = { h: 3600, m: 60, d: 86400 };
    return parseInt(value) * (multipliers[unit] || 3600);
  }

  private isTokenPayload(decoded: unknown): decoded is TokenPayload {
    return (
      typeof decoded === 'object' &&
      decoded !== null &&
      'userId' in decoded &&
      'email' in decoded &&
      'role' in decoded &&
      typeof (decoded as TokenPayload).userId === 'string' &&
      typeof (decoded as TokenPayload).email === 'string' &&
      typeof (decoded as TokenPayload).role === 'string'
    );
  }
} 