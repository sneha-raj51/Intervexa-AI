import { useState, useCallback } from "react";
import { setupMockInterviewApi, submitMockAnswerApi, completeMockInterviewApi, getMockInterviewApi } from "../services/mock.api";

export const useMock = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [interview, setInterview] = useState(null);

    const setupInterview = async (config) => {
        setLoading(true);
        setError(null);
        try {
            const data = await setupMockInterviewApi(config);
            setInterview(data.interview);
            return data.interview;
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to set up interview";
            setError(msg);
            // removed alert
            return null;
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = async (interviewId, questionIndex, userAnswer) => {
        setLoading(true);
        setError(null);
        try {
            const data = await submitMockAnswerApi(interviewId, { questionIndex, userAnswer });
            
            // Update the local state with the new answer/evaluation
            setInterview(prev => {
                if (!prev) return prev;
                const newAnswers = [...prev.answers];
                const existingIndex = newAnswers.findIndex(a => a.questionIndex === questionIndex);
                if (existingIndex !== -1) {
                    newAnswers[existingIndex] = { questionIndex, userAnswer, evaluation: data.evaluation };
                } else {
                    newAnswers.push({ questionIndex, userAnswer, evaluation: data.evaluation });
                }
                return { ...prev, answers: newAnswers };
            });

            return data.evaluation;
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to evaluate answer";
            setError(msg);
            // removed alert
            return null;
        } finally {
            setLoading(false);
        }
    };

    const completeInterview = async (interviewId, completedTime) => {
        setLoading(true);
        setError(null);
        try {
            const data = await completeMockInterviewApi(interviewId, completedTime);
            setInterview(data.interview);
            return data.interview;
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to complete interview";
            setError(msg);
            // removed alert
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getInterview = useCallback(async (interviewId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getMockInterviewApi(interviewId);
            setInterview(data.interview);
            return data.interview;
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.message || "Failed to fetch interview";
            setError(msg);
            // removed alert
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        interview,
        setupInterview,
        submitAnswer,
        completeInterview,
        getInterview,
    };
};
