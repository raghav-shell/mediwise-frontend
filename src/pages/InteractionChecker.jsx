import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldAlert, Plus, AlertCircle, CheckCircle, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';

export default function InteractionChecker() {
  const location = useLocation();
  const initialMeds = location.state?.prefilledMeds || ['', ''];
  const [meds, setMeds] = useState(initialMeds);
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);

  const updateMed = (index, value) => {
    const newMeds = [...meds];
    newMeds[index] = value;
    setMeds(newMeds);
  };

  const addMed = () => setMeds([...meds, '']);
  const removeMed = (index) => {
    if (meds.length <= 2) return;
    const newMeds = meds.filter((_, i) => i !== index);
    setMeds(newMeds);
  };

  const handleCheck = async () => {
    const validMeds = meds.filter(m => m.trim() !== '');
    if (validMeds.length >= 2) {
      setStatus('loading');

      try {
        const response = await fetch('https://mediwise-backend-production.up.railway.app/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ medicines: validMeds })
        });

        if (!response.ok) throw new Error('Failed to fetch interaction data');

        const result = await response.json();
        setData(result);
        setStatus('success');

        if (result.riskLevel === 'HIGH') {
          toast.error('High risk interaction detected!');
        } else {
          toast.success('Interaction check complete. Safe to take.');
        }
      } catch (error) {
        toast.error('Error connecting to backend API.');
        setStatus('idle');
      }
    } else {
      toast.warning('Please enter at least 2 medications.');
    }
  };

  return (
    <PageTransition>
      <div className="page-header">
        <h1 className="page-title">Interaction Checker</h1>
        <p className="page-subtitle">Check for potential interactions between multiple medications via API.</p>
      </div>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto 2rem auto', padding: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
          <AnimatePresence>
            {meds.map((med, index) => (
              <motion.div key={index} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="input-group" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <div className="input-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    {index + 1}
                  </div>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Enter medicine name..."
                    value={med}
                    onChange={(e) => updateMed(index, e.target.value)}
                  />
                </div>
                {meds.length > 2 && (
                  <button onClick={() => removeMed(index)} className="btn" style={{ padding: '0.75rem', color: 'var(--text-tertiary)' }}>
                    <X size={20} />
                  </button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* SURGICAL FIX: Added flexWrap, flex '1 1 auto', and gap to let buttons stack smoothly */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={addMed} style={{ borderRadius: 'var(--radius-full)', flex: '1 1 auto' }}>
            <Plus size={18} /> Add Medicine
          </button>
          <button className="btn btn-primary" onClick={handleCheck} style={{ flex: '1 1 auto' }}>
            {status === 'loading' ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={18} /></motion.div> : <><RefreshCw size={18} /> Check Interactions</>}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {status === 'success' && data && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px', margin: '0 auto' }}>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '3rem 2rem 1rem 2rem' }}>
              <h3 style={{ color: 'var(--text-secondary)', fontSize: '1.25rem', fontWeight: '600' }}>Overall Safety Level</h3>
              <div style={{ position: 'relative', width: '240px', height: '120px', overflow: 'hidden', marginTop: '1rem' }}>
                <div style={{ width: '240px', height: '240px', borderRadius: '50%', border: '24px solid var(--glass-border)', borderBottomColor: 'transparent', borderRightColor: 'transparent', transform: 'rotate(45deg)', position: 'absolute' }} />

                <motion.div
                  initial={{ rotate: -135 }}
                  animate={{ rotate: data.riskLevel === 'HIGH' ? -105 : (data.riskLevel === 'MODERATE' ? -45 : 45) }}
                  transition={{ duration: 1.5, type: 'spring', bounce: 0.4 }}
                  style={{ width: '240px', height: '240px', borderRadius: '50%', border: '24px solid transparent', borderTopColor: data.riskLevel === 'HIGH' ? 'var(--danger)' : (data.riskLevel === 'MODERATE' ? 'var(--warning)' : 'var(--success)'), borderLeftColor: data.riskLevel === 'HIGH' ? 'var(--danger)' : (data.riskLevel === 'MODERATE' ? 'var(--warning)' : 'var(--success)'), position: 'absolute' }}
                />
                <div style={{ position: 'absolute', bottom: '0', width: '100%', textAlign: 'center', fontWeight: '800', fontSize: '2rem', color: data.riskLevel === 'HIGH' ? 'var(--danger)' : (data.riskLevel === 'MODERATE' ? 'var(--warning)' : 'var(--success)') }}>
                  {data.riskLevel}
                </div>
              </div>
            </div>

            {data.interactions.map((interaction, idx) => (
              <div key={idx} className="card" style={{ borderLeft: `6px solid ${interaction.severity === 'Safe' ? 'var(--success)' : 'var(--danger)'}`, display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                <div style={{ color: interaction.severity === 'Safe' ? 'var(--success)' : 'var(--danger)', marginTop: '0.25rem' }}>
                  {interaction.severity === 'Safe' ? <CheckCircle size={28} /> : <AlertCircle size={28} />}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: '700' }}>{interaction.meds.join(' + ')}</h3>
                    <span className={interaction.severity === 'Safe' ? 'badge badge-low' : 'badge badge-high'}>{interaction.severity}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    {interaction.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}