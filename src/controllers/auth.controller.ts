import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { sendSuccess, sendError } from "../utils/response";
import { UserRole } from "../types";

export class AuthController {
  static async requestOtp(req: Request, res: Response): Promise<void> {
    try {
      const { mobile, role, name } = req.body;
      const result = await AuthService.requestOtp(mobile, role as UserRole, name );
      sendSuccess(res, result.message);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { mobile, otp } = req.body;
      const result = await AuthService.verifyOtp(mobile, otp);
      sendSuccess(res, "Login successful.", result);
    } catch (err) {
      sendError(res, (err as Error).message, 401);
    }
  }

  static async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!.userId);
      sendSuccess(res, "Profile fetched.", user);
    } catch (err) {
      sendError(res, (err as Error).message, 404);
    }
  }

  static async updateProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await AuthService.updateProfile(req.user!.userId, req.body);
      sendSuccess(res, "Profile updated.", user);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }
}
