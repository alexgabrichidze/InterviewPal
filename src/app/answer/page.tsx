'use client';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import { type CarouselApi } from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Import Next.js router for navigation
import { AudioRecorderWithVisualizer } from '@/components/ui/AudioRecorderWithVisualizer';
import { motion, AnimatePresence } from 'framer-motion';

export default function Answer() {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [loadingStates, setLoadingStates] = useState<boolean[]>(
        Array(5).fill(true)
    );
    const [feedbackStates, setFeedbackStates] = useState<boolean[]>(
        Array(5).fill(false)
    );
    const router = useRouter(); // Initialize router

    const fetchQuestion = (index: number) => {
        setLoadingStates((prev) => {
            const newStates = [...prev];
            newStates[index] = true;
            return newStates;
        });
        setTimeout(() => {
            setLoadingStates((prev) => {
                const newStates = [...prev];
                newStates[index] = false;
                return newStates;
            });
        }, 2000); // Simulate 2 seconds delay
    };

    const handleFeedbackDisplay = (index: number) => {
        setTimeout(() => {
            setFeedbackStates((prev) => {
                const newStates = [...prev];
                newStates[index] = true;
                return newStates;
            });
        }, 500); // Shorter delay for a smoother transition
    };

    useEffect(() => {
        if (api) {
            fetchQuestion(current);
            api.on('select', () => {
                const newIndex = api.selectedScrollSnap();
                setCurrent(newIndex);
                fetchQuestion(newIndex);
            });
        }
    }, [api]);

    const handleNextButtonClick = () => {
        if (current === 4) {
            router.push('/report'); // Navigate to the /report route when on the last card
        } else {
            api?.scrollTo(current + 1);
        }
    };

    return (
        <div className="w-full h-[89vh] flex items-center justify-center relative">
            <div className="w-full max-w-5xl mx-auto flex flex-row items-center justify-center">
                <Button
                    onClick={() => api?.scrollTo(current - 1)}
                    disabled={loadingStates[current]}
                >
                    Previous
                </Button>
                <Carousel className="relative" setApi={setApi}>
                    <CarouselContent className="flex">
                        {[...Array(5)].map((_, index) => (
                            <CarouselItem
                                key={index}
                                className="min-w-full flex justify-center items-center"
                            >
                                <div className="p-8 bg-gray-100 rounded-2xl shadow-md max-w-2xl w-full h-[600px] flex flex-col justify-center items-center">
                                    <AnimatePresence>
                                        {!feedbackStates[index] ? (
                                            <motion.div
                                                key={`content-${index}`}
                                                initial={{ opacity: 1, y: 0 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -50 }}
                                                transition={{
                                                    duration: 0.8,
                                                    delay: 0.5,
                                                }}
                                                className="w-full h-full flex flex-col justify-center items-center"
                                            >
                                                {loadingStates[index] ? (
                                                    <p>Loading question...</p>
                                                ) : (
                                                    <>
                                                        <p>
                                                            SAMPLE QUESTION{' '}
                                                            {index + 1}?
                                                        </p>
                                                        <AudioRecorderWithVisualizer
                                                            className="rounded-lg bg-white"
                                                            timerClassName="text-lg font-mono"
                                                            onSubmit={() =>
                                                                handleFeedbackDisplay(
                                                                    index
                                                                )
                                                            }
                                                        />
                                                    </>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key={`feedback-${index}`}
                                                initial={{ opacity: 0, y: 100 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    duration: 0.8,
                                                }}
                                                className="w-full h-full flex flex-col justify-center items-center"
                                            >
                                                <p>Feedback:</p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                <Button
                    onClick={handleNextButtonClick}
                    disabled={loadingStates[current]}
                >
                    {current === 4 ? 'Generate Report' : 'Next'}
                </Button>
            </div>
        </div>
    );
}
