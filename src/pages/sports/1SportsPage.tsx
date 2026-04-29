import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { useWallet } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import { Loader2, Trophy, Clock, Tv, ChevronRight, X } from 'lucide-react';
import clsx from 'clsx';

// ── Types ─────────────────────────────────────────────────────
type BetOutcome = '1' | 'X' | '2' | '1X' | '2X' | '12' | 'over' | 'under' | 'btts_yes' | 'btts_no';

interface Odds {
  home: number; draw: number; away: number;
  over25?: number; under25?: number;
  btts_yes?: number; btts_no?: number;
  '1X'?: number; '2X'?: number; '12'?: number;
}

interface Match {
  id: string;
  league: string;
  leagueLogo: string;
  homeTeam: string; homeLogo: string;
  awayTeam: string; awayLogo: string;
  kickoff: string;
  status: 'upcoming' | 'live' | 'finished';
  homeScore?: number; awayScore?: number;
  minute?: number;
  odds: Odds;
  popular?: boolean;
}

interface BetSlip { matchId: string; matchLabel: string; outcome: BetOutcome; outcomeLabel: string; odds: number; }

// ── Static demo matches (replace with real API) ───────────────
const LEAGUES = [
  { id: 'all',  name: 'All', icon: '⚽' },
  { id: 'kpl',  name: 'KPL', icon: '🇰🇪' },
  { id: 'epl',  name: 'Premier League', icon: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { id: 'cl',   name: 'Champions League', icon: '⭐' },
  { id: 'laliga', name: 'La Liga', icon: '🇪🇸' },
  { id: 'serie_a', name: 'Serie A', icon: '🇮🇹' },
  { id: 'bundesliga', name: 'Bundesliga', icon: '🇩🇪' },
  { id: 'afcon', name: 'AFCON', icon: '🌍' },
];

const DEMO_MATCHES: Match[] = [
  // KPL
  { id: 'm1', league: 'kpl', leagueLogo: '🇰🇪', homeTeam: 'Gor Mahia', homeLogo: '🟢', awayTeam: 'AFC Leopards', awayLogo: '🔵', kickoff: new Date(Date.now()+3600000).toISOString(), status: 'upcoming', odds: { home: 1.85, draw: 3.10, away: 4.20, over25: 1.90, under25: 1.80, btts_yes: 2.10, btts_no: 1.65, '1X': 1.25, '2X': 1.90, '12': 1.40 }, popular: true },
  { id: 'm2', league: 'kpl', leagueLogo: '🇰🇪', homeTeam: 'Tusker FC', homeLogo: '🟡', awayTeam: 'KCB FC', awayLogo: '🔴', kickoff: new Date(Date.now()+7200000).toISOString(), status: 'upcoming', odds: { home: 2.20, draw: 3.00, away: 3.30, over25: 2.10, under25: 1.65 } },
  { id: 'm3', league: 'kpl', leagueLogo: '🇰🇪', homeTeam: 'Bandari FC', homeLogo: '⚓', awayTeam: 'Sofapaka', awayLogo: '⚫', kickoff: new Date(Date.now()-1800000).toISOString(), status: 'live', minute: 67, homeScore: 1, awayScore: 1, odds: { home: 2.80, draw: 2.90, away: 2.50 } },
  // EPL
  { id: 'm4', league: 'epl', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeTeam: 'Arsenal', homeLogo: '🔴', awayTeam: 'Chelsea', awayLogo: '🔵', kickoff: new Date(Date.now()+10800000).toISOString(), status: 'upcoming', odds: { home: 2.10, draw: 3.40, away: 3.50, over25: 1.75, under25: 1.95, btts_yes: 1.80, btts_no: 1.85, '1X': 1.35, '2X': 1.75, '12': 1.45 }, popular: true },
  { id: 'm5', league: 'epl', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeTeam: 'Man City', homeLogo: '🩵', awayTeam: 'Liverpool', awayLogo: '🔴', kickoff: new Date(Date.now()+18000000).toISOString(), status: 'upcoming', odds: { home: 1.90, draw: 3.60, away: 3.80, over25: 1.65, under25: 2.10, btts_yes: 1.75, btts_no: 1.90 }, popular: true },
  { id: 'm6', league: 'epl', leagueLogo: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', homeTeam: 'Tottenham', homeLogo: '⚪', awayTeam: 'Newcastle', awayLogo: '⚫', kickoff: new Date(Date.now()+25200000).toISOString(), status: 'upcoming', odds: { home: 2.30, draw: 3.20, away: 2.90 } },
  // Champions League
  { id: 'm7', league: 'cl', leagueLogo: '⭐', homeTeam: 'Real Madrid', homeLogo: '⚪', awayTeam: 'Bayern Munich', awayLogo: '🔴', kickoff: new Date(Date.now()+86400000).toISOString(), status: 'upcoming', odds: { home: 1.95, draw: 3.50, away: 3.80, over25: 1.60, under25: 2.20, btts_yes: 1.65, btts_no: 2.05 }, popular: true },
  { id: 'm8', league: 'cl', leagueLogo: '⭐', homeTeam: 'PSG', homeLogo: '🔵', awayTeam: 'Man City', awayLogo: '🩵', kickoff: new Date(Date.now()+90000000).toISOString(), status: 'upcoming', odds: { home: 2.40, draw: 3.20, away: 2.70, over25: 1.70, under25: 2.00 } },
  // La Liga
  { id: 'm9', league: 'laliga', leagueLogo: '🇪🇸', homeTeam: 'Barcelona', homeLogo: '🔵', awayTeam: 'Atletico Madrid', awayLogo: '🔴', kickoff: new Date(Date.now()+172800000).toISOString(), status: 'upcoming', odds: { home: 1.75, draw: 3.80, away: 4.50 } },
  // Bundesliga
  { id: 'm10', league: 'bundesliga', leagueLogo: '🇩🇪', homeTeam: 'Borussia Dortmund', homeLogo: '🟡', awayTeam: 'Bayer Leverkusen', awayLogo: '🔴', kickoff: new Date(Date.now()+259200000).toISOString(), status: 'upcoming', odds: { home: 2.10, draw: 3.30, away: 3.10, over25: 1.65, under25: 2.10 } },
];

function formatKickoff(iso: string, status: string, minute?: number) {
  if (status === 'live') return { label: `${minute}'`, color: 'text-danger', pulse: true };
  if (status === 'finished') return { label: 'FT', color: 'text-muted', pulse: false };
  const d = new Date(iso);
  const now = new Date();
  const diff = d.getTime() - now.getTime();
  if (diff < 3600000) return { label: `${Math.floor(diff/60000)}m`, color: 'text-gold', pulse: false };
  return { label: d.toLocaleTimeString('en-KE', {hour:'2-digit', minute:'2-digit'}), color: 'text-muted', pulse: false };
}

// ── Bet Slip ──────────────────────────────────────────────────
function BetSlipPanel({ slip, onRemove, onClear, onPlace }: {
  slip: BetSlip[]; onRemove: (id: string, out: BetOutcome) => void;
  onClear: () => void; onPlace: (stake: number) => void;
}) {
  const { data: wallet } = useWallet();
  const [stake, setStake] = useState('100');
  const totalOdds = slip.reduce((acc, b) => acc * b.odds, 1);
  const potentialWin = parseFloat(stake || '0') * totalOdds;
  const [placing, setPlacing] = useState(false);

  const handlePlace = async () => {
    const amt = parseFloat(stake);
    if (!amt || amt < 10) return toast.error('Min stake KES 10');
    if (amt > Number(wallet?.balance || 0)) return toast.error('Insufficient balance');
    setPlacing(true);
    await onPlace(amt);
    setPlacing(false);
  };

  if (slip.length === 0) return (
    <div className="card text-center py-8">
      <div className="text-4xl mb-3">🎯</div>
      <p className="text-muted text-sm font-semibold">Bet Slip Empty</p>
      <p className="text-subtle text-xs mt-1">Click odds to add selections</p>
    </div>
  );

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <p className="section-title text-sm">🎯 Bet Slip ({slip.length})</p>
        <button onClick={onClear} className="text-danger text-xs hover:underline">Clear all</button>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {slip.map(b => (
          <div key={`${b.matchId}-${b.outcome}`} className="flex items-start gap-2 bg-card2 border border-border rounded-xl p-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-white font-semibold truncate">{b.matchLabel}</p>
              <p className="text-[10px] text-green mt-0.5">{b.outcomeLabel}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-display font-bold text-gold text-sm">{b.odds.toFixed(2)}</span>
              <button onClick={() => onRemove(b.matchId, b.outcome)} className="text-subtle hover:text-danger"><X size={12}/></button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border pt-3 space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-subtle">Total odds</span>
          <span className="font-display font-bold text-gold text-base">{totalOdds.toFixed(2)}x</span>
        </div>

        <div>
          <label className="label text-[10px]">Stake (KES)</label>
          <input type="number" value={stake} onChange={e => setStake(e.target.value)} className="input text-sm font-bold" min="10"/>
          <div className="flex gap-1.5 mt-1.5 flex-wrap">
            {[50,100,500,1000].map(a => (
              <button key={a} onClick={() => setStake(String(a))} className="flex-1 py-1 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white">{a}</button>
            ))}
          </div>
        </div>

        <div className="bg-green/5 border border-green/20 rounded-xl p-3 space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-subtle">Potential Win</span>
            <span className="font-display font-bold text-green text-lg">{formatKES(potentialWin)}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-subtle">Profit</span>
            <span className="text-green">{formatKES(potentialWin - parseFloat(stake||'0'))}</span>
          </div>
        </div>

        <button onClick={handlePlace} disabled={placing} className="btn-primary w-full justify-center py-3 font-bold text-sm">
          {placing ? <Loader2 size={16} className="animate-spin"/> : `⚽ Place Bet — ${formatKES(parseFloat(stake||'0'))}`}
        </button>
      </div>
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────
function MatchCard({ match, onAddBet, slipKeys }: { match: Match; onAddBet: (b: BetSlip) => void; slipKeys: Set<string> }) {
  const [expanded, setExpanded] = useState(false);
  const kickoff = formatKickoff(match.kickoff, match.status, match.minute);
  const label = `${match.homeTeam} vs ${match.awayTeam}`;

  const addBet = (outcome: BetOutcome, outcomeLabel: string, odds: number) => {
    if (odds <= 1) return;
    onAddBet({ matchId: match.id, matchLabel: label, outcome, outcomeLabel, odds });
  };

  const OddsBtn = ({ outcome, label: lbl, odds }: { outcome: BetOutcome; label: string; odds?: number }) => {
    if (!odds || odds <= 1) return null;
    const key = `${match.id}-${outcome}`;
    const active = slipKeys.has(key);
    return (
      <button onClick={() => addBet(outcome, lbl, odds)}
        className={clsx('flex flex-col items-center py-2 px-3 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95',
          active ? 'bg-green/15 border-green/40 text-green' : 'bg-card2 border-border text-muted hover:border-border2 hover:text-white')}>
        <span className="text-[9px] opacity-70 mb-0.5">{lbl}</span>
        <span className={clsx('font-display font-black text-sm', active ? 'text-green' : 'text-white')}>{odds.toFixed(2)}</span>
      </button>
    );
  };

  return (
    <div className={clsx('card border hover:border-border2 transition-all', match.popular && 'border-green/15')}>
      {/* Match header */}
      <div className="flex items-start gap-3">
        {match.popular && <span className="shrink-0 text-[9px] font-black bg-green/10 text-green px-1.5 py-0.5 rounded-full mt-0.5">🔥</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-subtle mb-2">
            <span>{match.leagueLogo}</span>
            <span className="uppercase font-semibold tracking-wide">{LEAGUES.find(l=>l.id===match.league)?.name}</span>
            <span>·</span>
            <span className={clsx('flex items-center gap-1 font-semibold', kickoff.color)}>
              {kickoff.pulse && <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"/>}
              {kickoff.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 text-right">
              <span className="text-sm font-bold text-white">{match.homeTeam}</span>
              <span className="ml-1.5 text-base">{match.homeLogo}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {match.status === 'live' || match.status === 'finished' ? (
                <span className="font-display font-black text-xl text-white">{match.homeScore} - {match.awayScore}</span>
              ) : (
                <span className="text-subtle text-xs font-semibold">vs</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <span className="text-base">{match.awayLogo}</span>
              <span className="ml-1.5 text-sm font-bold text-white">{match.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main odds: 1X2 */}
      <div className="flex gap-2 mt-3">
        <OddsBtn outcome="1" label="1 Home" odds={match.odds.home}/>
        <OddsBtn outcome="X" label="X Draw" odds={match.odds.draw}/>
        <OddsBtn outcome="2" label="2 Away" odds={match.odds.away}/>
        <button onClick={() => setExpanded(e => !e)} className="ml-auto text-subtle hover:text-muted">
          <ChevronRight size={16} className={clsx('transition-transform', expanded && 'rotate-90')}/>
        </button>
      </div>

      {/* Expanded markets */}
      {expanded && (
        <div className="mt-3 pt-3 border-t border-border space-y-3 animate-slide-up">
          {/* Double chance */}
          {(match.odds['1X'] || match.odds['2X'] || match.odds['12']) && (
            <div>
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-2 font-semibold">Double Chance</p>
              <div className="flex gap-2">
                <OddsBtn outcome="1X" label="1X" odds={match.odds['1X']}/>
                <OddsBtn outcome="12" label="12" odds={match.odds['12']}/>
                <OddsBtn outcome="2X" label="2X" odds={match.odds['2X']}/>
              </div>
            </div>
          )}

          {/* Over/Under */}
          {match.odds.over25 && (
            <div>
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-2 font-semibold">Total Goals 2.5</p>
              <div className="flex gap-2">
                <OddsBtn outcome="over" label="Over 2.5" odds={match.odds.over25}/>
                <OddsBtn outcome="under" label="Under 2.5" odds={match.odds.under25}/>
              </div>
            </div>
          )}

          {/* BTTS */}
          {match.odds.btts_yes && (
            <div>
              <p className="text-[10px] text-subtle uppercase tracking-wider mb-2 font-semibold">Both Teams to Score</p>
              <div className="flex gap-2">
                <OddsBtn outcome="btts_yes" label="Yes" odds={match.odds.btts_yes}/>
                <OddsBtn outcome="btts_no" label="No" odds={match.odds.btts_no}/>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function SportsPage() {
  const { data: wallet, refetch: refetchWallet } = useWallet();
  const [activeLeague, setActiveLeague] = useState('all');
  const [slip, setSlip] = useState<BetSlip[]>([]);
  const [myBets, setMyBets] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'matches' | 'mybets'>('matches');
  const [placingBet, setPlacingBet] = useState(false);

  const slipKeys = new Set(slip.map(b => `${b.matchId}-${b.outcome}`));
  const filtered = activeLeague === 'all' ? DEMO_MATCHES : DEMO_MATCHES.filter(m => m.league === activeLeague);
  const live = filtered.filter(m => m.status === 'live');
  const upcoming = filtered.filter(m => m.status === 'upcoming');

  const loadMyBets = () => {
    api.get('/sports/my-bets').then(r => setMyBets(r.data?.data || [])).catch(() => {});
  };
  useEffect(loadMyBets, []);

  const addBet = (b: BetSlip) => {
    const key = `${b.matchId}-${b.outcome}`;
    if (slipKeys.has(key)) {
      setSlip(s => s.filter(x => `${x.matchId}-${x.outcome}` !== key));
      toast(`Removed from slip`, { icon: '❌', duration: 1200 });
    } else {
      // Max 8 selections for accumulator
      if (slip.length >= 8) return toast.error('Max 8 selections per bet slip');
      setSlip(s => [...s, b]);
      toast(`Added: ${b.outcomeLabel} @ ${b.odds.toFixed(2)}`, { icon: '✅', duration: 1500 });
    }
  };

  const placeBet = async (stake: number) => {
    try {
      await api.post('/sports/bet', {
        stake,
        selections: slip.map(b => ({ matchId: b.matchId, outcome: b.outcome, odds: b.odds })),
        totalOdds: slip.reduce((a, b) => a * b.odds, 1),
      });
      toast.success(`Bet placed! Good luck 🍀`);
      setSlip([]);
      refetchWallet();
      loadMyBets();
      setActiveSection('mybets');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Bet placement failed');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header flex items-center gap-2">⚽ Sports Betting</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-subtle">Balance:</span>
          <span className="font-display font-bold text-green text-sm">{formatKES(Number(wallet?.balance||0))}</span>
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        <button onClick={() => setActiveSection('matches')} className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all', activeSection==='matches'?'bg-green text-black':'text-muted hover:text-white')}>
          ⚽ Matches
        </button>
        <button onClick={() => setActiveSection('mybets')} className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1', activeSection==='mybets'?'bg-green text-black':'text-muted hover:text-white')}>
          📋 My Bets {myBets.length > 0 && <span className="bg-gold text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">{myBets.length}</span>}
        </button>
      </div>

      {activeSection === 'matches' && (
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Left: Leagues + Matches */}
          <div className="flex-1 space-y-4">
            {/* League filter */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {LEAGUES.map(l => (
                <button key={l.id} onClick={() => setActiveLeague(l.id)}
                  className={clsx('shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap',
                    activeLeague===l.id ? 'bg-green/10 border-green/30 text-green' : 'bg-card border-border text-muted hover:border-border2')}>
                  <span>{l.icon}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>

            {/* Live matches */}
            {live.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"/>
                  <p className="text-xs font-bold text-danger uppercase tracking-wide">Live Now ({live.length})</p>
                </div>
                <div className="space-y-3">
                  {live.map(m => <MatchCard key={m.id} match={m} onAddBet={addBet} slipKeys={slipKeys}/>)}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={13} className="text-muted"/>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide">Upcoming ({upcoming.length})</p>
                </div>
                <div className="space-y-3">
                  {upcoming.map(m => <MatchCard key={m.id} match={m} onAddBet={addBet} slipKeys={slipKeys}/>)}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div className="card text-center py-12">
                <div className="text-4xl mb-3">⚽</div>
                <p className="text-muted">No matches for this league right now</p>
              </div>
            )}
          </div>

          {/* Right: Bet Slip */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="sticky top-4">
              <BetSlipPanel slip={slip} onRemove={(id, out) => setSlip(s => s.filter(b => !(b.matchId===id && b.outcome===out)))} onClear={() => setSlip([])} onPlace={placeBet}/>

              {/* Disclaimer */}
              <p className="text-center text-[10px] text-subtle mt-3 leading-relaxed">
                Betting involves risk. 18+ only.<br/>
                Odds subject to change. Bet responsibly.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'mybets' && (
        <div className="space-y-3">
          {myBets.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-muted">No bets placed yet</p>
              <button onClick={() => setActiveSection('matches')} className="btn-primary mt-4 mx-auto">Place Your First Bet</button>
            </div>
          )}
          {myBets.map((b: any, i: number) => (
            <div key={i} className={clsx('card border', b.status==='won'?'border-green/20 bg-green/3':b.status==='lost'?'border-danger/20 bg-danger/3':'border-border')}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-subtle">{new Date(b.createdAt).toLocaleString()}</span>
                <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-full', b.status==='won'?'bg-green/15 text-green':b.status==='lost'?'bg-danger/15 text-danger':'bg-gold/15 text-gold')}>
                  {b.status==='won'?'✅ WON':b.status==='lost'?'❌ LOST':'⏳ PENDING'}
                </span>
              </div>
              <div className="space-y-1 mb-2">
                {(b.selections||[]).map((s: any, si: number) => (
                  <div key={si} className="flex items-center gap-2 text-xs">
                    <span className="text-muted">{s.matchLabel}</span>
                    <span className="text-green font-semibold">→ {s.outcomeLabel}</span>
                    <span className="text-gold ml-auto">{s.odds.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-2">
                <span className="text-subtle">Stake: <strong className="text-white">{formatKES(b.stake)}</strong></span>
                <span className="text-subtle">Total odds: <strong className="text-gold">{b.totalOdds?.toFixed(2)}x</strong></span>
                {b.status==='won' && <span className="text-green font-bold">+{formatKES(b.winAmount)}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
