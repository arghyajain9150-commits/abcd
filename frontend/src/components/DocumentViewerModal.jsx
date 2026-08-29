import { X, Download, FileText, Calendar, User } from 'lucide-react';

export default function DocumentViewerModal({ document, onClose }) {
  if (!document) return null;

  const isPdf = document.file_name?.toLowerCase().endsWith('.pdf') || document.file_data?.startsWith('data:application/pdf');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(23,50,44,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 90,
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fff',
          borderRadius: 22,
          width: '100%',
          maxWidth: 600,
          height: '85vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 24px 70px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}
      >
        {/* Top Header */}
        <div style={{ padding: '14px 18px', background: '#17322C', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <FileText size={18} color="#FFE699" style={{ flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {document.file_name}
              </div>
              <div style={{ fontSize: 11, opacity: 0.8 }}>
                {document.file_type} · {document.file_size}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <a
              href={document.file_data}
              download={document.file_name}
              style={{
                background: '#2F7A68',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: 11.5,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                textDecoration: 'none',
              }}
            >
              <Download size={13} /> Download
            </a>
            <button
              onClick={onClose}
              style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Document Content Viewport */}
        <div style={{ flex: 1, background: '#F5F7F3', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', padding: 12 }}>
          {isPdf ? (
            <iframe
              src={document.file_data}
              title={document.file_name}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12, background: '#fff' }}
            />
          ) : (
            <img
              src={document.file_data}
              alt={document.file_name}
              style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
