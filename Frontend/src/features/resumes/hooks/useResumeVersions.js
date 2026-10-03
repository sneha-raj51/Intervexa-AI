import { useState, useCallback } from "react";
import { uploadResumeApi, getResumesApi, getResumeByIdApi, updateResumeApi, duplicateResumeApi, tailorResumeApi } from "../services/resumeVersion.api";

export const useResumeVersions = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [currentResume, setCurrentResume] = useState(null);

    const fetchResumes = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getResumesApi();
            setResumes(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch resumes");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchResumeById = useCallback(async (id) => {
        setLoading(true);
        try {
            const data = await getResumeByIdApi(id);
            setCurrentResume(data);
            return data;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch resume");
        } finally {
            setLoading(false);
        }
    }, []);

    const uploadResume = async (file, name) => {
        setLoading(true);
        try {
            const newResume = await uploadResumeApi(file, name);
            setResumes(prev => [newResume, ...prev]);
            return newResume;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to upload resume");
        } finally {
            setLoading(false);
        }
    };

    const duplicateResume = async (id, newName) => {
        setLoading(true);
        try {
            const newResume = await duplicateResumeApi(id, newName);
            setResumes(prev => [newResume, ...prev]);
            return newResume;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to duplicate resume");
        } finally {
            setLoading(false);
        }
    };

    const updateResume = async (id, data) => {
        setLoading(true);
        try {
            const updated = await updateResumeApi(id, data);
            setResumes(prev => prev.map(r => r._id === id ? updated : r));
            if (currentResume && currentResume._id === id) {
                setCurrentResume(updated);
            }
            return updated;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update resume");
        } finally {
            setLoading(false);
        }
    };

    const tailorResume = async (id, jobId) => {
        setLoading(true);
        try {
            const suggestions = await tailorResumeApi(id, jobId);
            return suggestions.suggestions;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to generate suggestions");
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        resumes,
        currentResume,
        loading,
        error,
        fetchResumes,
        fetchResumeById,
        uploadResume,
        duplicateResume,
        updateResume,
        tailorResume
    };
};
