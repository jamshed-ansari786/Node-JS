require("dotenv").config();

const JWT = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

if (!secret) {
  throw new Error("JWT_SECRET must be set in the environment");
}

function createTokenForUser(user) {
  const payload = {
    _id: user._id,
    email: user.email,
    fullName: user.fullName,
    profileImageURL: user.profileImageURL,
    role: user.role,
  };
  const token = JWT.sign(payload, secret, { expiresIn: "1d" });
  return token;
}

function validateToken(token) {
  const payload = JWT.verify(token, secret);
  return payload;
}

module.exports = {
  createTokenForUser,
  validateToken,
};
