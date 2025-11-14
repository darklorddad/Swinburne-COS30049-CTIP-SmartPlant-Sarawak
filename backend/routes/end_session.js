const express = require("express");
const router = express.Router();
const sessionMemory = require("../memory/sessionMemory");

router.post("/", (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }

  if (sessionMemory[sessionId]) {
    delete sessionMemory[sessionId];
  }

  return res.json({ message: "Session ended" });
});

module.exports = router;
