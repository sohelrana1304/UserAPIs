const mongoose = require('mongoose')


const userModel = new mongoose.Schema({

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true},

    isDeleted: { type: Boolean, default: false }

}, { timestamps: true })

module.exports = mongoose.model('User', userModel)