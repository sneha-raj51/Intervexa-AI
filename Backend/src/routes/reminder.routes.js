const express = require("express");
const reminderController = require("../controllers/reminder.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.use(authMiddleware.authUser);

router.get("/", reminderController.getReminders);
router.post("/", reminderController.createReminder);
router.patch("/:id", reminderController.updateReminder);
router.delete("/:id", reminderController.deleteReminder);

module.exports = router;
