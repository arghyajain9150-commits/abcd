import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { X, Sparkles, Send, Stethoscope, AlertTriangle, ShieldCheck, ArrowRight, Bot } from 'lucide-react';
import { triageSymptoms } from '../api/index.js';

const C = {
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  ink: '#17322C',
  soft: '#5B7169',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  accent: '#E3A542',
};

const PROMPT_CHIPS = [
  'Red, itchy & watery eyes',
  'High fever & sore throat',
  'Skin rash with itching',
  'Twisted ankle during football',
  'Severe menstrual cramps',
];

export default function AIAssistantModal({ initialQuery = '', onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Hello! I am your CHAMP AI Health Assistant. How are you feeling today? Describe any symptoms or concerns.',
      recommendation: null,
    },
  ]);
  const [input, setInput] = useState(initialQuery || '');
  const scrollRef = useRef(null);

  const { mutate: sendTriage, isPending } = useMutation({
    mutationFn: (text) => triageSymptoms({ message: text }),
    onSuccess: (res) => {
      const data = res.data;
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: data.reply,
          recommendation: data,
        },
      ]);
    },
    onError: () => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'I am having trouble reaching the campus triage server right now. If your symptoms are severe, please reach the Campus Health Centre or call 108.',
          recommendation: null,
        },
      ]);
    },
  });

  const handleSend = (textToSend) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || isPending) return;

    setMessages((prev) => [...prev, { role: 'user', text: queryText }]);
    setInput('');
    sendTriage(queryText);
  };

  useEffect(() => {
    if (initialQuery) {
      handleSend(initialQuery);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isPending]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 60,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.surface,
          borderRadius: 24,
          width: '100%',
          maxWidth: 440,
          height: '84vh',
          maxHeight: 700,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px -15px rgba(23,50,44,0.4)',
          overflow: 'hidden',
          border: `1px solid ${C.border}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 6 }}>
                Gemini Health AI
                <span
                  style={{
                    fontSize: 9,
                    background: C.accent,
                    color: '#fff',
                    padding: '2px 6px',
                    borderRadius: 99,
                    textTransform: 'uppercase',
                  }}
                >
                  Triage Live
                </span>
              </div>
              <div style={{ fontSize: 11, color: '#C8DDD7' }}>
                Campus epidemic & symptom evaluator
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Message Stream */}
        <div
          ref={scrollRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 16px 20px',
            background: C.bg,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: m.role === 'user' ? 'flex-end' : 'flex-start',
                gap: 6,
              }}
            >
              <div
                style={{
                  maxWidth: '85%',
                  background: m.role === 'user' ? C.primary : C.surface,
                  color: m.role === 'user' ? '#fff' : C.ink,
                  padding: '12px 14px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 8px -2px rgba(23,50,44,0.08)',
                  border: m.role === 'user' ? 'none' : `1px solid ${C.border}`,
                }}
              >
                {m.text}
              </div>

              {/* Recommendation Card */}
              {m.recommendation && (
                <div
                  style={{
                    width: '100%',
                    background: '#fff',
                    borderRadius: 16,
                    padding: 14,
                    border: `1.5px solid ${m.recommendation.urgency === 'urgent' ? '#F5C6BA' : C.border}`,
                    boxShadow: '0 4px 14px -3px rgba(23,50,44,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Stethoscope size={16} color={C.primary} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>
                        {m.recommendation.recommendedDoctor}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 99,
                        background:
                          m.recommendation.urgency === 'urgent'
                            ? C.urgentSoft
                            : m.recommendation.urgency === 'moderate'
                            ? '#FFF4E5'
                            : C.primarySoft,
                        color:
                          m.recommendation.urgency === 'urgent'
                            ? C.urgent
                            : m.recommendation.urgency === 'moderate'
                            ? C.accent
                            : C.primary,
                      }}
                    >
                      {m.recommendation.recommendedSpecialty}
                    </span>
                  </div>

                  {m.recommendation.preventionTips?.length > 0 && (
                    <div
                      style={{
                        background: C.bg,
                        borderRadius: 10,
                        padding: '8px 10px',
                        fontSize: 11.5,
                        color: C.soft,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: C.ink, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <ShieldCheck size={13} color={C.primary} /> Immediate Precautions:
                      </div>
                      {m.recommendation.preventionTips.slice(0, 3).map((tip, i) => (
                        <div key={i}>• {tip}</div>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => {
                      onClose();
                      navigate('/appointments');
                    }}
                    style={{
                      background: C.primary,
                      color: '#fff',
                      borderRadius: 12,
                      padding: '10px 14px',
                      fontSize: 13,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    Book Slot with {m.recommendation.recommendedDoctor}
                    <ArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          ))}

          {isPending && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.soft, fontSize: 12 }}>
              <Sparkles size={16} color={C.accent} style={{ animation: 'spin 2s linear infinite' }} />
              Gemini is evaluating your symptoms…
            </div>
          )}
        </div>

        {/* Quick Chips */}
        <div
          style={{
            padding: '8px 12px',
            background: '#fff',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            gap: 6,
            overflowX: 'auto',
            whiteSpace: 'nowrap',
          }}
        >
          {PROMPT_CHIPS.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              style={{
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: 99,
                background: C.bg,
                border: `1px solid ${C.border}`,
                color: C.ink,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div
          style={{
            padding: '12px 14px',
            background: '#fff',
            borderTop: `1px solid ${C.border}`,
            display: 'flex',
            gap: 8,
          }}
        >
          <input
            type="text"
            placeholder="Type symptoms (e.g. eye redness, fever)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: 12,
              border: `1px solid ${C.border}`,
              fontSize: 13,
              outline: 'none',
              color: C.ink,
            }}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending}
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: C.primary,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: 'pointer',
              opacity: !input.trim() || isPending ? 0.6 : 1,
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
