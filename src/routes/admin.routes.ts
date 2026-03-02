import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { UserRole } from "../types";

const router = Router();

router.use(authenticate, authorize(UserRole.SUPER_ADMIN));

router.get("/stats", AdminController.getStats);
router.get("/users", AdminController.getAllUsers);
router.get("/users/:id", AdminController.getUserById);
router.patch("/users/:id/role", AdminController.updateUserRole);
router.patch("/users/:id/toggle-status", AdminController.toggleUserStatus);
router.delete("/users/:id", AdminController.deleteUser);

export default router;
