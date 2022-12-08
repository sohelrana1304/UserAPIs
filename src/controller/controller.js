const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken")
const userModel = require("../model/userModel");
const {
    isValid,
    isValidRequestBody,
    isValidEmail,
    isValidPassword,
    isValidObjectId
} = require("../validation/validator");
const bcrypt = require("bcrypt");
const SECRET_KEY = process.env.SECRET_KEY

const createUser = async function (req, res) {
    try {
        const data = req.body;
        const { firstName, lastName, email, password } = data;

        if (!isValidRequestBody(data)) {
            return res
                .status(400)
                .send({ status: false, msg: "please provide  details" });
        }

        if (!isValid(firstName)) {
            return res
                .status(400)
                .send({
                    status: false,
                    message: "First name is required or not valid",
                });
        }

        const Pattern = /^[a-zA-Z ]*$/;
        if (!(Pattern.test(firstName))) {
            return res.status(400).send({ status: false, msg: "Not a valid format for firstName" })
        }

        if (!isValid(lastName)) {
            return res
                .status(400)
                .send({ status: false, message: "Last name is required or not valid" });
        }

        if (!(Pattern.test(lastName))) {
            return res.status(400).send({ status: false, msg: "Not a valid lastName" })
        }

        if (!isValid(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Email is required or not valid" });
        }

        if (!isValidEmail(email)) {
            return res
                .status(400)
                .send({ status: false, message: "Email is not valid" });
        }

        const checkEmail = await userModel.findOne({ email: email });

        if (checkEmail) {
            return res
                .status(400)
                .send({ status: false, msg: "Email is already exist" });
        }
        if (!isValid(password)) {
            return res
                .status(400)
                .send({ status: false, message: "Password is required or not valid" });
        }

        if (!isValidPassword(password)) {
            return res
                .status(400)
                .send({
                    status: false,
                    message:
                        "Password length should be 8 to 15 digits and enter atleast one uppercase or lowercase",
                });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);
        data.password = hash

        const createUser = await userModel.create(data);


        const option = {
            from: '"Sohel Rana" test@confettisocial.com', // sender address
            to: email, // list of receivers
            subject: "Account creation", // Subject line
            text: "Your account has been created successfully", // plain text body
        }

        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_EMAIL_PASSWORD
            }
        })
        const info = transporter.sendMail(option, (err, success) => {
            if (err) {
                console.log("Error", err)
            } else {
                console.log("Email sent")
            }
        })

        return res
            .status(201)
            .send({ status: true, message: "User created successfully", createUser });

    } catch (err) {
        console.log("This is the error :", err.message);
        res.status(500).send({ msg: "Error", error: err.message });
    }
};


const loginUser = async (req, res) => {
    try {
        const data = req.body

        const { email, password } = data
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Email and password is required to login" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Email is required or not valid" })
        }

        if (!isValidEmail(email)) {
            return res.status(400).send({ status: false, message: "Email is not valid" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Password is required or not valid" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password length should be 8 to 15 digits and enter atleast one uppercase or lowercase" })
        }


        const getUserData = await userModel.findOne({ email: email })
        if (!getUserData) {
            return res.status(401).send({ status: false, msg: "Invalid credentials" })
        }
        const ps = bcrypt.compareSync(password, getUserData.password)  //Sync
        // console.log(ps)
        if (ps == false) {
            return res.status(401).send({ status: false, msg: "Password is wrong" })
        }

        const token = jwt.sign({
            userID: getUserData._id,
        }, SECRET_KEY, { expiresIn: '30d' })

        const option = {
            from: '"Sohel Rana" test@confettisocial.com', // sender address
            to: email, // list of receivers
            subject: "Login Alert", // Subject line
            text: "You are successfully loggedin", // plain text body
        }

        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_EMAIL_PASSWORD
            }
        })
        const info = transporter.sendMail(option, (err, success) => {
            if (err) {
                console.log("Error", err)
            } else {
                console.log("Email sent")
            }
        })


        res.status(200).send({ status: true, message: "User Login succesfully", data: { userId: getUserData._id, token: token } },)

    } catch (err) {
        res.status(500).send({ status: true, Error: err.message })
    }
}


// To update an User
const updateUser = async (req, res) => {
    try {
        const body = req.body

        // Validate params
        const userId = req.params.userId
        console.log(userId)

        if (!isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "User Id is invalid" })
        }

        const userFound = await userModel.findOne({ _id: userId })
        if (!userFound) {
            return res.status(404).send({ status: false, msg: "User does not exist" })
        }

        // AUTHORISATION
        const tokenId = req.userId
        console.log("Token Id",tokenId)
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" })
        };

        // Destructuring
        const { firstName, lastName, email, password } = body;

        const updatedData = {}

        if (firstName) {
            if (!isValid(firstName)) {
                return res.status(400).send({ status: false, msg: "First Name is not valid" })
            }
            const Pattern = /^[a-zA-Z ]*$/;
            if (!(Pattern.test(firstName))) {
                return res.status(400).send({ status: false, msg: "Not a valid format for firstName" })
            }
            updatedData['firstName'] = firstName
        }

        if (lastName) {
            if (!isValid(lastName)) {
                return resstatus(400).send({ status: false, msg: "not valid lastName" })
            }
            const Pattern = /^[a-zA-Z ]*$/;
            if (!(Pattern.test(lastName))) {
                return res.status(400).send({ status: false, msg: "Not a valid lastName" })
            }
            updatedData['lastName'] = lastName
        }

        // Updating of email
        if (isValid(email)) {
            if (!isValidEmail(email)) {
                return res.status(400).send({ status: false, msg: "Invalid email id" })
            }
            // Duplicate email
            const duplicatemail = await userModel.find({ email: email })
            if (duplicatemail.length) {
                return res.status(400).send({ status: false, msg: "Email id is already exist" })
            }
            updatedData['email'] = email
        }

        // Updating of password
        if (password) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: 'password is required' })
            }
            if (!isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 character and max 15 " })
            }
            const encrypt = await bcrypt.hash(password, 10)
            updatedData['password'] = encrypt
        }

        if (!isValidRequestBody(updatedData)) {
            return res.status(400).send({ status: false, msg: "Input some data to update user" })
        }

        const updated = await userModel.findOneAndUpdate({ _id: userId }, updatedData, { new: true })

        const option = {
            from: '"Sohel Rana" test@confettisocial.com', // sender address
            to: userFound.email, // list of receivers
            subject: "Account details update", // Subject line
            text: "Your account details has been updated successfully", // plain text body
        }

        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_EMAIL_PASSWORD
            }
        })
        const info = transporter.sendMail(option, (err, success) => {
            if (err) {
                console.log("Error", err)
            } else {
                console.log("Email sent")
            }
        })

        return res.status(201).send({ status: true, message: "User updated successfully", data: updated })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ message: err.message });
    };
}

// To remove an User
const removeUser = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!isValidObjectId(userId)) {
            return res.status(404).send({ status: false, message: "User id is not valid" })
        }
        
        // AUTHORISATION
        const tokenId = req.userId
        if (!(userId == tokenId)) {
            return res.status(401).send({ status: false, message: "Unauthorized access! Owner info doesn't match" })
        };
        
        const removeUser = await userModel.findOneAndUpdate({ _id: userId, isDeleted: false },
            { $set: { isDeleted: true, deletedAt: new Date() } })

        if (removeUser == null) {
            return res.status(404).send({ status: false, message: "User is already removed or not exist" })
        }

        const option = {
            from: '"Sohel Rana" test@confettisocial.com', // sender address
            to: removeUser.email, // list of receivers
            subject: "Account Deletation", // Subject line
            text: "Your account has been removed successfully", // plain text body
        }

        const transporter = nodemailer.createTransport({
            host: process.env.HOST,
            port: process.env.SMTP_PORT,
            secure: true,
            auth: {
                user: process.env.SENDER_EMAIL,
                pass: process.env.SENDER_EMAIL_PASSWORD
            }
        })
        const info = transporter.sendMail(option, (err, success) => {
            if (err) {
                console.log("Error", err)
            } else {
                console.log("Email sent")
            }
        })

        return res.status(200).send({ status: true, message: "User has been removed successfully" })

    }
    catch (err) {
        console.log("This is the error :", err.message)
        res.status(500).send({ msg: "Error", error: err.message })
    }
}


module.exports = { createUser, loginUser, updateUser, removeUser}
