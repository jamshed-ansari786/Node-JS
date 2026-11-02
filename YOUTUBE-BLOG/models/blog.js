const { Schema, model } = require("mongoose");

const replySchema = new Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);

const commentSchema = new Schema(
  {
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true },
);

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 160,
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100000,
    },
    coverImageURL: {
      type: String,
      required: false,
    },
    coverImageDescription: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    comments: {
      type: [commentSchema],
      default: [],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
  },
  { timestamps: true },
);

const Blog = model("blog", blogSchema);

module.exports = Blog;
