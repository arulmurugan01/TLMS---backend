import { Request, Response } from "express";
import { NotificationService } from "../services/notification.service";
import { sendSuccess, sendError } from "../utils/response";

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await NotificationService.getForUser(
        req.user!.userId,
        parseInt(page as string) || 1,
        parseInt(limit as string) || 20
      );
      sendSuccess(res, "Notifications fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async markRead(req: Request, res: Response): Promise<void> {
    try {
      await NotificationService.markRead(req.params.id, req.user!.userId);
      sendSuccess(res, "Notification marked as read.");
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async markAllRead(req: Request, res: Response): Promise<void> {
    try {
      await NotificationService.markAllRead(req.user!.userId);
      sendSuccess(res, "All notifications marked as read.");
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }
}
