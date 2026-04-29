import { format, formatDistanceToNow } from 'date-fns';

export const formatKES = (amount: number): string =>
  `KES ${amount.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const formatDate = (date: string): string => {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86_400_000) return formatDistanceToNow(d, { addSuffix: true });
  return format(d, 'dd MMM yyyy, HH:mm');
};

export const txTypeIcon = (type: string): string => {
  const map: Record<string, string> = {
    DEPOSIT: '⬇️',
    WITHDRAWAL: '⬆️',
    SEND: '📤',
    RECEIVE: '📥',
    BILL_PAYMENT: '⚡',
    AIRTIME_PURCHASE: '📱',
    GAME_BET: '🎮',
    GAME_WIN: '🏆',
    SIGNAL_SUBSCRIPTION: '📈',
    REFERRAL_BONUS: '👥',
    COMMISSION: '💰',
  };
  return map[type] || '💳';
};

export const txTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    DEPOSIT: 'bg-green/10 text-green',
    RECEIVE: 'bg-green/10 text-green',
    GAME_WIN: 'bg-green/10 text-green',
    REFERRAL_BONUS: 'bg-green/10 text-green',
    WITHDRAWAL: 'bg-danger/10 text-danger',
    SEND: 'bg-blue/10 text-blue',
    BILL_PAYMENT: 'bg-gold/10 text-gold',
    AIRTIME_PURCHASE: 'bg-gold/10 text-gold',
    GAME_BET: 'bg-purple/10 text-purple',
    SIGNAL_SUBSCRIPTION: 'bg-blue/10 text-blue',
  };
  return map[type] || 'bg-white/5 text-muted';
};

export const maskPhone = (phone: string): string =>
  phone.replace(/(\+?\d{3})\d{4}(\d{3})/, '$1****$2');

export const copyToClipboard = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

export const cls = (...args: (string | undefined | null | false)[]): string =>
  args.filter(Boolean).join(' ');
