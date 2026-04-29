import { useState, useCallback, useEffect } from 'react';
import { useWallet } from '@/hooks/useApi';
import { api } from '@/services/api';
import { formatKES } from '@/utils/format';
import { calcMinesMultiplier } from '@/utils/gameUtils';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const GRID_SIZE = 25;
type CellState = 'hidden' | 'gem' | 'mine';

export default function MinesPage() {
  const { data: wallet, refetch: refetchWallet } = useWallet();
  const [betAmount, setBetAmount] = useState('100');
  const [minesCount, setMinesCount] = useState(5);
  const [cells, setCells] = useState<CellState[]>(Array(GRID_SIZE).fill('hidden'));
  const [phase, setPhase] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [gameId, setGameId] = useState<string | null>(null);
  const [gemsFound, setGemsFound] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [loading, setLoading] = useState(false);
  const [revealLoading, setRevealLoading] = useState<number | null>(null);
  const [serverSeedHash, setServerSeedHash] = useState('');
  const [revealedSeed, setRevealedSeed] = useState('');
  const [minePositions, setMinePositions] = useState<number[]>([]);

  // Resume active game on load
  useEffect(() => {
    api.get('/games/mines/active').then(res => {
      const game = res.data?.data;
      if (game) {
        setGameId(game.gameId);
        setBetAmount(String(game.betAmount));
        setMinesCount(game.minesCount);
        setCells(game.gridState as CellState[]);
        setGemsFound(game.gemsFound);
        setMultiplier(game.multiplier);
        setServerSeedHash(game.serverSeedHash);
        setPhase('playing');
        toast('Resumed active game!', { icon: '🎮' });
      }
    }).catch(() => {});
  }, []);

  const startGame = async () => {
    const amt = parseFloat(betAmount);
    if (!amt || amt < 10) return toast.error('Min bet KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    setLoading(true);
    try {
      const res = await api.post('/games/mines/start', { betAmount: amt, minesCount });
      const data = res.data.data;
      setGameId(data.gameId);
      setServerSeedHash(data.serverSeedHash);
      setCells(Array(GRID_SIZE).fill('hidden'));
      setGemsFound(0);
      setMultiplier(1);
      setMinePositions([]);
      setRevealedSeed('');
      setPhase('playing');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to start');
    } finally { setLoading(false); }
  };

  const revealCell = useCallback(async (idx: number) => {
    if (phase !== 'playing' || cells[idx] !== 'hidden' || !gameId || revealLoading !== null) return;
    setRevealLoading(idx);
    try {
      const res = await api.post('/games/mines/reveal', { gameId, cellIndex: idx });
      const data = res.data.data;

      setCells(data.gridState as CellState[]);

      if (data.hit === 'mine') {
        setMinePositions(data.minePositions || []);
        setRevealedSeed(data.serverSeed || '');
        setPhase('lost');
        refetchWallet();
        toast.error('💥 BOOM! Hit a mine!');
      } else {
        setGemsFound(data.gemsFound);
        setMultiplier(data.multiplier);
        if (data.safeLeft === 0) {
          // Auto-cashout: all safe cells found
          setMinePositions(data.minePositions || []);
          setRevealedSeed(data.serverSeed || '');
          setPhase('won');
          refetchWallet();
          toast.success(`🏆 All gems found! Won ${formatKES(data.currentWin)}`);
        }
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error');
    } finally { setRevealLoading(null); }
  }, [phase, cells, gameId, revealLoading, refetchWallet]);

  const cashOut = async () => {
    if (!gameId || phase !== 'playing' || gemsFound === 0) return;
    setLoading(true);
    try {
      const res = await api.post('/games/mines/cashout', { gameId });
      const data = res.data.data;
      setMinePositions(data.minePositions || []);
      setRevealedSeed(data.serverSeed || '');
      setPhase('won');
      refetchWallet();
      toast.success(`💰 Cashed out! +${formatKES(data.winAmount)} @ ${data.multiplier.toFixed(4)}x`);
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Cashout failed');
    } finally { setLoading(false); }
  };

  const cellContent = (state: CellState, idx: number) => {
    if (state === 'gem') return '💎';
    if (state === 'mine') return '💣';
    if ((phase === 'won' || phase === 'lost') && minePositions.includes(idx)) return '💣';
    return '';
  };

  const cellClass = (state: CellState, idx: number) => {
    const base = 'aspect-square rounded-xl flex items-center justify-center text-lg cursor-pointer transition-all duration-200 select-none border font-bold';
    if (state === 'gem') return clsx(base, 'bg-green/20 border-green/40 scale-105');
    if (state === 'mine' || ((phase === 'won' || phase === 'lost') && minePositions.includes(idx))) {
      return clsx(base, 'bg-danger/20 border-danger/40');
    }
    if (phase === 'playing') return clsx(base, 'bg-card2 border-border hover:bg-white/10 hover:border-border2 hover:scale-105 active:scale-95');
    return clsx(base, 'bg-card2/50 border-border/50 cursor-default');
  };

  const currentWin = parseFloat(betAmount || '0') * multiplier;
  const nextMult = calcMinesMultiplier(minesCount, gemsFound + 1);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl">💣</span>
        <div>
          <h1 className="page-header">Mines</h1>
          <p className="text-xs text-subtle">Find gems, avoid mines. Cash out anytime to keep winnings.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Controls */}
        <div className="w-full md:w-56 space-y-3 shrink-0">
          <div className="card space-y-3">
            <div>
              <label className="label text-[10px]">Bet (KES)</label>
              <input type="number" value={betAmount} onChange={e => setBetAmount(e.target.value)}
                className="input text-sm" disabled={phase === 'playing'} />
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {[50,100,500,1000].map(a => (
                  <button key={a} onClick={() => setBetAmount(String(a))} disabled={phase === 'playing'}
                    className="px-2 py-1 text-[10px] bg-card2 border border-border rounded-lg text-muted hover:text-white disabled:opacity-40">
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label text-[10px]">Mines: {minesCount}</label>
              <input type="range" min="1" max="24" value={minesCount}
                onChange={e => setMinesCount(Number(e.target.value))}
                className="w-full accent-green" disabled={phase === 'playing'} />
              <div className="flex justify-between text-[10px] text-subtle mt-0.5">
                <span>1 safe</span><span>24 risky</span>
              </div>
            </div>

            {/* Live stats */}
            {phase === 'playing' && (
              <div className="bg-card2 rounded-xl p-3 space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-subtle">Current mult</span>
                  <span className="text-gold font-bold">{multiplier.toFixed(4)}x</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-subtle">Win if cash out</span>
                  <span className="text-green font-bold">{formatKES(currentWin)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-subtle">Next gem</span>
                  <span className="text-blue">{nextMult.toFixed(4)}x</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-subtle">Gems found</span>
                  <span className="text-white">{gemsFound}</span>
                </div>
              </div>
            )}

            {/* Action button */}
            {phase === 'idle' || phase === 'won' || phase === 'lost' ? (
              <button onClick={startGame} disabled={loading}
                className="btn-primary w-full justify-center py-3 text-sm font-bold">
                {loading ? <Loader2 size={16} className="animate-spin" /> : phase === 'idle' ? '🎮 Start Game' : '🔄 Play Again'}
              </button>
            ) : (
              <button onClick={cashOut} disabled={loading || gemsFound === 0}
                className="w-full py-3 rounded-xl font-bold text-black text-sm transition-all disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg,#00e57a,#00c46a)', boxShadow: '0 0 20px rgba(0,229,122,0.3)' }}>
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : `💰 Cash Out ${multiplier.toFixed(4)}x`}
              </button>
            )}

            {/* Result */}
            {(phase === 'won' || phase === 'lost') && (
              <div className={clsx('text-center py-2.5 rounded-xl text-sm font-bold',
                phase === 'won' ? 'bg-green/10 text-green border border-green/20' : 'bg-danger/10 text-danger border border-danger/20')}>
                {phase === 'won' ? `🏆 Won ${formatKES(currentWin)}` : '💥 Hit a mine!'}
              </div>
            )}

            {/* Provably fair reveal */}
            {revealedSeed && (
              <div className="bg-card2 border border-border rounded-xl p-2 text-[9px] break-all text-subtle space-y-1">
                <p className="text-white font-semibold text-[10px]">🔐 Provably Fair</p>
                <p>Server seed: <span className="text-green">{revealedSeed.slice(0,20)}...</span></p>
                <p>Hash: <span className="text-blue">{serverSeedHash.slice(0,20)}...</span></p>
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 card p-3">
          <div className="grid grid-cols-5 gap-2">
            {cells.map((state, idx) => (
              <div key={idx}
                className={cellClass(state, idx)}
                onClick={() => revealCell(idx)}>
                {revealLoading === idx
                  ? <Loader2 size={14} className="animate-spin text-subtle" />
                  : cellContent(state, idx)}
              </div>
            ))}
          </div>
          <p className="text-center text-[10px] text-subtle mt-3">
            {phase === 'playing' && `${minesCount} mines hidden in ${GRID_SIZE} cells`}
            {phase === 'idle' && 'Start a game to reveal the grid'}
            {(phase === 'won' || phase === 'lost') && 'Game over. Mine positions revealed.'}
          </p>
        </div>
      </div>
    </div>
  );
}
