const express = require('express');
const userRouter = require('./routes/user');
const server = express();
const morgan = require('morgan');

require('dotenv').config();
require('./db/connectDB');
require('express-async-errors');
const {errorHandler} = require("./middlewares/error");

server.use(express.json());
server.use(morgan('dev'));
server.use('/api/user', userRouter);
server.use(errorHandler);

server.listen(3001, () => {
  console.log('Server is running on port 3001 test');
});