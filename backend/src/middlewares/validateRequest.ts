import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');

interface ValidationError {
  param: string;
  msg: string;
}

export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array().map((err: ValidationError) => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
}; 