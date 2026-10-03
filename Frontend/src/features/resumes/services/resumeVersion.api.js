import api from "../../../config/api";

export const uploadResumeApi = async (file, name) => {
    const formData = new FormData();
    formData.append("resume", file);
    if (name) formData.append("name", name);
    const response = await api.post("/api/resume-versions/upload", formData);
    return response.data;
};

export const getResumesApi = async () => {
    const response = await api.get("/api/resume-versions");
    return response.data;
};

export const getResumeByIdApi = async (id) => {
    const response = await api.get(`/api/resume-versions/${id}`);
    return response.data;
};

export const updateResumeApi = async (id, data) => {
    const response = await api.patch(`/api/resume-versions/${id}`, data);
    return response.data;
};

export const duplicateResumeApi = async (id, newName) => {
    const response = await api.post(`/api/resume-versions/${id}/duplicate`, { newName });
    return response.data;
};

export const tailorResumeApi = async (id, jobId) => {
    const response = await api.post(`/api/resume-versions/${id}/tailor`, { jobId });
    return response.data;
};
