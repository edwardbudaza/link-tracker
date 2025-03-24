export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
  version: string; // For token invalidation
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} 