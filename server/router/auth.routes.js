const express = require("express");
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const auth = require('../middlewares/authMiddleware');
const authController = require("../controllers/auth.controller");
const verifyCtrl = require("../controllers/verify.controller");


router.post('/register', ctrl.register); // public signup → CUSTOMER
router.post('/login', ctrl.login);       // public
router.get('/me', auth, ctrl.me);        // current user


// password reset
router.post("/send-otp", authController.sendOtp);
router.post("/verify-otp", authController.verifyOtp);
router.post("/reset-password", authController.resetPassword);



// NEW: verification
router.post("/send-phone-otp", auth, verifyCtrl.sendPhoneOtp);
router.post("/verify-phone-otp", auth, verifyCtrl.verifyPhoneOtp);

router.post("/send-email-link", auth, verifyCtrl.sendEmailVerifyLink);
router.get("/verify-email", verifyCtrl.verifyEmailLink); 
router.post("/verify-email", verifyCtrl.verifyEmailToken); 

module.exports = router;
