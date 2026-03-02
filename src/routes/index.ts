import { Router } from "express";
import authRoutes from "./auth.routes";
import loadRoutes from "./load.routes";
import notificationRoutes from "./notification.routes";
import adminRoutes from "./admin.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/loads", loadRoutes);
router.use("/notifications", notificationRoutes);
router.use("/admin", adminRoutes);

export default router;
