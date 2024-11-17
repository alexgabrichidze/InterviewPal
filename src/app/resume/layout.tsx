import { Button } from "@/components/ui/button"
import Link from 'next/link';

export default function ResumeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <header className="bg-gray-100 h-[8vh] flex justify-between px-7 items-center fixed top-0 left-0 w-full z-50">
                <span className="absolute left-1/2 transform -translate-x-1/2 text-2xl font-bold text-black">
                    Resume Upload
                </span>
                <Link href="/">
                    <Button>Go Back</Button>
                </Link>
            </header>
            <main className="pt-[8vh]">{children}</main>
        </div>
    );
}
