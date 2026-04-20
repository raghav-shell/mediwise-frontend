import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Info, AlertTriangle, ShieldAlert, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query as firestoreQuery, where } from 'firebase/firestore';

const SkeletonCard = () => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ width: '40%', height: '24px', backgroundColor: 'var(--glass-border)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />
    <div style={{ width: '100%', height: '16px', backgroundColor: 'var(--glass-border)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite', animationDelay: '0.2s' }} />
    <div style={{ width: '80%', height: '16px', backgroundColor: 'var(--glass-border)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite', animationDelay: '0.4s' }} />
  </div>
);

export default function MedicineSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [cabinetMeds, setCabinetMeds] = useState(new Set());

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
    
    // Fetch cabinet to know which meds are already saved
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const q = firestoreQuery(collection(db, `medicines/${user.id}/items`));
      getDocs(q).then(snapshot => {
        const meds = snapshot.docs.map(doc => doc.data());
        setCabinetMeds(new Set(meds.map(m => m.medicine_name.toLowerCase())));
      }).catch(console.error);
    }
  }, []);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    setQuery(searchQuery);
    setSearchParams({ q: searchQuery });
    setStatus('loading');
    
    try {
      const response = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch data');
      }
      
      const result = await response.json();
      setData(result);
      toast.success(`Found results for ${result.name}`);
      setStatus('success');
    } catch (error) {
      toast.error('Failed to search medicine. Please try again.');
      setStatus('idle');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
    performSearch(query);
  };

  return (
    <PageTransition>
      <div className="page-header">
        <h1 className="page-title">Medicine Search</h1>
        <p className="page-subtitle">Instantly find uses, side effects, and warnings.</p>
      </div>

      <form onSubmit={handleSearch} style={{ maxWidth: '600px', margin: '0 auto 3rem auto' }}>
        <div className="input-group" style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="input-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="E.g., Amoxicillin, Ibuprofen..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-xl)' }}>
            Search
          </button>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-tertiary)' }}>
            <BookOpen size={64} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-secondary)' }}>Enter a medicine name to get started</h3>
            <p style={{ marginTop: '0.5rem' }}>We'll pull up the uses, side effects, and safety warnings.</p>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
             <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <div style={{ width: '64px', height: '64px', backgroundColor: 'var(--glass-border)', borderRadius: 'var(--radius-xl)', animation: 'pulse 1.5s infinite' }} />
               <div style={{ width: '200px', height: '32px', backgroundColor: 'var(--glass-border)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s infinite' }} />
             </div>
             <SkeletonCard />
             <SkeletonCard />
             <SkeletonCard />
          </motion.div>
        )}

        {status === 'success' && data && (
          <motion.div key="success" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-xl)', color: 'var(--primary)' }}>
                  <Search size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{data.name}</h2>
                  <span className="badge badge-low">{data.type}</span>
                </div>
              </div>
              
              <button 
                className="btn btn-save" 
                disabled={cabinetMeds.has(data.name.toLowerCase())}
                onClick={async () => {
                  const userStr = localStorage.getItem('user');
                  if (!userStr) return toast.error('Please log in first to save medicines');
                  const user = JSON.parse(userStr);
                  
                  try {
                    // Check for duplicates
                    const q = firestoreQuery(collection(db, `medicines/${user.id}/items`), where("medicine_name", "==", data.name));
                    const existing = await getDocs(q);
                    
                    if (!existing.empty) {
                      setCabinetMeds(prev => new Set([...prev, data.name.toLowerCase()]));
                      return toast.error('Medicine already in cabinet');
                    }
                    
                    await addDoc(collection(db, `medicines/${user.id}/items`), {
                      medicine_name: data.name,
                      added_at: Date.now()
                    });
                    
                    toast.success(`Saved ${data.name} to cabinet!`);
                    setCabinetMeds(prev => new Set([...prev, data.name.toLowerCase()]));
                  } catch (err) {
                    console.error(err);
                    toast.error('Failed to save');
                  }
                }}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  borderRadius: 'var(--radius-full)', 
                  fontWeight: 'bold',
                  opacity: cabinetMeds.has(data.name.toLowerCase()) ? 0.6 : 1,
                  cursor: cabinetMeds.has(data.name.toLowerCase()) ? 'not-allowed' : 'pointer'
                }}>
                {cabinetMeds.has(data.name.toLowerCase()) ? '✓ Saved to Cabinet' : '+ Save to Cabinet'}
              </button>
            </div>

            <div className="card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', marginBottom: '1rem' }}>
                <Info size={20} /> Uses
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{data.uses}</p>
            </div>

            <div className="card" style={{ borderColor: 'var(--warning)', backgroundColor: 'var(--glass-bg)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)', marginBottom: '1rem' }}>
                <AlertTriangle size={20} /> Side Effects
              </h3>
              <ul style={{ color: 'var(--text-secondary)', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', lineHeight: '1.6' }}>
                {data.sideEffects.map((effect, idx) => (
                  <li key={idx}>{effect}</li>
                ))}
              </ul>
            </div>

            <div className="card" style={{ borderColor: 'var(--danger)', backgroundColor: 'var(--glass-bg)' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--danger)', marginBottom: '1rem' }}>
                <ShieldAlert size={20} /> Warnings & Precautions
              </h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>{data.warnings}</p>
            </div>
            
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </PageTransition>
  );
}
