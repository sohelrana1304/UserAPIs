const express = require('express');
const { createUser, loginUser } = require('../controller/controller');
const router = express.Router();

router.post("/SignUp", createUser);

router.post("/logIn", loginUser)





module.exports = router