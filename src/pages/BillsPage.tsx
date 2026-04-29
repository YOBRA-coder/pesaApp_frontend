// ─── BillsPage.tsx ──────────────────────────────────────────
import { Zap, Droplets, Tv, Phone, Loader2 } from 'lucide-react';
import { usePayBill, useBuyAirtime } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import { useState } from 'react';
import clsx from 'clsx';

const BILL_CATEGORIES = [
  { id: 'kplc', label: 'KPLC Power', icon: '⚡', color: 'text-gold bg-gold/10', type: 'KPLC_PREPAID', placeholder: 'Meter number' },
  { id: 'water', label: 'Water Bill', icon: '💧', color: 'text-blue bg-blue/10', type: 'WATER_NAIROBI', placeholder: 'Account number' },
  { id: 'dstv', label: 'DSTV / GOtv', icon: '📺', color: 'text-purple bg-purple/10', type: 'DSTV', placeholder: 'Smartcard number' },
  { id: 'airtime', label: 'Buy Airtime', icon: '📱', color: 'text-green bg-green/10', type: 'airtime', placeholder: 'Phone number' },
];

export default function BillsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState({ accountNumber: '', amount: '', phone: '', network: 'SAFARICOM' });
  const payBill = usePayBill();
  const buyAirtime = useBuyAirtime();

  const cat = BILL_CATEGORIES.find(c => c.id === selected);

  const handlePay = () => {
    if (!cat) return;
    if (cat.type === 'airtime') {
      buyAirtime.mutate({ phone: form.phone, amount: Number(form.amount), network: form.network });
    } else {
      payBill.mutate({ billType: cat.type, accountNumber: form.accountNumber, amount: Number(form.amount) });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="page-header flex items-center gap-2"><Zap size={20} className="text-green" /> Pay Bills</h1>

      <div className="grid grid-cols-4 gap-4">
        {BILL_CATEGORIES.map(b => (
          <button key={b.id} onClick={() => setSelected(b.id === selected ? null : b.id)}
            className={clsx('card-hover flex flex-col items-center gap-3 py-5 transition-all', selected === b.id && 'border-green/40 bg-green/5')}>
            <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center text-2xl', b.color)}>{b.icon}</div>
            <p className="text-xs font-medium text-center">{b.label}</p>
          </button>
        ))}
      </div>

      {selected && cat && (
        <div className="card animate-slide-up space-y-4">
          <h2 className="section-title">{cat.icon} {cat.label}</h2>
          {cat.type === 'airtime' ? (
            <>
              <div>
                <label className="label">Network</label>
                <div className="flex gap-2">
                  {['SAFARICOM','AIRTEL','TELKOM'].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, network: n }))}
                      className={clsx('px-4 py-2 rounded-xl text-xs font-semibold border transition-all',
                        form.network === n ? 'border-green bg-green/10 text-green' : 'border-border text-muted hover:border-border2')}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input className="input" placeholder="0712 345 678" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </>
          ) : (
            <div>
              <label className="label">{cat.placeholder}</label>
              <input className="input" placeholder={cat.placeholder} value={form.accountNumber} onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))} />
            </div>
          )}
          <div>
            <label className="label">Amount (KES)</label>
            <input className="input" type="number" placeholder="Enter amount" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
          </div>
          <button onClick={handlePay} disabled={payBill.isPending || buyAirtime.isPending} className="btn-primary w-full justify-center">
            {payBill.isPending || buyAirtime.isPending ? <Loader2 size={16} className="animate-spin" /> : `Pay ${formatKES(Number(form.amount) || 0)}`}
          </button>
        </div>
      )}
    </div>
  );
}