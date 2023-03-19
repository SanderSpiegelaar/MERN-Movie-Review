const PasswordResetToken = require('../models/passwordResetToken');
const {sendError} = require("../utils/helper");
const {isValidObjectId} = require("mongoose");

exports.verifyPasswordResetToken = async (req, res, next) => {
    const { token, userId } = req.body;

    if(!token.trim() || !isValidObjectId(userId)) return sendError(res, "Unauthorized access, invalid request!")

    const resetToken = await PasswordResetToken.findOne({ owner: userId} );
    if(!resetToken) return sendError(res, "Invalid token!");

    const matched = await resetToken.compareToken(token);
    if(!matched) return sendError(res, "Invalid token!");

    req.resetToken = resetToken;

    next();
};