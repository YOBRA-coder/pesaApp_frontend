import { useState, useRef } from 'react';
import { Upload, CheckCircle, Clock, XCircle, Camera, FileText, Loader2 } from 'lucide-react';
import { useKycStatus, useSubmitKyc } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

const docTypes = [
  { value: 'NATIONAL_ID', label: 'National ID', icon: '🪪' },
  { value: 'PASSPORT', label: 'Passport', icon: '📘' },
  { value: 'DRIVING_LICENSE', label: "Driver's License", icon: '🚗' },
];

export default function KycPage() {
  const { data: kycRecord, isLoading } = useKycStatus();
  const submitKyc = useSubmitKyc();
  const user = useAuthStore(s => s.user);

  const [docType, setDocType] = useState('NATIONAL_ID');
  const [formData, setFormData] = useState({ docNumber: '', firstName: '', lastName: '', dateOfBirth: '' });
  const [files, setFiles] = useState<{ idFront?: File; idBack?: File; selfie?: File }>({});
  const [previews, setPreviews] = useState<{ idFront?: string; idBack?: string; selfie?: string }>({});

  const idFrontRef = useRef<HTMLInputElement>(null);
  const idBackRef = useRef<HTMLInputElement>(null);
  const selfieRef = useRef<HTMLInputElement>(null);

  const handleFile = (key: 'idFront' | 'idBack' | 'selfie', file: File | undefined) => {
    if (!file) return;
    setFiles(f => ({ ...f, [key]: file }));
    const url = URL.createObjectURL(file);
    setPreviews(p => ({ ...p, [key]: url }));
  };

  const handleSubmit = async () => {
    if (!files.idFront || !files.selfie) return;
    const fd = new FormData();
    fd.append('docType', docType);
    fd.append('docNumber', formData.docNumber);
    fd.append('firstName', formData.firstName);
    fd.append('lastName', formData.lastName);
    if (formData.dateOfBirth) fd.append('dateOfBirth', formData.dateOfBirth);
    fd.append('idFront', files.idFront);
    if (files.idBack) fd.append('idBack', files.idBack);
    fd.append('selfie', files.selfie);
    await submitKyc.mutateAsync(fd);
  };

  const statusBanner = () => {
    if (kycRecord?.status === 'APPROVED') return (
      <div className="flex items-center gap-3 bg-green/10 border border-green/20 rounded-2xl p-5">
        <CheckCircle size={24} className="text-green shrink-0" />
        <div><p className="font-semibold text-green">KYC Verified ✅</p><p className="text-xs text-subtle mt-1">Your identity has been verified. Full limits unlocked.</p></div>
      </div>
    );
    if (kycRecord?.status === 'PENDING') return (
      <div className="flex items-center gap-3 bg-gold/10 border border-gold/20 rounded-2xl p-5">
        <Clock size={24} className="text-gold shrink-0" />
        <div><p className="font-semibold text-gold">Under Review</p><p className="text-xs text-subtle mt-1">Your documents are being reviewed. Usually takes 24 hours.</p></div>
      </div>
    );
    if (kycRecord?.status === 'REJECTED') return (
      <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-2xl p-5">
        <XCircle size={24} className="text-danger shrink-0" />
        <div><p className="font-semibold text-danger">KYC Rejected</p><p className="text-xs text-subtle mt-1">{kycRecord.rejectionReason || 'Please resubmit with clearer documents.'}</p></div>
      </div>
    );
    return null;
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-green" size={32} /></div>;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h1 className="page-header">KYC Verification</h1>

      {statusBanner()}

      {kycRecord?.status === 'APPROVED' ? null : (
        <div className="space-y-5">
          {/* Doc Type */}
          <div className="card space-y-3">
            <h2 className="section-title flex items-center gap-2"><FileText size={16} /> Document Type</h2>
            <div className="grid grid-cols-3 gap-3">
              {docTypes.map(dt => (
                <button key={dt.value} onClick={() => setDocType(dt.value)}
                  className={clsx('flex flex-col items-center gap-2 p-3 rounded-xl border text-sm transition-all',
                    docType === dt.value ? 'border-green bg-green/10 text-green' : 'border-border text-muted hover:border-border2')}>
                  <span className="text-2xl">{dt.icon}</span>
                  <span className="text-xs font-medium">{dt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Personal Info */}
          <div className="card space-y-4">
            <h2 className="section-title">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input className="input" value={formData.firstName} onChange={e => setFormData(f => ({ ...f, firstName: e.target.value }))} placeholder="John" />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input className="input" value={formData.lastName} onChange={e => setFormData(f => ({ ...f, lastName: e.target.value }))} placeholder="Kamau" />
              </div>
            </div>
            <div>
              <label className="label">ID / Document Number</label>
              <input className="input" value={formData.docNumber} onChange={e => setFormData(f => ({ ...f, docNumber: e.target.value }))} placeholder="12345678" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={formData.dateOfBirth} onChange={e => setFormData(f => ({ ...f, dateOfBirth: e.target.value }))} />
            </div>
          </div>

          {/* Documents Upload */}
          <div className="card space-y-4">
            <h2 className="section-title">Upload Documents</h2>
            <div className="grid grid-cols-2 gap-4">
              {/* ID Front */}
              <div>
                <label className="label">ID Front *</label>
                <div
                  onClick={() => idFrontRef.current?.click()}
                  className={clsx('border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                    previews.idFront ? 'border-green/40' : 'border-border hover:border-border2')}>
                  {previews.idFront
                    ? <img src={previews.idFront} alt="ID Front" className="h-full w-full object-cover rounded-xl" />
                    : <><Upload size={20} className="text-subtle" /><span className="text-xs text-subtle">Upload Front</span></>}
                </div>
                <input ref={idFrontRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile('idFront', e.target.files?.[0])} />
              </div>

              {/* ID Back */}
              <div>
                <label className="label">ID Back</label>
                <div
                  onClick={() => idBackRef.current?.click()}
                  className={clsx('border-2 border-dashed rounded-xl h-32 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                    previews.idBack ? 'border-green/40' : 'border-border hover:border-border2')}>
                  {previews.idBack
                    ? <img src={previews.idBack} alt="ID Back" className="h-full w-full object-cover rounded-xl" />
                    : <><Upload size={20} className="text-subtle" /><span className="text-xs text-subtle">Upload Back</span></>}
                </div>
                <input ref={idBackRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile('idBack', e.target.files?.[0])} />
              </div>
            </div>

            {/* Selfie */}
            <div>
              <label className="label">Selfie with ID *</label>
              <div
                onClick={() => selfieRef.current?.click()}
                className={clsx('border-2 border-dashed rounded-xl h-40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all',
                  previews.selfie ? 'border-green/40' : 'border-border hover:border-border2')}>
                {previews.selfie
                  ? <img src={previews.selfie} alt="Selfie" className="h-full w-full object-cover rounded-xl" />
                  : <><Camera size={24} className="text-subtle" /><span className="text-sm text-subtle">Take/Upload Selfie holding your ID</span></>}
              </div>
              <input ref={selfieRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => handleFile('selfie', e.target.files?.[0])} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!files.idFront || !files.selfie || !formData.docNumber || !formData.firstName || submitKyc.isPending}
            className="btn-primary w-full justify-center"
          >
            {submitKyc.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Submit for Verification'}
          </button>

          <p className="text-center text-xs text-subtle">
            Your documents are encrypted and stored securely. Only used for verification.
          </p>
        </div>
      )}
    </div>
  );
}
