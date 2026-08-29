import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Pill, CheckCircle2, Clock, PackageCheck, AlertCircle, Search, User, FileText, Stethoscope } from 'lucide-react';
import { getPharmacyPrescriptions, updatePrescriptionStatus, getPharmacyInventory, getStudentPrescriptions } from '../api/index.js';
import { useAuthStore } from '../store/store.js';

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
  preparing: { label: 'Packing', bg: C.primarySoft, color: C.primary, next: 'ready_for_pickup', nextLabel: 'Ready for Pickup' },
  ready_for_pickup: { label: 'Ready for Pickup', bg: '#D8F3E5', color: '#1B7A4B', next: 'dispensed', nextLabel: 'Dispense & Hand Over' },
  dispensed: { label: 'Dispensed', bg: C.bg, color: C.soft, next: null },
};

export default function PharmacyPortal() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'my_records'
  const [search, setSearch] = useState('');

  // Prescriptions for Pharmacist
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['pharmacy-prescriptions'],
    queryFn: () => getPharmacyPrescriptions().then((r) => r.data),
    refetchInterval: 10_000,
  });

  // Inventory
  const { data: inventory = [], isLoading: invLoading } = useQuery({
    queryKey: ['pharmacy-inventory'],
    queryFn: () => getPharmacyInventory().then((r) => r.data),
  });

  // Student's personal records
  const { data: myRecords = [] } = useQuery({
    queryKey: ['student-prescriptions'],
    queryFn: () => getStudentPrescriptions().then((r) => r.data),
  });

  const { mutate: updateStatus } = useMutation({
    mutationFn: ({ id, status }) => updatePrescriptionStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries(['pharmacy-prescriptions']);
      qc.invalidateQueries(['student-prescriptions']);
    },
  });

  const filteredInventory = inventory.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = orders.filter((o) => o.status !== 'dispensed').length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <div className="champ-heading" style={{ fontSize: 22, fontWeight: 700, color: C.ink }}>
            Campus Pharmacy & Records
          </div>
          <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
            Block A Ground Floor · Digital Dispensary
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', background: C.border, borderRadius: 12, padding: 3, marginBottom: 16 }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: activeTab === 'orders' ? '#fff' : 'transparent',
            color: activeTab === 'orders' ? C.primary : C.soft,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Rx Orders ({pendingCount})
        </button>
        <button
          onClick={() => setActiveTab('my_records')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: activeTab === 'my_records' ? '#fff' : 'transparent',
            color: activeTab === 'my_records' ? C.primary : C.soft,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          My Medical Rx ({myRecords.length})
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            flex: 1,
            padding: '7px 0',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            background: activeTab === 'inventory' ? '#fff' : 'transparent',
            color: activeTab === 'inventory' ? C.primary : C.soft,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Stock Inventory
        </button>
      </div>

      {/* ─── TAB 1: Pharmacist Fulfillment Orders Queue ─── */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {ordersLoading ? (
            <div style={{ textAlign: 'center', padding: 30, color: C.soft }}>Loading prescription orders…</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, color: C.soft }}>
              <PackageCheck size={36} color={C.primary} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No pending prescriptions</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>When doctors issue prescriptions, they appear here instantly.</div>
            </div>
          ) : (
            orders.map((rx) => {
              const conf = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={rx.id}
                  style={{
                    background: C.surface,
                    borderRadius: 18,
                    padding: 16,
                    border: `1px solid ${rx.status === 'ready_for_pickup' ? '#2F7A68' : C.border}`,
                    boxShadow: '0 2px 10px -2px rgba(23,50,44,0.06)',
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
                      {rx.student_name}
                    </div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                      Prescribed by <strong>{rx.doctor_name}</strong> · Diagnosis: <em>{rx.diagnosis}</em>
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

                  {rx.notes && (
                    <div style={{ fontSize: 11.5, color: C.soft, fontStyle: 'italic' }}>
                      Doctor's Note: "{rx.notes}"
                    </div>
                  )}

                  {/* Action Button */}
                  {conf.next && (
                    <button
                      onClick={() => updateStatus({ id: rx.id, status: conf.next })}
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
                      <PackageCheck size={16} /> {conf.nextLabel}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ─── TAB 2: Student's Personal Medical Records ─── */}
      {activeTab === 'my_records' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myRecords.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, background: C.surface, borderRadius: 18, border: `1px solid ${C.border}`, color: C.soft }}>
              <FileText size={36} color={C.border} style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>No digital prescriptions yet</div>
              <div style={{ fontSize: 12, marginTop: 2 }}>Prescriptions from your doctor consultations will appear here.</div>
            </div>
          ) : (
            myRecords.map((rx) => {
              const conf = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
              return (
                <div
                  key={rx.id}
                  style={{
                    background: C.surface,
                    borderRadius: 18,
                    padding: 16,
                    border: `1px solid ${C.border}`,
                    boxShadow: '0 2px 8px -2px rgba(23,50,44,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: conf.bg, color: conf.color, padding: '2px 8px', borderRadius: 99, textTransform: 'uppercase' }}>
                      {conf.label}
                    </span>
                    <span style={{ fontSize: 11, color: C.soft }}>
                      {new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: C.ink }}>
                      Diagnosis: {rx.diagnosis}
                    </div>
                    <div style={{ fontSize: 12, color: C.soft, marginTop: 2 }}>
                      Prescribed by <strong>{rx.doctor_name} ({rx.doctor_specialty})</strong>
                    </div>
                  </div>

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

      {/* ─── TAB 3: Inventory ─── */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color={C.soft} style={{ position: 'absolute', left: 12, top: 12 }} />
            <input
              type="text"
              placeholder="Search medicine by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                borderRadius: 12,
                border: `1px solid ${C.border}`,
                fontSize: 13,
                outline: 'none',
                color: C.ink,
              }}
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
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: C.ink }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: 11, color: C.soft, marginTop: 2 }}>
                    Category: {item.category}
                  </div>
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
    </div>
  );
}
