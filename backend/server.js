const express = require('express');
const userRouter = require('./routes/user');

const server = express();

server.use(userRouter);

server.listen(3000, () => {
  console.log('Server is running on port 3000 test');
});