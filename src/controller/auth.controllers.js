const { OPTIONS, REFRESH_TOKEN_SECRET } = require("../constant");
const { RefreshToken } = require("../models/refreshToken.models");
const { User } = require("../models/user.models");
const ApiError = require("../utils/ApiError");
const { ApiResponse } = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const { checkVaoidEmail} = require("../utils/utils");
const jwt = require("jsonwebtoken");


// @desc Register
// @access Public
const register = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  // check user is valid input
  if (
    [email, password].some(
      (field) => field?.trim() === ""
    ) ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // check user is exits
  const users = new User();
  const isUserExist = await users.isUserExist(email);
  if (isUserExist) {
    throw new ApiError(409, "Another User already associated with this email.");
  }
 
  // create user and save
  const user = new User({
    email,
    password,
  });

  const createdUser = await user.save();
  // remove value from user object before sending response
  createdUser.password = undefined;

  

  res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered Successfully"));
});


// @desc Login
// @access Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // check user is valid input
  if (
    [email, password].some((field) => field?.trim() === "") ||
    !checkVaoidEmail(email)
  ) {
    throw new ApiError(400, "Please provide valid inputs");
  }

  // check user is exits
  const users = await User.findOne({ email: email });

  if (!users) {
    throw new ApiError(400, "Wrong username or password. Please try again");
  }
  // compare given password and hashed password
  const matchPassword = await users.isPasswordCorrect(password);
  if (!matchPassword) {
    throw new ApiError(401, "Wrong username or password. Please try again");
  }

  

  users.password = undefined;
 

  // genrate refresh & access_token
  const accessToken = await users.createAccessToken();
  const refreshToken = await users.createRefreshToken();

  if (!accessToken && !refreshToken) {
    throw new ApiError(400, "Something went wrong Please try again.");
  }
  res
    .status(200)
    .send(
      new ApiResponse(
        200,
        { accessToken, users },
        "User logged in successfully"
      )
    );
});



// @desc genrate access token from  refress token
// @access Public
const genrateAccessToken = asyncHandler(async (req, res) => {
  const { accessToken } = req.body;
  if (!accessToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const decodedToken = jwt.decode(accessToken, REFRESH_TOKEN_SECRET);

  if (!decodedToken) {
    throw new ApiError(401, "Unauthorized request");
  }
  const refreshTokenInstances = new RefreshToken();
  const isRefreshToken = await refreshTokenInstances.getRefreshToken(
    decodedToken._id
  );
  if (!isRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  const user = await User.findById(decodedToken._id);
  const newAccessToken = await user.createAccessToken();

  if (!newAccessToken) {
    throw new ApiError(500, "Something went wrong in token generation.");
  }
  res
    .status(200)
    .send(
      new ApiResponse(
        200,
        { newAccessToken},
        "Access token generated successfully."
      )
    );
});

// @desc logout
// @access Private
const logout = asyncHandler(async (req, res) => {
  const { _id, token_id } = req.auth;
  // revoke the tokens
  const refreshTokenInstances = new RefreshToken();
  await refreshTokenInstances.deleteToken(token_id);
  res
    .status(200)
    .send(
      new ApiResponse(200, {}, `Logged out from all devices Successfully.`)
    );
});


//@desc Returning current logged in user
//@access Private
const getUserInfo = asyncHandler(async (req, res) => {
  const userID = req.auth?._id;
  if (!userID) {
    throw new ApiError(400, "userID not find");
  }

  const user = await User.findById(userID);
  if (!user) {
    throw new ApiError(409, "user not found.");
  }

  res.status(200).json(new ApiResponse(200, user, "USer Update Successfully"));
});


module.exports = {
  register,
  login,
  logout,
  genrateAccessToken,
  getUserInfo,
 
};
