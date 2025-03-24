import { Request, Response } from "express";

export interface IUrlController {
  createShortUrl(req: Request, res: Response): Promise<void>;
  getUserUrls(req: Request, res: Response): Promise<void>;
  processHtml(req: Request, res: Response): Promise<void>;
} 