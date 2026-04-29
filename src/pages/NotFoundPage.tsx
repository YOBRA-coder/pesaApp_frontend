// ─── NotFoundPage.tsx ────────────────────────────────────────
import { useNavigate as useNav } from 'react-router-dom';
export default function NotFoundPage() {
  const nav = useNav();
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center text-center p-4">
      <div>
        <div className="text-7xl mb-4">🔍</div>
        <h1 className="font-display font-bold text-3xl text-white mb-2">Page Not Found</h1>
        <p className="text-muted mb-6">The page you're looking for doesn't exist.</p>
        <button onClick={() => nav('/')} className="btn-primary mx-auto">Go Home</button>
      </div>
    </div>
  );
}
