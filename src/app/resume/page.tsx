'use client';
import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // Import from 'next/navigation' for Next.js App Router
import { Button } from '@/components/ui/button';
import { Toaster, toast } from 'react-hot-toast';

export default function Resume() {
    const [jobDescription, setJobDescription] = useState<string>('');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);   
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter(); // Initialize the router

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        setResumeFile(file);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate async submission

            toast.success('Form submitted successfully!');
            setResumeFile(null);
            setJobDescription('');

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            // Redirect to the /answer route
            router.push('/answer');
        } catch (error) {
            toast.error('Failed to submit the form. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const isSubmitDisabled =
        !resumeFile || jobDescription.trim() === '' || isSubmitting;

    return (
        <section className="w-full h-[89vh] flex flex-col justify-center items-center py-[40vh] px-[4vw] space-y-4">
            <div>
                <label
                    htmlFor="file-upload"
                    className="block text-sm font-medium text-gray-700"
                >
                    Upload your resume (PDF or DOCX only)
                </label>
                <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.docx"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="mt-2 p-2 border border-gray-300 rounded"
                />
            </div>
            <div>
                <label
                    htmlFor="job-description"
                    className="block text-sm font-medium text-gray-700"
                >
                    Paste the job description
                </label>
                <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    className="mt-2 p-2 border border-gray-300 rounded w-64 h-64"
                    placeholder="Copy and paste the job description here..."
                ></textarea>
            </div>
            <Button
                className="mt-4"
                disabled={isSubmitDisabled}
                onClick={handleSubmit}
            >
                {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
            <Toaster />
        </section>
    );
}
