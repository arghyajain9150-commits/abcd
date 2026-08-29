import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, CheckCircle2, Clock, PackageCheck, AlertCircle, Search, User, FileText, Stethoscope, UploadCloud, Download, KeyRound, QrCode, ShieldCheck, X } from 'lucide-react';
import { getPharmacyPrescriptions, updatePrescriptionStatus, getPharmacyInventory, getStudentPrescriptions, getMyDocuments } from '../api/index.js';
import { useAuthStore } from '../store/store.js';
import DocumentUploadModal from '../components/DocumentUploadModal.jsx';

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
  accentSoft: '#FFF4E5',
};

const STATUS_CONFIG = {
  pending: { label: 'Pending', bg: C.accentSoft, color: C.accent, next: 'preparing', nextLabel: 'Start Packing' },
  preparing: { label: 'Packing', bg: C.primarySoft, color: C.primary, next: 'ready_for_pickup', nextLabel: 'Mark Ready for Pickup' },
  ready_for_pickup: { label: 'Ready for Pickup', bg: '#D8F3E5', color: '#1B7A4B', next: 'dispensed', nextLabel: 'Verify OTP & Dispense' },
  dispensed: { label: 'Dispensed', bg: C.bg, color: C.soft, next: null },
};

export default function PharmacyPortal({ persona = 'student' }) {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const isPharmacist = persona === 'pharmacist' || user?.role === 'pharmacist';
  const [activeTab, setActiveTab] = useState(isPharmacist ? 'orders' : 'my_rx');
  const [rxFilter, setRxFilter] = useState('active'); // 'active' | 'all'
  const [search, setSearch] = useState('');
  const [docModalOpen, setDocModalOpen] = useState(false);

  // OTP Verification Modal for Pharmacist Handover
  const [dispenseModalRx, setDispenseModalRx] = useState(null);
  const [inputOtp, setInputOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // 1. Prescriptions for Pharmacist Fulfillment Desk
  const { data: allOrders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['pharmacy-prescriptions'],
    queryFn: () => getPharmacyPrescriptions().then((r) => r.data),
    enabled: isPharmacist,
    refetchInterval: 8_000,
  });

  // 2. Student's OWN Private Prescriptions
  const { data: myPrescriptions = [], isLoading: myRxLoading } = useQuery({
    queryKey: ['student-prescriptions'],
    queryFn: () => getStudentPrescriptions().then((r) => r.data),
    refetchInterval: 8_000,
  });

  // 3. Student's OWN Uploaded Lab Files
  const { data: myDocs = [] } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => getMyDocuments().then((r) => r.data),
  });

  // 4. Pharmacy Stock Inventory
  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: ['pharmacy-inventory'],
    queryFn: () => getPharmacyInventory().then((r) => r.data),
  });

  const { mutate: updateStatus, isPending: updatingStatus } = useMutation({
    mutationFn: ({ id, status, otp }) => updatePrescriptionStatus(id, status, otp),
    onSuccess: () => {
      qc.invalidateQueries(['pharmacy-prescriptions']);
      qc.invalidateQueries(['student-prescriptions']);
      qc.invalidateQueries(['pharmacy-inventory']);
      setDispenseModalRx(null);
      setInputOtp('');
      setOtpError('');
    },
    onError: (err) => {
      setOtpError(err.response?.data?.error || 'Failed to update prescription status');
    },
  });

  const handleActionClick = (rx, conf) => {
    if (conf.next === 'dispensed') {
      setDispenseModalRx(rx);
      setInputOtp('');
      setOtpError('');
    } else {
      updateStatus({ id: rx.id, status: conf.next });
    }
  };

  const handleConfirmDispense = () => {
    if (!dispenseModalRx) return;
    if (!inputOtp.trim()) {
      setOtpError('Please enter the 4-digit student pickup OTP');
      return;
    }
    updateStatus({ id: dispenseModalRx.id, status: 'dispensed', otp: inputOtp.trim() });
  };

  // Pharmacist filtered orders
  const activeOrders = allOrders.filter((o) => o.status !== 'dispensed');
  const displayedOrders = (rxFilter === 'active' ? activeOrders : allOrders).filter((o) =>
    o.student_name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase()) ||
    o.hostel_block?.toLowerCase().includes(search.toLowerCase())
  );

  // Filtered inventory
  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div>
        <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
          {isPharmacist ? 'Pharmacy Fulfillment Desk' : 'My Prescriptions & Pharmacy'}
        </div>
        <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
          Block A Ground Floor · {isPharmacist ? '2FA Dispensary & Inventory Manager' : 'Digital Health & Medication Pass'}
        </div>
      </div>

      {/* ─── Tabs Navigation ─── */}
      <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3 }}>
        {isPharmacist ? (
          <>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === 'orders' ? '#fff' : 'transparent',
                color: activeTab === 'orders' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Fulfillment Queue ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === 'inventory' ? '#fff' : 'transparent',
                color: activeTab === 'inventory' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Medicine Stock
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab('my_rx')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === 'my_rx' ? '#fff' : 'transparent',
                color: activeTab === 'my_rx' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              My Prescriptions ({myPrescriptions.length})
            </button>
            <button
              onClick={() => setActiveTab('my_files')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === 'my_files' ? '#fff' : 'transparent',
                color: activeTab === 'my_files' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Lab Files ({myDocs.length})
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              style={{
                flex: 1,
                padding: '8px 0',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                background: activeTab === 'inventory' ? '#fff' : 'transparent',
                color: activeTab === 'inventory' ? C.primary : C.soft,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Stock Status
            </button>
          </>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────────
          VIEW 1: STUDENT'S PERSONAL CONFIDENTIAL PRESCRIPTIONS
      ──────────────────────────────────────────────────────────────── */}
      {!isPharmacist && activeTab === 'my_rx' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myRxLoading ? (
            <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading your prescriptions…</div>
          ) : myPrescriptions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, color: C.soft }}>
              <FileText size={36} color={C.border} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No Prescriptions on File</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>When your campus doctor issues a prescription, it will appear here with live pickup status.</div>
            </div>
          ) : (
            myPrescriptions.map((rx) => {
              const conf = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
              const isReady = rx.status === 'ready_for_pickup';
              return (
                <div
                  key={rx.id}
                  style={{
                    background: C.surface,
                    borderRadius: 18,
                    padding: 16,
                    border: `1.5px solid ${isReady ? '#1B7A4B' : C.border}`,
                    boxShadow: '0 2px 10px -2px rgba(23,50,44,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 800, background: conf.bg, color: conf.color, padding: '3px 9px', borderRadius: 99, textTransform: 'uppercase' }}>
                      {isReady ? '🎉 Ready for Pickup at Block A' : conf.label}
                    </span>
                    <span style={{ fontSize: 11, color: C.soft }}>
                      {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>

                  {/* 2FA Pickup Verification OTP Card */}
                  {isReady && rx.pickup_otp && (
                    <div
                      style={{
                        background: 'linear-gradient(135deg, #E4EFEA 0%, #D5E8DF 100%)',
                        border: `1.5px dashed ${C.primary}`,
                        borderRadius: 14,
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.primary, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          🔐 Pickup Verification Code
                        </div>
                        <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>
                          Show this 4-digit code at Block A Dispensary:
                        </div>
                      </div>
                      <div
                        style={{
                          background: C.primary,
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: 18,
                          letterSpacing: '0.1em',
                          padding: '4px 12px',
                          borderRadius: 10,
                          fontFamily: 'monospace',
                        }}
                      >
                        {rx.pickup_otp}
                      </div>
                    </div>
                  )}

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>
                      Diagnosis: {rx.diagnosis}
                    </div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                      Prescribed by <strong>{rx.doctor_name} ({rx.doctor_specialty})</strong>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div style={{ background: C.bg, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rx.items?.map((item, i) => (
                      <div key={i} style={{ fontSize: 12 }}>
                        <div style={{ fontWeight: 700, color: C.ink }}>
                          💊 {item.medicine_name} — {item.dosage}
                        </div>
                        <div style={{ fontSize: 11, color: C.soft, marginTop: 1 }}>
                          Schedule: {item.frequency} for {item.duration_days} days · {item.instructions}
                        </div>
                      </div>
                    ))}
                  </div>

                  {rx.notes && (
                    <div style={{ fontSize: 11.5, color: C.soft, background: C.primarySoft, padding: '8px 10px', borderRadius: 8 }}>
                      <strong>Doctor Advice:</strong> {rx.notes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 2: STUDENT'S PERSONAL LAB FILES
      ──────────────────────────────────────────────────────────────── */}
      {!isPharmacist && activeTab === 'my_files' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #17322C 0%, #2F7A68 100%)',
              borderRadius: 18,
              padding: 16,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <UploadCloud size={22} color="#fff" />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Attach Medical Files</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>Upload blood tests, X-rays & scan PDFs</div>
              </div>
            </div>
            <button
              onClick={() => setDocModalOpen(true)}
              style={{ background: '#fff', color: C.primary, fontWeight: 700, fontSize: 12, padding: '7px 12px', borderRadius: 10, border: 'none', cursor: 'pointer' }}
            >
              Upload +
            </button>
          </div>

          {myDocs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 30, background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, color: C.soft, fontSize: 12 }}>
              No uploaded documents yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {myDocs.map((doc) => (
                <div
                  key={doc.id}
                  style={{
                    background: C.surface,
                    borderRadius: 14,
                    padding: '12px 14px',
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                    <FileText size={18} color={C.primary} style={{ flexShrink: 0 }} />
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {doc.file_name}
                      </div>
                      <div style={{ fontSize: 11, color: C.soft }}>
                        {doc.file_type} · {doc.file_size} · {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>

                  <a
                    href={doc.file_data}
                    download={doc.file_name}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: C.primarySoft,
                      color: C.primary,
                      borderRadius: 8,
                      padding: '6px 10px',
                      fontSize: 11.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      textDecoration: 'none',
                    }}
                  >
                    <Download size={13} /> View
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 3: PHARMACIST FULFILLMENT QUEUE (2FA SECURE HANDOVER)
      ──────────────────────────────────────────────────────────────── */}
      {isPharmacist && activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Pharmacist Filter Pills & Search */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setRxFilter('active')}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                background: rxFilter === 'active' ? C.primary : C.surface,
                color: rxFilter === 'active' ? '#fff' : C.soft,
                border: `1px solid ${rxFilter === 'active' ? C.primary : C.border}`,
                cursor: 'pointer',
              }}
            >
              Active Queue ({activeOrders.length})
            </button>
            <button
              onClick={() => setRxFilter('all')}
              style={{
                padding: '6px 12px',
                borderRadius: 999,
                fontSize: 11.5,
                fontWeight: 700,
                background: rxFilter === 'all' ? C.primary : C.surface,
                color: rxFilter === 'all' ? '#fff' : C.soft,
                border: `1px solid ${rxFilter === 'all' ? C.primary : C.border}`,
                cursor: 'pointer',
              }}
            >
              All / Archive ({allOrders.length})
            </button>
          </div>

          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading prescription orders…</div>
          ) : displayedOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, color: C.soft }}>
              <PackageCheck size={36} color={C.primary} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No Pending Orders</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>All incoming campus prescriptions have been packed and dispensed!</div>
            </div>
          ) : (
            displayedOrders.map((rx) => {
              const conf = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={rx.id}
                  style={{
                    background: C.surface,
                    borderRadius: 18,
                    padding: 16,
                    border: `1.5px solid ${rx.status === 'ready_for_pickup' ? '#2F7A68' : C.border}`,
                    boxShadow: '0 2px 8px -2px rgba(23,50,44,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, background: conf.bg, color: conf.color, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
                        {conf.label}
                      </span>
                      <span style={{ fontSize: 11, color: C.soft, marginLeft: 8 }}>
                        {new Date(rx.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>
                      Rx #{rx.id.slice(0, 6)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>
                      Patient: {rx.student_name}
                    </div>
                    <div style={{ fontSize: 11.5, color: C.soft, marginTop: 1 }}>
                      Residence: {rx.hostel_block || 'Hostel B'} Rm {rx.room_number || '204'} · Doctor: <strong>{rx.doctor_name}</strong>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div style={{ background: C.bg, borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {rx.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, alignItems: 'center' }}>
                        <div style={{ fontWeight: 600, color: C.ink }}>
                          • {item.medicine_name} ({item.dosage})
                        </div>
                        <div style={{ color: C.soft, fontSize: 11 }}>
                          {item.frequency} × {item.duration_days}d
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Button */}
                  {conf.next && (
                    <button
                      onClick={() => handleActionClick(rx, conf)}
                      style={{
                        background: conf.next === 'dispensed' ? '#17322C' : C.primary,
                        color: '#fff',
                        borderRadius: 12,
                        padding: '10px 0',
                        fontSize: 13,
                        fontWeight: 700,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        marginTop: 4,
                      }}
                    >
                      {conf.next === 'dispensed' ? <KeyRound size={16} /> : <PackageCheck size={16} />} {conf.nextLabel}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────
          VIEW 4: INVENTORY
      ──────────────────────────────────────────────────────────────── */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color={C.soft} style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search campus medication..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 12, border: `1px solid ${C.border}`, fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filteredInventory.map((item) => (
              <div
                key={item.id}
                style={{
                  background: C.surface,
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>{item.name}</div>
                  <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>Category: {item.category}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: item.stock_quantity < 20 ? C.urgent : C.primary }}>
                    {item.stock_quantity} {item.unit}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.is_available ? C.primary : C.urgent, textTransform: 'uppercase' }}>
                    {item.is_available ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── 2FA OTP Verification Modal (Pharmacist Dispensing Step) ─── */}
      {dispenseModalRx && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(23,50,44,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 85,
            padding: 16,
          }}
          onClick={() => setDispenseModalRx(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#fff',
              borderRadius: 22,
              width: '100%',
              maxWidth: 400,
              padding: '22px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <KeyRound size={18} color={C.primary} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>2FA Medicine Handover</div>
                  <div style={{ fontSize: 11, color: C.soft }}>Verify student pickup authorization</div>
                </div>
              </div>
              <button
                onClick={() => setDispenseModalRx(null)}
                style={{ width: 28, height: 28, borderRadius: 8, background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
              >
                <X size={14} />
              </button>
            </div>

            <div style={{ background: C.bg, borderRadius: 12, padding: 12, fontSize: 12 }}>
              <div>Patient: <strong>{dispenseModalRx.student_name}</strong></div>
              <div style={{ color: C.soft, marginTop: 2 }}>Prescription #{dispenseModalRx.id.slice(0, 6)}</div>
            </div>

            {otpError && (
              <div style={{ background: C.urgentSoft, color: C.urgent, padding: '8px 12px', borderRadius: 10, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertCircle size={15} /> {otpError}
              </div>
            )}

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Enter 4-Digit Student Pickup OTP
              </label>
              <input
                type="text"
                maxLength={4}
                autoFocus
                placeholder="e.g. 4821"
                value={inputOtp}
                onChange={(e) => setInputOtp(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '12px',
                  borderRadius: 12,
                  border: `1.5px solid ${C.primary}`,
                  fontSize: 22,
                  fontWeight: 800,
                  letterSpacing: '0.25em',
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
              />
              <div style={{ fontSize: 11, color: C.soft, marginTop: 6, textAlign: 'center' }}>
                The student sees this code on their CHAMP Pharmacy screen.
              </div>
            </div>

            <button
              onClick={handleConfirmDispense}
              disabled={updatingStatus || inputOtp.length < 4}
              style={{
                background: C.primary,
                color: '#fff',
                padding: '12px 0',
                borderRadius: 12,
                fontSize: 13.5,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                opacity: updatingStatus || inputOtp.length < 4 ? 0.6 : 1,
              }}
            >
              <Check size={16} /> {updatingStatus ? 'Verifying & Dispensing…' : 'Verify OTP & Complete Handover'}
            </button>
          </div>
        </div>
      )}

      {docModalOpen && <DocumentUploadModal onClose={() => setDocModalOpen(false)} />}
    </div>
  );
}
