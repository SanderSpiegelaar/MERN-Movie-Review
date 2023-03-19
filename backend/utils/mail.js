const nodeMailer = require('nodemailer');

exports.generateOTP = (otp_length = 6) => {
    let OTP = '';
    for(let i = 1; i <= otp_length; i++) {
        const randomVal = Math.round(Math.random() * 9);
        OTP += randomVal;
    };
    return OTP;
};

exports.generateMailTransporter = () => nodeMailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
        user: "b245bd127455a7",
        pass: "ecfe40d808c7fe"
    }
});