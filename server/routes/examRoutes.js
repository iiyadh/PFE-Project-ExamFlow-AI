const express = require("express");
const router = express.Router();
const { verifyToken, authorizeRoles } = require("../middlewares/authMiddleware");
const {
  getExams,
  getStudentExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  getExamSubmissions,
  getSubmissionDetail,
} = require("../controllers/examController");

// Student exam list (must be before /:examId to avoid conflict)
router.get("/student", verifyToken, authorizeRoles("student", "admin"), getStudentExams);

// Teacher CRUD
router.get("/", verifyToken, authorizeRoles("teacher", "admin"), getExams);
router.post("/", verifyToken, authorizeRoles("teacher", "admin"), createExam);
router.get("/:examId", verifyToken, getExamById);
router.put("/:examId", verifyToken, authorizeRoles("teacher", "admin"), updateExam);
router.delete("/:examId", verifyToken, authorizeRoles("teacher", "admin"), deleteExam);
router.post("/:examId/publish", verifyToken, authorizeRoles("teacher", "admin"), publishExam);

// Submissions
router.get("/:examId/submissions", verifyToken, authorizeRoles("teacher", "admin"), getExamSubmissions);
router.get("/:examId/submissions/:studentId", verifyToken, authorizeRoles("teacher", "admin"), getSubmissionDetail);

module.exports = router;
