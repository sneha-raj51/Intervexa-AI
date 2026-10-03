const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middlewares/auth.middleware");
const resumeVersionController = require("../controllers/resumeVersion.controller");

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

router.use(authMiddleware.authUser);

router.post("/upload", upload.single("resume"), resumeVersionController.uploadResume);
router.get("/", resumeVersionController.getResumes);
router.get("/:id", resumeVersionController.getResumeById);
router.patch("/:id", resumeVersionController.updateResume);
router.post("/:id/duplicate", resumeVersionController.duplicateResume);
router.post("/:id/tailor", resumeVersionController.tailorResume);

module.exports = router;
