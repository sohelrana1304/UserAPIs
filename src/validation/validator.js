const mongoose = require("mongoose");

// Input validation
const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

// Request body validation
const isValidRequestBody = function (requestBody) {
  return Object.keys(requestBody).length > 0;
};

// Mongodb object id validation
const isValidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};


// Email id validation
const isValidEmail = function (value) {
  const mailFormat = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  // Checking if the inputted email id perfectely formatted or not
  if (!value.match(mailFormat)) return false;
  return true;
};


// Password validation
const isValidPassword = function (value) {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
  if (!value.match(passwordPattern)) return false;
  return true;
};




// Exporting functions
module.exports = {
  isValid,
  isValidRequestBody,
  isValidObjectId,
  isValidEmail,
  isValidPassword,
};
