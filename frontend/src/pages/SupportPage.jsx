import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, HelpCircle, Send, CheckCircle2, ChevronDown, ChevronUp, Search, MessageSquare, Clock, Phone, Ticket, AlertCircle, FileText, Check } from 'lucide-react';
import { createSupportTicket, getMySupportTickets } from '../api/index.js';

const C = {
  ink: '#17322C',
  soft: '#5B7169',
  primary: '#2F7A68',
  primarySoft: '#E4EFEA',
  urgent: '#D6483C',
  urgentSoft: '#FBE7E4',
  surface: '#FFFFFF',
  border: '#E1E3DA',
  bg: '#F5F7F3',
  accent: '#E3A542',
  accentSoft: '#FFF4E5',
};

const FAQS = [
  { q: 'How fast are appointments confirmed?', a: 'Instantly! You get an email confirmation and your real-time queue position right away.' },
  { q: 'Can I request a medical leave certificate?', a: 'Yes — submit a support ticket under "Medical Leave Certificate Request". Our medical officer reviews and issues verified digital certificates.' },
  { q: 'How do digital prescriptions work with the Pharmacy?', a: 'When the doctor issues a prescription, it is instantly transmitted to the campus pharmacy. Once packed, you will receive a notification with a 4-digit pickup OTP.' },
  { q: 'Is my medical data confidential?', a: 'Yes, only campus healthcare doctors and pharmacists can access your consultation records. Your health data is securely encrypted.' },
  { q: 'What should I do during an emergency after clinic hours?', a: 'Tap the red Emergency button to call the 24/7 Campus Ambulance (108) or Campus Security Patrol.' },
];

const TICKET_CATEGORIES = [
  'Medical Leave Certificate Request',
  'Prescription & Medicine Query',
  'Appointment Scheduling Issue',
  'Hostel Quarantine Assistance',
  'General Campus Health Inquiry',
];

export default function SupportPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'history'
  const [search, setSearch] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(TICKET_CATEGORIES[0]);
  const [message, setMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const { data: myTickets = [], isLoading: loadingTickets } = useQuery({
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
      setTimeout(() => {
        setTicketSubmitted(false);
        setActiveTab('history');
      }, 1200);
    },
  });

  const filteredFaqs = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
          Helpdesk & Campus Support
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
          Campus health guidelines, inquiries & leave certificates
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, gap: 2 }}>
        <button
          onClick={() => setActiveTab('new')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 700,
            background: activeTab === 'new' ? '#fff' : 'transparent',
            color: activeTab === 'new' ? C.primary : C.soft,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Submit Inquiry / Leave Note
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            flex: 1,
            padding: '8px 0',
            borderRadius: 10,
            fontSize: 12.5,
            fontWeight: 700,
            background: activeTab === 'history' ? '#fff' : 'transparent',
            color: activeTab === 'history' ? C.primary : C.soft,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          My Tickets ({myTickets.length})
        </button>
      </div>

      {/* ────────────────────────────────────────────────────────────────
          TAB 1: SUBMIT INQUIRY & FAQS
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'new' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Clinic Timing & Location Card */}
          <div style={{ background: C.surface, borderRadius: 18, padding: 14, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={18} color={C.primary} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>Campus Health Centre (Block A)</div>
                <div style={{ fontSize: 11, color: C.soft }}>Ground Floor · Main OPD & Pharmacy Wing</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 2, fontSize: 11.5, background: C.bg, padding: '8px 10px', borderRadius: 10 }}>
              <div>⏰ <strong>OPD Hours:</strong> 8:30 AM – 6:30 PM</div>
              <div>🚨 <strong>Emergency Desk:</strong> 24/7 On-Call</div>
            </div>
          </div>

          {/* Ticket Submission Form */}
          <div style={{ background: C.surface, borderRadius: 18, padding: 16, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MessageSquare size={18} color={C.primary} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>Submit Inquiry or Leave Certificate Request</div>
            </div>

            {ticketSubmitted ? (
              <div style={{ background: '#D8F3E5', color: '#1B7A4B', padding: 14, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700 }}>
                <CheckCircle2 size={18} /> Ticket submitted successfully! Redirecting to ticket history…
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!subject.trim() || !message.trim()) return;
                  submitTicket({ category, subject, message });
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
              >
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Inquiry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', marginTop: 4, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, outline: 'none', background: '#fff' }}
                  >
                    {TICKET_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Subject</label>
                  <input
                    type="text"
                    placeholder="e.g. Medical Leave note for Fever (28 Aug - 30 Aug)"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: 4, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>Details / Medical Reason</label>
                  <textarea
                    rows={3}
                    placeholder="Provide details for the medical officer..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    style={{ width: '100%', marginTop: 4, padding: '9px 12px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5, outline: 'none', resize: 'none' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isPending || !subject.trim() || !message.trim()}
                  style={{
                    background: C.primary,
                    color: '#fff',
                    padding: '11px 0',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginTop: 4,
                    opacity: isPending || !subject.trim() || !message.trim() ? 0.6 : 1,
                  }}
                >
                  <Send size={15} /> {isPending ? 'Submitting…' : 'Submit Ticket'}
                </button>
              </form>
            )}
          </div>

          {/* Searchable FAQs Accordion */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Frequently Asked Questions
              </div>
            </div>

            <div style={{ position: 'relative' }}>
              <Search size={15} color={C.soft} style={{ position: 'absolute', left: 12, top: 11 }} />
              <input
                type="text"
                placeholder="Search campus health FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', padding: '8px 12px 8px 34px', borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12.5 }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  style={{
                    background: C.surface,
                    borderRadius: 12,
                    padding: '12px 14px',
                    border: `1px solid ${C.border}`,
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: 13, color: C.ink }}>
                    <span>{faq.q}</span>
                    {expandedFaq === i ? <ChevronUp size={16} color={C.primary} /> : <ChevronDown size={16} color={C.soft} />}
                  </div>
                  {expandedFaq === i && (
                    <div style={{ marginTop: 8, fontSize: 12, color: C.soft, lineHeight: 1.45, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          TAB 2: MY TICKETS & RESOLUTION THREAD
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loadingTickets ? (
            <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading your tickets…</div>
          ) : myTickets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, color: C.soft }}>
              <Ticket size={36} color={C.border} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No Submitted Tickets</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>You haven't submitted any inquiry or medical leave certificate requests yet.</div>
            </div>
          ) : (
            myTickets.map((t) => {
              const isResolved = t.status === 'resolved';
              const isInReview = t.status === 'in_review' || t.status === 'in_progress';
              return (
                <div
                  key={t.id}
                  style={{
                    background: C.surface,
                    borderRadius: 16,
                    padding: 16,
                    border: `1px solid ${isResolved ? '#C3DED3' : C.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        borderRadius: 99,
                        background: isResolved ? '#D8F3E5' : isInReview ? C.accentSoft : C.primarySoft,
                        color: isResolved ? '#1B7A4B' : isInReview ? C.accent : C.primary,
                      }}
                    >
                      {isResolved ? '✅ Resolved' : isInReview ? '🔄 In Review' : '📬 Open'}
                    </span>
                    <span style={{ fontSize: 11, color: C.soft }}>
                      {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: C.ink }}>{t.subject}</div>
                    <div style={{ fontSize: 11, color: C.primary, fontWeight: 600, marginTop: 1 }}>{t.category}</div>
                  </div>

                  <div style={{ fontSize: 12, color: C.soft, background: C.bg, padding: '8px 10px', borderRadius: 8 }}>
                    "{t.message}"
                  </div>

                  {/* Admin Resolution Note */}
                  {t.admin_response ? (
                    <div style={{ background: '#E4EFEA', borderRadius: 8, padding: '8px 10px', fontSize: 11.5, color: C.ink }}>
                      <strong>Medical Desk Response:</strong> {t.admin_response}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: C.soft, fontStyle: 'italic' }}>
                      ⏳ Awaiting response from on-duty campus medical officer.
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
