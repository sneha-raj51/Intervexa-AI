const CareerInsight = require("../models/careerInsight.model");
const JobApplication = require("../models/jobApplication.model");
const InterviewReport = require("../models/interviewReport.model");
const MockInterview = require("../models/mockInterview.model");
const ResumeAnalysis = require("../models/resumeAnalysis.model");
const { analyzeCareerInsights } = require("../services/ai.service");

exports.getInsights = async (req, res) => {
    try {
        const { forceRefresh } = req.query;
        let insight = await CareerInsight.findOne({ user: req.user._id });

        // If insight exists and is less than 24 hours old, and not forcing refresh, return it
        if (!forceRefresh && insight && (new Date() - insight.lastGeneratedAt) < 24 * 60 * 60 * 1000) {
            return res.status(200).json(insight);
        }

        // Otherwise, gather data and generate new insights
        const jobs = await JobApplication.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
        const interviews = await InterviewReport.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
        const mocks = await MockInterview.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5);
        const latestResume = await ResumeAnalysis.findOne({ user: req.user._id }).sort({ createdAt: -1 });

        let summaryStr = `
        Recent Jobs Tracked: ${jobs.map(j => j.title + ' at ' + j.company).join(", ")}
        Recent Interview Scores: ${interviews.map(i => i.matchScore + '% for ' + (i.title || 'General')).join(", ")}
        Skill Gaps Identified: ${interviews.map(i => (i.skillGaps || []).map(g => g.skill).join(", ")).join(" | ")}
        Mock Interviews Taken: ${mocks.map(m => m.difficulty + ' ' + m.type).join(", ")}
        Latest Resume ATS Score: ${latestResume?.score?.atsCompatibility || 'N/A'}
        Latest Resume Missing Skills: ${latestResume?.breakdown?.missing?.join(", ") || 'N/A'}
        `;

        let aiResponse = null;
        try {
            aiResponse = await analyzeCareerInsights({ summaryData: summaryStr });
        } catch (err) {
            console.error("Gemini failed for insights, using deterministic fallback", err);
            aiResponse = {
                overallReadiness: latestResume?.score?.atsCompatibility || 0,
                topStrengths: latestResume?.breakdown?.strengths || ["Start by adding a resume to identify strengths"],
                focusAreas: latestResume?.breakdown?.missing || ["More data needed to find focus areas"],
                nextBestAction: {
                    title: "Practice your fundamentals",
                    description: "Take some mock interviews to build your profile.",
                    recommendedRoute: "/practice"
                },
                skillIntelligence: (latestResume?.jdIntelligence?.requiredSkills || []).map(s => ({
                    skill: s, level: "Developing"
                })),
                interviewInsights: { technicalAccuracy: 0, answerDepth: 0, behavioralStructure: 0 },
                jobRequirementPatterns: [],
                personalizedRecommendations: [],
                preparationRoadmap: []
            };
        }

        if (!insight) {
            insight = new CareerInsight({
                user: req.user._id,
                data: aiResponse
            });
        } else {
            insight.data = aiResponse;
            insight.lastGeneratedAt = new Date();
        }

        await insight.save();
        res.status(200).json(insight);
    } catch (error) {
        console.error("Error generating career insights:", error);
        res.status(500).json({ message: "Failed to generate career insights" });
    }
};
