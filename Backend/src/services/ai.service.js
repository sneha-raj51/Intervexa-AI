const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

// GEMINI ISOLATED SETUP
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

async function executeGeminiWithRetry(apiCall, functionName) {
    let retries = 2;
    let baseDelay = 2000;
    while (retries >= 0) {
        try {
            return await apiCall();
        } catch (error) {
            const status = error.status || error?.response?.status;
            
            let retryDelayMs = null;
            if (status === 429) {
                try {
                    const parsed = JSON.parse(error.message.replace(/^ApiError: /, ''));
                    const details = parsed?.error?.details || [];
                    for (const d of details) {
                        if (d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo' && d.retryDelay) {
                            retryDelayMs = parseFloat(d.retryDelay.replace('s', '')) * 1000;
                        }
                    }
                } catch(e) {}
            }

            if (status === 429 || status === 408 || (status >= 500 && status < 600)) {
                if (retries === 0) {
                    throw new Error(`AI Service currently unavailable due to high demand. Please try again later.`);
                }
                
                let delay = baseDelay + Math.random() * 500;
                
                if (status === 429 && retryDelayMs !== null) {
                    if (retryDelayMs > 15000) {
                        throw new Error(`AI Service quota exceeded. Please wait ${Math.ceil(retryDelayMs / 1000)} seconds before trying again.`);
                    }
                    delay = Math.max(delay, retryDelayMs);
                }

                console.log(`Gemini API failed for ${functionName} with status ${status}. Retrying in ${Math.round(delay)}ms... (${retries} retries left)`);
                await new Promise(resolve => setTimeout(resolve, delay));
                baseDelay *= 2;
                retries--;
            } else {
                throw new Error(`AI Service error: ${error.message}`);
            }
        }
    }
}

// OPENROUTER SETUP
async function executeOpenRouter(prompt, schema, functionName) {
    let retries = 2;
    let baseDelay = 2000;
    while (retries >= 0) {
        try {
            const promptWithSchema = prompt + `\n\nRespond ONLY with valid JSON exactly matching this JSON schema:\n${JSON.stringify(zodToJsonSchema(schema))}`;
            
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "openrouter/free",
                    messages: [
                        { role: "user", content: promptWithSchema }
                    ],
                    response_format: { type: "json_object" }
                })
            });

            if (!response.ok) {
                const status = response.status;
                const errorData = await response.text();
                
                if (status === 429) {
                    const retryAfter = response.headers.get('retry-after');
                    let retryDelayMs = retryAfter ? parseInt(retryAfter) * 1000 : null;
                    
                    if (retries === 0) {
                        throw new Error(`AI Service currently unavailable due to high demand. Please try again later.`);
                    }
                    
                    let delay = baseDelay + Math.random() * 500;
                    if (retryDelayMs !== null) {
                        if (retryDelayMs > 15000) {
                            throw new Error(`AI Service quota exceeded. Please wait ${Math.ceil(retryDelayMs / 1000)} seconds before trying again.`);
                        }
                        delay = Math.max(delay, retryDelayMs);
                    }
                    console.log(`OpenRouter API failed for ${functionName} with status ${status}. Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    baseDelay *= 2;
                    retries--;
                    continue;
                }
                
                if (status === 408 || (status >= 500 && status < 600)) {
                    if (retries === 0) {
                        throw new Error(`AI Service currently unavailable. Please try again later.`);
                    }
                    let delay = baseDelay + Math.random() * 500;
                    console.log(`OpenRouter API failed for ${functionName} with status ${status}. Retrying in ${Math.round(delay)}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                    baseDelay *= 2;
                    retries--;
                    continue;
                }
                
                throw new Error(`OpenRouter error: ${status} ${errorData}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            
            let jsonString = content.trim();
            if (jsonString.startsWith('```json')) {
                jsonString = jsonString.substring(7, jsonString.length - 3).trim();
            } else if (jsonString.startsWith('```')) {
                jsonString = jsonString.substring(3, jsonString.length - 3).trim();
            }
            
            return JSON.parse(jsonString);
            
        } catch (error) {
            if (error.message.startsWith('AI Service') || error.message.startsWith('OpenRouter error')) {
                throw error;
            }
            
            if (retries === 0) {
                throw new Error(`AI Service error: ${error.message}`);
            }
            
            let delay = baseDelay + Math.random() * 500;
            console.log(`OpenRouter network/parse error for ${functionName}: ${error.message}. Retrying in ${Math.round(delay)}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            baseDelay *= 2;
            retries--;
        }
    }
}


const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job describe"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        intention: z.string().describe("The intention of interviewer behind asking this question"),
        answer: z.string().describe("How to answer this question, what points to cover, what approach to take etc.")
    })).describe("Behavioral questions that can be asked in the interview along with their intention and how to answer them"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill which the candidate is lacking"),
        severity: z.enum([ "low", "medium", "high" ]).describe("The severity of this skill gap, i.e. how important is this skill for the job and how much it can impact the candidate's chances")
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of this day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        tasks: z.array(z.string()).describe("List of tasks to be done on this day to follow the preparation plan, e.g. read a specific book or article, solve a set of problems, watch a video etc.")
    })).describe("A day-wise preparation plan for the candidate to follow in order to prepare for the interview effectively"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an interview report for a candidate with the following details:
                        Resume: ${resume}
                        Self Description: ${selfDescription}
                        Job Description: ${jobDescription}
`
    return await executeOpenRouter(prompt, interviewReportSchema, 'generateInterviewReport');
}



const resumeAnalysisSchemaZod = z.object({
    score: z.object({
        atsCompatibility: z.number().describe("Score 0-100 based on formatting and parseability"),
        contentStrength: z.number().describe("Score 0-100 based on impact and clarity"),
        skillsCoverage: z.number().describe("Score 0-100 based on presence of key skills")
    }),
    breakdown: z.object({
        strengths: z.array(z.string()).describe("List of strengths in the resume"),
        needsAttention: z.array(z.string()).describe("List of areas needing attention in the resume"),
        missing: z.array(z.string()).describe("List of missing crucial elements in the resume")
    }),
    sectionAnalysis: z.object({
        summary: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() }),
        experience: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() }),
        projects: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() }),
        education: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() }),
        certifications: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() }),
        skills: z.object({ status: z.string(), observations: z.string(), suggestions: z.string() })
    }),
    jdIntelligence: z.object({
        requiredSkills: z.array(z.string()),
        preferredSkills: z.array(z.string()),
        responsibilities: z.array(z.string()),
        qualifications: z.array(z.string())
    }).nullable(),
    matchBreakdown: z.object({
        matchedSkills: z.array(z.string()),
        partialSkills: z.array(z.string()),
        missingSkills: z.array(z.string()),
        overallMatch: z.number().describe("Overall match score 0-100")
    }).nullable(),
    recommendations: z.array(z.string()).describe("Actionable improvements based on the JD if provided, else general improvements")
})

async function analyzeResume({ resume, jobDescription }) {
    const prompt = `Analyze the following Resume for a candidate. 
    Current Date: ${new Date().toISOString().split('T')[0]}
    Resume: ${resume}
    Target Job Description (optional): ${jobDescription}

    If the Job Description is empty or not provided, return null for jdIntelligence and matchBreakdown, and focus solely on the resume's standalone strength. 
    If the Job Description is provided, provide a detailed comparison and match breakdown.
    
    IMPORTANT ANTI-HALLUCINATION RULES:
    1. NEVER invent skills, projects, achievements, or experience that are not explicitly in the resume.
    2. If a skill is required in the JD but missing from the resume, list it in matchBreakdown.missingSkills and clearly state it is missing. DO NOT tell the user to blindly add it unless they have genuine experience.
    3. Do NOT fabricate percentages or precise numbers if there is no data to support them. 
    4. Provide honest, actionable improvements.
    5. Be robust to formatting: "B.Tech" or "Course" counts as Education. "Certificates" or "Licenses" counts as Certifications. DO NOT mark them as missing if present.
    6. Properly calculate past/current/future dates based ONLY on the "Current Date" provided above. For example, if current date is Oct 2026, then July 2026 is in the PAST. DO NOT mark past dates as future dates.
    `

    return await executeOpenRouter(prompt, resumeAnalysisSchemaZod, 'analyzeResume');
}

const mockQuestionsSchemaZod = z.object({
    questions: z.array(z.object({
        question: z.string(),
        category: z.enum(["Technical", "Behavioral"]),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
        intention: z.string()
    }))
})

async function generateMockQuestions({ type, difficulty, questionCount, jobDescription, resume, skillGaps }) {
    const prompt = `Generate ${questionCount} interview questions for a mock interview.
    Interview Type: ${type} (If Mixed, provide a balanced mix of Technical and Behavioral)
    Difficulty: ${difficulty}
    
    Context to personalize the questions (if provided):
    Target Role / JD: ${jobDescription || 'General'}
    Candidate Resume: ${resume || 'None'}
    Identified Skill Gaps: ${skillGaps || 'None'}
    
    IMPORTANT RULES:
    1. If resume is provided, use actual projects/experience for behavioral questions. Do NOT invent projects, companies, skills, or experience.
    2. Ensure questions are relevant to the role and skill profile.
    3. Avoid repetitive questions.
    `

    return await executeOpenRouter(prompt, mockQuestionsSchemaZod, 'generateMockQuestions');
}

const mockEvaluationSchemaZod = z.object({
    whatYouDidWell: z.string(),
    whatToImprove: z.string(),
    exampleDirection: z.string().describe("Label this as 'Example Answer Structure' if providing an example. DO NOT fake the user's experience."),
    star: z.object({
        situation: z.enum(["✓", "✕", "⚠", "N/A"]),
        task: z.enum(["✓", "✕", "⚠", "N/A"]),
        action: z.enum(["✓", "✕", "⚠", "N/A"]),
        result: z.enum(["✓", "✕", "⚠", "N/A"])
    }).describe("For behavioral questions, evaluate STAR. For technical, return N/A for all.")
})

async function evaluateMockAnswer({ question, category, userAnswer }) {
    const prompt = `Evaluate the candidate's answer to this interview question.
    Category: ${category}
    Question: ${question}
    Candidate's Answer: ${userAnswer}
    
    IMPORTANT RULES:
    1. Provide concise feedback: what they did well, what to improve, and how to approach it better (exampleDirection).
    2. Do NOT fake the user's experience. If providing an example, base it on generic best practices if they didn't provide specifics.
    3. If the question is Behavioral, evaluate the STAR method (Situation, Task, Action, Result) with ✓, ✕, or ⚠. 
    4. If the question is Technical, mark all STAR fields as N/A.
    `

    return await executeOpenRouter(prompt, mockEvaluationSchemaZod, 'evaluateMockAnswer');
}

const tailoringSuggestionsSchemaZod = z.object({
    suggestions: z.array(z.object({
        originalText: z.string().describe("The original text from the resume"),
        suggestedText: z.string().describe("The suggested improved text"),
        explanation: z.string().describe("Why this suggestion improves the resume for the target role"),
        section: z.string().describe("The section of the resume (e.g. Summary, Experience, Skills)")
    }))
})

async function generateTailoringSuggestions({ resume, jobDescription }) {
    const prompt = `You are an expert resume writer and career coach. Review the following Resume and suggest improvements to tailor it for the provided Job Description.

    Resume: ${resume}
    Target Job Description: ${jobDescription}

    CRITICAL ANTI-HALLUCINATION RULES:
    1. NEVER invent or fabricate experience, skills, projects, metrics, or education that are not explicitly present in the Resume.
    2. Do NOT suggest adding statements like "Increased sales by X%" unless the user actually provided those numbers.
    3. You CAN reorganize existing facts, improve clarity, use stronger action verbs, and highlight existing relevant experience to better match the Job Description.
    4. If the Job Description requires a skill that is entirely absent from the Resume, you may suggest a placeholder like "[Add specific project where you used X, if applicable]" but do not invent the project yourself.

    Output a list of specific, actionable suggestions.
    `;

    return await executeOpenRouter(prompt, tailoringSuggestionsSchemaZod, 'generateTailoringSuggestions');
}

const careerInsightsSchemaZod = z.object({
    overallReadiness: z.number().describe("Overall readiness score from 0-100"),
    topStrengths: z.array(z.string()).describe("List of user's top strengths based on their real data"),
    focusAreas: z.array(z.string()).describe("List of areas requiring focus or improvement"),
    nextBestAction: z.object({
        title: z.string(),
        description: z.string(),
        recommendedRoute: z.string().describe("The best route to take, e.g. '/mock-interview', '/analyze', '/practice'")
    }),
    skillIntelligence: z.array(z.object({
        skill: z.string(),
        level: z.enum(["Strong", "Developing", "Needs Practice"])
    })),
    interviewInsights: z.object({
        technicalAccuracy: z.number().describe("Score 0-10"),
        answerDepth: z.number().describe("Score 0-10"),
        behavioralStructure: z.number().describe("Score 0-10")
    }),
    jobRequirementPatterns: z.array(z.string()).describe("Common skills or requirements seen across user's target jobs"),
    personalizedRecommendations: z.array(z.string()).describe("Actionable prep recommendations"),
    preparationRoadmap: z.array(z.object({
        step: z.string(),
        status: z.enum(["Completed", "In Progress", "Pending"])
    }))
})

async function analyzeCareerInsights({ summaryData }) {
    const prompt = `You are an expert AI Career Coach. Analyze the following aggregated user preparation data and generate a personalized career insight report.
    
    User Data Summary:
    ${summaryData}

    CRITICAL ANTI-HALLUCINATION RULES:
    1. NEVER invent skills, jobs, interview results, or mock scores. Base everything strictly on the User Data Summary provided above.
    2. If the user data is empty or very sparse, acknowledge that they are just starting out and recommend foundational steps (e.g., uploading a resume, analyzing their first job).
    3. Calculate 'overallReadiness' (0-100) based on their average interview match scores, mock results, and skill gaps. If they have no data, set it to 0.
    4. Provide actionable and realistic recommendations.
    `;

    return await executeOpenRouter(prompt, careerInsightsSchemaZod, 'analyzeCareerInsights');
}

module.exports = { generateInterviewReport, analyzeResume, generateMockQuestions, evaluateMockAnswer, generateTailoringSuggestions, analyzeCareerInsights }