import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { UserRole, JwtPayload } from "../types";
import { sendError } from "../utils/response";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendError(res, "Access denied. No token provided.", 401);
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch {
    sendError(res, "Invalid or expired token.", 401);
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized.", 401);
      return;
    }
    if (!roles.includes(req.user.role)) {
      sendError(res, "Forbidden. You do not have permission.", 403);
      return;
    }
    next();
  };
};

export const checkAdminSecret = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { role, adminSecret } = req.body;

  if (role === UserRole.SUPER_ADMIN) {
    if (!adminSecret) {
      return res.status(403).json({
        success: false,
        message: "Admin secret is required for admin access.",
      });
    }

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({
        success: false,
        message: "Invalid admin secret.",
      });
    }
  }

  next();
};
