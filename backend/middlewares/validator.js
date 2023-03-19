const {check, validationResult} = require("express-validator");

exports.userCreateValidator = [
    check('name')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Name is missing!'),

    check('email')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Email is missing!'),

    check('email')
        .normalizeEmail()
        .isEmail()
        .withMessage('Email is invalid!'),

    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is missing!')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long!'),
];

exports.validatePassword = [
    check('password')
        .trim()
        .not()
        .isEmpty()
        .withMessage('Password is missing!')
        .isLength({min: 6})
        .withMessage('Password must be at least 6 characters long!'),
];

exports.validateUser = (req, res, next) => {
    const error = validationResult(req).array();
    if(error.length){
        return res.status(400).json({error: error[0].msg})
    }

    next();
};