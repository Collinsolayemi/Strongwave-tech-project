import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import mongoose from "mongoose";

import users from "./routes/users.js";
import admin from "./routes/admin.js";

const app = express();
dotenv.config();

//body parser
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: false }));

// configure mongodb connection: connect to mongodb atlas
const uri = process.env.ATLAS_URI;
const port = process.env.PORT || 4001;

//allows servers to specify not only who can access the assets, but also how they can be accessed
app.use(
  cors({
    origin: "*", // restrict calls to those this address
    credentials: true,
    methods: "GET,PUT,PATCH,POST,DELETE",
  })
);

app.use(helmet());

app.get("/", (req, res) => res.send("APP is running!"));

app.use("/api/users", users);
app.use("/api/admin", admin);

//mongoose connection
mongoose.connect(
  "mongodb+srv://collinsolayemi1995:Babasturborn@cluster0.ojjvmrc.mongodb.net/madilla?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB Database connection established successfully");
  //setup server
  app.listen(port, () => {
    console.log(`Madilas Market is running on port ${port}`);
  });
});
