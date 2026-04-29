import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, ArrowDownLeft, ArrowUpRight, Send, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { useWallet, useDeposit, useWithdraw, useSendMoney, useTransactions, useLookupUser } from '@/hooks/useApi';
import { useAuthStore } from '@/store/authStore';
import { formatKES, formatDate, txTypeIcon, txTypeColor } from '@/utils/format';
import clsx from 'clsx';

const tabs = [
  { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
  { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
  { id: 'send', label: 'Send Money', icon: Send },
];

const moneySchema = z.object({
  phone: z.string().min(10, 'Valid phone required'),
  amount: z.number({ coerce: true }).min(100, 'Minimum is KES 100'),
});

const sendSchema = z.object({
  recipientPhone: z.string().min(10, 'Valid phone required'),
  amount: z.number({ coerce: true }).min(10, 'Minimum is KES 10'),
  note: z.string().optional(),
});

export default function WalletPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(params.get('tab') || 'deposit');
  const [showBal, setShowBal] = useState(true);
  const user = useAuthStore(s => s.user);
  const { data: wallet } = useWallet();
  const { data: txData } = useTransactions(1);

  const deposit = useDeposit();
  const withdraw = useWithdraw();
  const sendMoney = useSendMoney();

  const depositForm = useForm<z.infer<typeof moneySchema>>({ resolver: zodResolver(moneySchema), defaultValues: { phone: user?.phone || '', amount: '' as any } });
  const withdrawForm = useForm<z.infer<typeof moneySchema>>({ resolver: zodResolver(moneySchema), defaultValues: { phone: user?.phone || '', amount: '' as any } });
  const sendForm = useForm<z.infer<typeof sendSchema>>({ resolver: zodResolver(sendSchema) });
  const recipientPhone = sendForm.watch('recipientPhone');
  const { data: recipient } = useLookupUser(recipientPhone || '');

  return (
    <div className="space-y-6">
      <h1 className="page-header">Wallet</h1>

      {/* Balance Card */}
      <div className="card relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-green/5 rounded-full blur-2xl" />
        <div className="flex items-center justify-between mb-1">
          <p className="label">Available Balance</p>
          <button onClick={() => setShowBal(s => !s)} className="text-subtle hover:text-muted">
            {showBal ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
        </div>
        <p className="font-display font-black text-4xl text-white mb-4">
          {showBal ? formatKES(Number(wallet?.balance || 0)) : 'KES ••••••'}
        </p>
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
          {[
            { label: 'Locked', value: Number(wallet?.lockedBalance || 0), color: 'text-gold' },
            { label: 'Total In', value: Number(wallet?.totalDeposited || 0), color: 'text-green' },
            { label: 'Total Out', value: Number(wallet?.totalWithdrawn || 0), color: 'text-danger' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-1">{s.label}</p>
              <p className={clsx('font-display font-bold text-sm', s.color)}>
                {showBal ? formatKES(s.value) : '••••'}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all',
              activeTab === t.id ? 'bg-green text-black font-bold shadow' : 'text-muted hover:text-white'
            )}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      {activeTab === 'deposit' && (
        <div className="card animate-slide-up space-y-4">
          <h2 className="section-title">Deposit via M-Pesa</h2>
          <p className="text-xs text-subtle">Enter your M-Pesa number. You'll receive an STK push prompt.</p>
          <form onSubmit={depositForm.handleSubmit(d => deposit.mutate({ phone: d.phone, amount: Number(d.amount) }))} className="space-y-4">
            <div>
              <label className="label">M-Pesa Phone</label>
              <input {...depositForm.register('phone')} className="input" placeholder="0712 345 678" />
              {depositForm.formState.errors.phone && <p className="text-danger text-xs mt-1">{depositForm.formState.errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Amount (KES)</label>
              <input {...depositForm.register('amount', { valueAsNumber: true })} className="input" placeholder="500" type="number" min="100" />
              {depositForm.formState.errors.amount?.message && <p className="text-danger text-xs mt-1">{depositForm.formState.errors.amount.message}</p>}
            </div>
            {/* Quick amounts */}
            <div className="flex gap-2 flex-wrap">
              {[500, 1000, 2000, 5000].map(a => (
                <button key={a} type="button" onClick={() => depositForm.setValue('amount', a as any)}
                  className="px-3 py-1.5 text-xs bg-card2 border border-border rounded-lg text-muted hover:text-white hover:border-border2 transition-all">
                  {formatKES(a)}
                </button>
              ))}
            </div>
            <button type="submit" disabled={deposit.isPending} className="btn-primary w-full justify-center">
              {deposit.isPending ? <Loader2 size={16} className="animate-spin" /> : <><ArrowDownLeft size={15} /> Deposit via M-Pesa</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'withdraw' && (
        <div className="card animate-slide-up space-y-4">
          <h2 className="section-title">Withdraw to M-Pesa</h2>
          <p className="text-xs text-subtle">Fee: 1.5% of withdrawal amount. Minimum KES 100.</p>
          <form onSubmit={withdrawForm.handleSubmit(d => withdraw.mutate({ phone: d.phone, amount: Number(d.amount) }))} className="space-y-4">
            <div>
              <label className="label">M-Pesa Phone</label>
              <input {...withdrawForm.register('phone')} className="input" placeholder="0712 345 678" />
            </div>
            <div>
              <label className="label">Amount (KES)</label>
              <input {...withdrawForm.register('amount', { valueAsNumber: true })} className="input" placeholder="500" type="number" min="100" />
            </div>
            <div className="bg-card2 border border-border rounded-xl p-3 text-xs text-muted space-y-1">
              <div className="flex justify-between"><span>Available</span><span className="text-white font-semibold">{formatKES(Number(wallet?.balance || 0))}</span></div>
              <div className="flex justify-between"><span>Fee (1.5%)</span><span className="text-gold">{formatKES(Number(withdrawForm.watch('amount') || 0) * 0.015)}</span></div>
            </div>
            <button type="submit" disabled={withdraw.isPending} className="btn-primary w-full justify-center bg-danger border-0" style={{ background: '#ff4d6a', boxShadow: '0 4px 20px rgba(255,77,106,0.25)' }}>
              {withdraw.isPending ? <Loader2 size={16} className="animate-spin" /> : <><ArrowUpRight size={15} /> Withdraw</>}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'send' && (
        <div className="card animate-slide-up space-y-4">
          <h2 className="section-title">Send to PesaApp Member</h2>
          <form onSubmit={sendForm.handleSubmit(d => sendMoney.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Recipient Phone</label>
              <input {...sendForm.register('recipientPhone')} className="input" placeholder="0712 345 678" />
              {sendForm.formState.errors.recipientPhone && <p className="text-danger text-xs mt-1">{sendForm.formState.errors.recipientPhone.message}</p>}
              {recipient && (
                <div className="mt-2 flex items-center gap-2 text-xs text-green bg-green/10 border border-green/20 rounded-lg px-3 py-2">
                  <span>✅</span>
                  <span>{recipient.firstName || recipient.username || recipient.phone}</span>
                </div>
              )}
            </div>
            <div>
              <label className="label">Amount (KES)</label>
              <input {...sendForm.register('amount', { valueAsNumber: true })} className="input" placeholder="100" type="number" min="10" />
              {sendForm.formState.errors.amount && <p className="text-danger text-xs mt-1">{sendForm.formState.errors.amount.message}</p>}
            </div>
            <div>
              <label className="label">Note (Optional)</label>
              <input {...sendForm.register('note')} className="input" placeholder="For rent, Thanks, etc." />
            </div>
            <button type="submit" disabled={sendMoney.isPending} className="btn-primary w-full justify-center">
              {sendMoney.isPending ? <Loader2 size={16} className="animate-spin" /> : <><Send size={15} /> Send Money</>}
            </button>
          </form>
        </div>
      )}

      {/* Transactions */}
      <div className="card">
        <div className='flex justify-between'>
 <h2 className="section-title mb-4">Transaction History</h2>
        <button onClick={() => navigate('/transactions')} className="text-xs text-green hover:underline flex items-center gap-1">All Transactions <ChevronRight size={12} /></button>

        </div>
        <div className="space-y-1">
          {(txData?.transactions || []).map(tx => (
            <div key={tx.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
              <div className={clsx('w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0', txTypeColor(tx.type))}>
                {txTypeIcon(tx.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{tx.description || tx.type}</p>
                <p className="text-[11px] text-subtle mt-0.5">{formatDate(tx.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className={clsx('font-display font-bold text-sm', ['DEPOSIT','RECEIVE','GAME_WIN','REFERRAL_BONUS'].includes(tx.type) ? 'text-green' : 'text-danger')}>
                  {['DEPOSIT','RECEIVE','GAME_WIN','REFERRAL_BONUS'].includes(tx.type) ? '+' : '-'}{formatKES(Number(tx.amount))}
                </p>
                <p className={clsx('text-[10px] mt-0.5', tx.status === 'COMPLETED' ? 'text-green/60' : tx.status === 'FAILED' ? 'text-danger/60' : 'text-gold/60')}>
                  {tx.status}
                </p>
              </div>
            </div>
          ))}
          {!txData?.transactions?.length && (
            <p className="text-center text-subtle py-8 text-sm">No transactions yet. Make your first deposit!</p>
          )}
        </div>
      </div>
    </div>
  );
}
