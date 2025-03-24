// controllers/authController.ts
import { Request, Response } from "express";
import { injectable, inject } from "inversify";
import { AuthService } from "../services/authService";
import { ILoggingService } from "../interfaces/services/ILoggingService";
import { TYPES } from "../di/types";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.AuthService) private authService: AuthService,
    @inject(TYPES.LoggingService) private logger: ILoggingService
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;
      console.log('Registration attempt:', { email, name }); // Don't log password

      if (!email || !password) {
        console.log('Missing required fields');
        res
          .status(400)
          .json({
            success: false,
            message: "Email and password are required.",
          });
        return;
      }

      const user = await this.authService.registerUser(email, password, name);
      console.log('User registered successfully:', { userId: user._id });
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        userId: user._id,
      });
    } catch (error) {
      console.error('Registration error:', error);
      this.logger.error("Registration failed", error as Error);

      if ((error as Error).message === "User already exists") {
        res
          .status(409)
          .json({ success: false, message: "User already exists." });
      } else {
        res
          .status(500)
          .json({ success: false, message: "Registration failed." });
      }
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res
          .status(400)
          .json({
            success: false,
            message: "Email and password are required.",
          });
        return;
      }

      const { user, tokens } = await this.authService.loginUser(
        email,
        password
      );

      res.status(200).json({
        success: true,
        message: "Login successful.",
        token: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user,
      });
    } catch (error) {
      this.logger.error("Login failed", error as Error);

      if ((error as Error).message === "Invalid credentials") {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials." });
      } else {
        res.status(500).json({ success: false, message: "Login failed." });
      }
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res
          .status(400)
          .json({ success: false, message: "Refresh token is required." });
        return;
      }

      const newToken = await this.authService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        token: newToken,
      });
    } catch (error) {
      this.logger.error("Token refresh failed", error as Error);
      res
        .status(401)
        .json({ success: false, message: "Invalid refresh token." });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res
          .status(400)
          .json({ success: false, message: "Refresh token is required." });
        return;
      }

      await this.authService.logout(refreshToken);

      res.status(200).json({
        success: true,
        message: "Logged out successfully.",
      });
    } catch (error) {
      this.logger.error("Logout failed", error as Error);
      res.status(500).json({ success: false, message: "Logout failed." });
    }
  }
}
