import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Phone, ArrowRight, Loader2, ChevronDown, Gift } from 'lucide-react';
import { api } from '@/services/api';
import clsx from 'clsx';

const schema = z.object({
  phone: z.string().min(9, 'Enter a valid phone number').regex(/^(\+?254|0)[17]\d{8}$/, 'Enter a valid Kenyan number (e.g. 0712345678)'),
  referralCode: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

const FEATURES = [
  { emoji: '💳', text: 'Deposit & withdraw via M-Pesa' },
  { emoji: '⚡', text: 'Pay KPLC, water, airtime bills' },
  { emoji: '✈️', text: 'Play Aviator, Mines, Plinko, Dice' },
  { emoji: '📈', text: 'Forex & crypto signals' },
  { emoji: '👥', text: 'Earn KES 200 per referral' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showReferral, setShowReferral] = useState(false);
  const refCode = searchParams.get('ref') || searchParams.get('referral') || '';
 
// Pre-fill referral code from URL
useEffect(() => {
  if (refCode) {
    setValue('referralCode', refCode);
    setShowReferral(true);
    toast(`Referral code applied: ${refCode}`, { icon: '🎁' });
  }
}, [refCode]);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: refCode },
  });

  const phone = watch('phone');

  // Format phone as user types
  const formatPhone = (raw: string) => {
    // Strip non-digits
    let digits = raw.replace(/\D/g, '');
    // Normalize to 07XX format for display
    if (digits.startsWith('254')) digits = '0' + digits.slice(3);
    return digits;
  };

  const onSubmit = async ({ phone, referralCode }: FormData) => {
    setLoading(true);
    try {
      // Normalize phone before sending
      const normalized = phone.startsWith('0') ? `+254${phone.slice(1)}` : phone;
      const res = await api.post('/auth/request-otp', { phone: normalized });

      if (res.data.success) {
        toast.success('OTP sent to your phone 📱');
        navigate('/auth/verify', {
          state: {
            phone: normalized,
            referralCode: referralCode || undefined,
            isNewUser: res.data.isNewUser, // backend hints if new user
          }
        });
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Failed to send OTP';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col lg:flex-row">
      {/* Left: Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-bg2 to-bg flex-col justify-between p-12 border-r border-border relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-80 h-80 bg-green/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-blue/5 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 gradient-green rounded-xl flex items-center justify-center font-display font-black text-black text-xl glow-green">P</div>
            <span className="font-display font-bold text-xl text-white">PesaApp</span>
          </div>

          <h1 className="font-display font-black text-5xl text-white leading-tight mb-6">
            Kenya's Smart<br />
            <span className="text-green">Money Platform</span>
          </h1>

          <p className="text-muted text-lg leading-relaxed mb-10">
            Deposit, pay bills, play games, invest in forex & crypto — all from one app.
          </p>

          <div className="space-y-4">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <span className="text-xl">{f.emoji}</span>
                <span className="text-muted text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-subtle text-xs">
          © 2025 PesaApp Technologies Limited · Regulated in Kenya
        </div>
      </div>

      {/* Right: Auth form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <div className="w-14 h-14 gradient-green rounded-2xl flex items-center justify-center font-display font-black text-black text-2xl glow-green">P</div>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-white mb-1">Sign In</h2>
            <p className="text-muted text-sm">Enter your phone to receive a verification code. New? We'll create your account automatically.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Phone input */}
            <div>
              <label className="label">Phone Number</label>
              <div className="flex gap-2">
                {/* Country code badge */}
                <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-3 text-sm text-muted shrink-0">
                  🇰🇪 <span className="text-white font-semibold">+254</span>
                </div>
                <div className="relative flex-1">
                  <input
                    {...register('phone', {
                      onChange: e => {
                        e.target.value = formatPhone(e.target.value);
                      }
                    })}
                    className={clsx('input', errors.phone && 'border-danger/50 focus:border-danger focus:ring-danger/20')}
                    placeholder="0712 345 678"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    autoFocus
                  />
                </div>
              </div>
              {errors.phone && <p className="text-danger text-xs mt-1.5 flex items-center gap-1">⚠️ {errors.phone.message}</p>}
              <p className="text-subtle text-[11px] mt-1.5">Safaricom, Airtel & Telkom supported</p>
            </div>

            {/* Referral code toggle */}
            <button type="button" onClick={() => setShowReferral(s => !s)}
              className="flex items-center gap-2 text-xs text-muted hover:text-green transition-colors">
              <Gift size={13} />
              {showReferral ? 'Hide' : 'Have a referral code?'}
              <ChevronDown size={13} className={clsx('transition-transform', showReferral && 'rotate-180')} />
            </button>

            {showReferral && (
              <div className="animate-slide-up">
                <label className="label">Referral Code</label>
                <input
                  {...register('referralCode')}
                  className="input font-mono tracking-widest text-green"
                  placeholder="PESA-XXXXXX"
                />
                <p className="text-[11px] text-subtle mt-1">Only applies on first-time registration</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 mt-2 text-base font-bold">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                : <>Continue <ArrowRight size={18} /></>
              }
            </button>
          </form>

          {/* Info box */}
          <div className="mt-5 bg-card border border-border rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-white">ℹ️ How it works</p>
            <div className="space-y-1.5 text-xs text-muted">
              <p>• <strong className="text-white">Existing user?</strong> You'll be logged in after OTP verification</p>
              <p>• <strong className="text-white">New user?</strong> Your account is created automatically — no forms needed</p>
              <p>• OTP expires in 5 minutes · Max 3 attempts per 15 minutes</p>
            </div>
          </div>

          {/* Legal links */}
          <p className="text-center text-subtle text-[11px] mt-5 leading-relaxed">
            By continuing, you agree to our{' '}
            <button onClick={() => navigate('/legal?doc=terms')} className="text-green hover:underline">Terms of Use</button>
            {' '}and{' '}
            <button onClick={() => navigate('/legal?doc=privacy')} className="text-green hover:underline">Privacy Policy</button>.
            Must be 18+ to use.
          </p>

                    {/* Staff login link */}
          <div className="mt-6 text-center">
            <button onClick={() => navigate('/auth/admin')} className="text-[11px] text-subtle hover:text-muted transition-colors">
              Staff / Admin login →
            </button>
          </div>

          {/* Feature pills (mobile only) */}
          <div className="flex lg:hidden flex-wrap gap-2 justify-center mt-6">
            {FEATURES.map(f => (
              <span key={f.text} className="text-xs text-muted bg-card border border-border rounded-full px-3 py-1">
                {f.emoji} {f.text.split(' ').slice(0,3).join(' ')}
              </span>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}