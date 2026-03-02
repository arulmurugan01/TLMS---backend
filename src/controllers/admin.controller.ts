import { Request, Response } from "express";
import { AdminService } from "../services/admin.service";
import { sendSuccess, sendError } from "../utils/response";
import { UserRole } from "../types";

export class AdminController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      sendSuccess(res, "System stats fetched.", stats);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await AdminService.getAllUsers(
        parseInt(page as string) || 1,
        parseInt(limit as string) || 20
      );
      sendSuccess(res, "Users fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.getUserById(req.params.id);
      sendSuccess(res, "User fetched.", user);
    } catch (err) {
      sendError(res, (err as Error).message, 404);
    }
  }

  static async updateUserRole(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.body;
      if (!Object.values(UserRole).includes(role)) {
        sendError(res, "Invalid role.");
        return;
      }
      const user = await AdminService.updateUserRole(req.params.id, role);
      sendSuccess(res, "User role updated.", user);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async toggleUserStatus(req: Request, res: Response): Promise<void> {
    try {
      const user = await AdminService.toggleUserStatus(req.params.id);
      sendSuccess(
        res,
        `User ${user.isActive ? "activated" : "deactivated"} successfully.`,
        user
      );
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      await AdminService.deleteUser(req.params.id);
      sendSuccess(res, "User deleted.");
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }
}
