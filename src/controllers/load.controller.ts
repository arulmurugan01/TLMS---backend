import { Request, Response } from "express";
import { LoadService } from "../services/load.service";
import { sendSuccess, sendError } from "../utils/response";
import { UserRole, LoadStatus } from "../types";

export class LoadController {

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const load = await LoadService.create(req.user!.userId, {
        ...req.body,
        pickupDate: new Date(req.body.pickupDate),
      });
      sendSuccess(res, "Load created successfully.", load, 201);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getAvailable(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, origin, destination } = req.query;
      const result = await LoadService.getAvailable({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        origin: origin as string,
        destination: destination as string,
      });
      sendSuccess(res, "Available loads fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getMy(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status } = req.query;
      const result = await LoadService.getByseller(req.user!.userId, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        status: status as LoadStatus,
      });
      sendSuccess(res, "Your loads fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getAssigned(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status } = req.query;
      const result = await LoadService.getByDriver(req.user!.userId, {
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        status: status as LoadStatus,
      });
      sendSuccess(res, "Assigned loads fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const load = await LoadService.getById(
        req.params.id,
        req.user!.userId,
        req.user!.role as UserRole
      );
      sendSuccess(res, "Load fetched.", load);
    } catch (err) {
      const msg = (err as Error).message;
      sendError(res, msg, msg === "Access denied." ? 403 : 404);
    }
  }

  static async accept(req: Request, res: Response): Promise<void> {
    try {
      const load = await LoadService.accept(req.params.id, req.user!.userId);
      sendSuccess(res, "Load accepted successfully.", load);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }


  static async complete(req: Request, res: Response): Promise<void> {
    try {
      const load = await LoadService.complete(
        req.params.id,
        req.user!.userId,
        req.user!.role as UserRole
      );
      sendSuccess(res, "Load marked as completed.", load);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async adminGetAll(req: Request, res: Response): Promise<void> {
    try {
      const { page, limit, status } = req.query;
      const result = await LoadService.getAll({
        page: parseInt(page as string) || 1,
        limit: parseInt(limit as string) || 10,
        status: status as LoadStatus,
      });
      sendSuccess(res, "All loads fetched.", result);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }


  static async adminUpdate(req: Request, res: Response): Promise<void> {
    try {
      const load = await LoadService.adminUpdate(req.params.id, req.body);
      sendSuccess(res, "Load updated.", load);
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }

  static async adminDelete(req: Request, res: Response): Promise<void> {
    try {
      await LoadService.adminDelete(req.params.id);
      sendSuccess(res, "Load deleted.");
    } catch (err) {
      sendError(res, (err as Error).message);
    }
  }
}
