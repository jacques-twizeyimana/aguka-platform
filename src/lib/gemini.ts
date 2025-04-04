import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface WorkExperience {
  role: string;
  company: string;
  startDate: string;
  endDate: string | null;
  description: string[];
}

export interface Education {
  level: string;
  schoolName: string;
  startDate: string;
  endDate: string;
  gpa: string;
  achievements: string[];
}

export interface ResumeAnalysis {
  name: string;
  email: string;
  phone: string;
  ageGroup: string;
  careerSummary: string;
  workExperience: WorkExperience[];
  education: Education[];
}

export interface JobPoolAnalysis {
  suggestedPool: {
    title: string;
    description: string;
  };
  confidence: number;
  keywords: string[];
}

export async function analyzeResume(pdfText: string): Promise<ResumeAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this resume and extract the following information in JSON format:
    - Full name
    - Email address
    - Phone number
    - Approximate age group (20-25, 26-30, 31-35, 36-40, 41+)
    - Career summary
    - Work experience (array of objects with role, company, start date, end date (null if present), description/achievements array)
    - Education (array of objects with level, school name, start date, end date, GPA, achievements array)
    
    Here's the resume text:
    ${pdfText}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to parse resume analysis');
  }
}

export async function analyzeJobForPool(
  title: string,
  description: string,
  level: string
): Promise<JobPoolAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Analyze this job posting and suggest a job pool title and description. A job pool groups similar jobs based on the target recruitment audience. Consider the role, required skills, and experience level.

  Job details:
  Title: ${title}
  Level: ${level}
  Description: ${description}

  Return the analysis in this JSON format:
  {
    "suggestedPool": {
      "title": "A clear, specific title like 'Senior React Developer' or 'DevOps Team Lead'",
      "description": "A brief description of the target candidate profile"
    },
    "confidence": "A number between 0 and 1 indicating match confidence",
    "keywords": ["Array", "of", "key", "skills", "and", "requirements"]
  }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error('Failed to analyze job for pool classification');
  }
}