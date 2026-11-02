const { createHmac, randomBytes, randomUUID } = require("crypto");

const { Schema, model } = require("mongoose");
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      sparse: true,
      default: randomUUID,
    },
    salt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURL: {
      type: String,
      default: "/images/default.png",
    },
    role: {
      type: String,
      enum: ["USER", "ADMIN"],
      default: "USER",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");
  user.salt = salt;
  user.password = hashedPassword;
  user.password = hashedPassword;
});

userSchema.static(
  "matchPasswordAndGenerateToken",
  async function (email, password) {
    const user = await this.findOne({ email });
    if (!user) {
      const error = new Error("Incorrect email or password.");
      error.status = 401;
      throw error;
    }
    const salt = user.salt;
    const hashedPassword = user.password;

    const userProvidedHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== userProvidedHash) {
      const error = new Error("Incorrect email or password.");
      error.status = 401;
      throw error;
    }

    const token = createTokenForUser(user);
    return token;
  },
);

const User = model("user", userSchema);

module.exports = User;
