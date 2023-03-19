const express = require('express');
const {create, verifyEmail, resendOTP} = require("../controllers/user");
const {userCreateValidator, validateUser} = require("../middlewares/validator");

const router = express.Router();

router.post('/create', userCreateValidator, validateUser, create);
router.post('/verify-email', userCreateValidator, verifyEmail);
router.post('/resend-email-verification-token', resendOTP)

module.exports = router;