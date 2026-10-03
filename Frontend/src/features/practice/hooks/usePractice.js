import { useState, useCallback } from "react";
import { getPracticeQuestionsApi, getWeakAreasApi, updateQuestionStatusApi, submitPracticeAnswerApi } from "../services/practice.api";

export const usePractice = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [weakAreas, setWeakAreas] = useState([]);

    const fetchQuestions = useCallback(async (filters = {}) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPracticeQuestionsApi(filters);
            setQuestions(data.questions);
            return data.questions;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch practice questions");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeakAreas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getWeakAreasApi();
            setWeakAreas(data.weakAreas);
            return data.weakAreas;
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = async (id, updateData) => {
        try {
            const data = await updateQuestionStatusApi(id, updateData);
            // Optimistically update the local state
            setQuestions(prev => prev.map(q => q._id === id ? { ...q, ...updateData } : q));
            return data.question;
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to update status");
            return null;
        }
    };

    const submitAnswer = async (id, userAnswer) => {
        setLoading(true);
        try {
            const data = await submitPracticeAnswerApi(id, userAnswer);
            // Optimistically update the question in the list with new attempt and status
            setQuestions(prev => prev.map(q => q._id === id ? data.question : q));
            return data.evaluation;
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to submit answer");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        questions,
        weakAreas,
        fetchQuestions,
        fetchWeakAreas,
        updateStatus,
        submitAnswer
    };
};
