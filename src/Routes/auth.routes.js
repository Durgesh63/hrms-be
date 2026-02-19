const { Router } = require("express");
const {
  register,
  login,
  logout,
  genrateAccessToken,
  getUserInfo,
} = require("../controller/auth.controllers");
const checkAuthUser = require("../middleware/auth.middleware");

const userrouter = Router();


// public routes
// user register -----
userrouter.route("/register").post(register);

userrouter.route("/login").post(login);

userrouter.route("/user").get(checkAuthUser, getUserInfo);

userrouter.route("/verify-token").post(genrateAccessToken);

// private routes --- auth routes
userrouter.route("/logout").post(checkAuthUser, logout);

module.exports = userrouter;


