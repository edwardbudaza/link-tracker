import { Request, Response } from "express";

export interface IRedirectService {
  redirect(req: Request, res: Response): Promise<void>;
  recordClickEvent(shortId: string, req: Request): Promise<void>;
}
