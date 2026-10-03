const ResumeVersion = require("../models/resumeVersion.model");
const pdfParse = require("pdf-parse");
const { generateTailoringSuggestions } = require("../services/ai.service");
const JobApplication = require("../models/jobApplication.model");
const Notification = require("../models/notification.model");
const Activity = require("../models/activity.model");

exports.uploadResume = async (req, res) => {
    try {
        const resumeFile = req.file;
        const { name } = req.body;

        if (!resumeFile) {
            return res.status(400).json({ message: "Resume file is required" });
        }

        const resumePdfData = await (new pdfParse.PDFParse(Uint8Array.from(resumeFile.buffer))).getText();
        const resumeText = resumePdfData.text;

        const newVersion = new ResumeVersion({
            user: req.user._id,
            name: name || "Original Resume",
            content: resumeText
        });

        await newVersion.save();

        try {
            await Activity.create({
                user: req.user._id,
                type: "RESUME_UPLOADED",
                title: "Resume Uploaded",
                description: `Uploaded new baseline resume: ${newVersion.name}.`,
                relatedEntityType: "ResumeVersion",
                relatedEntityId: newVersion._id
            });
        } catch (err) {
            console.error("Failed to create activity:", err);
        }

        res.status(201).json(newVersion);
    } catch (error) {
        console.error("Error uploading resume:", error);
        res.status(500).json({ message: "Failed to upload resume" });
    }
};

exports.getResumes = async (req, res) => {
    try {
        const resumes = await ResumeVersion.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.status(200).json(resumes);
    } catch (error) {
        console.error("Error getting resumes:", error);
        res.status(500).json({ message: "Failed to fetch resumes" });
    }
};

exports.getResumeById = async (req, res) => {
    try {
        const resume = await ResumeVersion.findOne({ _id: req.params.id, user: req.user._id });
        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        res.status(200).json(resume);
    } catch (error) {
        console.error("Error getting resume:", error);
        res.status(500).json({ message: "Failed to fetch resume" });
    }
};

exports.updateResume = async (req, res) => {
    try {
        const { name, content, targetRole, status } = req.body;
        const resume = await ResumeVersion.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { name, content, targetRole, status },
            { new: true }
        );

        if (!resume) {
            return res.status(404).json({ message: "Resume not found" });
        }
        res.status(200).json(resume);
    } catch (error) {
        console.error("Error updating resume:", error);
        res.status(500).json({ message: "Failed to update resume" });
    }
};

exports.duplicateResume = async (req, res) => {
    try {
        const { newName } = req.body;
        const original = await ResumeVersion.findOne({ _id: req.params.id, user: req.user._id });
        if (!original) {
            return res.status(404).json({ message: "Resume not found" });
        }

        const duplicate = new ResumeVersion({
            user: req.user._id,
            name: newName || `${original.name} (Copy)`,
            targetRole: original.targetRole,
            content: original.content,
            originalSourceId: original._id
        });

        await duplicate.save();

        try {
            await Activity.create({
                user: req.user._id,
                type: "RESUME_TAILORED",
                title: "Resume Version Created",
                description: `Created tailored version: ${duplicate.name}.`,
                relatedEntityType: "ResumeVersion",
                relatedEntityId: duplicate._id
            });
            await Notification.create({
                user: req.user._id,
                type: "RESUME",
                title: "Resume Saved",
                message: `Successfully saved new resume version: ${duplicate.name}.`,
                relatedEntityType: "ResumeVersion",
                relatedEntityId: duplicate._id
            });
        } catch (err) {
            console.error("Failed to create activity/notification:", err);
        }

        res.status(201).json(duplicate);
    } catch (error) {
        console.error("Error duplicating resume:", error);
        res.status(500).json({ message: "Failed to duplicate resume" });
    }
};

exports.tailorResume = async (req, res) => {
    try {
        const { jobId } = req.body;
        const resume = await ResumeVersion.findOne({ _id: req.params.id, user: req.user._id });
        
        if (!resume) return res.status(404).json({ message: "Resume not found" });
        
        const job = await JobApplication.findOne({ _id: jobId, user: req.user._id });
        if (!job) return res.status(404).json({ message: "Job not found" });
        if (!job.description) return res.status(400).json({ message: "Job lacks a description for tailoring." });

        const suggestions = await generateTailoringSuggestions({
            resume: resume.content,
            jobDescription: job.description
        });

        res.status(200).json(suggestions);
    } catch (error) {
        console.error("Error tailoring resume:", error);
        res.status(500).json({ message: "Failed to tailor resume" });
    }
};
