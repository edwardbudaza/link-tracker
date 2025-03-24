export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'USER_NOT_FOUND'
  | 'DUPLICATE_USER'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN';

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  static unauthorized(message: string = 'Unauthorized'): AuthError {
    return new AuthError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message: string = 'Forbidden'): AuthError {
    return new AuthError(message, 'FORBIDDEN', 403);
  }

  static invalidCredentials(message: string = 'Invalid credentials'): AuthError {
    return new AuthError(message, 'INVALID_CREDENTIALS', 401);
  }

  static invalidToken(message: string = 'Invalid token'): AuthError {
    return new AuthError(message, 'INVALID_TOKEN', 401);
  }

  static tokenExpired(message: string = 'Token expired'): AuthError {
    return new AuthError(message, 'TOKEN_EXPIRED', 401);
  }

  static userNotFound(message: string = 'User not found'): AuthError {
    return new AuthError(message, 'USER_NOT_FOUND', 404);
  }

  static duplicateUser(message: string = 'User already exists'): AuthError {
    return new AuthError(message, 'DUPLICATE_USER', 409);
  }
} 