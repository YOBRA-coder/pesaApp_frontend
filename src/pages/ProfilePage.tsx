
// ─── ProfilePage.tsx ──────────────────────────────────────────
import { useRef as useR, useState } from 'react';
import { Camera as Cam, User, Shield, Bell, LogOut, ChevronRight as CR } from 'lucide-react';
import { useMe, useUpdateProfile } from '@/hooks/useApi';
import { useNavigate as useNav } from 'react-router-dom';
import { api } from '@/services/api';
import { useAuthStore as useAS } from '@/store/authStore';

export default function ProfilePage() {
  const nav = useNav();
  const { user, logout } = useAS();
  const { data: me } = useMe();
  const update = useUpdateProfile();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '' });
  const fileRef = useR<HTMLInputElement>(null);

  const startEdit = () => { setForm({ firstName: me?.firstName || '', lastName: me?.lastName || '', username: me?.username || '', email: me?.email || '' }); setEditing(true); };
  const handleSave = () => { update.mutate(form); setEditing(false); };

  const handleAvatar = async (file: File) => {
    const fd = new FormData(); fd.append('avatar', file);
    await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
  };

  const menuItems = [
    { icon: Shield, label: 'KYC Verification', sub: me?.kycRecord?.status || 'Not started', to: '/kyc', badge: me?.kycStatus === 'APPROVED' ? '✅' : '⚠️' },
    { icon: Bell, label: 'Notifications', sub: 'Manage alerts', to: '/profile' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="page-header">Profile</h1>

      {/* Avatar & Name */}
      <div className="card flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center font-display font-bold text-green text-2xl overflow-hidden">
            {me?.avatarUrl ? <img src={me.avatarUrl} className="w-full h-full object-cover" alt="Avatar" /> : (me?.firstName?.[0] || 'U')}
          </div>
          <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-green rounded-full flex items-center justify-center">
            <Cam size={12} className="text-black" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAvatar(f); }} />
        </div>
        <div className="flex-1">
          <p className="font-display font-bold text-lg text-white">{me?.firstName && me?.lastName ? `${me.firstName} ${me.lastName}` : me?.username || 'Set up your profile'}</p>
          <p className="text-sm text-muted">{me?.phone}</p>
          <p className="text-xs text-subtle mt-0.5">Code: <span className="text-green font-mono">{user?.referralCode}</span></p>
        </div>
        <button onClick={editing ? handleSave : startEdit} className={editing ? 'btn-primary text-xs py-1.5 px-3' : 'btn-ghost text-xs py-1.5 px-3'}>
          {editing ? 'Save' : 'Edit'}
        </button>
      </div>

      {editing && (
        <div className="card animate-slide-up space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">First Name</label><input className="input" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></div>
            <div><label className="label">Last Name</label><input className="input" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></div>
          </div>
          <div><label className="label">Username</label><input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="@username" /></div>
          <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="you@email.com" /></div>
        </div>
      )}

      {/* Menu */}
      <div className="card divide-y divide-border p-0 overflow-hidden">
        {menuItems.map(item => (
          <button key={item.label} onClick={() => nav(item.to)} className="w-full flex items-center gap-3 p-4 hover:bg-white/5 transition-all text-left">
            <div className="w-9 h-9 rounded-xl bg-card2 flex items-center justify-center text-subtle"><item.icon size={16} /></div>
            <div className="flex-1"><p className="text-sm font-medium text-white">{item.label}</p><p className="text-xs text-subtle">{item.sub}</p></div>
            <div className="flex items-center gap-2">{item.badge && <span>{item.badge}</span>}<CR size={14} className="text-subtle" /></div>
          </button>
        ))}
        <button onClick={async () => { try { await api.post('/auth/logout'); } catch {} logout(); nav('/auth/login'); }}
          className="w-full flex items-center gap-3 p-4 hover:bg-danger/5 transition-all text-left">
          <div className="w-9 h-9 rounded-xl bg-danger/10 flex items-center justify-center text-danger"><LogOut size={16} /></div>
          <span className="text-sm font-medium text-danger">Logout</span>
        </button>
      </div>
    </div>
  );
}