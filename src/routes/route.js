const express = require('express');
const router = express.Router();
const { createUser, loginUser, updateUser, removeUser } = require('../controller/controller');
const { userAuth } = require('../middleware/auth');

// To Create an User
router.post("/SignUp", createUser);

// For log in
router.post("/logIn", loginUser)

// For update User's information
router.patch("/user/:userId/profile", userAuth, updateUser)

// To remove User
router.delete("/user/:userId", userAuth, removeUser)





module.exports = router