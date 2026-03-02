import { Router } from "express";
import { body, param } from "express-validator";
import { LoadController } from "../controllers/load.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../types";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(UserRole.SELLER),
  [
    body("origin").trim().notEmpty().withMessage("Origin is required."),
    body("destination").trim().notEmpty().withMessage("Destination is required."),
    body("materialDescription").trim().notEmpty().withMessage("Material description is required."),
    body("weight").isFloat({ min: 0.1 }).withMessage("Weight must be a positive number."),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number."),
    body("pickupDate").isISO8601().withMessage("Pickup date must be a valid date (YYYY-MM-DD)."),
    body("notes").optional().trim(),
  ],
  validate,
  LoadController.create
);

router.get("/my", authorize(UserRole.SELLER), LoadController.getMy);

router.patch(
  "/:id/complete",
  authorize(UserRole.SELLER, UserRole.SUPER_ADMIN),
  [param("id").isUUID()],
  validate,
  LoadController.complete
);

router.get(
  "/available",
  authorize(UserRole.TRANSPORTER),
  LoadController.getAvailable
);


router.get(
  "/assigned",
  authorize(UserRole.TRANSPORTER),
  LoadController.getAssigned
);

router.patch(
  "/:id/accept",
  authorize(UserRole.TRANSPORTER),
  [param("id").isUUID()],
  validate,
  LoadController.accept
);

router.get("/", authorize(UserRole.SUPER_ADMIN), LoadController.adminGetAll);

router.put(
  "/:id",
  authorize(UserRole.SUPER_ADMIN),
  [param("id").isUUID()],
  validate,
  LoadController.adminUpdate
);


router.delete(
  "/:id",
  authorize(UserRole.SUPER_ADMIN),
  [param("id").isUUID()],
  validate,
  LoadController.adminDelete
);


router.get(
  "/:id",
  [param("id").isUUID()],
  validate,
  LoadController.getById
);

export default router;
