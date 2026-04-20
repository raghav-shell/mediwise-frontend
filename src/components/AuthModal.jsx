import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const userData = {
        id: user.uid,
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      };

      // Get standard Firebase JWT if we want to pass to backend later
      const token = await user.getIdToken();
      localStorage.setItem('token', token);
      
      localStorage.setItem('user', JSON.stringify(userData));
      onLogin(userData);
      toast.success('Successfully logged in with Google!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Google login failed.');
    }
  };

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card" style={{ position: 'relative', width: '100%', maxWidth: '400px', padding: '2.5rem', margin: '1rem', zIndex: 1001, textAlign: 'center' }}
        >
          <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', color: 'var(--text-tertiary)' }}>
            <X size={24} />
          </button>
          
          <div style={{ marginBottom: '2rem' }}>
            <Activity size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)' }}>Welcome to MediWise</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to access your personal medicine cabinet and scan history.</p>
          </div>

          <button onClick={handleGoogleLogin} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>

          <p style={{ marginTop: '1.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
