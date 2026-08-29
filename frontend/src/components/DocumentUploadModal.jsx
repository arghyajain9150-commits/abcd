import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UploadCloud, FileText, Trash2, Eye, Download, Check, AlertCircle, Plus } from 'lucide-react';
import { uploadDocument, getMyDocuments, deleteDocument } from '../api/index.js';

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

const DOC_TYPES = ['Lab Report', 'Blood Test', 'External Prescription', 'X-Ray / Scan', 'Vaccination Record', 'Other'];

export default function DocumentUploadModal({ onClose }) {
  const qc = useQueryClient();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [docType, setDocType] = useState('Lab Report');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: () => getMyDocuments().then((r) => r.data),
  });

  const { mutate: handleUpload, isPending: uploading } = useMutation({
    mutationFn: (payload) => uploadDocument(payload),
    onSuccess: () => {
      setSuccessMsg('Medical document uploaded successfully!');
      setSelectedFile(null);
      qc.invalidateQueries(['my-documents']);
      setTimeout(() => setSuccessMsg(''), 2500);
    },
    onError: (err) => {
      setErrorMsg(err.response?.data?.error || 'Failed to upload document');
    },
  });

  const { mutate: handleDelete } = useMutation({
    mutationFn: (id) => deleteDocument(id),
    onSuccess: () => {
      qc.invalidateQueries(['my-documents']);
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      setErrorMsg('File size must be under 8MB');
      return;
    }
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = () => {
      const sizeStr = file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

      setSelectedFile({
        name: file.name,
        type: docType,
        size: sizeStr,
        data: reader.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const submitUpload = () => {
    if (!selectedFile) return;
    handleUpload({
      file_name: selectedFile.name,
      file_type: docType,
      file_size: selectedFile.size,
      file_data: selectedFile.data,
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
        zIndex: 70,
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
          maxWidth: 460,
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
            <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>Medical Records & Files</div>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Upload lab reports, scans & external prescriptions</div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} color="#fff" />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {errorMsg && (
            <div style={{ background: C.urgentSoft, color: C.urgent, padding: '10px 12px', borderRadius: 12, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}
          {successMsg && (
            <div style={{ background: '#D8F3E5', color: '#1B7A4B', padding: '10px 12px', borderRadius: 12, fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Check size={16} /> {successMsg}
            </div>
          )}

          {/* Upload Drop Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              background: C.bg,
              border: `2px dashed ${C.primary}`,
              borderRadius: 18,
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div style={{ width: 44, height: 44, borderRadius: 14, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={22} color={C.primary} />
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, color: C.ink }}>
              {selectedFile ? selectedFile.name : 'Tap to Upload Medical Report'}
            </div>
            <div style={{ fontSize: 11.5, color: C.soft }}>
              {selectedFile ? `Size: ${selectedFile.size} · Ready to attach` : 'Supports PDF, JPG, PNG (Max 8MB)'}
            </div>
          </div>

          {/* Document Type Selector */}
          {selectedFile && (
            <div style={{ background: '#fff', borderRadius: 14, padding: 14, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: C.soft, textTransform: 'uppercase' }}>
                Select Record Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                {DOC_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDocType(t)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      background: docType === t ? C.primarySoft : C.bg,
                      color: docType === t ? C.primary : C.ink,
                      border: `1px solid ${docType === t ? C.primary : C.border}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                onClick={submitUpload}
                disabled={uploading}
                style={{
                  background: C.primary,
                  color: '#fff',
                  padding: '11px 0',
                  borderRadius: 12,
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  marginTop: 4,
                }}
              >
                {uploading ? 'Attaching Document…' : 'Save & Attach to Medical Profile'}
              </button>
            </div>
          )}

          {/* Uploaded Documents List */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: C.soft, textTransform: 'uppercase', marginBottom: 10, letterSpacing: '0.04em' }}>
              My Attached Records ({documents.length})
            </div>

            {isLoading ? (
              <div style={{ textAlign: 'center', padding: 20, color: C.soft }}>Loading attached documents…</div>
            ) : documents.length === 0 ? (
              <div style={{ background: C.bg, borderRadius: 14, padding: '20px', textAlign: 'center', color: C.soft, fontSize: 12 }}>
                No external documents uploaded yet. Upload previous blood tests or scans above so campus doctors can review them.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {documents.map((doc) => (
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
                      <div style={{ width: 34, height: 34, borderRadius: 10, background: C.primarySoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <FileText size={18} color={C.primary} />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: C.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.file_name}
                        </div>
                        <div style={{ fontSize: 11, color: C.soft }}>
                          {doc.file_type} · {doc.file_size} · {new Date(doc.uploaded_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                      <a
                        href={doc.file_data}
                        download={doc.file_name}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: C.bg,
                          border: `1px solid ${C.border}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: C.ink,
                          textDecoration: 'none',
                        }}
                      >
                        <Download size={14} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc.id)}
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 8,
                          background: '#FBE7E4',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Trash2 size={14} color={C.urgent} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
