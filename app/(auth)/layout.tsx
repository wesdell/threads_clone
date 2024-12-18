import React from "react";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";

export const metadata = {
    title: "Threads",
    description: "Meta Threads Application"
};

const inter = Inter({subsets: ["latin"]});

export default function AuthLayout({children}: {children: React.ReactNode}) {
    return(
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1`}>
                    {children}
                </body>
            </html>
        </ClerkProvider>
    );
}