import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register } from '../api/index.js';
import { useAuthStore } from '../store/store.js';
import { connectSocket } from '../socket/socket.js';

const C = { primary: '#2F7A68', ink: '#17322C', soft: '#5B7169', bg: '#EDEDE6', border: '#E1E3DA', urgent: '#D6483C' };

export default function RegisterPage() {
  const navigate = useNavigate();
  const setAuth  = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [err, setErr]   = useState('');

  const { mutate, isPending } = useMutation({
    mutationFn: () => register(form),
    onSuccess: (res) => {
      const { token, user } = res.data;
      setAuth(user, token);
      connectSocket(user.id);
      navigate('/');
    },
    onError: (e) => {
      const errData = e.response?.data?.error;
      if (typeof errData === 'string') {
        setErr(errData);
      } else if (Array.isArray(errData)) {
        setErr(errData.map((d) => d.message || JSON.stringify(d)).join(', '));
      } else {
        setErr(e.message || 'Registration failed');
      }
    },
  });

  const fields = [
    { label: 'Full Name',    key: 'name',     type: 'text' },
    { label: 'College Email',key: 'email',    type: 'email' },
    { label: 'Password',     key: 'password', type: 'password' },
    { label: 'Phone (optional)', key: 'phone', type: 'tel' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter:wght@400;500;600&display=swap'); * { box-sizing:border-box; } button { font-family:inherit; cursor:pointer; }`}</style>

      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 20px 60px -20px rgba(23,50,44,0.2)', border: `1px solid ${C.border}` }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 28, fontWeight: 700, color: C.ink }}>Join CHAMP</div>
          <div style={{ fontSize: 13, color: C.soft, marginTop: 4 }}>Your campus health companion</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {fields.map(({ label, key, type }) => (
            <div key={key}>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.soft, display: 'block', marginBottom: 6 }}>{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 14, color: C.ink, outline: 'none' }}
              />
            </div>
          ))}

          {err && <p style={{ color: C.urgent, fontSize: 13, margin: 0 }}>{err}</p>}

          <button
            onClick={() => mutate()}
            disabled={isPending}
            style={{ background: C.primary, color: '#fff', padding: '13px 0', borderRadius: 14, fontSize: 14, fontWeight: 600, border: 'none', opacity: isPending ? 0.7 : 1, marginTop: 4 }}
          >
            {isPending ? 'Creating account…' : 'Create Account'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: C.soft, marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
