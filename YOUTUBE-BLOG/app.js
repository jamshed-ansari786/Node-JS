require("dotenv").config();

const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const multer = require("multer");

const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const Blog = require("./models/blog");
const { checkForAuthenticationCookie } = require("./middleware/authentication");

const app = express();
const PORT = Number(process.env.PORT || 8000);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535");
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server Started at PORT: ${PORT}`));
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error);
    process.exitCode = 1;
  });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
});
app.use(express.static(path.join(__dirname, "public")));
app.use(checkForAuthenticationCookie("token"));

app.use((req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

app.get("/", async (req, res) => {
  const blogs = await Blog.find({})
    .populate("createdBy", "fullName")
    .sort({ createdAt: -1 });

  res.render("home", {
    blogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.use((req, res) => {
  res.status(404).send("Page not found.");
});

app.use((error, req, res, next) => {
  console.error(error);

  const status =
    error instanceof multer.MulterError || error.status === 400
      ? 400
      : error.status === 404
        ? 404
        : 500;
  const message =
    status === 400
      ? error.message
      : status === 404
        ? "The requested page or blog was not found."
        : "Something went wrong. Please try again later.";

  res.status(status).send(message);
});
