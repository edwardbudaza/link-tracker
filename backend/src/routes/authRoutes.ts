import {
  Router,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from "express";
import { container } from "../di/container";
import { TYPES } from "../di/types";
import { AuthController } from "../controllers/authController";
import { validateRequest } from "../middlewares/validateRequest";
import { authenticateToken, AuthRequest } from "../middlewares/authMiddleware";
const { body } = require("express-validator");

const router = Router();
const authController = container.get<AuthController>(TYPES.AuthController);

// Define validation rules
const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
  validateRequest,
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

// Route handlers with proper typing
const register: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authController.register(req, res);
  } catch (error) {
    next(error);
  }
};

const login: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authController.login(req, res);
  } catch (error) {
    next(error);
  }
};

const refreshToken: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    await authController.refreshToken(authReq, res);
  } catch (error) {
    next(error);
  }
};

const logout: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    await authController.logout(authReq, res);
  } catch (error) {
    next(error);
  }
};

// Routes with validation middleware
router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/refresh-token", authenticateToken, refreshToken);
router.post("/logout", authenticateToken, logout);

export default router;
