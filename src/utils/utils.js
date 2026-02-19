const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { ACCESS_TOKEN_SECRET } = require("../constant");

const checkVaoidEmail = (email) => {
  const re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const isValidPassowrd = async (password, dbPassword) => {
  return await bcrypt.compare(password, dbPassword);
};


const verifyAccessToken = (token) => {
  try {
    const data = jwt.verify(token, ACCESS_TOKEN_SECRET);
    return { success: true, data: data };
  } catch (error) {
    return { success: false };
  }
};
module.exports = {
  checkVaoidEmail,
  isValidPassowrd,
  verifyAccessToken
};
