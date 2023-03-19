const User = require('../models/user');
const EmailVerificationToken = require('../models/emailVerificationToken');
const nodeMailer = require('nodemailer');
const {isValidObjectId} = require("mongoose");
const {generateOTP, generateMailTransporter} = require("../utils/mail");
const {sendError} = require("../utils/helper");

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