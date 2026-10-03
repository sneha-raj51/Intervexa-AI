import { createBrowserRouter, Navigate } from "react-router";
import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import Protected from "./features/auth/components/Protected";
import Home from "./features/interview/pages/Home";
import Interview from "./features/interview/pages/Interview";
import Layout from "./components/Layout";
import Dashboard from "./features/interview/pages/Dashboard";
import ResumeIntelligence from "./features/resume/pages/ResumeIntelligence";
import { MockSetup } from "./features/mock/pages/MockSetup";
import { MockRoom } from "./features/mock/pages/MockRoom";
import { MockReport } from "./features/mock/pages/MockReport";
import { PracticeHub } from "./features/practice/pages/PracticeHub";
import { ProgressHub } from "./features/progress/pages/ProgressHub";
import { JobsDashboard } from "./features/jobs/pages/JobsDashboard";
import { JobWorkspace } from "./features/jobs/pages/JobWorkspace";
import { ResumesDashboard } from "./features/resumes/pages/ResumesDashboard";
import { ResumeTailor } from "./features/resumes/pages/ResumeTailor";
import { ActivityCenter } from "./features/activity/pages/ActivityCenter";
import { CareerInsights } from "./features/insights/pages/CareerInsights";
import { Landing } from "./features/landing/pages/Landing";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Layout />,
        children: [
            {
                path: "login",
                element: <Login />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                index: true,
                element: <Landing />
            },
            {
                path: "dashboard",
                element: <Protected><Dashboard /></Protected>
            },
            {
                path: "analyze",
                element: <Protected><Home /></Protected>
            },
            {
                path: "resume",
                element: <Protected><ResumeIntelligence /></Protected>
            },
            {
                path: "resume/:analysisId",
                element: <Protected><ResumeIntelligence /></Protected>
            },
            {
                path: "interview/:interviewId",
                element: <Protected><Interview /></Protected>
            },
            {
                path: "mock-interview",
                element: <Protected><MockSetup /></Protected>
            },
            {
                path: "mock-interview/:id",
                element: <Protected><MockRoom /></Protected>
            },
            {
                path: "mock-interview/:id/report",
                element: <Protected><MockReport /></Protected>
            },
            {
                path: "practice",
                element: <Protected><PracticeHub /></Protected>
            },
            {
                path: "progress",
                element: <Protected><ProgressHub /></Protected>
            },
            {
                path: "jobs",
                element: <Protected><JobsDashboard /></Protected>
            },
            {
                path: "jobs/:id",
                element: <Protected><JobWorkspace /></Protected>
            },
            {
                path: "resumes",
                element: <Protected><ResumesDashboard /></Protected>
            },
            {
                path: "resumes/:id",
                element: <Protected><ResumeTailor /></Protected>
            },
            {
                path: "activity",
                element: <Protected><ActivityCenter /></Protected>
            },
            {
                path: "career-insights",
                element: <Protected><CareerInsights /></Protected>
            }
        ]
    }
])