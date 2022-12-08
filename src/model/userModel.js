const mongoose = require('mongoose')

// User Schema
const userModel = new mongoose.Schema({

    firstName: { type: String, required: true },

    lastName: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String, required: true},

    isDeleted: { type: Boolean, default: false },

    deletedAt: { type: Date, default: null },

}, { timestamps: true })


// Exporting this User Model
module.exports = mongoose.model('User', userModel)