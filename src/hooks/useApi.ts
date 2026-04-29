import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, apiGet, apiPatch, apiPost } from '@/services/api';
import toast from 'react-hot-toast';
import type { Wallet, Transaction, Signal, ReferralStats, KycRecord, Notification } from '@/types';

// ─── Wallet ─────────────────────────────────────────────────
export const useWallet = () =>
  useQuery({ queryKey: ['wallet'], queryFn: () => apiGet<Wallet>('/wallet/balance'), staleTime: 10_000 });

export const useTransactions = (page = 1, type?: string) =>
  useQuery({
    queryKey: ['transactions', page, type],
    queryFn: () => apiGet<{ transactions: Transaction[]; total: number; totalPages: number }>(
      '/wallet/transactions', { page, limit: 20, type }
    ),
  });

export const useDeposit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone: string; amount: number }) => apiPost('/wallet/deposit', data),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Check your phone for M-Pesa prompt');
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Deposit failed'),
  });
};

export const useWithdraw = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone: string; amount: number }) => apiPost('/wallet/withdraw', data),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Withdrawal processing');
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Withdrawal failed'),
  });
};

export const useSendMoney = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { recipientPhone: string; amount: number; note?: string }) => apiPost('/wallet/send', data),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Money sent!');
      qc.invalidateQueries({ queryKey: ['wallet'] });
      qc.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Send failed'),
  });
};

// ─── KYC ────────────────────────────────────────────────────
export const useKycStatus = () =>
  useQuery({ queryKey: ['kyc'], queryFn: () => apiGet<KycRecord>('/kyc/status') });

export const useSubmitKyc = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      api.post('/kyc/submit', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      toast.success('KYC submitted! Review takes up to 24 hours.');
      qc.invalidateQueries({ queryKey: ['kyc'] });
      qc.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'KYC submission failed'),
  });
};

// ─── User ────────────────────────────────────────────────────
export const useMe = () =>
  useQuery({ queryKey: ['me'], queryFn: () => apiGet<{ wallet: Wallet; kycRecord: KycRecord | null } & any>('/users/me') });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { firstName?: string; lastName?: string; username?: string; email?: string }) =>
      apiPatch('/users/me', data),
    onSuccess: () => { toast.success('Profile updated'); qc.invalidateQueries({ queryKey: ['me'] }); },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Update failed'),
  });
};

export const useLookupUser = (phone: string) =>
  useQuery({
    queryKey: ['lookup', phone],
    queryFn: () => apiGet<{ phone: string; username: string; firstName: string }>(`/users/lookup?phone=${phone}`),
    enabled: phone.length >= 10,
    retry: false,
  });

// ─── Signals ─────────────────────────────────────────────────
export const useSignals = () =>
  useQuery({ queryKey: ['signals'], queryFn: () => apiGet<Signal[]>('/signals') });

export const useSignalSubscription = () =>
  useQuery({ queryKey: ['signal-sub'], queryFn: () => apiGet<any>('/signals/subscription') });

export const useSubscribeSignals = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (plan: string) => apiPost('/signals/subscribe', { plan }),
    onSuccess: (res: any) => {
      toast.success(res.message || 'Subscribed!');
      qc.invalidateQueries({ queryKey: ['signal-sub', 'wallet'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Subscription failed'),
  });
};

// ─── Bills ───────────────────────────────────────────────────
export const usePayBill = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { billType: string; accountNumber: string; amount: number }) => apiPost('/bills/pay', data),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Bill paid successfully');
      qc.invalidateQueries({ queryKey: ['wallet', 'transactions'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Payment failed'),
  });
};

export const useBuyAirtime = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phone: string; amount: number; network: string }) => apiPost('/bills/airtime', data),
    onSuccess: (res: any) => {
      toast.success(res.data?.message || 'Airtime sent!');
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Airtime purchase failed'),
  });
};

// ─── Referrals ───────────────────────────────────────────────
export const useReferralStats = () =>
  useQuery({ queryKey: ['referrals'], queryFn: () => apiGet<ReferralStats>('/referrals/stats') });

// ─── Notifications ───────────────────────────────────────────
export const useNotifications = () =>
  useQuery({ queryKey: ['notifications'], queryFn: () => apiGet<{ notifications: Notification[]; unread: number }>('/notifications') });

// ─── Games ───────────────────────────────────────────────────
export const usePlaceBet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { gameType: string; betAmount: number; clientSeed?: string }) => apiPost('/games/bet', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
    onError: (e: any) => toast.error(e.response?.data?.message || 'Bet failed'),
  });
};

export const useCashOut = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { sessionId: string; multiplier: number }) => apiPost('/games/cashout', data),
    onSuccess: (res: any) => {
      toast.success(`Cashed out at ${res.data?.multiplier}x — Won KES ${Number(res.data?.winAmount).toFixed(2)}`);
      qc.invalidateQueries({ queryKey: ['wallet'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.message || 'Cashout failed'),
  });
};

export const useGameHistory = (page = 1) =>
  useQuery({ queryKey: ['game-history', page], queryFn: () => apiGet<any>(`/games/history?page=${page}`) });
