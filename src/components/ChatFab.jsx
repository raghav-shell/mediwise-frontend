import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Mic } from 'lucide-react';
import { toast } from 'sonner';

export default function ChatFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: "Hi! I'm your MediWise assistant. Do you have any questions about your medications or how to take them safely?" }
  ]);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    } else {
      // Turn off microphone if user closes the chat window
      if (isListening && recognitionRef.current) {
        recognitionRef.current.stop();
        setIsListening(false);
      }
    }
  }, [messages, isOpen]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice recognition is not supported in this browser.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
      toast('Listening...', { icon: '🎤' });
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setMessage(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      setIsListening(false);
      toast.error('Could not hear you clearly.');
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    // Add user message immediately
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setMessage('');

    try {
      // Connect to the new Groq AI Backend
      const res = await fetch('https://mediwise-backend-production.up.railway.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'AI Failed');
      
      setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: `Error: ${error.message}` }]);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'fixed',
              bottom: '5rem',
              right: '2rem',
              width: 'calc(100vw - 4rem)',
              maxWidth: '350px',
              backgroundColor: 'var(--glass-bg)',
              backdropFilter: 'blur(24px) saturate(180%)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--glass-shadow)',
              border: '1px solid var(--glass-border)',
              overflow: 'hidden',
              zIndex: 100
            }}
          >
            <div style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'var(--bg-base)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} />
                <span style={{ fontWeight: '600' }}>Ask MediWise AI</span>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'var(--bg-base)' }}><X size={20} /></button>
            </div>
            
            <div style={{ height: '300px', padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'transparent' }}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ 
                  alignSelf: msg.role === 'ai' ? 'flex-start' : 'flex-end', 
                  backgroundColor: msg.role === 'ai' ? 'var(--glass-bg)' : 'var(--primary-light)',
                  backdropFilter: 'blur(24px) saturate(180%)', 
                  padding: '0.75rem 1rem', 
                  borderRadius: msg.role === 'ai' ? '1rem 1rem 1rem 0' : '1rem 1rem 0 1rem', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
                  border: '1px solid var(--glass-border)',
                  maxWidth: '85%' 
                }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{msg.text}</p>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '1rem', borderTop: '1px solid var(--glass-border)', backgroundColor: 'var(--glass-bg)' }}>
              <div className="input-group" style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={toggleListening} 
                  style={{ 
                    padding: '0.75rem', 
                    borderRadius: '50%', 
                    backgroundColor: isListening ? 'var(--danger-light)' : 'var(--primary-light)', 
                    color: isListening ? 'var(--danger)' : 'var(--primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Mic size={18} />
                </button>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder={isListening ? "Listening..." : "Ask a question..."}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-full)' }}
                />
                <button className="btn btn-primary" onClick={handleSend} style={{ padding: '0.75rem', borderRadius: '50%' }}>
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          color: 'var(--bg-base)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          cursor: 'pointer'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </motion.button>
    </>
  );
}
