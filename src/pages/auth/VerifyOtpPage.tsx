import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { phone, referralCode } = (location.state as any) || {};
  const { setAuth } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if no phone
  useEffect(() => { if (!phone) navigate('/auth/login'); }, [phone]);

  // Countdown
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) refs.current[i + 1]?.focus();
    if (next.every(d => d) && next.join('').length === 6) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const handleVerify = async (code: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: code, referralCode });
      const { user, accessToken, refreshToken, isNewUser } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(isNewUser ? '🎉 Account created! Welcome to PesaApp' : 'Welcome back!');
      navigate('/');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid OTP');
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post('/auth/request-otp', { phone });
      toast.success('New OTP sent');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to resend');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-sm relative">
        <button onClick={() => navigate('/auth/login')} className="flex items-center gap-2 text-muted hover:text-white transition-colors mb-8 text-sm">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="text-center mb-8">
          <div className="text-4xl mb-4">📱</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Enter OTP</h1>
          <p className="text-muted text-sm">
            Code sent to <span className="text-white font-semibold">{phone}</span>
          </p>
        </div>

        {/* OTP inputs */}
        <div className="flex gap-3 justify-center mb-6">
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={el => refs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="w-12 h-14 text-center text-xl font-display font-bold bg-card border-2 border-border rounded-xl text-white outline-none transition-all focus:border-green focus:ring-2 focus:ring-green/20"
              autoFocus={i === 0}
            />
          ))}
        </div>

        <button
          onClick={() => handleVerify(otp.join(''))}
          disabled={loading || otp.join('').length < 6}
          className="btn-primary w-full justify-center mb-4"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : 'Verify OTP'}
        </button>

        {/* Resend */}
        <div className="text-center">
          {countdown > 0 ? (
            <p className="text-subtle text-sm">Resend in {countdown}s</p>
          ) : (
            <button onClick={handleResend} disabled={resending} className="text-green text-sm flex items-center gap-1.5 mx-auto hover:underline">
              {resending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
