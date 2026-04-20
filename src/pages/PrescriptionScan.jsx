import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, UploadCloud, FileText, CheckCircle2, ChevronRight, ChevronDown, Activity, Info, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import PageTransition from '../components/PageTransition';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export default function PrescriptionScan() {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, scanning, success
  const [data, setData] = useState(null);
  
  const [expandedMed, setExpandedMed] = useState(null);
  const [medDetails, setMedDetails] = useState({});
  const [cabinetMeds, setCabinetMeds] = useState(new Set());

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      const q = query(collection(db, `medicines/${user.id}/items`));
      getDocs(q).then(snapshot => {
        const meds = snapshot.docs.map(doc => doc.data());
        setCabinetMeds(new Set(meds.map(m => m.medicine_name.toLowerCase())));
      }).catch(console.error);
    }
  }, []);

  const handleCheckInteractions = () => {
    if (!data || data.length < 2) {
      toast.warning('Need at least 2 medicines to check interactions!');
      return;
    }
    const medNames = data.map(m => m.name.split(' ')[0]); // Get base name
    navigate('/interactions', { state: { prefilledMeds: medNames } });
  };

  const handleMedClick = async (medName) => {
    const baseName = medName.split(' ')[0];
    if (expandedMed === baseName) {
      setExpandedMed(null);
      return;
    }
    setExpandedMed(baseName);
    
    if (!medDetails[baseName]) {
      try {
        const res = await fetch(`http://localhost:3000/api/search?q=${encodeURIComponent(baseName)}`);
        const result = await res.json();
        setMedDetails(prev => ({ ...prev, [baseName]: result }));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('scanning');
    toast('Uploading to Backend AI OCR...', { icon: '☁️' });

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64data = reader.result;
      
      try {
        const response = await fetch('http://localhost:3000/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64data })
        });
        
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'API Error');
        
        setData(result.detectedMedicines);
        setStatus('success');
        toast.success(`Backend AI extracted ${result.detectedMedicines.length} medicines.`);
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Backend connection failed!');
        setStatus('idle');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <PageTransition>
      <div className="page-header">
        <h1 className="page-title">Scan Prescription</h1>
        <p className="page-subtitle">Upload or take a photo of your prescription to auto-detect medicines using AI.</p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            style={{
              maxWidth: '650px',
              margin: '0 auto',
              border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--glass-border-highlight)'}`,
              borderRadius: 'var(--radius-xl)',
              padding: '5rem 2rem',
              textAlign: 'center',
              backgroundColor: isDragging ? 'var(--primary-light)' : 'var(--glass-bg)',
              backdropFilter: 'blur(30px)',
              boxShadow: 'var(--glass-shadow)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileUpload({ target: { files: e.dataTransfer.files }}); }}
            whileHover={{ scale: 1.02 }}
          >
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
              id="file-upload" 
            />
            <label htmlFor="file-upload" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem', cursor: 'pointer' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--primary)' }}>
                <UploadCloud size={56} />
              </div>
              <h3 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: '700' }}>Click or Drag image to upload</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Supports JPG, PNG, PDF</p>
              <div className="btn btn-primary" style={{ marginTop: '1.5rem' }}>
                Browse Files
              </div>
            </label>
          </motion.div>
        )}

        {status === 'scanning' && (
          <motion.div 
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ maxWidth: '650px', margin: '0 auto', textAlign: 'center', padding: '5rem 0' }}
          >
            <motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ color: 'var(--primary)', marginBottom: '2.5rem', display: 'inline-block' }}
            >
              <Activity size={72} />
            </motion.div>
            <h3 style={{ fontSize: '1.75rem', color: 'var(--text-primary)', fontWeight: '700' }}>Backend AI is reading your prescription...</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem', fontSize: '1.1rem' }}>Extracting medicine names and dosages via API.</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '4rem', opacity: 0.6 }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '70px', backgroundColor: 'var(--glass-border-highlight)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          </motion.div>
        )}

        {status === 'success' && data && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ maxWidth: '650px', margin: '0 auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2.5rem', justifyContent: 'center' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}>
                <CheckCircle2 color="var(--success)" size={48} />
              </motion.div>
              <h2 style={{ fontSize: '2rem', color: 'var(--text-primary)', fontWeight: '800', letterSpacing: '-0.02em' }}>Scan Successful</h2>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontSize: '1.35rem' }}>
                <FileText size={24} /> Detected Medicines
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {data.map((med, i) => {
                  const baseName = med.name.split(' ')[0];
                  const isExpanded = expandedMed === baseName;
                  const details = medDetails[baseName];

                  return (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }} 
                    animate={{ opacity: 1, x: 0 }} 
                    transition={{ delay: i * 0.15 }}
                    key={i} 
                    style={{ overflow: 'hidden', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border-highlight)' }}
                  >
                    <div 
                      onClick={() => handleMedClick(med.name)}
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem' }}
                    >
                      <div>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{med.name}</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{med.dosage}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className="btn btn-save" 
                          disabled={cabinetMeds.has(med.name.toLowerCase())}
                          onClick={async (e) => {
                            e.stopPropagation();
                            const userStr = localStorage.getItem('user');
                            if (!userStr) return toast.error('Please log in first to save medicines');
                            const user = JSON.parse(userStr);
                            
                            try {
                              const q = query(collection(db, `medicines/${user.id}/items`), where("medicine_name", "==", med.name));
                              const existing = await getDocs(q);
                              
                              if (!existing.empty) {
                                setCabinetMeds(prev => new Set([...prev, med.name.toLowerCase()]));
                                return toast.error('Medicine already in cabinet');
                              }
                              
                              await addDoc(collection(db, `medicines/${user.id}/items`), {
                                medicine_name: med.name,
                                dosage: med.dosage,
                                added_at: Date.now()
                              });
                              
                              toast.success(`Saved ${med.name} to cabinet!`);
                              setCabinetMeds(prev => new Set([...prev, med.name.toLowerCase()]));
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to save');
                            }
                          }}
                          style={{ 
                            padding: '0.5rem 1rem', 
                            borderRadius: 'var(--radius-full)', 
                            fontSize: '0.85rem', 
                            fontWeight: 'bold',
                            opacity: cabinetMeds.has(med.name.toLowerCase()) ? 0.6 : 1,
                            cursor: cabinetMeds.has(med.name.toLowerCase()) ? 'not-allowed' : 'pointer'
                          }}>
                          {cabinetMeds.has(med.name.toLowerCase()) ? '✓ Saved' : '+ Save'}
                        </button>
                        <button className="btn" style={{ padding: '0.75rem', color: 'var(--primary)', backgroundColor: 'var(--glass-bg)', borderRadius: '50%' }}>
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        </button>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          style={{ padding: '0 1.25rem 1.25rem 1.25rem', color: 'var(--text-secondary)', fontSize: '0.95rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}
                        >
                          {!details ? (
                            <p style={{ paddingTop: '1rem' }}>Loading FDA Data...</p>
                          ) : (
                            <div style={{ paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              <p><strong><Info size={14} style={{display:'inline', marginBottom:'-2px'}}/> Uses:</strong> {details.uses}</p>
                              <p><strong><AlertTriangle size={14} style={{display:'inline', marginBottom:'-2px'}}/> Side Effects:</strong> {details.sideEffects?.join(' ')}</p>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )})}
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '3rem' }}>
                <button className="btn btn-primary" onClick={handleCheckInteractions} style={{ flex: 1 }}>Check Interactions</button>
                <button className="btn btn-secondary" onClick={() => setStatus('idle')}>Scan Another</button>
              </div>
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
