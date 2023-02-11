import express from "express";

import {
  registerBuyer,
  registerSeller,
  loginBuyerOrSeller,
  verifyEmail,
  resendOTP,
  getUserProfile,
  updateUserProfile,
  forgetPassword,
  updatePassword,
  resetPassword,
  sendPhoneVerifationOTP,
  verifyPhoneNumber,
} from "../controller/users.js";

import {
  validateUser,
  validate,
  validateStoreInfo,
} from "../middleware/validator.js";
import auth from "../middleware/auth.js";
import {
  createAccountLimit,
  loginAccountLimit,
  resendOtpLimit,
} from "../middleware/ratelimit.js";

const router = express.Router();

router.post("/login", loginBuyerOrSeller, loginAccountLimit);

// router.post("/seller/login", loginSeller, loginAccountLimit);

router.post(
  "/buyer/register",
  validateUser,
  validate,
  registerBuyer,
  createAccountLimit
);

router.post(
  "/seller/register",
  validateUser,
  validateStoreInfo,
  validate,
  registerSeller,
  createAccountLimit
);

router.post("/verify-email/:userId", verifyEmail);

router.post("/resend-otp", resendOTP, resendOtpLimit);

router.post("/send-phone-otp/:userId", sendPhoneVerifationOTP, resendOtpLimit);

router.post("/verify-phone/:userId", verifyPhoneNumber);

router.get("/get-user", auth, getUserProfile);

router.patch("/update-profile/:id", auth, updateUserProfile);

router.patch("/update-password/:id", auth, updatePassword);

router.post("/forget-password", forgetPassword);

router.post("/reset-password", resetPassword);

export default router;
