import api from "../../../config/api";

export const analyzeResumeApi = async ({ resumeFile, jobDescription }) => {
    try {
        const formData = new FormData()
        formData.append("resume", resumeFile)
        if (jobDescription) formData.append("jobDescription", jobDescription)

        const response = await api.post("/api/resume/analyze", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        })
        return response.data
    } catch (error) {
        throw error
    }
}

export const getResumeAnalysesApi = async () => {
    try {
        const response = await api.get("/api/resume/")
        return response.data
    } catch (error) {
        throw error
    }
}

export const getResumeAnalysisByIdApi = async (analysisId) => {
    try {
        const response = await api.get(`/api/resume/${analysisId}`)
        return response.data
    } catch (error) {
        throw error
    }
}
