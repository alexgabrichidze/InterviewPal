import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// Configuration to run the middleware for specific routes
export const config = {
    matcher: [
        '/answer',
        '/resume',
        '/api/:path*',
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    ],
};
