const express = require('express');
const { createUser, loginUser, updateUser, removeUser } = require('../controller/controller');
const { userAuth } = require('../middleware/auth');
const router = express.Router();

router.post("/SignUp", createUser);

router.get("/logIn", loginUser)

router.put("/user/:userId/profile", userAuth, updateUser)

router.delete("/user/:userId", userAuth, removeUser)





module.exports = router