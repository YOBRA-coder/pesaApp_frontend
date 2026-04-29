import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api, apiGet } from '@/services/api';
import { formatKES, formatDate } from '@/utils/format';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { Users, TrendingUp, DollarSign, Shield, BarChart2, Send, CheckCircle, XCircle, Eye, Plus, Loader2, ChevronDown, Search } from 'lucide-react';
import { HouseWallet, GameRevenueTable } from './admin/HouseFund';
import { RevenueSummary, HouseTransactions } from './admin/AdminExtensions';
import AdminSignalsPage from './admin/AdminSignals';

function useAdminStats() {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    apiGet('/admin/stats').then(setStats).catch(() => { });
  }, []);
  return stats;
}

function useAdminUsers(page: number, search: string) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    setLoading(true);
    apiGet('/admin/users', { page, limit: 15, search }).then(setData).finally(() => setLoading(false));
  }, [page, search]);
  return { data, loading };
}

function useKycPending() {
  const [data, setData] = useState<any[]>([]);
  const refresh = () => apiGet<any[]>('/admin/kyc/pending').then(setData).catch(() => { });
  useEffect(() => { refresh(); }, []);
  return { data, refresh };
}

function useSignalsList() {
  const [data, setData] = useState<any[]>([]);
  const refresh = () => apiGet<any[]>('/signals').then(d => setData(Array.isArray(d) ? d : [])).catch(() => { });
  useEffect(() => { refresh(); }, []);
  return { data, refresh };
}

// ── Signal creation form ────────────────────────────────────
function CreateSignalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    assetType: 'FOREX', pair: '', direction: 'BUY',
    entryPrice: '', stopLoss: '', takeProfit1: '', takeProfit2: '', takeProfit3: '',
    analysis: '',
  });
  const [loading, setLoading] = useState(false);

  const pairs: Record<string, string[]> = {
    FOREX: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/KES', 'GBP/JPY', 'AUD/USD', 'USD/CHF', 'EUR/GBP'],
    CRYPTO: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT', 'XRP/USDT', 'DOGE/USDT'],
    COMMODITY: ['XAU/USD', 'XAG/USD', 'WTI/USD', 'BRENT/USD'],
  };

  const handleCreate = async () => {
    if (!form.pair || !form.entryPrice || !form.stopLoss || !form.takeProfit1) {
      return toast.error('Fill all required fields');
    }
    setLoading(true);
    try {
      await api.post('/admin/signals', {
        assetType: form.assetType,
        pair: form.pair,
        direction: form.direction,
        entryPrice: parseFloat(form.entryPrice),
        stopLoss: parseFloat(form.stopLoss),
        takeProfit1: parseFloat(form.takeProfit1),
        takeProfit2: form.takeProfit2 ? parseFloat(form.takeProfit2) : undefined,
        takeProfit3: form.takeProfit3 ? parseFloat(form.takeProfit3) : undefined,
        analysis: form.analysis,
      });
      toast.success('Signal published!');
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to create signal');
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="section-title">📊 New Signal</h2>
          <button onClick={onClose} className="text-subtle hover:text-white text-xl">×</button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {(['FOREX', 'CRYPTO', 'COMMODITY'] as const).map(t => (
            <button key={t} onClick={() => setForm(f => ({ ...f, assetType: t, pair: '' }))}
              className={clsx('py-2 rounded-xl text-xs font-bold border transition-all', form.assetType === t ? 'border-green bg-green/10 text-green' : 'border-border text-muted')}>
              {t}
            </button>
          ))}
        </div>

        <div>
          <label className="label">Pair *</label>
          <select value={form.pair} onChange={e => setForm(f => ({ ...f, pair: e.target.value }))} className="input">
            <option value="">Select pair</option>
            {(pairs[form.assetType] || []).map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        <div className="flex gap-2">
          {(['BUY', 'SELL'] as const).map(d => (
            <button key={d} onClick={() => setForm(f => ({ ...f, direction: d }))}
              className={clsx('flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all',
                form.direction === d ? (d === 'BUY' ? 'border-green bg-green/10 text-green' : 'border-danger bg-danger/10 text-danger') : 'border-border text-muted')}>
              {d === 'BUY' ? '▲ BUY' : '▼ SELL'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[['entryPrice', 'Entry *'], ['stopLoss', 'Stop Loss *'], ['takeProfit1', 'Take Profit 1 *']].map(([k, l]) => (
            <div key={k}>
              <label className="label text-[10px]">{l}</label>
              <input type="number" step="any" className="input text-sm" placeholder="0.0000"
                value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[['takeProfit2', 'TP2 (optional)'], ['takeProfit3', 'TP3 (optional)']].map(([k, l]) => (
            <div key={k}>
              <label className="label text-[10px]">{l}</label>
              <input type="number" step="any" className="input text-sm" placeholder="0.0000"
                value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
            </div>
          ))}
        </div>

        <div>
          <label className="label">Analysis / Rationale</label>
          <textarea value={form.analysis} onChange={e => setForm(f => ({ ...f, analysis: e.target.value }))}
            className="input resize-none h-24 text-sm" placeholder="Technical/fundamental analysis for this signal..." />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Loader2 size={14} className="animate-spin" /> : '📤 Publish Signal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Close signal modal ──────────────────────────────────────
function CloseSignalModal({ signal, onClose, onDone }: any) {
  const [status, setStatus] = useState<'CLOSED_TP' | 'CLOSED_SL'>('CLOSED_TP');
  const [pnl, setPnl] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    try {
      await api.patch(`/admin/signals/${signal.id}/close`, { status, pnlPercent: parseFloat(pnl) });
      toast.success('Signal closed');
      onDone(); onClose();
    } catch { toast.error('Failed'); } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
        <h2 className="section-title">Close Signal: {signal.pair}</h2>
        <div className="flex gap-2">
          {(['CLOSED_TP', 'CLOSED_SL'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={clsx('flex-1 py-2 rounded-xl text-xs font-bold border transition-all',
                status === s ? (s === 'CLOSED_TP' ? 'border-green bg-green/10 text-green' : 'border-danger bg-danger/10 text-danger') : 'border-border text-muted')}>
              {s === 'CLOSED_TP' ? '✅ TP Hit' : '❌ SL Hit'}
            </button>
          ))}
        </div>
        <div>
          <label className="label">P&L % (e.g. 3.5 or -1.2)</label>
          <input type="number" step="0.01" className="input" placeholder="3.5" value={pnl} onChange={e => setPnl(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button onClick={handle} disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? <Loader2 size={14} className="animate-spin" /> : 'Close Signal'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Page ─────────────────────────────────────────
export default function AdminPage() {
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateSignal, setShowCreateSignal] = useState(false);
  const [closingSignal, setClosingSignal] = useState<any>(null);

  const stats = useAdminStats();
  const { data: usersData, loading: usersLoading } = useAdminUsers(page, search);
  const { data: pendingKyc, refresh: refreshKyc } = useKycPending();
  const { data: signals, refresh: refreshSignals } = useSignalsList();

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Shield size={40} className="text-danger" />
        <p className="text-white font-semibold">Admin access required</p>
        <button onClick={() => navigate('/')} className="btn-ghost">Go Home</button>
      </div>
    );
  }

  const handleKyc = async (userId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await api.post(`/admin/kyc/${userId}/${action}`, { reason });
      toast.success(`KYC ${action}d`);
      refreshKyc();
    } catch { toast.error('Failed'); }
  };

  const handleUserStatus = async (id: string, status: string) => {
    try {
      await api.patch(`/admin/users/${id}/status`, { status });
      toast.success(`User ${status.toLowerCase()}`);
    } catch { toast.error('Failed'); }
  };

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'kyc', label: `🪪 KYC ${pendingKyc.length > 0 ? `(${pendingKyc.length})` : ''}` },
    { id: 'signals', label: '📈 Signals' },
    { id: 'transactions', label: '💳 Transactions' },
    { id: 'house', label: '💰 House Fund' },
    { id: 'revenue', label: '📊 Revenue' },
  ];

  return (
    <div className="space-y-5">
      {showCreateSignal && <CreateSignalModal onClose={() => setShowCreateSignal(false)} onCreated={refreshSignals} />}
      {closingSignal && <CloseSignalModal signal={closingSignal} onClose={() => setClosingSignal(null)} onDone={refreshSignals} />}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="page-header flex items-center gap-2"><Shield size={20} className="text-green" /> Admin</h1>
          <p className="text-subtle text-xs mt-0.5">PesaApp Management Console</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={clsx('px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all',
              activeTab === t.id ? 'bg-green text-black' : 'text-muted hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Users', value: stats?.totalUsers || '—', icon: Users, color: 'text-blue', bg: 'bg-blue/10' },
              { label: 'Active Users', value: stats?.activeUsers || '—', icon: CheckCircle, color: 'text-green', bg: 'bg-green/10' },
              { label: 'Today Txns', value: stats?.todayTx || '—', icon: BarChart2, color: 'text-gold', bg: 'bg-gold/10' },
              { label: 'Pending KYC', value: stats?.pendingKyc || '—', icon: Shield, color: 'text-purple', bg: 'bg-purple/10' },
              { label: 'Total Deposited', value: formatKES(stats?.totalDeposited || 0), icon: DollarSign, color: 'text-green', bg: 'bg-green/10' },
              { label: 'Game Volume', value: formatKES(stats?.totalGameVolume || 0), icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10' },
            ].map(s => (
              <div key={s.label} className="card flex items-center gap-3">
                <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center', s.bg)}>
                  <s.icon size={18} className={s.color} />
                </div>
                <div>
                  <p className={clsx('font-display font-bold text-xl leading-none', s.color)}>{s.value}</p>
                  <p className="text-[10px] text-subtle mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pending KYC preview */}
          {pendingKyc.length > 0 && (
            <div className="card border-gold/20 bg-gold/5">
              <div className="flex items-center justify-between mb-3">
                <p className="section-title text-gold flex items-center gap-2"><Shield size={14} /> {pendingKyc.length} KYC Pending Review</p>
                <button onClick={() => setActiveTab('kyc')} className="text-xs text-gold hover:underline">Review All →</button>
              </div>
              <div className="space-y-2">
                {pendingKyc.slice(0, 3).map((k: any) => (
                  <div key={k.id} className="flex items-center gap-3 text-sm">
                    <span className="text-muted flex-1">{k.firstName} {k.lastName} — {k.user?.phone}</span>
                    <button onClick={() => handleKyc(k.userId, 'approve')} className="px-2.5 py-1 text-[10px] bg-green/10 border border-green/20 rounded-lg text-green font-bold hover:bg-green/20">Approve</button>
                    <button onClick={() => handleKyc(k.userId, 'reject', 'Documents unclear')} className="px-2.5 py-1 text-[10px] bg-danger/10 border border-danger/20 rounded-lg text-danger font-bold hover:bg-danger/20">Reject</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input className="input pl-9 text-sm" placeholder="Search phone or username..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Phone', 'Name', 'Status', 'KYC', 'Balance', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[10px] text-subtle uppercase tracking-wider px-4 py-3 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading && <tr><td colSpan={7} className="text-center py-8 text-muted"><Loader2 className="animate-spin mx-auto" size={20} /></td></tr>}
                  {(usersData?.users || []).map((u: any) => (
                    <tr key={u.id} className="border-b border-border/50 hover:bg-white/3 transition-all">
                      <td className="px-4 py-3 font-mono text-xs text-muted">{u.phone}</td>
                      <td className="px-4 py-3 text-white text-xs">{u.firstName || u.username || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                          u.status === 'ACTIVE' ? 'bg-green/10 text-green' : u.status === 'SUSPENDED' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold')}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                          u.kycStatus === 'APPROVED' ? 'bg-green/10 text-green' : u.kycStatus === 'PENDING' ? 'bg-gold/10 text-gold' : 'bg-white/5 text-muted')}>
                          {u.kycStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-display font-bold text-xs text-green">{formatKES(Number(u.wallet?.balance || 0))}</td>
                      <td className="px-4 py-3 text-[11px] text-subtle">{formatDate(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => handleUserStatus(u.id, u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED')}
                            className={clsx('px-2 py-1 text-[10px] rounded-lg font-bold border',
                              u.status === 'SUSPENDED' ? 'border-green/20 bg-green/10 text-green' : 'border-danger/20 bg-danger/10 text-danger')}>
                            {u.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center px-4 py-3 border-t border-border text-xs text-subtle">
              <span>{usersData?.total || 0} total users</span>
              <div className="flex gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-border rounded-lg disabled:opacity-30 hover:border-border2">←</button>
                <span className="py-1">Page {page}</span>
                <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-border rounded-lg hover:border-border2">→</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* KYC */}
      {activeTab === 'kyc' && (
        <div className="space-y-4">
          <p className="text-muted text-sm">{pendingKyc.length} applications pending review</p>
          {pendingKyc.length === 0 && (
            <div className="card text-center py-12">
              <CheckCircle size={40} className="text-green mx-auto mb-3" />
              <p className="text-white font-semibold">All caught up!</p>
              <p className="text-subtle text-sm">No pending KYC applications</p>
            </div>
          )}
          {pendingKyc.map((k: any) => (
            <div key={k.id} className="card space-y-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-white">{k.firstName} {k.lastName}</p>
                  <p className="text-xs text-subtle">{k.user?.phone} · {k.docType} · {k.docNumber}</p>
                  <p className="text-[10px] text-subtle mt-0.5">Submitted {formatDate(k.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleKyc(k.userId, 'approve')} className="px-3 py-2 text-xs bg-green/10 border border-green/20 rounded-xl text-green font-bold hover:bg-green/20 flex items-center gap-1.5">
                    <CheckCircle size={12} /> Approve
                  </button>
                  <button onClick={() => handleKyc(k.userId, 'reject', 'Please resubmit clearer documents')} className="px-3 py-2 text-xs bg-danger/10 border border-danger/20 rounded-xl text-danger font-bold hover:bg-danger/20 flex items-center gap-1.5">
                    <XCircle size={12} /> Reject
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[['ID Front', k.idFrontUrl], ['ID Back', k.idBackUrl], ['Selfie', k.selfieUrl]].map(([label, url]) => (
                  <div key={label} className="space-y-1">
                    <p className="text-[10px] text-subtle uppercase tracking-wider">{label}</p>
                    {url ? (
                      <a href={url as string} target="_blank" rel="noopener noreferrer">
                        <img src={url as string} alt={label as string} className="w-full h-24 object-cover rounded-xl border border-border hover:border-border2 transition-all" />
                      </a>
                    ) : <div className="w-full h-24 rounded-xl bg-card2 border border-border flex items-center justify-center text-subtle text-xs">No image</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Signals */}
      {activeTab === 'signals' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-muted text-sm">{signals.length} total signals</p>
            <button onClick={() => setShowCreateSignal(true)} className="btn-primary text-sm py-2">
              <Plus size={14} /> New Signal
            </button>
          </div>
          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Pair', 'Type', 'Direction', 'Entry', 'TP1', 'SL', 'Status', 'P&L', 'Actions'].map(h => (
                      <th key={h} className="text-left text-[10px] text-subtle uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {signals.map((s: any) => (
                    <tr key={s.id} className="border-b border-border/50 hover:bg-white/3">
                      <td className="px-4 py-3 font-display font-bold text-white">{s.pair}</td>
                      <td className="px-4 py-3 text-xs text-subtle">{s.assetType}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', s.direction === 'BUY' ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger')}>
                          {s.direction}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono">{Number(s.entryPrice).toFixed(4)}</td>
                      <td className="px-4 py-3 text-xs text-green font-mono">{Number(s.takeProfit1).toFixed(4)}</td>
                      <td className="px-4 py-3 text-xs text-danger font-mono">{Number(s.stopLoss).toFixed(4)}</td>
                      <td className="px-4 py-3">
                        <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                          s.status === 'ACTIVE' ? 'bg-gold/10 text-gold' : s.status === 'CLOSED_TP' ? 'bg-green/10 text-green' : 'bg-danger/10 text-danger')}>
                          {s.status === 'ACTIVE' ? '● LIVE' : s.status === 'CLOSED_TP' ? '✅ TP' : '❌ SL'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-xs">
                        {s.pnlPercent !== null && s.pnlPercent !== undefined ? (
                          <span className={Number(s.pnlPercent) >= 0 ? 'text-green' : 'text-danger'}>
                            {Number(s.pnlPercent) > 0 ? '+' : ''}{Number(s.pnlPercent).toFixed(2)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {s.status === 'ACTIVE' && (
                          <button onClick={() => setClosingSignal(s)} className="px-2 py-1 text-[10px] border border-border rounded-lg text-muted hover:text-white hover:border-border2">
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {signals.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-muted text-sm">No signals yet. Create one!</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Transactions */}
      {activeTab === 'transactions' && <TransactionsTab />}
      {activeTab === 'house' && (
        <div className="space-y-5">
          <HouseWallet />
          <div className="card"><h2 className="section-title mb-4">Transactions</h2><HouseTransactions /></div>
        </div>
      )}
      {activeTab === 'revenue' && (
        <div className="space-y-5">
          <RevenueSummary />
          <GameRevenueTable />
        </div>
      )}
      {activeTab === 'signals' && <AdminSignalsPage />}
    </div>
  );
}

function TransactionsTab() {
  const [data, setData] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  useEffect(() => {
    apiGet('/admin/transactions', { page, limit: 20, type: type || undefined }).then(setData);
  }, [page, type]);

  const types = ['', 'DEPOSIT', 'WITHDRAWAL', 'SEND', 'GAME_BET', 'GAME_WIN', 'BILL_PAYMENT'];
  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {types.map(t => (
          <button key={t || 'all'} onClick={() => { setType(t); setPage(1); }}
            className={clsx('px-3 py-1.5 text-xs rounded-lg border transition-all', type === t ? 'border-green bg-green/10 text-green' : 'border-border text-muted hover:border-border2')}>
            {t || 'All Types'}
          </button>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {['User', 'Type', 'Amount', 'Fee', 'Status', 'Date'].map(h => (
                  <th key={h} className="text-left text-[10px] text-subtle px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.transactions || []).map((tx: any) => (
                <tr key={tx.id} className="border-b border-border/50 hover:bg-white/3">
                  <td className="px-4 py-3 text-muted font-mono">{tx.user?.phone}</td>
                  <td className="px-4 py-3 text-white">{tx.type}</td>
                  <td className="px-4 py-3 font-display font-bold text-sm text-green">{formatKES(Number(tx.amount))}</td>
                  <td className="px-4 py-3 text-muted">{formatKES(Number(tx.fee))}</td>
                  <td className="px-4 py-3">
                    <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full',
                      tx.status === 'COMPLETED' ? 'bg-green/10 text-green' : tx.status === 'FAILED' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold')}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-subtle">{formatDate(tx.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between px-4 py-3 border-t border-border text-xs text-subtle">
          <span>{data?.total || 0} transactions</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border border-border rounded-lg disabled:opacity-30">←</button>
            <span className="py-1">Page {page}</span>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-1 border border-border rounded-lg">→</button>
          </div>
        </div>
      </div>
    </div>
  );
}
