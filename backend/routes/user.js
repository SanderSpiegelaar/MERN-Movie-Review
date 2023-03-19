const express = require('express');
const {
    create,
    verifyEmail,
    resendOTP,
    forgetPassword,
    sendResetPasswordTokenStatus,
    resetPassword } = require("../controllers/user");
const {
    userCreateValidator,
    validateUser,
    validatePassword } = require("../middlewares/validator");
const {verifyPasswordResetToken} = require("../middlewares/user");

const router = express.Router();

// User related routes
router.post('/create', userCreateValidator, validateUser, create);
router.post('/verify-email', userCreateValidator, verifyEmail);
router.post('/resend-email-verification-token', resendOTP);
router.post('/forget-password', forgetPassword);
router.post('/verify-password-reset-token', verifyPasswordResetToken, sendResetPasswordTokenStatus);
router.post('/reset-password', verifyPasswordResetToken, validatePassword, validateUser, resetPassword);

module.exports = router;