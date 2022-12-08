const mongoose = require('mongoose')

const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidRequestBody = function (requestBody) {
    return Object.keys(requestBody).length > 0
}

const isValidObjectId = function (objectId) {
    return mongoose.Types.ObjectId.isValid(objectId)
}


const isValidEmail = function (value) {
    let mailFormat = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/
    // Checking if the inputted email id perfectely formatted or not
    if (!(value.match(mailFormat))) return false
    return true

}

const isValidPassword = function (value) {
    let passwordPattern = /^[a-zA-Z0-9!@#$%&*]{8,15}$/;
    if (!(passwordPattern.test(value))) return false
    return true
}

module.exports = {isValid, isValidRequestBody, isValidObjectId, isValidEmail, isValidPassword}