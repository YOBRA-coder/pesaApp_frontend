// ─── SendMoneyPage.tsx ───────────────────────────────────────
import { useNavigate as useNav } from 'react-router-dom';
export default function SendMoneyPage() {
  const nav = useNav();
  return <div className="space-y-4"><h1 className="page-header">Send Money</h1><p className="text-subtle text-sm">Use the Wallet page → Send tab to send money.</p><button onClick={() => nav('/wallet?tab=send')} className="btn-primary">Go to Send →</button></div>;
}

