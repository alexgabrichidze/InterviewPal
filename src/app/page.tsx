import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut } from '@clerk/nextjs';
import { FlipWords } from '@/components/ui/flip-words';
export default function Home() {
    const words = ['better', 'smarter', 'faster'];

    return (
        <div>
            <section className="w-full h-[92vh] flex flex-row justify-between items-center py-[40vh] px-[4vw]">
                <div className="flex flex-col justify-center items-left  gap-[4vh]">
                    <span className="text-4xl font-bold text-black">
                        InterviewPal
                    </span>
                    <div className=" flex justify-left items-left">
                        <div className="text-4xl font-normal text-neutral-600 dark:text-neutral-400">
                            Prepare
                            <FlipWords words={words} /> <br />
                            for your technical interviews.
                        </div>
                    </div>
                    <p className="text-4xl  text-neutral-600 dark:text-neutral-400">
                        Practice{' '}
                        <span className="font-bold text-neutral-600">key</span>{' '}
                        questions, <br />
                        get insights about your answer, <br />
                        and more!
                    </p>
                </div>
                <SignedOut>
                    <SignInButton>
                        <Button className="h-11 rounded-md px-8">
                            Start practicing
                        </Button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <Link href="/resume">
                        <Button className="h-11 rounded-md px-8">
                            Start practicing
                        </Button>
                    </Link>
                </SignedIn>
            </section>
        </div>
    );
}
