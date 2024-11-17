// import { NextResponse } from "next/server";

// export async function POST(req) {
//     const data = await req.json();
//     console.log("data", data.hello);
//     return NextResponse.json({ message: "Hello from the server!" });
// }

import { NextResponse } from 'next/server'; // Next.js's way of returning a response to user
import dotenv, { config } from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This function is used to retrieve information from GeminiAPI with streaming.
export async function POST(req) {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // AI model
    const reqObj = await req.json(); // Parse request to JS object
    const jobDescription = reqObj.jobDescription;
    const resume = reqObj.resume;

    // const prompt =
    //     "Give me 5 questions for a software engineering role interview based on this job description and my resume. I want you to cross reference key terms from the job description with my resume and find common key terms. Now use these key terms to create the questions such that they mimic the way an interviewer would look over a resume and ask questions related to the candidate's experience and projects that are relevant to the job description.Here is the job description:\n" +
    //     jobDescription +
    //     "\nHere is the resume:\n" +
    //     resume;
    const prompt = `
The user is preparing for a software engineer position interview. The job description includes the following required skills and responsibilities:
"${jobDescription}"

The user's resume highlights the projects, skills, and experience:
"${resume}"

Identify overlapping skills, technologies, or responsibilities between the job description and the resume. Based on these overlaps, generate 5 specific, detailed, and professional interview questions. Each question should:
1. Reference a specific skill, technology, or responsibility mentioned in both the resume and the job description.
2. Be tailored to the candidate’s experience as described in their resume.
3. Mimic how an interviewer might challenge the candidate on their past experience or test their ability to meet the job's requirements.

Format your response as a numbered list of questions. Do not include a title of the section/skill that the question is related to.
`;

    const result = await model.generateContentStream(prompt); // Send prompt to model
    const response = await result.response;
    const text = response.text(); // Get text from response

    return NextResponse.json({ message: text });
}

// TODO implement this
function cleanText(text) {
    console.log('resume before cleaning:\n', text);
    text = text
        .replace(/"/g, '\\"') // Escape double quotes for JSON compatibility
        .replace(/\t/g, ' ') // Replace tabs with spaces
        .replace(/•/g, '-') // Replace bullet points with dashes
        .replace(/ +/g, ' ') // Replace multiple spaces with a single space
        .trim(); // Trim leading/trailing spaces
    console.log('\n\n\nresume after cleaning:\n', text);
}
