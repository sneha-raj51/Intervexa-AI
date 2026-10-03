const ResumeAnalysis = require("../models/resumeAnalysis.model");
const InterviewReport = require("../models/interviewReport.model");
const MockInterview = require("../models/mockInterview.model");
const PracticeQuestion = require("../models/practiceQuestion.model");

exports.getReadinessData = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;

        // Fetch data required for calculations
        const latestResumeAnalysis = await ResumeAnalysis.findOne({ user: userId }).sort({ createdAt: -1 });
        const latestInterviewReport = await InterviewReport.findOne({ user: userId }).sort({ createdAt: -1 });
        const mockInterviews = await MockInterview.find({ user: userId });
        const practiceQuestions = await PracticeQuestion.find({ user: userId });

        const breakdown = {
            resume: null,
            jobMatch: null,
            technical: null,
            behavioral: null,
            practice: null,
            mockInterview: null
        };

        // 1. Resume Strength
        if (latestResumeAnalysis && latestResumeAnalysis.score) {
            // we have atsCompatibility, contentStrength, skillsCoverage
            const { atsCompatibility, contentStrength, skillsCoverage } = latestResumeAnalysis.score;
            if (contentStrength != null) {
                breakdown.resume = Math.round((atsCompatibility + contentStrength + skillsCoverage) / 3);
            }
        }

        // 2. Job Match
        if (latestResumeAnalysis && latestResumeAnalysis.matchBreakdown && latestResumeAnalysis.matchBreakdown.overallMatch != null) {
            breakdown.jobMatch = latestResumeAnalysis.matchBreakdown.overallMatch;
        } else if (latestInterviewReport && latestInterviewReport.matchScore != null) {
            breakdown.jobMatch = latestInterviewReport.matchScore;
        }

        // 3. Technical & Behavioral
        const techQuestions = practiceQuestions.filter(q => q.category === "Technical");
        const behavQuestions = practiceQuestions.filter(q => q.category === "Behavioral");

        if (techQuestions.length > 0) {
            const practiced = techQuestions.filter(q => q.status === "Practiced").length;
            breakdown.technical = Math.round((practiced / techQuestions.length) * 100);
        }

        if (behavQuestions.length > 0) {
            const practiced = behavQuestions.filter(q => q.status === "Practiced").length;
            breakdown.behavioral = Math.round((practiced / behavQuestions.length) * 100);
        }

        // 4. Practice Progress
        if (practiceQuestions.length > 0) {
            const practiced = practiceQuestions.filter(q => q.status === "Practiced").length;
            breakdown.practice = Math.round((practiced / practiceQuestions.length) * 100);
        }

        // 5. Mock Interview Performance
        if (mockInterviews.length > 0) {
            const completed = mockInterviews.filter(m => m.status === "Completed").length;
            // Let's use a simple ratio for now, if they completed 1 out of 2 it's 50%.
            // But usually mock interview score is based on actual AI feedback.
            // Since we don't have a numerical mock score, we will use completion ratio, scaled.
            // Or maybe just average of the other scores if they completed at least 1 mock.
            // Let's do: if completed > 0, we give them a base of 70 + based on how many they completed.
            if (completed > 0) {
                breakdown.mockInterview = Math.min(100, 60 + (completed * 10)); // Just a simple metric
            } else {
                breakdown.mockInterview = 0; // Started but not completed
            }
        }

        // Calculate Overall Readiness
        let totalScore = 0;
        let activeCategories = 0;

        Object.values(breakdown).forEach(val => {
            if (val !== null) {
                totalScore += val;
                activeCategories += 1;
            }
        });

        const overallReadiness = activeCategories > 0 ? Math.round(totalScore / activeCategories) : null;

        // Roadmap Steps
        const roadmap = [
            { step: 1, title: "Understand your target role", status: latestInterviewReport ? "Completed" : "Not Started" },
            { step: 2, title: "Strengthen weak technical skills", status: breakdown.technical > 0 ? "In Progress" : "Not Started" },
            { step: 3, title: "Practice behavioral questions", status: breakdown.behavioral > 0 ? "In Progress" : "Not Started" },
            { step: 4, title: "Complete a mock interview", status: mockInterviews.some(m => m.status === "Completed") ? "Completed" : (mockInterviews.length > 0 ? "In Progress" : "Not Started") },
            { step: 5, title: "Review weak areas", status: practiceQuestions.some(q => q.status === "Needs Review") ? "In Progress" : "Not Started" },
        ];

        // Ensure Technical / Behavioral get marked completed if 100%
        if (breakdown.technical === 100) roadmap[1].status = "Completed";
        if (breakdown.behavioral === 100) roadmap[2].status = "Completed";
        if (!practiceQuestions.some(q => q.status === "Needs Review") && practiceQuestions.length > 0) roadmap[4].status = "Completed";

        // Next Best Action
        let nextBestAction = {
            message: "Analyze your first target role to get started.",
            action: "/analyze",
            label: "Analyze Role"
        };

        if (activeCategories > 0) {
            // Find lowest score
            let lowestCat = null;
            let lowestVal = 101;
            
            for (const [key, val] of Object.entries(breakdown)) {
                if (val !== null && val < lowestVal) {
                    lowestVal = val;
                    lowestCat = key;
                }
            }

            if (!latestResumeAnalysis && !latestInterviewReport) {
                // Keep default
            } else if (roadmap[3].status === "Not Started") {
                nextBestAction = { message: "Complete a mock interview to test your skills.", action: "/mock-interview", label: "Mock Interview" };
            } else if (lowestCat === "technical") {
                nextBestAction = { message: "Practice your technical questions.", action: "/practice", label: "Practice Hub" };
            } else if (lowestCat === "behavioral") {
                nextBestAction = { message: "Review your behavioral answers.", action: "/practice", label: "Practice Hub" };
            } else if (lowestCat === "jobMatch" || lowestCat === "resume") {
                nextBestAction = { message: "Improve your resume content based on intelligence feedback.", action: "/resume", label: "Resume Intelligence" };
            } else {
                nextBestAction = { message: "Keep practicing to improve your readiness.", action: "/practice", label: "Practice Hub" };
            }
        }

        // Weak Areas (from PracticeQuestions)
        const weakAreas = [];
        const groups = {};
        const weakQuestions = practiceQuestions.filter(q => q.status === "Needs Review");
        weakQuestions.forEach(q => {
            const key = q.skill || q.category;
            if (!groups[key]) groups[key] = { name: key, count: 0 };
            groups[key].count++;
        });

        for (const key in groups) {
            weakAreas.push({
                area: key,
                reason: `Several recent questions involving ${key} need improvement.`
            });
        }
        // Take top 3
        weakAreas.sort((a,b) => b.count - a.count);
        const topWeakAreas = weakAreas.slice(0, 3);

        // Activity Timeline & Achievements
        const activity = [];
        
        if (latestResumeAnalysis) activity.push({ title: "Analyzed Resume Match", date: latestResumeAnalysis.createdAt, icon: "📄" });
        if (latestInterviewReport) activity.push({ title: `Generated Interview Strategy for ${latestInterviewReport.title}`, date: latestInterviewReport.createdAt, icon: "🎯" });
        
        const completedMocks = mockInterviews.filter(m => m.status === "Completed");
        completedMocks.forEach(m => {
            activity.push({ title: "Completed Mock Interview", date: m.updatedAt || m.createdAt, icon: "🎙️" });
        });

        const practicedQ = practiceQuestions.filter(q => q.status === "Practiced");
        if (practicedQ.length > 0) {
            activity.push({ title: `Practiced ${practicedQ.length} questions`, date: practicedQ[practicedQ.length-1].updatedAt, icon: "✅" });
        }

        activity.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        const achievements = [];
        if (latestResumeAnalysis || latestInterviewReport) achievements.push("First Analysis");
        if (completedMocks.length > 0) achievements.push("First Mock Interview");
        if (practicedQ.length >= 10) achievements.push("10 Questions Practiced");
        if (practiceQuestions.filter(q => q.isBookmarked).length >= 5) achievements.push("5 Questions Bookmarked");
        if (practiceQuestions.some(q => q.category === "Behavioral" && q.status === "Practiced")) achievements.push("First Behavioral Practice");

        res.status(200).json({
            overallReadiness,
            breakdown,
            roadmap,
            nextBestAction,
            weakAreas: topWeakAreas,
            activity: activity.slice(0, 10), // Limit to top 10
            achievements
        });

    } catch (error) {
        console.error("Error fetching readiness data:", error);
        res.status(500).json({ message: "Failed to fetch progress data." });
    }
};
