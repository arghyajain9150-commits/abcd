import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, User, Heart, ShieldAlert, Home, Phone, Check, Sparkles, CreditCard, UploadCloud, FileText } from 'lucide-react';
import { updateProfile } from '../api/index.js';
import { useAuthStore } from '../store/store.js';
import DocumentUploadModal from './DocumentUploadModal.jsx';

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

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

export default function ProfileModal({ onClose }) {
  const qc = useQueryClient();
  const { user, setUser } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bloodGroup, setBloodGroup] = useState(user?.blood_group || 'O+');
  const [allergies, setAllergies] = useState(user?.allergies || 'None reported');
  const [hostelBlock, setHostelBlock] = useState(user?.hostel_block || 'Hostel Block B');
  const [roomNumber, setRoomNumber] = useState(user?.room_number || '204');
  const [emergencyContact, setEmergencyContact] = useState(user?.emergency_contact || '+91 98765 00000');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);

  const { mutate: saveProfile, isPending } = useMutation({
    mutationFn: (payload) => updateProfile(payload),
    onSuccess: (res) => {
      setUser(res.data);
      setSavedSuccess(true);
      qc.invalidateQueries(['unread-count']);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 1200);
    },
  });

  const handleSave = () => {
    saveProfile({
      name,
      phone,
      blood_group: bloodGroup,
      allergies,
      hostel_block: hostelBlock,
      room_number: roomNumber,
      emergency_contact: emergencyContact,
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 65,
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
          maxHeight: '90vh',
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
            padding: '18px 20px',
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
                width: 38,
                height: 38,
                borderRadius: 12,
                background: 'rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CreditCard size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Campus Health ID & Profile</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Medical records & student credentials</div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Digital Health Card Summary */}
        <div style={{ padding: '16px 20px 0' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #E4EFEA 0%, #D5E8DF 100%)',
              borderRadius: 18,
              padding: 16,
              border: `1.5px solid ${C.primary}`,
              boxShadow: '0 4px 14px -3px rgba(47,122,104,0.2)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Digital Health Pass · Verified
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: C.ink, background: '#fff', padding: '2px 8px', borderRadius: 8 }}>
                🩸 {bloodGroup}
              </span>
            </div>

            <div style={{ fontWeight: 800, fontSize: 17, color: C.ink }}>
              {name || user?.name}
            </div>
            <div style={{ fontSize: 12, color: C.soft }}>
              {user?.email} · {user?.role?.toUpperCase()}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: `1px solid rgba(47,122,104,0.2)`, paddingTop: 8, marginTop: 4, fontSize: 11 }}>
              <span style={{ color: C.soft }}>Residence: <strong>{hostelBlock} - Rm {roomNumber}</strong></span>
              <span style={{ color: C.urgent, fontWeight: 700 }}>Allergies: {allergies}</span>
            </div>
          </div>
        </div>

        {/* Upload Medical Files Action Bar */}
        <div style={{ padding: '12px 20px 0' }}>
          <button
            onClick={() => setDocModalOpen(true)}
            style={{
              width: '100%',
              background: '#fff',
              border: `1.5px dashed ${C.primary}`,
              borderRadius: 14,
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: C.ink,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UploadCloud size={18} color={C.primary} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 12.5, fontWeight: 700 }}>Attach Medical Reports / Prescriptions</div>
                <div style={{ fontSize: 10.5, color: C.soft }}>Upload lab tests, blood work & scan PDFs</div>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.primary }}>Upload +</span>
          </button>
        </div>

        {/* Editable Form */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Blood Group */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Blood Group
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginTop: 6 }}>
              {BLOOD_GROUPS.map((bg) => (
                <button
                  key={bg}
                  type="button"
                  onClick={() => setBloodGroup(bg)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 700,
                    background: bloodGroup === bg ? C.primary : C.bg,
                    color: bloodGroup === bg ? '#fff' : C.ink,
                    border: `1px solid ${bloodGroup === bg ? C.primary : C.border}`,
                    cursor: 'pointer',
                  }}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Known Allergies */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Known Medical / Drug Allergies
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts, Dust, None reported"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '9px 12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                outline: 'none',
                color: C.ink,
              }}
            />
          </div>

          {/* Hostel & Room */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 8 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Hostel Block
              </label>
              <input
                type="text"
                value={hostelBlock}
                onChange={(e) => setHostelBlock(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Room No.
              </label>
              <input
                type="text"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '9px 12px',
                  borderRadius: 12,
                  border: `1px solid ${C.border}`,
                  fontSize: 13,
                }}
              />
            </div>
          </div>

          {/* Phone & Emergency Contact */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
              Emergency Guardian Contact
            </label>
            <input
              type="text"
              placeholder="+91 98765 00000"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              style={{
                width: '100%',
                marginTop: 6,
                padding: '9px 12px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
              }}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isPending}
            style={{
              background: savedSuccess ? '#1B7A4B' : C.primary,
              color: '#fff',
              borderRadius: 14,
              padding: '12px 0',
              fontSize: 14,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 6,
            }}
          >
            {savedSuccess ? (
              <>
                <Check size={18} /> Profile Saved!
              </>
            ) : isPending ? (
              'Saving Medical Profile…'
            ) : (
              'Update Medical Profile & ID'
            )}
          </button>
        </div>

        {docModalOpen && <DocumentUploadModal onClose={() => setDocModalOpen(false)} />}
      </div>
    </div>
  );
}
