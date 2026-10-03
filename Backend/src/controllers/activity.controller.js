const Activity = require("../models/activity.model");
const JobApplication = require("../models/jobApplication.model");
const ResumeAnalysis = require("../models/resumeAnalysis.model");
const InterviewReport = require("../models/interviewReport.model");
const MockInterview = require("../models/mockInterview.model");
const PracticeQuestion = require("../models/practiceQuestion.model");

exports.getActivities = async (req, res) => {
    try {
        const userId = req.user._id;

        // 1. Fetch explicit activities
        const explicitActivities = await Activity.find({ user: userId }).lean();
        const explicitEntityIds = new Set(explicitActivities.map(a => a.relatedEntityId?.toString()).filter(Boolean));

        // 2. Fetch derived activities
        const jobs = await JobApplication.find({ user: userId }).lean();
        const resumes = await ResumeAnalysis.find({ user: userId }).lean();
        const interviews = await InterviewReport.find({ user: userId }).lean();
        const mocks = await MockInterview.find({ user: userId }).lean();
        const practices = await PracticeQuestion.find({ user: userId }).lean();
        
        let allActivities = [...explicitActivities];

        jobs.forEach(job => {
            if (!explicitEntityIds.has(job._id.toString())) {
                allActivities.push({
                    _id: job._id,
                    type: "JOB_ADDED",
                    title: "Job Tracked",
                    description: `Tracked application for ${job.title} at ${job.company}`,
                    createdAt: job.createdAt
                });
            }
        });

        resumes.forEach(res => {
            if (!explicitEntityIds.has(res._id.toString())) {
                allActivities.push({
                    _id: res._id,
                    type: "RESUME_ANALYZED",
                    title: "Resume Analyzed",
                    description: `Analyzed resume match and ATS compatibility.`,
                    createdAt: res.createdAt
                });
            }
        });

        interviews.forEach(int => {
            if (!explicitEntityIds.has(int._id.toString())) {
                allActivities.push({
                    _id: int._id,
                    type: "INTERVIEW_GENERATED",
                    title: "Interview Strategy Generated",
                    description: `Generated interview prep for ${int.title || 'a role'}`,
                    createdAt: int.createdAt
                });
            }
        });

        mocks.forEach(mock => {
            if (!explicitEntityIds.has(mock._id.toString())) {
                allActivities.push({
                    _id: mock._id,
                    type: "INTERVIEW_MOCK",
                    title: "Mock Interview Completed",
                    description: `Completed a ${mock.difficulty} ${mock.type} interview.`,
                    createdAt: mock.createdAt
                });
            }
        });

        practices.forEach(prac => {
            if (!explicitEntityIds.has(prac._id.toString())) {
                allActivities.push({
                    _id: prac._id,
                    type: "PRACTICE_COMPLETED",
                    title: "Practice Completed",
                    description: `Practiced a ${prac.difficulty} question.`,
                    createdAt: prac.createdAt
                });
            }
        });

        // Sort descending by timestamp
        allActivities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        // Limit to latest 50
        res.status(200).json(allActivities.slice(0, 50));
    } catch (error) {
        console.error("Error getting activities:", error);
        res.status(500).json({ message: "Failed to get activities" });
    }
};
