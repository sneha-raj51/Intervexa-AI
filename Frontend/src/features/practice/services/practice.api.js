import api from "../../../config/api";

export const getPracticeQuestionsApi = async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append("search", filters.search);
    if (filters.category) params.append("category", filters.category);
    if (filters.difficulty) params.append("difficulty", filters.difficulty);
    if (filters.status) params.append("status", filters.status);
    
    const response = await api.get(`/api/practice?${params.toString()}`);
    return response.data;
};

export const getWeakAreasApi = async () => {
    const response = await api.get("/api/practice/weak-areas");
    return response.data;
};

export const updateQuestionStatusApi = async (id, data) => {
    const response = await api.patch(`/api/practice/${id}`, data);
    return response.data;
};

export const submitPracticeAnswerApi = async (id, userAnswer) => {
    const response = await api.post(`/api/practice/${id}/answer`, { userAnswer });
    return response.data;
};
