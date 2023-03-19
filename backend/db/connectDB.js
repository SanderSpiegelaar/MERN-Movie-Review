const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/mern-movie').then(() => {
    console.log('Database connected successfully');
}).catch((err) => {
    console.log('Database connection failed: ', err);
});