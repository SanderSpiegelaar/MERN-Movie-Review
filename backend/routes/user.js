const express = require('express');
const {create} = require("../controllers/user");
const {userCreateValidator, validateUser} = require("../middlewares/validator");

const router = express.Router();

router.post('/create', userCreateValidator, validateUser, create);

module.exports = router;