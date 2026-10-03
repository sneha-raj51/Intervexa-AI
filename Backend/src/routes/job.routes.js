const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const jobController = require("../controllers/job.controller");

const jobRouter = express.Router();

jobRouter.use(authMiddleware.authUser);

jobRouter.post("/", jobController.createJob);
jobRouter.get("/", jobController.getJobs);
jobRouter.get("/:id", jobController.getJobById);
jobRouter.patch("/:id", jobController.updateJob);
jobRouter.delete("/:id", jobController.deleteJob);

module.exports = jobRouter;
