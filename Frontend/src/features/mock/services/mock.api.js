import api from "../../../config/api";

export const setupMockInterviewApi = async (data) => {
    const response = await api.post("/api/mock/setup", data);
    return response.data;
};

export const submitMockAnswerApi = async (interviewId, data) => {
    const response = await api.post(`/api/mock/${interviewId}/answer`, data);
    return response.data;
};

export const completeMockInterviewApi = async (interviewId, completedTime) => {
    const response = await api.post(`/api/mock/${interviewId}/complete`, { completedTime });
    return response.data;
};

export const getMockInterviewApi = async (interviewId) => {
    const response = await api.get(`/api/mock/${interviewId}`);
    return response.data;
};
