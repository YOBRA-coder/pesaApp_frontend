import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layout
import AppLayout from '@/components/layout/AppLayout';

// Auth
import LoginPage from '@/pages/auth/LoginPage';
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage';
import AdminLoginPage from '@/pages/auth/AdminLoginPage';

// App Pages
import DashboardPage from '@/pages/DashboardPage';
import WalletPage from '@/pages/WalletPage';
import SendMoneyPage from '@/pages/SendMoneyPage';
import BillsPage from '@/pages/BillsPage';
import GamesPage from '@/pages/GamesPage';
import AviatorPage from '@/pages/games/AviatorPage';
import MinesPage from '@/pages/games/MinesPage';
import { DicePage, PlinkoPage } from '@/pages/games/DiceAndPlinko';
import InvestPage from '@/pages/invest/InvestPage';
import SportsPage from '@/pages/sports/SportsPage';
import ReferralsPage from '@/pages/ReferralsPage';
import ProfilePage from '@/pages/ProfilePage';
import KycPage from '@/pages/KycPage';
import TransactionsPage from '@/pages/TransactionsPage';
import AdminPage from '@/pages/AdminPage';
import AgentPage from '@/pages/AgentPage';
import LegalPage from '@/pages/legal/LegalPage';

// PWA
import { PWAInstallBanner, useServiceWorker, UpdateBanner } from '@/components/pwa/PWAInstall';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

function RequireGuest({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function AppRoot() {
  const { updateAvailable, applyUpdate } = useServiceWorker();

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* ── User Auth ────────────────────────────────────────── */}
          <Route path="/auth/login"  element={<RequireGuest><LoginPage /></RequireGuest>} />
          <Route path="/auth/verify" element={<RequireGuest><VerifyOtpPage /></RequireGuest>} />

          {/* ── Referral entry point — /register?ref=CODE ─────────── */}
          {/* This route just forwards to login, referral code read from URL */}
          <Route path="/register" element={<RequireGuest><LoginPage /></RequireGuest>} />
          <Route path="/invite"   element={<RequireGuest><LoginPage /></RequireGuest>} />

          {/* ── Staff Auth ───────────────────────────────────────── */}
          <Route path="/auth/admin" element={<AdminLoginPage />} />
          <Route path="/auth/setup" element={<AdminLoginPage />} />

          {/* ── Legal (public) ──────────────────────────────────── */}
          <Route path="/legal"   element={<LegalPage />} />
          <Route path="/terms"   element={<LegalPage />} />
          <Route path="/privacy" element={<LegalPage />} />

          {/* ── Protected App ───────────────────────────────────── */}
          <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
            <Route index element={<DashboardPage />} />
            <Route path="wallet"       element={<WalletPage />} />
            <Route path="send"         element={<SendMoneyPage />} />
            <Route path="bills"        element={<BillsPage />} />

            {/* Games */}
            <Route path="games"          element={<GamesPage />} />
            <Route path="games/aviator"  element={<AviatorPage />} />
            <Route path="games/mines"    element={<MinesPage />} />
            <Route path="games/dice"     element={<DicePage />} />
            <Route path="games/plinko"   element={<PlinkoPage />} />

            {/* Invest & Sports */}
            <Route path="invest"  element={<InvestPage />} />
            <Route path="sports"  element={<SportsPage />} />

            {/* Social & Profile */}
            <Route path="referrals"    element={<ReferralsPage />} />
            <Route path="profile"      element={<ProfilePage />} />
            <Route path="kyc"          element={<KycPage />} />
            <Route path="transactions" element={<TransactionsPage />} />

            {/* Staff */}
            <Route path="admin" element={<AdminPage />} />
            <Route path="agent" element={<AgentPage />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* PWA overlays */}
      <PWAInstallBanner />
      {updateAvailable && <UpdateBanner onUpdate={applyUpdate} />}
    </>
  );
}

export default AppRoot;