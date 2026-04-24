const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  generateQuestions,
  verifyQuestion,
} = require("../controllers/questionController");

// AI routes (before /:id to avoid conflicts)
router.post("/generate", verifyToken, authorizeRoles("teacher"), generateQuestions);
router.post("/generate/preview", verifyToken, authorizeRoles("teacher"), generateQuestions);
router.post("/verify", verifyToken, authorizeRoles("teacher"), verifyQuestion);

// CRUD
router.get("/", verifyToken, getQuestions);
router.post("/", verifyToken, authorizeRoles("teacher"), createQuestion);
router.put("/:id", verifyToken, authorizeRoles("teacher"), updateQuestion);
router.delete("/:id", verifyToken, authorizeRoles("teacher"), deleteQuestion);

module.exports = router;
