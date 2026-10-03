const JobApplication = require("../models/jobApplication.model");
const InterviewReport = require("../models/interviewReport.model");
const MockInterview = require("../models/mockInterview.model");
const ResumeAnalysis = require("../models/resumeAnalysis.model");
const Notification = require("../models/notification.model");
const Activity = require("../models/activity.model");

exports.createJob = async (req, res) => {
    try {
        const { title, company, description, url, location, employmentType, notes, applicationDate, status } = req.body;
        
        const newJob = new JobApplication({
            user: req.user._id,
            title,
            company,
            description,
            url,
            location,
            employmentType,
            notes,
            applicationDate,
            status: status || "Saved",
            timeline: [{ status: status || "Saved", date: new Date() }]
        });
        
        await newJob.save();
        
        try {
            await Activity.create({
                user: req.user._id,
                type: "JOB_CREATED",
                title: "Job Application Created",
                description: `Created application for ${title} at ${company}.`,
                relatedEntityType: "JobApplication",
                relatedEntityId: newJob._id
            });
        } catch (err) {
            console.error("Failed to create activity:", err);
        }

        res.status(201).json(newJob);
    } catch (error) {
        console.error("Create job error:", error);
        res.status(500).json({ message: "Failed to create job" });
    }
};

exports.getJobs = async (req, res) => {
    try {
        const jobs = await JobApplication.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(jobs);
    } catch (error) {
        console.error("Get jobs error:", error);
        res.status(500).json({ message: "Failed to fetch jobs" });
    }
};

exports.getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await JobApplication.findOne({ _id: jobId, user: req.user._id });
        
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Fetch related entities for the workspace
        const resumeAnalysis = await ResumeAnalysis.findOne({ jobId, user: req.user._id }).sort({ createdAt: -1 });
        const interviewReport = await InterviewReport.findOne({ jobId, user: req.user._id }).sort({ createdAt: -1 });
        const mockInterviews = await MockInterview.find({ jobId, user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            job,
            resumeAnalysis,
            interviewReport,
            mockInterviews
        });
    } catch (error) {
        console.error("Get job details error:", error);
        res.status(500).json({ message: "Failed to fetch job details" });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const updates = req.body;
        
        const job = await JobApplication.findOne({ _id: jobId, user: req.user._id });
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // If status is changing, append to timeline
        let statusChanged = false;
        if (updates.status && updates.status !== job.status) {
            job.timeline.push({ status: updates.status, date: new Date() });
            statusChanged = true;
        }

        Object.assign(job, updates);
        await job.save();

        if (statusChanged) {
            try {
                await Activity.create({
                    user: req.user._id,
                    type: "JOB_UPDATED",
                    title: "Application Status Updated",
                    description: `${job.title} at ${job.company} status changed to ${job.status}.`,
                    relatedEntityType: "JobApplication",
                    relatedEntityId: job._id
                });
                await Notification.create({
                    user: req.user._id,
                    type: "JOB",
                    title: "Status Update",
                    message: `Your application for ${job.title} is now: ${job.status}.`,
                    relatedEntityType: "JobApplication",
                    relatedEntityId: job._id
                });
            } catch (err) {
                console.error("Failed to create activity/notification:", err);
            }
        }

        res.status(200).json(job);
    } catch (error) {
        console.error("Update job error:", error);
        res.status(500).json({ message: "Failed to update job" });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const jobId = req.params.id;
        const deletedJob = await JobApplication.findOneAndDelete({ _id: jobId, user: req.user._id });
        
        if (!deletedJob) {
            return res.status(404).json({ message: "Job not found" });
        }

        // We could also delete the connected InterviewReports, MockInterviews, etc., 
        // or just leave them. Let's delete them to clean up the workspace.
        await ResumeAnalysis.deleteMany({ jobId });
        await InterviewReport.deleteMany({ jobId });
        await MockInterview.deleteMany({ jobId });

        res.status(200).json({ message: "Job and related data deleted successfully" });
    } catch (error) {
        console.error("Delete job error:", error);
        res.status(500).json({ message: "Failed to delete job" });
    }
};
