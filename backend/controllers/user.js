const User = require('../models/user');

exports.create = async (req, res) => {
    const {name, email, password} = req.body;
    const existingUser = await User.findOne({email});

    if(existingUser) return res.status(401).json({error: 'Email already exists!'});

    const newUser = new User ({name, email, password});

    await newUser.save();

   // var transport = nodemailer.createTransport({
   //     host: "sandbox.smtp.mailtrap.io",
   //     port: 2525,
   //     auth: {
   //         user: "b245bd127455a7",
   //         pass: "ecfe40d808c7fe"
   //     }
    //});

    res.status(201).json({user: newUser})
};