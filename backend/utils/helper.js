const crypto = require('crypto');

exports.sendError = (res, error, statusCode = 401) => {
    res.status(statusCode).json({error});
};

exports.generateRandomByte = () => {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(32, async (err, buffer) => {
            if(err) reject(err);
            const buffString = buffer.toString('hex');

            console.log(buffString);
            resolve(buffString);
        });
    });
};