const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY


const userAuth = async function (req, res, next) {
    try {
        let token = req.header('x-api-key')
        // console.log("Token", token)
        if (!token) {
            return res.status(403).send({ status: false, message: "Missing authentication token in request" })
        }

        const verifyToken = jwt.verify(token, SECRET_KEY, (err, decode) => {
            if (err) {
                return res.status(500).send({ msg: err })
            } else {
                req.userId = decode.userID
                console.log("x",decode.userID)
                next()
            }
        })
        console.log("Decoded", verifyToken)
    } catch (err) {
        console.log(err)
    }
}

module.exports = { userAuth }