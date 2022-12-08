const nodemailer = require("nodemailer");

 // Configuration for send email.
const transporter = nodemailer.createTransport({
    host: process.env.HOST, // host name
    port: process.env.SMTP_PORT, // smtp port no
    secure: true,
    auth: {
        user: process.env.SENDER_EMAIL, // Sender's email id
        pass: process.env.SENDER_EMAIL_PASSWORD, // Sender's email's password
    },
});

module.exports = {transporter}