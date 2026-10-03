import { useState, useCallback } from "react"
import { analyzeResumeApi, getResumeAnalysesApi, getResumeAnalysisByIdApi } from "../services/resume.api"

export const useResume = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [analysis, setAnalysis] = useState(null)
    const [analyses, setAnalyses] = useState([])

    const analyzeResume = async ({ resumeFile, jobDescription }) => {
        setLoading(true)
        setError(null)
        try {
            const data = await analyzeResumeApi({ resumeFile, jobDescription })
            setAnalysis(data.analysis)
            return data.analysis
        } catch (err) {
            console.error(err)
            const msg = err.response?.data?.message || "Failed to analyze resume"
            setError(msg)
            // removed alert
            return null
        } finally {
            setLoading(false)
        }
    }

    const getAnalyses = useCallback(async () => {
        setLoading(true)
        try {
            const data = await getResumeAnalysesApi()
            setAnalyses(data.analyses)
        } catch (err) {
            console.error(err)
            // removed alert
        } finally {
            setLoading(false)
        }
    }, [])

    const getAnalysisById = useCallback(async (analysisId) => {
        setLoading(true)
        try {
            const data = await getResumeAnalysisByIdApi(analysisId)
            setAnalysis(data.analysis)
            return data.analysis
        } catch (err) {
            console.error(err)
            // removed alert
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        loading,
        error,
        analysis,
        analyses,
        analyzeResume,
        getAnalyses,
        getAnalysisById
    }
}
