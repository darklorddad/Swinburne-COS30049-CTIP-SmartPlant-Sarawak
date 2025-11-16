const express = require("express");
const router = express.Router();
const { deleteUser } = require("../controllers/userController");

router.delete("/:uid", deleteUser);

module.exports = router;
