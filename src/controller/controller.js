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

        if (!isValid(lastName)) {
            return res
                .status(400)
                .send({ status: false, message: "Last name is required or not valid" });
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
        }, "userLogin", { expiresIn: '30d' })

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


// To fetch a user's details
const fetchUser = async (req, res) => {
    try {
        let userId = req.params.userId

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: "userId is not valid" });

        let checkData = await userModel.findById({ _id: userId });
        if (!checkData) return res.status(404).send({ status: false, msg: "There is no user exist with this id" });

        // let tokenId = req.userId
        // if (!(userId == tokenId)) return res.status(401).send({ status: false, message: `Unauthorized access! Owner info doesn't match` });

        return res.status(200).send({ status: true, message: 'User profile details', data: checkData });
    }
    catch (err) {
        //console.log(err)
        return res.status(500).send({ status: false, msg: err.message });
    }
}


module.exports = { createUser, loginUser, fetchUser }
