import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import TimetableView from './components/TimetableView';
import AdminApp from './components/AdminApp';
import ThemeToggle from './components/ThemeToggle';

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          <Link to="/" className="logo">
            <span className="logo-icon">📅</span>
            TimeTable Pro
          </Link>
          <nav className="nav-desktop">
            <ul className="nav-links">
              <li><Link to="/" className={pathname === '/' ? 'active' : ''}>View Timetable</Link></li>
              <li><Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
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
        <Link to="/" className={`mobile-tab ${pathname === '/' ? 'active' : ''}`}>
          <span className="mobile-tab-icon">📅</span>
          <span className="mobile-tab-label">Timetable</span>
        </Link>
        <Link to="/admin" className={`mobile-tab ${pathname === '/admin' ? 'active' : ''}`}>
          <span className="mobile-tab-icon">⚙️</span>
          <span className="mobile-tab-label">Admin</span>
        </Link>
      </nav>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<div className="container page-content"><TimetableView /></div>} />
          <Route path="/admin" element={<AdminApp />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
