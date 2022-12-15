const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const route = require("./routes/route");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connecting with MongoDB Database
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => console.log("MongoDB is connected."))
  .catch((err) => console.log(err));

app.use("/", route);

// Handeling route error
app.use(async (req, res, next) => {
  const error = new Error("This route is not exist.");
  error.status = 404;
  next(error);
});
app.use((err, req, res, next) => {
  res
    .status(err.status || 500)
    .send({ error: {message: err.message } });
});

app.listen(process.env.PORT || 4000, () => {
  console.log("Express app running on port", process.env.PORT || 4000);
});
