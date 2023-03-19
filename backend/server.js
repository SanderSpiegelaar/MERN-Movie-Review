const express = require('express');
const userRouter = require('./routes/user');
const server = express();

require('./db/connectDB');

server.use(express.json());
server.use('/api/user', userRouter);

server.listen(3000, () => {
  console.log('Server is running on port 3000 test');
});