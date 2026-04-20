import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Moon, Sun, Pill, Menu, UserCircle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import HomeDashboard from './pages/HomeDashboard';
import MedicineSearch from './pages/MedicineSearch';
import InteractionChecker from './pages/InteractionChecker';
import PrescriptionScan from './pages/PrescriptionScan';
import MyCabinet from './pages/MyCabinet';
import ChatFab from './components/ChatFab';
import AuthModal from './components/AuthModal';
import { Toaster, toast } from 'sonner';

function Navbar({ toggleTheme, isDark, user, openAuth, handleLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <Pill className="logo-icon" size={28} />
          MediWise
        </Link>
        
        <div className="nav-links">
          <Link to="/search" className="nav-link">Search</Link>
          <Link to="/interactions" className="nav-link">Interactions</Link>
          <Link to="/scan" className="nav-link">Scan</Link>
          {user && <Link to="/cabinet" className="nav-link">My Cabinet</Link>}
          
          <button className="nav-link" onClick={toggleTheme} aria-label="Toggle theme">
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          {user ? (
            <button className="btn btn-primary" onClick={handleLogout} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}>
              Log Out
            </button>
          ) : (
            <button className="btn btn-primary" onClick={openAuth} style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <UserCircle size={18} /> Log In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function AnimatedRoutes({ user }) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomeDashboard />} />
        <Route path="/search" element={<MedicineSearch />} />
        <Route path="/interactions" element={<InteractionChecker />} />
        <Route path="/scan" element={<PrescriptionScan />} />
        <Route path="/cabinet" element={<MyCabinet user={user} />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.removeAttribute('data-theme');
    }
  }, [isDark]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  return (
    <Router>
      <div className="app-container">
        <Toaster position="bottom-center" toastOptions={{ style: { background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)' } }} />
        
        <Navbar 
          toggleTheme={() => setIsDark(!isDark)} 
          isDark={isDark} 
          user={user} 
          openAuth={() => setIsAuthOpen(true)}
          handleLogout={handleLogout}
        />
        
        <main className="main-content">
          <AnimatedRoutes user={user} />
        </main>
        
        <footer style={{ textAlign: 'center', padding: '2rem 1rem 1rem 1rem', marginTop: 'auto', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
          <p>&copy; {new Date().getFullYear()} Raghav Sharma. All rights reserved.</p>
        </footer>
        
        <ChatFab />
        
        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          onLogin={(userData) => setUser(userData)} 
        />
      </div>
    </Router>
  );
}
