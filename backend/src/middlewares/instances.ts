import { container } from '../di/container';
import { TYPES } from '../di/types';
import { AuthMiddleware } from './authMiddleware';

// Get middleware instances from container
const authMiddleware = container.get<AuthMiddleware>(TYPES.AuthMiddleware);

// Export bound middleware functions
export const authenticateToken = authMiddleware.authenticate.bind(authMiddleware); 