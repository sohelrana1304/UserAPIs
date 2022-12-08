const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Authentication
const userAuth = async function (req, res, next) {
  try {
    // Taking token from header
    const token = req.header("x-api-key");

    // If token is not present then is response message will displayed.
    if (token == undefined) {
      return res
        .status(403)
        .send({
          status: false,
          message: "Missing authentication token in request",
        });
    }

    // Varifing token
    const verifyToken = jwt.verify(token, SECRET_KEY, (err, decode) => {
      if (err) {
        return res.status(500).send({ msg: err });
      } else {
        req.userId = decode.userID;
        next();
      }
    });
  } catch (err) {
    console.log("This is the error :", err.message);
    res.status(500).send({ msg: "Error", error: err.message });
  }
};

// Exporting function
module.exports = { userAuth };
