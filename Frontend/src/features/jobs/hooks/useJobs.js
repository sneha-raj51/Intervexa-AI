import { useState, useCallback } from "react";
import { createJobApi, getJobsApi, getJobByIdApi, updateJobApi, deleteJobApi } from "../services/job.api";

export const useJobs = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJobsApi();
            setJobs(data);
            return data;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch jobs");
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchJobWorkspace = useCallback(async (jobId) => {
        setLoading(true);
        setError(null);
        try {
            const data = await getJobByIdApi(jobId);
            setCurrentWorkspace(data);
            return data;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to fetch job workspace");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const createJob = async (jobData) => {
        setLoading(true);
        setError(null);
        try {
            const newJob = await createJobApi(jobData);
            setJobs(prev => [newJob, ...prev]);
            return newJob;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to create job");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const updateJob = async (jobId, updates) => {
        setLoading(true);
        setError(null);
        try {
            const updatedJob = await updateJobApi(jobId, updates);
            setJobs(prev => prev.map(job => job._id === jobId ? updatedJob : job));
            if (currentWorkspace && currentWorkspace.job._id === jobId) {
                setCurrentWorkspace(prev => ({ ...prev, job: updatedJob }));
            }
            return updatedJob;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to update job");
            return null;
        } finally {
            setLoading(false);
        }
    };

    const deleteJob = async (jobId) => {
        setLoading(true);
        setError(null);
        try {
            await deleteJobApi(jobId);
            setJobs(prev => prev.filter(job => job._id !== jobId));
            return true;
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Failed to delete job");
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        jobs,
        currentWorkspace,
        loading,
        error,
        fetchJobs,
        fetchJobWorkspace,
        createJob,
        updateJob,
        deleteJob
    };
};
