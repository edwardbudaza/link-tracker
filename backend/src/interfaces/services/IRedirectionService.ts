import { Request, Response, NextFunction } from "express";

export interface IRedirectionService {
  redirect(req: Request, res: Response, next: NextFunction): Promise<void>;
  recordClickEvent(shortId: string, req: Request): Promise<void>;
}
