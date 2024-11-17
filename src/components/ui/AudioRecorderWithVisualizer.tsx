'use client';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Mic, Trash } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { FaPaperPlane } from 'react-icons/fa';
import { Toaster, toast } from 'react-hot-toast';

type Props = {
    className?: string;
    timerClassName?: string;
};

type Record = {
    id: number;
    name: string;
    file: any;
};

let recorder: MediaRecorder;
let recordingChunks: BlobPart[] = [];
let timerTimeout: NodeJS.Timeout;

const padWithLeadingZeros = (num: number, length: number): string => {
    return String(num).padStart(length, '0');
};

export const AudioRecorderWithVisualizer = ({
    className,
    timerClassName,
    onSubmit,
}: Props & { onSubmit?: () => void }) => {
    const { theme } = useTheme();
    // States
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isRecordingFinished, setIsRecordingFinished] =
        useState<boolean>(false);
    const [timer, setTimer] = useState<number>(0);
    const [currentRecord, setCurrentRecord] = useState<Record>({
        id: -1,
        name: '',
        file: null,
    });
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // New state for submission

    // Calculate the hours, minutes, and seconds from the timer
    const hours = Math.floor(timer / 3600);
    const minutes = Math.floor((timer % 3600) / 60);
    const seconds = timer % 60;

    // Split the hours, minutes, and seconds into individual digits
    const [hourLeft, hourRight] = useMemo(
        () => padWithLeadingZeros(hours, 2).split(''),
        [hours]
    );
    const [minuteLeft, minuteRight] = useMemo(
        () => padWithLeadingZeros(minutes, 2).split(''),
        [minutes]
    );
    const [secondLeft, secondRight] = useMemo(
        () => padWithLeadingZeros(seconds, 2).split(''),
        [seconds]
    );
    // Refs
    const mediaRecorderRef = useRef<{
        stream: MediaStream | null;
        analyser: AnalyserNode | null;
        mediaRecorder: MediaRecorder | null;
        audioContext: AudioContext | null;
    }>({
        stream: null,
        analyser: null,
        mediaRecorder: null,
        audioContext: null,
    });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<any>(null);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const fullTranscriptRef = useRef<string>('');

    function startRecording() {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices
                .getUserMedia({ audio: true })
                .then((stream) => {
                    setIsRecording(true);
                    const AudioContext = window.AudioContext;
                    const audioCtx = new AudioContext();
                    const analyser = audioCtx.createAnalyser();
                    const source = audioCtx.createMediaStreamSource(stream);
                    source.connect(analyser);
                    mediaRecorderRef.current = {
                        stream,
                        analyser,
                        mediaRecorder: null,
                        audioContext: audioCtx,
                    };

                    const mimeType = MediaRecorder.isTypeSupported('audio/mpeg')
                        ? 'audio/mpeg'
                        : MediaRecorder.isTypeSupported('audio/webm')
                        ? 'audio/webm'
                        : 'audio/wav';

                    mediaRecorderRef.current.mediaRecorder = new MediaRecorder(
                        stream,
                        { mimeType }
                    );
                    mediaRecorderRef.current.mediaRecorder.start();
                    recordingChunks = [];
                    recorder = new MediaRecorder(stream);
                    recorder.start();
                    recorder.ondataavailable = (e) => {
                        recordingChunks.push(e.data);
                    };

                    // Initialize SpeechRecognition
                    if (
                        'SpeechRecognition' in window ||
                        'webkitSpeechRecognition' in window
                    ) {
                        recognitionRef.current =
                            new (window.SpeechRecognition ||
                                window.webkitSpeechRecognition)();
                        const recognition = recognitionRef.current;
                        recognition.lang = 'en-US';
                        recognition.interimResults = true;
                        recognition.continuous = true;
                        fullTranscriptRef.current = '';

                        recognition.onresult = (event) => {
                            let interimTranscript = '';
                            for (
                                let i = event.resultIndex;
                                i < event.results.length;
                                i++
                            ) {
                                const transcript =
                                    event.results[i][0].transcript;
                                if (event.results[i].isFinal) {
                                    fullTranscriptRef.current +=
                                        transcript + ' ';
                                } else {
                                    interimTranscript += transcript;
                                }
                            }
                        };

                        recognition.onerror = (event) => {
                            console.error('Transcription Error:', event.error);
                        };

                        recognition.start();
                    } else {
                        console.error(
                            'SpeechRecognition is not supported in this browser.'
                        );
                    }
                })
                .catch((error) => {
                    alert(error);
                    console.error('Error:', error);
                });
        }
    }

    function stopRecording() {
        recorder.onstop = () => {
            const recordBlob = new Blob(recordingChunks, {
                type: 'audio/wav',
            });

            const audioURL = window.URL.createObjectURL(recordBlob);
            setCurrentRecord({ ...currentRecord, file: audioURL });
            recordingChunks = [];
        };

        recorder.stop();
        setIsRecording(false);
        setIsRecordingFinished(true);
        setTimer(0);
        clearTimeout(timerTimeout);
    }

    function resetRecording() {
        const { mediaRecorder, stream, analyser, audioContext } =
            mediaRecorderRef.current;

        if (mediaRecorder) {
            mediaRecorder.onstop = () => {
                recordingChunks = [];
            };
            mediaRecorder.stop();
        } else {
            alert('Recorder instance is null!');
        }

        // Stop the web audio context and the analyser node
        if (analyser) {
            analyser.disconnect();
        }
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
        }
        if (audioContext) {
            audioContext.close();
        }
        setIsRecording(false);
        setIsRecordingFinished(true);
        setTimer(0);
        clearTimeout(timerTimeout);

        // Clear the animation frame and canvas
        cancelAnimationFrame(animationRef.current || 0);
        const canvas = canvasRef.current;
        if (canvas) {
            const canvasCtx = canvas.getContext('2d');
            if (canvasCtx) {
                const WIDTH = canvas.width;
                const HEIGHT = canvas.height;
                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            }
        }

        // Stop recognition if active
        if (recognitionRef.current) {
            recognitionRef.current.abort();
            recognitionRef.current = null;
            fullTranscriptRef.current = '';
        }
    }

    async function handleSubmit() {
        const recognition = recognitionRef.current;
        if (recognition) {
            const transcriptPromise = new Promise<string>((resolve) => {
                recognition.onend = () => {
                    const finalTranscript = fullTranscriptRef.current.trim();
                    console.log('Full transcript:', finalTranscript);
                    fullTranscriptRef.current = '';
                    recognitionRef.current = null;
                    resolve(finalTranscript);
                };
            });

            recognition.stop();
            stopRecording(); // Stop the recording process

            setIsSubmitting(true); // Disable the Submit button

            try {
                const finalTranscript = await transcriptPromise;

                // Simulate async submission with a timeout
                await new Promise((resolve) => setTimeout(resolve, 2000));
                
                onSubmit?.();
                // Simulate success
                console.log('Transcript submitted:', finalTranscript);
                toast.success('Transcript submitted successfully!');
                // Optionally reset the form or state here
            } catch (error) {
                console.error('Submission error:', error);
                toast.error(
                    'Failed to submit the transcript. Please try again.'
                );
            } finally {
                setIsSubmitting(false); // Re-enable the Submit button
            }
        } else {
            console.error('Recognition is null in handleSubmit');
        }
    }

    // Effect to update the timer every second
    useEffect(() => {
        if (isRecording) {
            timerTimeout = setTimeout(() => {
                setTimer(timer + 1);
            }, 1000);
        }
        return () => clearTimeout(timerTimeout);
    }, [isRecording, timer]);

    // Visualizer
    useEffect(() => {
        if (!canvasRef.current) return;

        const canvas = canvasRef.current;
        const canvasCtx = canvas.getContext('2d');
        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        const drawWaveform = (dataArray: Uint8Array) => {
            if (!canvasCtx) return;
            canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            canvasCtx.fillStyle = '#939393';

            const barWidth = 1;
            const spacing = 1;
            const maxBarHeight = HEIGHT / 2.5;
            const numBars = Math.floor(WIDTH / (barWidth + spacing));

            for (let i = 0; i < numBars; i++) {
                const barHeight =
                    Math.pow(dataArray[i] / 128.0, 8) * maxBarHeight;
                const x = (barWidth + spacing) * i;
                const y = HEIGHT / 2 - barHeight / 2;
                canvasCtx.fillRect(x, y, barWidth, barHeight);
            }
        };

        const visualizeVolume = () => {
            if (
                !mediaRecorderRef.current?.stream
                    ?.getAudioTracks()[0]
                    ?.getSettings().sampleRate
            )
                return;
            const bufferLength =
                (mediaRecorderRef.current?.stream
                    ?.getAudioTracks()[0]
                    ?.getSettings().sampleRate as number) / 100;
            const dataArray = new Uint8Array(bufferLength);

            const draw = () => {
                if (!isRecording) {
                    cancelAnimationFrame(animationRef.current || 0);
                    return;
                }
                animationRef.current = requestAnimationFrame(draw);
                mediaRecorderRef.current?.analyser?.getByteTimeDomainData(
                    dataArray
                );
                drawWaveform(dataArray);
            };

            draw();
        };

        if (isRecording) {
            visualizeVolume();
        } else {
            if (canvasCtx) {
                canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);
            }
            cancelAnimationFrame(animationRef.current || 0);
        }

        return () => {
            cancelAnimationFrame(animationRef.current || 0);
        };
    }, [isRecording, theme]);

    return (
        <div
            className={cn(
                'flex h-16 rounded-md relative w-full items-center justify-center gap-2 max-w-5xl',
                {
                    'border p-1': isRecording,
                    'border-none p-0': !isRecording,
                },
                className
            )}
        >
            {isRecording ? (
                <Timer
                    hourLeft={hourLeft}
                    hourRight={hourRight}
                    minuteLeft={minuteLeft}
                    minuteRight={minuteRight}
                    secondLeft={secondLeft}
                    secondRight={secondRight}
                    timerClassName={timerClassName}
                />
            ) : null}
            <canvas
                ref={canvasRef}
                className={`h-full w-full bg-background ${
                    !isRecording ? 'hidden' : 'flex'
                }`}
            />
            <div className="flex gap-2">
                {/* ========== Delete recording button ========== */}
                {isRecording ? (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={resetRecording}
                                size={'icon'}
                                variant={'destructive'}
                                className="w-full px-3"
                                disabled={isSubmitting} // Disable if submitting
                            >
                                <Trash size={15} />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent className="m-2">
                            <span> Reset recording</span>
                        </TooltipContent>
                    </Tooltip>
                ) : null}

                {/* ========== Start and send recording button ========== */}
                <Tooltip>
                    <TooltipTrigger asChild>
                        {!isRecording ? (
                            <Button
                                onClick={() => startRecording()}
                                size={'icon'}
                                className="w-full px-4"
                                disabled={isSubmitting} // Disable if submitting
                            >
                                Record
                                <Mic size={15} />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                size={'icon'}
                                className="w-full px-4"
                                disabled={isSubmitting} // Disable if submitting
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                                <FaPaperPlane
                                    size={15}
                                    className="text-[0.9rem] opacity-80 transition"
                                />
                            </Button>
                        )}
                    </TooltipTrigger>
                    <TooltipContent className="m-2">
                        <span>
                            {' '}
                            {!isRecording
                                ? 'Start recording'
                                : 'Submit recording'}{' '}
                        </span>
                    </TooltipContent>
                </Tooltip>
            </div>
            <Toaster /> {/* Add Toaster component */}
        </div>
    );
};

const Timer = React.memo(
    ({
        hourLeft,
        hourRight,
        minuteLeft,
        minuteRight,
        secondLeft,
        secondRight,
        timerClassName,
    }: {
        hourLeft: string;
        hourRight: string;
        minuteLeft: string;
        minuteRight: string;
        secondLeft: string;
        secondRight: string;
        timerClassName?: string;
    }) => {
        return (
            <div
                className={cn(
                    'items-center -top-12 left-0 absolute justify-center gap-0.5 border p-1.5 rounded-md font-mono font-medium text-foreground flex',
                    timerClassName
                )}
            >
                <span className="rounded-md bg-background p-0.5 text-foreground">
                    {hourLeft}
                </span>
                <span className="rounded-md bg-background p-0.5 text-foreground">
                    {hourRight}
                </span>
                <span>:</span>
                <span className="rounded-md bg-background p-0.5 text-foreground">
                    {minuteLeft}
                </span>
                <span className="rounded-md bg-background p-0.5 text-foreground">
                    {minuteRight}
                </span>
                <span>:</span>
                <span className="rounded-md bg-background p-0.5 text-foreground">
                    {secondLeft}
                </span>
                <span className="rounded-md bg-background p-0.5 text-foreground ">
                    {secondRight}
                </span>
            </div>
        );
    }
);
Timer.displayName = 'Timer';
