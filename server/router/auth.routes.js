// server\router\auth.routes.js

import { Router } from "express";
import {
 register,
  login,
  me,
} from "../controllers/user.controller.js";
import auth from "../middlewares/authMiddleware.js";
import authController from "../controllers/auth.controller.js";
import {sendPhoneOtp,verifyPhoneOtp,sendEmailVerifyLink,verifyEmailLink,verifyEmailToken} from "../controllers/verify.controller.js";
const router = Router();

router.post('/register', register); // public signup → CUSTOMER
router.post('/login', login);       // public
router.get('/me', auth, me);        // current user


// password reset
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);



// NEW: verification
router.post("/send-phone-otp", auth, sendPhoneOtp);
router.post("/verify-phone-otp", auth, verifyPhoneOtp);

router.post("/send-email-link", auth, sendEmailVerifyLink);
router.get("/verify-email", verifyEmailLink); 
router.post("/verify-email", verifyEmailToken); 

export default router;
