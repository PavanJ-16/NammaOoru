import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Namma Guide - Your Bengaluru Companion",
    description: "Intelligent city companion for anyone new to Bengaluru. Voice translation, smart transport planning, and local discovery.",
    manifest: "/manifest.json",
    themeColor: "#0f172a",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className={inter.className}>
                {children}
            </body>
        </html>
    );
}
