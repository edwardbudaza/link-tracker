import { Request, Response, NextFunction } from 'express';

export interface IAuthMiddleware {
  authenticate(req: Request, res: Response, next: NextFunction): Promise<void>;
  requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
} 