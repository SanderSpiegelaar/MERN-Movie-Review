const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const {isValidObjectId} = require("mongoose");
const jwt = require('jsonwebtoken');
const PasswordResetToken = require('../models/passwordResetToken');
const {generateOTP, generateMailTransporter} = require("../utils/mail");
const {sendError, generateRandomByte} = require("../utils/helper");

exports.create = async (req, res) => {
    const {name, email, password} = req.body;
    const existingUser = await User.findOne({email});

    if(existingUser) return sendError(res, 'This email is already in use!');
    const newUser = new User ({name, email, password});
    await newUser.save();

    // Generate & Send Email Verification Token
    let OTP = generateOTP();

    const newEmailVerificationToken = new EmailVerificationToken({owner: newUser._id, token: OTP});
    await newEmailVerificationToken.save();

    const transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@mern-movie-review.com',
        to: newUser.email,
        subject: 'Email Verification',
        html: `
            <div style="text-align: center">
                <h1>Verify your email</h1>
                <p>Use the following OTP to verify your email</p>
                <h2>${OTP}</h2>
            </div>
        `
    });

    res.status(201).json({
        message: 'Please verify your email!'
    });
};

exports.verifyEmail = async (req, res) => {
    const {userId, OTP} = req.body;
    const user =  await User.findById(userId)

    if(!isValidObjectId(userId)) return sendError(res, 'Invalid user!');

    if(!user) return sendError(res, 'User not found!');

    if(user.emailVerified) return sendError(res, 'Email already verified');

    const token = await EmailVerificationToken.findOne({owner: userId})
    if(!token) return sendError(res, 'Token not found!');

    const isMatched = await token.compareToken(OTP)
    if(!isMatched) return sendError(res, 'Invalid OTP');

    user.emailVerified = true;
    await user.save();

    await EmailVerificationToken.findByIdAndDelete(token._id);

    const transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@mern-movie-review.com',
        to: User.email,
        subject: 'Email Verified!',
        html: `
            <div style="text-align: center">
                <h1>Email Verified!/h1>
                <p>Your email was verified succesfully</p>
            </div>
        `
    });

    res.json({message: 'Email verified successfully!'});
}

exports.resendOTP = async (req, res) => {
    const { userId } = req.body;
    const user = await User.findById(userId);

    if( !user ) return sendError(res, 'User not found', 404);
    if( user.emailVerified ) return sendError(res, 'Email already verified');

    const tokenExists = await EmailVerificationToken.findOne({owner: userId});
    if(tokenExists) return sendError(res, 'Token is not expired yet (tokens are valid for 60 minutes)');

    let OTP = generateOTP();

    const newEmailVerificationToken = new EmailVerificationToken({owner: user._id, token: OTP});
    await newEmailVerificationToken.save();

    const transport = generateMailTransporter();

    transport.sendMail({
        from: 'verification@mern-movie-review.com',
        to: user.email,
        subject: 'Your new Email Verification',
        html: `
            <div style="text-align: center">
                <h1>Verify your email</h1>
                <p>Use the following OTP to verify your email</p>
                <h2>${OTP}</h2>
            </div>
        `
    });

    res.json({message: 'New OTP sent to your email!'});
};

exports.forgetPassword = async (req, res) => {
    const {email} = req.body;

    if(!email) return sendError(res, 'Email is required');

    const user = await User.findOne({email});
    if(!user) return sendError(res, 'User not found', 404);

    const tokenExists = await PasswordResetToken.findOne({owner: user._id});
    if(tokenExists) return sendError(res, 'Token is not expired yet (tokens are valid for 60 minutes)');

    const token = await generateRandomByte();
    const newPasswordResetToken = await PasswordResetToken({owner: user._id, token});
    await newPasswordResetToken.save();

    const resetPasswordUrl = `http://localhost:3000/reset-password?token=${token}&id=${user._id}`;

    const transport = generateMailTransporter();
    transport.sendMail({
        from: 'reset-paswword@mern-movie-review.com',
        to: user.email,
        subject: 'Reset password link',
        html: `
            <div style="text-align: center">
                <h1>Reset password</h1>
                <p>Click the link below to reset your password</p>
                <a href="${resetPasswordUrl}">Reset Password</a>
            </div>
        `
    });

    res.json({message: 'Reset password link sent to your email!'});
};

exports.sendResetPasswordTokenStatus = async  (req, res) => {
    res.json({ valid: true })
};

exports.resetPassword = async  (req, res) => {
    const {newPassword, userId} = req.body;
    const user = await User.findById(userId);
    const matched = await user.comparePassword(newPassword);

    if(matched) return sendError(res, 'New password cannot be same as old password');

    user.password = newPassword;
    await user.save();
    await PasswordResetToken.findByIdAndDelete(req.resetToken._id)

    const transport = generateMailTransporter();

    await transport.sendMail({
        from: 'verification@mern-movie-review.com',
        to: user.email,
        subject: 'Password Reset Successfully',
        html: `
            <div style="text-align: center">
                <h1>Password Reset Successfully</h1>
            </div>
        `
    });

    res.json({message: 'Password reset successfully!'});
};

exports.signIn = async (req, res,) => {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if(!user) return sendError(res, 'Email or password not correct', );

    const matched = await user.comparePassword(password);
    if(!matched) return sendError(res, 'Email or password not correct');

    const {_id, name} = user;
    const jwtToken = jwt.sign({userId: _id}, process.env.JWT_SECRET, {expiresIn: '1d'});

    res.json({user: {id: _id}, name, email, token: jwtToken})
};