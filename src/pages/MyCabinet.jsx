import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pill, Plus, Trash2, ShieldAlert, Activity, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';

import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';

export default function MyCabinet({ user }) {
  const navigate = useNavigate();
  const [meds, setMeds] = useState([]);
  const [newMed, setNewMed] = useState('');
  const [status, setStatus] = useState('idle');

  const fetchCabinet = async () => {
    try {
      const q = query(collection(db, `medicines/${user.id}/items`));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => b.added_at - a.added_at);
      setMeds(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load cabinet');
    }
  };

  useEffect(() => {
    if (user) fetchCabinet();
  }, [user]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newMed.trim()) return;
    
    try {
      // Check for duplicates
      const q = query(collection(db, `medicines/${user.id}/items`), where("medicine_name", "==", newMed));
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        toast.error('Medicine already in cabinet');
        return;
      }

      await addDoc(collection(db, `medicines/${user.id}/items`), {
        medicine_name: newMed,
        added_at: Date.now()
      });
      
      toast.success(`Added ${newMed} to cabinet`);
      setNewMed('');
      fetchCabinet();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add medicine');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, `medicines/${user.id}/items`, id));
      toast.success('Removed medicine');
      fetchCabinet();
    } catch (error) {
      console.error(error);
      toast.error('Failed to remove medicine');
    }
  };

  const handleCheckAll = async () => {
    if (meds.length < 2) {
      return toast.warning('You need at least 2 medicines to check interactions.');
    }
    
    const medicineNames = meds.map(m => m.medicine_name);
    navigate('/interactions', { state: { prefilledMeds: medicineNames } });
  };

  if (!user) {
    return (
      <PageTransition>
        <div style={{ textAlign: 'center', padding: '5rem 0' }}>
          <ShieldAlert size={64} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1.5rem auto' }} />
          <h2 className="page-title" style={{ fontSize: '2rem' }}>Please Log In</h2>
          <p className="page-subtitle">You must be logged in to access your personal medicine cabinet.</p>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="page-header">
        <h1 className="page-title">My Cabinet</h1>
        <p className="page-subtitle">Manage your daily medications and check them all at once.</p>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* Add Medicine Form */}
        <form onSubmit={handleAdd} className="card" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', backgroundColor: 'var(--glass-bg)' }}>
          <div className="input-group" style={{ flex: 1 }}>
            <Pill className="input-icon" size={20} />
            <input 
              type="text" 
              className="input-field" 
              placeholder="Add a new medicine..."
              value={newMed}
              onChange={(e) => setNewMed(e.target.value)}
              style={{ backgroundColor: 'transparent' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 2rem' }}>
            <Plus size={20} /> Add
          </button>
        </form>

        {/* Action Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 1rem' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>{meds.length} Saved Medicines</h3>
          <button 
            onClick={handleCheckAll} 
            disabled={meds.length < 2}
            className="btn btn-secondary" 
            style={{ 
              borderColor: meds.length < 2 ? 'var(--glass-border)' : 'var(--warning)', 
              color: meds.length < 2 ? 'var(--text-tertiary)' : 'var(--warning)',
              opacity: meds.length < 2 ? 0.5 : 1,
              cursor: meds.length < 2 ? 'not-allowed' : 'pointer'
            }}>
            <ShieldAlert size={18} /> Check All Interactions
          </button>
        </div>

        {/* Medicine List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <AnimatePresence>
            {meds.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-tertiary)' }}>
                <Heart size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <p>Your cabinet is empty. Start adding medicines above.</p>
              </motion.div>
            ) : (
              meds.map((med) => (
                <motion.div 
                  key={med.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-md)' }}>
                      <Pill size={24} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)' }}>{med.medicine_name}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)' }}>Added on {new Date(med.added_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(med.id)} className="btn" style={{ color: 'var(--danger)', padding: '0.5rem' }}>
                    <Trash2 size={20} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
