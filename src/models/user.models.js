const mongoose = require("mongoose");
const {
  ACCESS_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_SECRET,
  REFRESH_TOKEN_EXPIRY,
} = require("../constant");
const { RefreshToken } = require("./refreshToken.models");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
   
    email: {
      type: String,
      required: true,
      unique: [true, "Email already in use"],
      index: true,
      trim: true,
    },
    
    password: {
      type: String,
      require: [true, "Password is required"],
    },
   
  },
  { timestamps: true }
);



userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isUserExist = async function (email) {
  return await User.findOne({ email: email });
};

userSchema.methods.createAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
    },
    ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.createRefreshToken = async function () {
  try {
    const refreshTokenInstances = new RefreshToken();
    const isRefreshToken = await refreshTokenInstances.getRefreshToken(
      this._id
    );
    if (isRefreshToken) {
      return isRefreshToken?.refreshToken;
    }

    const jwtrefreshtoken = jwt.sign(
      {
        _id: this._id,
      },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRY,
      }
    );
    const refreshTokenInstance = new RefreshToken({
      refreshToken: jwtrefreshtoken,
      userId: this._id,
    });
    const refreshToken = await refreshTokenInstance.save();
    return refreshToken?.refreshToken;
  } catch (error) {
    throw new ApiError(500, error);
  }
};

const User = mongoose.model("User", userSchema);

module.exports = {
  User,
};
