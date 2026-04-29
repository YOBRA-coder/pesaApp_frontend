// ─── Auth ──────────────────────────────────────────────────
export interface User {
  id: string;
  phone: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarUrl?: string;
  role: 'USER' | 'AGENT' | 'ADMIN';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  kycStatus: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  referralCode: string;
  createdAt: string;
}

// ─── Wallet ─────────────────────────────────────────────────
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lockedBalance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  currency: string;
}

// ─── Transactions ───────────────────────────────────────────
export type TransactionType =
  | 'DEPOSIT' | 'WITHDRAWAL' | 'SEND' | 'RECEIVE'
  | 'BILL_PAYMENT' | 'AIRTIME_PURCHASE'
  | 'GAME_BET' | 'GAME_WIN'
  | 'SIGNAL_SUBSCRIPTION' | 'REFERRAL_BONUS' | 'COMMISSION';

export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REVERSED';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  description?: string;
  reference: string;
  externalRef?: string;
  provider?: string;
  metadata?: Record<string, unknown>;
  relatedUserId?: string;
  completedAt?: string;
  createdAt: string;
}

// ─── KYC ────────────────────────────────────────────────────
export interface KycRecord {
  id: string;
  userId: string;
  docType: 'NATIONAL_ID' | 'PASSPORT' | 'DRIVING_LICENSE';
  docNumber: string;
  firstName: string;
  lastName: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  verifiedAt?: string;
}

// ─── Games ──────────────────────────────────────────────────
export type GameType = 'AVIATOR' | 'CRASH' | 'DICE' | 'MINES' | 'PLINKO' | 'WHEEL';

export interface GameSession {
  id: string;
  gameType: GameType;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  betAmount: number;
  winAmount?: number;
  multiplier?: number;
  cashOutAt?: number;
  crashPoint?: number;
  createdAt: string;
}

// ─── Signals ────────────────────────────────────────────────
export type SignalDirection = 'BUY' | 'SELL';
export type SignalAssetType = 'FOREX' | 'CRYPTO' | 'COMMODITY';
export type SignalStatus = 'ACTIVE' | 'CLOSED_TP' | 'CLOSED_SL' | 'CANCELLED';

export interface Signal {
  id: string;
  assetType: SignalAssetType;
  pair: string;
  direction: SignalDirection;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number;
  currentPrice?: number;
  status: SignalStatus;
  pnlPercent?: number;
  analysis?: string;
  createdAt: string;
  closedAt?: string;
}

export interface SignalSubscription {
  id: string;
  planName: string;
  priceKes: number;
  expiresAt: string;
  isActive: boolean;
}

// ─── Referrals ──────────────────────────────────────────────
export interface ReferralStats {
  referralCode: string;
  referralLink: string;
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  referrals: Array<{ id: string; phone: string; kycStatus: string; createdAt: string }>;
}

// ─── Bills ──────────────────────────────────────────────────
export type BillType =
  | 'KPLC_PREPAID' | 'KPLC_POSTPAID'
  | 'WATER_NAIROBI' | 'WATER_MOMBASA'
  | 'DSTV' | 'GOTV' | 'STARTIMES' | 'NETFLIX'
  | 'AIRTIME_SAFARICOM' | 'AIRTIME_AIRTEL' | 'AIRTIME_TELKOM';

// ─── Notifications ──────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// ─── API Response ───────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiError {
  success: false;
  message: string;
}
