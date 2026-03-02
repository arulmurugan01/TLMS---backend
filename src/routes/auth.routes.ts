import { Router } from "express";
import { body } from "express-validator";
import { AuthController } from "../controllers/auth.controller";
import { authenticate, checkAdminSecret} from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { UserRole } from "../types";

const router = Router();

router.post(
  "/request-otp",
  [
    body("mobile")
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Enter a valid 10-digit Indian mobile number."),
    body("role")
      .optional()
      .isIn(Object.values(UserRole))
      .withMessage("Invalid role."),
  ],
  validate,
  checkAdminSecret,
  AuthController.requestOtp
);

router.post(
  "/verify-otp",
  [
    body("mobile")
      .trim()
      .matches(/^[6-9]\d{9}$/)
      .withMessage("Enter a valid mobile number."),
    body("otp")
      .trim()
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be 6 digits."),
  ],
  validate,
  AuthController.verifyOtp
);


router.get("/profile", authenticate, AuthController.getProfile);


router.patch(
  "/profile",
  authenticate,
  [body("name").optional().trim().isLength({ min: 2, max: 100 })],
  validate,
  AuthController.updateProfile
);

export default router;
