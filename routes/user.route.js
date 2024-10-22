const express = require("express");
const { signupUser, loginUser } = require("../controllers/user.controller");

const userRouter = express.Router();

userRouter.post("/signup", signupUser);
userRouter.post("/login", loginUser);
module.exports = userRouter;