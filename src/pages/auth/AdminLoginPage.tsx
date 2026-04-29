import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Shield, Phone, Lock, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import clsx from 'clsx';

// ── Step 1: Phone + Password ─────────────────────────────────
const loginSchema = z.object({
  phone: z.string().min(9, 'Enter phone'),
  password: z.string().min(8, 'Password required'),
});

// ── Step 2: 2FA OTP ──────────────────────────────────────────
const otpSchema = z.object({
  otp: z.string().length(6, '6-digit code required').regex(/^\d+$/, 'Numbers only'),
});

// ── Setup password ───────────────────────────────────────────
const setupSchema = z.object({
  password: z.string().min(8, 'Min 8 characters'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Passwords do not match', path: ['confirm'] });

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useAuthStore();

  const setupPhone = searchParams.get('phone') || '';
  const setupOtp = searchParams.get('otp') || '';
  const isSetup = !!setupPhone;

  const [step, setStep] = useState<'login' | 'otp' | 'setup'>(!isSetup ? 'login' : 'setup');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const otpForm = useForm({ resolver: zodResolver(otpSchema) });
  const setupForm = useForm({ resolver: zodResolver(setupSchema) });

  // ── Step 1: submit phone + password ──────────────────────
  const onLogin = async (data: any) => {
    setLoading(true);
    try {
      const normalized = data.phone.startsWith('0') ? `+254${data.phone.slice(1)}` : data.phone;
      await api.post('/auth/admin/login', { phone: normalized, password: data.password });
      setPhone(normalized);
      toast.success('Password verified. Check your phone for 2FA code.');
      setStep('otp');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  // ── Step 2: verify 2FA OTP ────────────────────────────────
  const onVerify2FA = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/admin/verify-2fa', { phone, otp: data.otp });
      const { user, accessToken, refreshToken } = res.data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome, ${user.firstName || user.role}!`);
      navigate(user.role === 'ADMIN' ? '/admin' : '/agent');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Invalid code');
    } finally { setLoading(false); }
  };

  // ── Setup: set password for first time ───────────────────
  const onSetup = async (data: any) => {
    setLoading(true);
    try {
      const normalized = setupPhone.startsWith('0') ? `+254${setupPhone.slice(1)}` : setupPhone;
      await api.post('/auth/admin/setup-password', {
        phone: normalized,
        otp: setupOtp,
        password: data.password,
      });
      toast.success('Password set! You can now login.');
      navigate('/auth/admin');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Setup failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-green/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Back to user login */}
        <button onClick={() => navigate('/auth/login')} className="flex items-center gap-2 text-subtle hover:text-muted text-sm mb-6 transition-colors">
          <ArrowLeft size={14} /> User Login
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-green/10 border border-green/20 rounded-xl flex items-center justify-center">
            <Shield size={22} className="text-green" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-white">
              {step === 'setup' ? 'Set Your Password' : step === 'otp' ? '2FA Verification' : 'Staff Login'}
            </h1>
            <p className="text-xs text-subtle">
              {step === 'setup' ? 'Create a secure password for your account' : step === 'otp' ? 'Enter the code sent to your phone' : 'Admin & Agent access only'}
            </p>
          </div>
        </div>

        {/* ── SETUP FORM ────────────────────────────────────── */}
        {step === 'setup' && (
          <form onSubmit={setupForm.handleSubmit(onSetup)} className="space-y-4">
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-3 text-xs text-gold mb-4">
              Setting password for <strong>{setupPhone}</strong>
            </div>
            <div>
              <label className="label">New Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input {...setupForm.register('password')} type={showPass ? 'text' : 'password'}
                  className="input pl-9 pr-10" placeholder="Min 8 characters" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {setupForm.formState.errors.password && <p className="text-danger text-xs mt-1">{setupForm.formState.errors.password.message}</p>}
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input {...setupForm.register('confirm')} type="password" className="input" placeholder="Repeat password" />
              {setupForm.formState.errors.confirm && <p className="text-danger text-xs mt-1">{setupForm.formState.errors.confirm.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 font-bold">
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Set Password & Login →'}
            </button>
          </form>
        )}

        {/* ── LOGIN FORM ────────────────────────────────────── */}
        {step === 'login' && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
            <div>
              <label className="label">Staff Phone Number</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input {...loginForm.register('phone')} className="input pl-9" placeholder="0712 345 678" type="tel" autoFocus />
              </div>
              {loginForm.formState.errors.phone && <p className="text-danger text-xs mt-1">{loginForm.formState.errors.phone.message}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input {...loginForm.register('password')} type={showPass ? 'text' : 'password'}
                  className="input pl-9 pr-10" placeholder="Your password" />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {loginForm.formState.errors.password && <p className="text-danger text-xs mt-1">{loginForm.formState.errors.password.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 font-bold">
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Continue <ArrowRight size={16} /></>}
            </button>
          </form>
        )}

        {/* ── 2FA OTP FORM ─────────────────────────────────── */}
        {step === 'otp' && (
          <div className="space-y-5">
            <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted">
              A 6-digit code was sent to <strong className="text-white">{phone}</strong>
            </div>
            <form onSubmit={otpForm.handleSubmit(onVerify2FA)} className="space-y-4">
              <div>
                <label className="label">2FA Code</label>
                <input {...otpForm.register('otp')} className="input text-center font-display font-bold text-2xl tracking-[0.3em]"
                  placeholder="000000" maxLength={6} inputMode="numeric" autoFocus />
                {otpForm.formState.errors.otp && <p className="text-danger text-xs mt-1">{otpForm.formState.errors.otp.message}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 font-bold">
                {loading ? <Loader2 size={16} className="animate-spin" /> : '✅ Verify & Login'}
              </button>
            </form>
            <button onClick={() => setStep('login')} className="flex items-center gap-2 text-subtle hover:text-muted text-xs mx-auto transition-colors">
              <ArrowLeft size={12} /> Change phone/password
            </button>
          </div>
        )}

        {/* Security note */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-[10px] text-subtle">🔒 Secured with 2-factor authentication</p>
          <p className="text-[10px] text-subtle">All admin actions are logged and audited</p>
        </div>
      </div>
    </div>
  );
}
