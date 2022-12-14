const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../model/userModel");
const {
  isValid,
  isValidRequestBody,
  isValidEmail,
  isValidPassword,
  isValidObjectId,
} = require("../validation/validator");
const { transporter } = require("./emailConfig");
const SECRET_KEY = process.env.SECRET_KEY;

// To add a new User in Database
const createUser = async function (req, res) {
  try {
    // Taking data from request body
    const data = req.body;
    const { firstName, lastName, email, password } = data;

    // Request body validation
    if (!isValidRequestBody(data)) {
      return res
        .status(400)
        .send({ status: false, msg: "Please provide details to register yourself." });
    }

    // Regex for taking input only Character
    const Pattern = /^[a-zA-Z]*$/;

    // First name validation
    if ((!isValid(firstName)) || (!Pattern.test(firstName))) {
      return res
        .status(400)
        .send({ status: false, msg: "First name is not valid." });
    }

    // Last name validation
    if ((!isValid(lastName)) || (!Pattern.test(lastName))) {
      return res
        .status(400)
        .send({ status: false, message: "Last name is not valid." });
    }

    // Email validation
    if ( (!isValid(email)) || (!isValidEmail(email))) {
      return res
        .status(400)
        .send({ status: false, message: "Email id is not valid." });
    }

    // Checking email from database for uniqueness
    const checkEmail = await userModel.findOne({ email: email });
    if (checkEmail) {
      return res
        .status(400)
        .send({ status: false, msg: "Email id is already registered." });
    }

    // Password validation
    if ((!isValid(password)) || (!isValidPassword(password))) {
      return res.status(400).send({
        status: false,
        message:
          "Password length should be atleast 8 digits and enter atleast one uppercase, one lowercase and one special character.",
      });
    }

    // Hashing passwaord
    const hashPassword = await bcrypt.hash(password, 10);
    data.password = hashPassword;

    // Adding a new user in Database
    const createUser = await userModel.create(data);

    // Configuration for send email after creating new User.
    // Email template
    const option = {
      from: process.env.FROM, // sender address
      to: email, // list of receivers
      subject: "Account creation", // Subject line
      text: "Your account has been created successfully.", // plain text body
    };

    if (createUser) {
      // Sending email
      const info = transporter.sendMail(option, (err, success) => {
        if (err) {
          console.log("Error :", err.message);
        } else {
          console.log("Email sent");
        }
      });
    }

    // Sending response
    return res
      .status(201)
      .send({ status: true, message: "User created successfully", createUser });
  } catch (err) {
    console.log("Error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

// For log in
const loginUser = async (req, res) => {
  try {
    // Taking data from request body
    const data = req.body;
    const { email, password } = data;

    // Checking request body empty or not
    if (!isValidRequestBody(data)) {
      return res.status(400).send({
        status: false,
        msg: "Email and password is required to login",
      });
    }

    // Email validating
    if ((!isValid(email)) || (!isValidEmail(email))) {
      return res
        .status(400)
        .send({ status: false, message: "Email id is not valid." });
    }

    // Password validating
    if (!isValid(password)) {
      return res
        .status(400)
        .send({ status: false, message: "Password is required." });
    }

    // Checking email from database to check it is existed or not.
    const getUserData = await userModel.findOne({ email: email });

    // Comparing password
    const comparePassword = await bcrypt.compare(password, getUserData.password);

    if (!getUserData || !comparePassword) {
      return res
        .status(401)
        .send({ status: false, msg: "Email id or Password does not match" });
    }

    // Generating a JWT token
    const token = jwt.sign(
      {
        userID: getUserData._id,
      },
      SECRET_KEY,
      { expiresIn: "2d" }
    );

    // Configuration for send email after successfull login by a User.
    // Email template
    const option = {
      from: process.env.FROM, // sender address
      to: email, // list of receivers
      subject: "Login Alert", // Subject line
      text: "You are successfully loggedin.", // plain text body
    };
    if (getUserData && comparePassword && token) {
      // Sending email
      const info = transporter.sendMail(option, (err, success) => {
        if (err) {
          console.log("Error :", err.message);
        } else {
          console.log("Email sent");
        }
      });
    }

    // Sending response data
    return res.status(200).send({
      status: true,
      message: "User Login succesfully",
      data: { userId: getUserData._id, token: token },
    });
  } catch (err) {
    console.log("Error :", err.message);
    res.status(500).send({ status: true, Error: err.message });
  }
};

// To update an User
const updateUser = async (req, res) => {
  try {
    // Taking data from request body
    const body = req.body;

    // Taking User Id from params
    const userId = req.params.userId;

    // Validate user id from params
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, msg: "User Id is invalid." });
    }

    // Checking email from database to check it is exist or not
    const userFound = await userModel.findOne({ _id: userId });
    if (!userFound) {
      return res
        .status(404)
        .send({ status: false, msg: "User does not exist." });
    }

    // Authorization
    const tokenId = req.userId;
    if (!(userId == tokenId)) {
      return res.status(401).send({
        status: false,
        message: "Unauthorized access! Owner info doesn't match.",
      });
    }

    // Destructuring
    const { firstName, lastName, email, password } = body;

    const updatedData = {};

    const Pattern = /^[a-zA-Z]*$/;

    // Updating First name according to User Input
    if (firstName) {
      if (!Pattern.test(firstName)) {
        return res
          .status(400)
          .send({ status: false, msg: "First Name is not valid." });
      }
      updatedData["firstName"] = firstName;
    }

    // Updating Last name according to User Input
    if (lastName) {
      if (!Pattern.test(lastName)) {
        return res
          .status(400)
          .send({ status: false, msg: "Last Name is not valid." });
      }
      updatedData["lastName"] = lastName;
    }

    // Updating email according to User Input
    if (isValid(email)) {
      if (!isValidEmail(email)) {
        return res.status(400).send({ status: false, msg: "Invalid email id." });
      }
      // Duplicate email
      const duplicatemail = await userModel.find({ email: email });
      if (duplicatemail.length) {
        return res
          .status(400)
          .send({ status: false, msg: "Email id is already registered." });
      }
      updatedData["email"] = email;
    }

    // Updating password according to User Input
    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).send({
          status: false,
          message: "Password length should be atleast 8 digits and enter atleast one uppercase, one lowercase and one special character.",
        });
      }
      // Encrypting password
      const encrypt = await bcrypt.hash(password, 10);
      updatedData["password"] = encrypt;
    }

    // If no input is given for update
    if (!isValidRequestBody(updatedData)) {
      return res
        .status(400)
        .send({ status: false, msg: "Input some data to update your profile." });
    }

    // After validating all the input new data will be updated in Database
    const updated = await userModel.findOneAndUpdate(
      { _id: userId }, updatedData, { new: true }
    );

    // Configuration for send email after updating a new User
    // Email template
    const option = {
      from: process.env.FROM, // sender address
      to: email, // list of receivers
      subject: "Account details update", // Subject line
      text: "Your account details has been updated successfully.", // plain text body
    };
    if (updated) {
      // Sending email
      const info = transporter.sendMail(option, (err, success) => {
        if (err) {
          console.log("Error :", err.message);
        } else {
          console.log("Email sent");
        }
      });
    }

    // Sending response
    return res.status(201).send({
      status: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (err) {
    console.log("Error :", err.message);
    return res.status(500).send({ message: err.message });
  }
};

// To remove an User
const removeUser = async function (req, res) {
  try {
    // Taking user id from params
    const userId = req.params.userId;

    if (!isValidObjectId(userId)) {
      return res
        .status(404)
        .send({ status: false, message: "User id is not valid." });
    }

    // Authorization
    const tokenId = req.userId;
    if (!(userId == tokenId)) {
      return res.status(401).send({
        status: false,
        message: "Unauthorized access! Owner info doesn't match.",
      });
    }

    // Removing an user from Database
    const removeUser = await userModel.findOneAndUpdate(
      { _id: userId, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    if (removeUser == null) {
      return res.status(404).send({
        status: false,
        message: "User is already removed or not exist.",
      });
    }

    // Configuration for send email after removing a User.
    // Email template
    const option = {
      from: process.env.FROM, // sender address
      to: removeUser.email, // list of receivers
      subject: "Account Deletation", // Subject line
      text: "Your account has been removed successfully.", // plain text body
    };
    if (removeUser) {
      // Sending email
      const info = transporter.sendMail(option, (err, success) => {
        if (err) {
          console.log("Error :", err.message);
        } else {
          console.log("Email sent");
        }
      });
    }

    // Sending response
    return res
      .status(200)
      .send({ status: true, message: "User has been removed successfully." });
  } catch (err) {
    console.log("Error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

// Exporting functions
module.exports = { createUser, loginUser, updateUser, removeUser };
