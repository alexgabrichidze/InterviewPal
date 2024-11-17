import './globals.css';
import {
    ClerkProvider,
    SignInButton,
    SignedIn,
    SignedOut,
    UserButton,
} from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body>
                    <header className="bg-gray-100 h-[8vh] flex justify-between px-7 items-center shadow fixed top-0 left-0 w-full z-50">
                        <span className="absolute left-[4vw] text-2xl font-bold text-black">
                            InterviewPal
                        </span>
                        <SignedOut>
                            <SignInButton>
                                <Button className="absolute left-[94vw]">
                                    Sign In
                                </Button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton></UserButton>
                        </SignedIn>
                    </header>
                    <SignInButton />
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}
