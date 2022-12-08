const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const route = require("./routes/route");

const app = express();
app.use(express.json());

// Connecting with MongoDB Database
mongoose
  .connect(process.env.MONGODB_URL, { useNewUrlParser: true })
  .then(() => console.log("MongoDB is connected."))
  .catch((err) => console.log(err));

app.use("/", route);

app.listen(process.env.PORT || 4000, () => {
  console.log("Express app running on port", process.env.PORT || 4000);
});
