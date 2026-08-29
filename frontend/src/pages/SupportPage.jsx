import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, HelpCircle, Send, CheckCircle2, ChevronDown, ChevronUp, Search, MessageSquare, Clock, Phone } from 'lucide-react';
import { createSupportTicket, getMySupportTickets } from '../api/index.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  accent: '#E3A542',
};

const FAQS = [
  { q: 'How fast are appointments confirmed?', a: 'Instantly! You get an email confirmation and your real-time queue position right away.' },
  { q: 'Can I request a medical leave certificate?', a: 'Yes — submit a support ticket below under "Medical Leave Certificate Request". Our medical officer reviews and issues verified digital certificates.' },
  { q: 'How do digital prescriptions work with the Pharmacy?', a: 'When the doctor issues a prescription, it is instantly transmitted to the campus pharmacy. Once packed, you will receive a notification that your medicine is ready for pickup at Block A Ground Floor.' },
  { q: 'Is my medical data confidential?', a: 'Yes, only campus healthcare doctors and pharmacists can access your consultation records. Your health data is securely encrypted.' },
  { q: 'What should I do during an emergency after clinic hours?', a: 'Tap the red Emergency button to call the 24/7 Campus Ambulance (108) or Campus Security Patrol.' },
];

export default function SupportPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Medical Leave Request');
  const [message, setMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const { data: myTickets = [] } = useQuery({
    queryKey: ['my-support-tickets'],
    queryFn: () => getMySupportTickets().then((r) => r.data),
  });

  const { mutate: submitTicket, isPending } = useMutation({
    mutationFn: (data) => createSupportTicket(data),
    onSuccess: () => {
      setTicketSubmitted(true);
      setSubject('');
      setMessage('');
      qc.invalidateQueries(['my-support-tickets']);
      setTimeout(() => setTicketSubmitted(false), 3000);
    },
  });

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <div>
        <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
          Helpdesk & Campus Support
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
          Campus health centre guidelines, FAQs & inquiry tickets
        </div>
      </div>

      {/* Clinic Timing & Location Card */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin size={20} color={C.primary} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Campus Health Centre</div>
            <div style={{ fontSize: 12, color: C.soft }}>Block A, Ground Floor (Opposite Central Library)</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderTop: `1px solid ${C.border}`, paddingTop: 10, fontSize: 11.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.ink }}>
            <Clock size={14} color={C.primary} />
            <span>OPD: <strong>8 AM – 8 PM</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: C.ink }}>
            <Phone size={14} color={C.primary} />
            <span>Desk: <strong>+91 98765 43210</strong></span>
          </div>
        </div>
      </div>

      {/* Interactive Support Ticket / Inquiry Form */}
      <div style={{ background: C.surface, borderRadius: 18, padding: 18, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MessageSquare size={18} color={C.primary} />
          <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Submit Inquiry / Medical Leave Request</div>
        </div>

        {ticketSubmitted ? (
          <div style={{ background: '#D8F3E5', color: '#1B7A4B', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <CheckCircle2 size={18} /> Ticket submitted! The medical desk will review and update your record.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Inquiry Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }}
              >
                <option>Medical Leave Request</option>
                <option>Prescription Clarification</option>
                <option>Vaccination / Health Insurance Query</option>
                <option>General Feedback / Suggestion</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Subject</label>
              <input
                type="text"
                placeholder="e.g. Leave certificate for Viral Fever..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Details</label>
              <textarea
                rows={2}
                placeholder="Provide details about your query or medical absence dates..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                style={{ width: '100%', marginTop: 4, padding: '8px 10px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, resize: 'none' }}
              />
            </div>

            <button
              onClick={() => submitTicket({ category, subject, message })}
              disabled={!subject.trim() || !message.trim() || isPending}
              style={{
                background: C.primary,
                color: '#fff',
                padding: '10px 0',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: !subject.trim() || !message.trim() || isPending ? 0.6 : 1,
              }}
            >
              <Send size={14} /> {isPending ? 'Submitting Ticket…' : 'Submit to Health Desk'}
            </button>
          </div>
        )}
      </div>

      {/* Searchable FAQ Section */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Frequently Asked Questions
          </span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={15} color={C.soft} style={{ position: 'absolute', left: 12, top: 11 }} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filteredFaqs.map((f, i) => {
            const isOpen = expandedFaq === i;
            return (
              <div
                key={i}
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: `1px solid ${C.border}`,
                  cursor: 'pointer',
                }}
                onClick={() => setExpandedFaq(isOpen ? null : i)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 13, color: C.ink }}>
                  <span>{f.q}</span>
                  {isOpen ? <ChevronUp size={16} color={C.primary} /> : <ChevronDown size={16} color={C.soft} />}
                </div>
                {isOpen && (
                  <div style={{ fontSize: 12, color: C.soft, marginTop: 8, lineHeight: 1.5, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
