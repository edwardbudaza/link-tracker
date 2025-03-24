import { Request, Response, NextFunction } from "express";

export interface IRedirectController {
  redirect(req: Request, res: Response, next: NextFunction): Promise<void>;
} 