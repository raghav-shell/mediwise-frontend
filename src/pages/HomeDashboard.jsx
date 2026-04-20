import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShieldAlert, Camera, ArrowRight, Activity, Heart, Shield } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function HomeDashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <PageTransition>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', alignItems: 'center', paddingTop: '2rem' }}>
        
        {/* Massive Hero Section */}
        <section style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--primary)', marginBottom: '1.5rem' }}>
            <Activity size={48} />
          </div>
          <h1 className="page-title" style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>MediWise</h1>
          <p className="page-subtitle" style={{ fontSize: '1.25rem', marginBottom: '3rem' }}>Search any medicine to instantly find uses, side effects, and warnings.</p>
          
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: '750px', position: 'relative' }}>
            <div className="input-group" style={{ 
              display: 'flex', gap: '0.5rem', background: 'var(--glass-bg)', padding: '0.5rem', 
              borderRadius: 'var(--radius-full)', boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
              border: '1px solid var(--glass-border-highlight)' 
            }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search className="input-icon" size={24} style={{ left: '1.5rem', color: 'var(--text-tertiary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  style={{ 
                    border: 'none', background: 'transparent', padding: '1.25rem 1.25rem 1.25rem 4rem', 
                    fontSize: '1.2rem', boxShadow: 'none', backdropFilter: 'none'
                  }}
                  placeholder="E.g., Amoxicillin, Ibuprofen..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '0 2.5rem', fontSize: '1.1rem' }}>
                Search
              </button>
            </div>
          </form>
        </section>

        {/* Quick Actions Grid (Apple Style) */}
        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', width: '100%' }}>
          
          <div className="apple-card" onClick={() => navigate('/interactions')}>
            <ShieldAlert size={32} color="#FF9500" strokeWidth={1.5} />
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                Ensure safety. <br/>
                <span className="apple-grad-orange">Check interactions</span><br/>
                between your medicines instantly.
              </p>
            </div>
          </div>

          <div className="apple-card" onClick={() => navigate('/scan')}>
            <Camera size={32} color="#007AFF" strokeWidth={1.5} />
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                <span className="apple-grad-blue">Upload a prescription</span><br/>
                and let our AI auto-detect everything.
              </p>
            </div>
          </div>

          <div className="apple-card" onClick={() => navigate('/cabinet')}>
            <Heart size={32} color="#AF52DE" strokeWidth={1.5} />
            <div style={{ marginTop: '0.5rem' }}>
              <p style={{ fontSize: '1.15rem', fontWeight: '600', color: 'var(--text-primary)', lineHeight: '1.4' }}>
                Your health data. <br/>
                <span className="apple-grad-purple">Always secure and ready.</span>
              </p>
            </div>
          </div>

        </section>

        {/* Trust Indicators */}
        <section style={{ display: 'flex', justifyContent: 'center', gap: '4rem', borderTop: '1px solid var(--glass-border)', paddingTop: '2.5rem', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            <Heart size={20} /> <span>Trusted by Patients</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-tertiary)', fontWeight: '500' }}>
            <Shield size={20} /> <span>Data Privacy Safe</span>
          </div>
        </section>

      </div>
    </PageTransition>
  );
}
