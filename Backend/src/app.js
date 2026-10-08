const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express()

// Trust proxy is required for secure cookies behind reverse proxies like Render
app.set("trust proxy", 1)

app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174", "http://localhost:5175"],
    credentials: true
}))

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")
const resumeRouter = require("./routes/resume.routes")
const mockRouter = require("./routes/mock.routes")
const practiceRouter = require("./routes/practice.routes")
const progressRouter = require("./routes/progress.routes")
const jobRouter = require("./routes/job.routes")
const resumeVersionRouter = require("./routes/resumeVersion.routes")
const notificationRouter = require("./routes/notification.routes")
const activityRouter = require("./routes/activity.routes")
const reminderRouter = require("./routes/reminder.routes")
const insightsRouter = require("./routes/insights.routes")

/* using all the routes here */
app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)
app.use("/api/resume", resumeRouter)
app.use("/api/mock", mockRouter)
app.use("/api/practice", practiceRouter)
app.use("/api/progress", progressRouter)
app.use("/api/jobs", jobRouter)
app.use("/api/resume-versions", resumeVersionRouter)
app.use("/api/notifications", notificationRouter)
app.use("/api/activities", activityRouter)
app.use("/api/reminders", reminderRouter)
app.use("/api/insights", insightsRouter)

app.use((err, req, res, next) => {
    console.error("Backend Error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error", error: err });
})

module.exports = app