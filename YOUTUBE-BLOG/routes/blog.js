const { Router } = require("express");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const mongoose = require("mongoose");
const Blog = require("../models/blog");
const { requireAuthentication } = require("../middleware/authentication");

const router = Router();

const uploadDirectory = path.resolve(__dirname, "../public/uploads");
const imageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

fs.mkdirSync(uploadDirectory, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      callback(null, `${crypto.randomUUID()}${imageExtensions.get(file.mimetype)}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (imageExtensions.has(file.mimetype)) return callback(null, true);
    const error = new Error("Cover image must be a JPEG, PNG, WebP, or GIF image.");
    error.status = 400;
    return callback(error);
  },
});

function isValidBlogId(id) {
  return mongoose.isValidObjectId(id);
}

async function findBlog(id) {
  if (!isValidBlogId(id)) return null;
  return Blog.findById(id)
    .populate("createdBy", "fullName")
    .populate("comments.createdBy", "fullName")
    .populate("comments.replies.createdBy", "fullName");
}

function ownsBlog(blog, user) {
  return blog.createdBy && String(blog.createdBy._id || blog.createdBy) === String(user._id);
}

function ownsComment(comment, user) {
  return comment.createdBy &&
    String(comment.createdBy._id || comment.createdBy) === String(user._id);
}

function ownsReply(reply, user) {
  return reply.createdBy &&
    String(reply.createdBy._id || reply.createdBy) === String(user._id);
}

function canModerateBlog(blog, user) {
  return user.role === "ADMIN" || ownsBlog(blog, user);
}

function validBlogContent(title, body) {
  return typeof title === "string" &&
    title.trim().length > 0 &&
    title.trim().length <= 160 &&
    typeof body === "string" &&
    body.trim().length > 0 &&
    body.trim().length <= 100000;
}

function validImageDescription(description) {
  return description === undefined ||
    (typeof description === "string" && description.trim().length <= 500);
}

router.get("/add-new", requireAuthentication, (req, res) => {
  return res.render("addBlog");
});

router.post(
  "/add-new",
  requireAuthentication,
  upload.single("coverImage"),
  async (req, res, next) => {
    if (
      !validBlogContent(req.body.title, req.body.body) ||
      !validImageDescription(req.body.coverImageDescription)
    ) {
      return res.status(400).render("addBlog", {
        error: "Enter a title, a blog body, and an image description of no more than 500 characters.",
      });
    }

    try {
      await Blog.create({
        title: req.body.title.trim(),
        body: req.body.body.trim(),
        coverImageURL: req.file ? `/uploads/${req.file.filename}` : undefined,
        coverImageDescription: (req.body.coverImageDescription || "").trim(),
        createdBy: req.user._id,
      });

      return res.redirect("/");
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/:id/edit", requireAuthentication, async (req, res, next) => {
  try {
    const blog = await findBlog(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");
    if (!ownsBlog(blog, req.user)) return res.sendStatus(403);

    return res.render("editBlog", { blog });
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/:id/edit",
  requireAuthentication,
  upload.single("coverImage"),
  async (req, res, next) => {
    try {
      const blog = await findBlog(req.params.id);
      if (!blog) return res.status(404).send("Blog not found.");
      if (!ownsBlog(blog, req.user)) return res.sendStatus(403);

      if (
        !validBlogContent(req.body.title, req.body.body) ||
        !validImageDescription(req.body.coverImageDescription)
      ) {
        return res.status(400).render("editBlog", {
          blog,
          error: "Enter a title, a blog body, and an image description of no more than 500 characters.",
        });
      }

      blog.title = req.body.title.trim();
      blog.body = req.body.body.trim();
      blog.coverImageDescription = (req.body.coverImageDescription || "").trim();
      if (req.file) blog.coverImageURL = `/uploads/${req.file.filename}`;
      await blog.save();

      return res.redirect(`/blog/${blog._id}`);
    } catch (error) {
      return next(error);
    }
  },
);

router.post("/:id/delete", requireAuthentication, async (req, res, next) => {
  try {
    const blog = await findBlog(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");
    if (!ownsBlog(blog, req.user)) return res.sendStatus(403);

    await blog.deleteOne();
    return res.redirect("/");
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/comments", requireAuthentication, async (req, res, next) => {
  try {
    const blog = await findBlog(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");

    const body = req.body.body;
    if (typeof body !== "string" || !body.trim() || body.trim().length > 3000) {
      return res.status(400).render("blog", {
        blog,
        error: "A comment is required and must be no more than 3,000 characters.",
      });
    }

    blog.comments.push({
      body: body.trim(),
      createdBy: req.user._id,
    });
    await blog.save();

    return res.redirect(`/blog/${blog._id}#comments`);
  } catch (error) {
    return next(error);
  }
});

router.post(
  "/:id/comments/:commentId/replies",
  requireAuthentication,
  async (req, res, next) => {
    try {
      const blog = await findBlog(req.params.id);
      if (!blog) return res.status(404).send("Blog not found.");
      if (!mongoose.isValidObjectId(req.params.commentId)) {
        return res.status(404).send("Comment not found.");
      }

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).send("Comment not found.");

      const body = req.body.body;
      if (typeof body !== "string" || !body.trim() || body.trim().length > 3000) {
        return res.status(400).render("blog", {
          blog,
          error: "A reply is required and must be no more than 3,000 characters.",
        });
      }

      comment.replies.push({
        body: body.trim(),
        createdBy: req.user._id,
      });
      await blog.save();

      return res.redirect(`/blog/${blog._id}#comment-${comment._id}`);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/:id/comments/:commentId/delete",
  requireAuthentication,
  async (req, res, next) => {
    try {
      const blog = await findBlog(req.params.id);
      if (!blog) return res.status(404).send("Blog not found.");
      if (!mongoose.isValidObjectId(req.params.commentId)) {
        return res.status(404).send("Comment not found.");
      }

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).send("Comment not found.");
      if (!ownsComment(comment, req.user) && !canModerateBlog(blog, req.user)) {
        return res.sendStatus(403);
      }

      blog.comments.pull({ _id: comment._id });
      await blog.save();

      return res.redirect(`/blog/${blog._id}#comments`);
    } catch (error) {
      return next(error);
    }
  },
);

router.post(
  "/:id/comments/:commentId/replies/:replyId/delete",
  requireAuthentication,
  async (req, res, next) => {
    try {
      const blog = await findBlog(req.params.id);
      if (!blog) return res.status(404).send("Blog not found.");
      if (
        !mongoose.isValidObjectId(req.params.commentId) ||
        !mongoose.isValidObjectId(req.params.replyId)
      ) {
        return res.status(404).send("Reply not found.");
      }

      const comment = blog.comments.id(req.params.commentId);
      if (!comment) return res.status(404).send("Comment not found.");

      const reply = comment.replies.id(req.params.replyId);
      if (!reply) return res.status(404).send("Reply not found.");
      if (
        !ownsReply(reply, req.user) &&
        !ownsComment(comment, req.user) &&
        !canModerateBlog(blog, req.user)
      ) {
        return res.sendStatus(403);
      }

      comment.replies.pull({ _id: reply._id });
      await blog.save();

      return res.redirect(`/blog/${blog._id}#comment-${comment._id}`);
    } catch (error) {
      return next(error);
    }
  },
);

router.get("/:id", async (req, res, next) => {
  try {
    const blog = await findBlog(req.params.id);
    if (!blog) return res.status(404).send("Blog not found.");

    return res.render("blog", { blog });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
