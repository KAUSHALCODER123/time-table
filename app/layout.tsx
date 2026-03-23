import React from 'react';
import type { Metadata } from 'next';
import Navigation from './Navigation';
import '../src/styles/global.css';

export const metadata: Metadata = {
    title: 'Timetable Generator',
    description: 'Timetable Pro management application',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
              const getTheme = () => {
                if (typeof localStorage !== "undefined" && localStorage.getItem("theme")) {
                    return localStorage.getItem("theme");
                }
                if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
                    return "dark";
                }
                return "light";
              };
              document.documentElement.setAttribute("data-theme", getTheme());
            `,
                    }}
                />
            </head>
            <body>
                <Navigation>
                    {children}
                </Navigation>
            </body>
        </html>
    );
}
