import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { fileURLToPath } from 'url';
let response = '';
export const POST = async (req, res) => {
    // Parse the incoming form data
    const formData = await req.formData();

    // Get the file from the form data
    const file = formData.get('file');

    // Check if a file is received
    if (!file) {
        // If no file is received, return a JSON response with an error and a 400 status code
        return NextResponse.json(
            { error: 'No files received.' },
            { status: 400 }
        );
    }

    // Convert the file data to a Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Replace spaces in the file name with underscores
    const filename = file.name.replaceAll(' ', '_');
    console.log(filename);

    try {
        // Define the directory path
        const dirPath = path.join(process.cwd(), 'public/assets');

        // Ensure the directory exists, creating it if necessary
        await mkdir(dirPath, { recursive: true });

        // Write the file to the specified directory (public/assets) with the modified filename
        await writeFile(path.join(dirPath, filename), buffer);

        // Return a JSON response with a success message and a 201 status code
        response = await readPDF(`public/assets/${filename}`);
        return NextResponse.json({
            Message: 'Success',
            status: 201,
            response: response,
        });
    } catch (error) {
        // If an error occurs during file writing, log the error and return a JSON response with a failure message and a 500 status code
        console.log('Error occurred ', error);
        return NextResponse.json({ Message: 'Failed', status: 500 });
    }
};

async function readPDF(fileURLToPath) {
    // Initialize GoogleGenerativeAI with your API_KEY.
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Initialize GoogleAIFileManager with your API_KEY.
    const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
        // Choose a Gemini model.
        model: 'gemini-1.5-flash',
    });

    // Upload the file and specify a display name.
    const uploadResponse = await fileManager.uploadFile(fileURLToPath, {
        mimeType: 'application/pdf',
        displayName: 'Gemini 1.5 PDF',
    });

    // View the response.
    console.log(
        `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    // Generate content using text and the URI reference for the uploaded file.
    const result = await model.generateContent([
        {
            fileData: {
                mimeType: uploadResponse.file.mimeType,
                fileUri: uploadResponse.file.uri,
            },
        },
        { text: 'Can you summarize this document as a bulleted list?' },
    ]);

    // Output the generated text to the console

    const responseText = await result.response.text();
    return responseText;
}
