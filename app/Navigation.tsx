"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '../src/components/ThemeToggle';

export default function Navigation({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <>
            <header className="app-header">
                <div className="header-inner">
                    <Link href="/" className="logo">
                        <span className="logo-icon">📅</span>
                        TimeTable Pro
                    </Link>
                    <nav className="nav-desktop">
                        <ul className="nav-links">
                            <li><Link href="/" className={pathname === '/' ? 'active' : ''}>View Timetable</Link></li>
                            <li><Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
                        </ul>
                    </nav>
                    <div className="header-actions">
                        <ThemeToggle />
                    </div>
                </div>
            </header>
            <main className="main-content">
                {children}
            </main>
            <nav className="mobile-tab-bar">
                <Link href="/" className={`mobile-tab ${pathname === '/' ? 'active' : ''}`}>
                    <span className="mobile-tab-icon">📅</span>
                    <span className="mobile-tab-label">Timetable</span>
                </Link>
                <Link href="/admin" className={`mobile-tab ${pathname === '/admin' ? 'active' : ''}`}>
                    <span className="mobile-tab-icon">⚙️</span>
                    <span className="mobile-tab-label">Admin</span>
                </Link>
            </nav>
        </>
    );
}
