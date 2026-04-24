const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  startAttempt,
  saveAnswers,
  submitAttempt,
  getResults,
  getAttempt,
} = require("../controllers/examAttemptController");

// Student routes
router.post("/", verifyToken, authorizeRoles("student", "admin"), startAttempt);
router.put("/:attemptId/answers", verifyToken, authorizeRoles("student", "admin"), saveAnswers);
router.post("/:attemptId/submit", verifyToken, authorizeRoles("student", "admin"), submitAttempt);
router.get("/:attemptId/results", verifyToken, authorizeRoles("student", "admin"), getResults);

// Teacher/admin view of any attempt
router.get("/:attemptId", verifyToken, authorizeRoles("teacher", "admin"), getAttempt);

module.exports = router;
