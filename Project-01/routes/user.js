const express = require("express");
const {
  handleGetAllUsers,
  handlegetUserBy,
  handleUpdateUSerById,
  handleDeleteUserById,
  handleCreateNewUser,
} = require("../controllers/user");

const router = express.Router();

router.route("/").get(handleGetAllUsers).post(handleCreateNewUser);

router
  .route("/:id")
  .get(handleGetAllUsers)
  .patch(handleUpdateUSerById)
  .delete(handleDeleteUserById);

module.exports = router;
