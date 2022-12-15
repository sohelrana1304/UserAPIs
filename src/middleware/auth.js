const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Authentication
const userAuth = async function (req, res, next) {
  try {
    // Taking token from header
    const authHeader = req.headers["authorization"];
    
    // If token is not present then is response message will displayed.
    if (authHeader == undefined) {
      return res
        .status(401)
        .send({
          status: false,
          message: "User is Unauthorized",
        });
    }

    const bearerToken = authHeader.split(" ")
    const token = bearerToken[1]

    // Varifing token
    const verifyToken = jwt.verify(token, SECRET_KEY, (err, decode) => {
      if (err) {
        if(err.name  === "JsonWebTokenError"){
          return res.status(401).send({ msg: "User is Unauthorized" });
        }else{
          return res.status(401).send({ msg: err.message });
        }
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
