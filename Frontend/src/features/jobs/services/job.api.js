import api from "../../../config/api";

export const createJobApi = async (jobData) => {
    const response = await api.post("/api/jobs", jobData);
    return response.data;
};

export const getJobsApi = async () => {
    const response = await api.get("/api/jobs");
    return response.data;
};

export const getJobByIdApi = async (jobId) => {
    const response = await api.get(`/api/jobs/${jobId}`);
    return response.data;
};

export const updateJobApi = async (jobId, updates) => {
    const response = await api.patch(`/api/jobs/${jobId}`, updates);
    return response.data;
};

export const deleteJobApi = async (jobId) => {
    const response = await api.delete(`/api/jobs/${jobId}`);
    return response.data;
};
