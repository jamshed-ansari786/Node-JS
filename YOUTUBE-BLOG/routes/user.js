const { Router } = require("express");
const User = require("../models/user");

const router = Router();

router.get("/signin", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("signin");
});

router.get("/signup", (req, res) => {
  if (req.user) return res.redirect("/");
  return res.render("signup");
});

router.post("/signin", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).render("signin", {
        error: "Enter your email and password.",
      });
    }
    const token = await User.matchPasswordAndGenerateToken(
      email.trim().toLowerCase(),
      password,
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .redirect("/");
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).render("signin", {
        error: "Incorrect email or password.",
      });
    }
    return next(error);
  }
});

router.post("/signup", async (req, res, next) => {
  const { fullName, email, password } = req.body;

  if (
    typeof fullName !== "string" ||
    !fullName.trim() ||
    fullName.trim().length > 100 ||
    typeof email !== "string" ||
    !email.trim() ||
    email.trim().length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 128
  ) {
    return res.status(400).render("signup", {
      error: "Enter your name, a valid email, and a password between 8 and 128 characters.",
    });
  }

  try {
    await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });

    return res.redirect("/user/signin");
  } catch (error) {
    if (error.code === 11000 || error.name === "ValidationError") {
      return res.status(400).render("signup", {
        error: "Email already registered or invalid signup data.",
      });
    }
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  return res
    .clearCookie("token", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
    .redirect("/");
});

module.exports = router;
