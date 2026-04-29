import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import { useWallet } from '@/hooks/useApi';
import { formatKES } from '@/utils/format';
import toast from 'react-hot-toast';
import { Loader2, Clock, X, ChevronDown, ChevronUp, RefreshCw, Trophy } from 'lucide-react';
import clsx from 'clsx';
import axios, { all } from 'axios';

// ── Types ─────────────────────────────────────────────────────
type MarketType =
  | '1X2' | 'DC' | 'BTTS' | 'OVER_UNDER' | 'DNB'
  | 'CORRECT_SCORE' | 'HT_FT' | 'ASIAN_HANDICAP' | 'FIRST_GOAL';

interface OddsMap { [key: string]: number; }

interface Market {
  type: MarketType;
  label: string;
  selections: { key: string; label: string; odds: number }[];
}

interface Match {
  id: string; league: string; leagueLabel: string; leagueFlag: string;
  homeTeam: string; awayTeam: string; homeLogo: string; awayLogo: string;
  kickoff: string; status: 'upcoming'|'live'|'finished';
  homeScore?: number; awayScore?: number; minute?: number;
  markets: Market[];
  popular?: boolean;
}

interface BetSelection {
  matchId: string; matchLabel: string;
  marketType: MarketType; marketLabel: string;
  key: string; selectionLabel: string; odds: number;
}

// ── Leagues ───────────────────────────────────────────────────
const LEAGUES = [
  { id:'all',   flag:'🌍', label:'All' },
  { id:'kpl',   flag:'🇰🇪', label:'KPL' },
  { id:'epl',   flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', label:'Premier League' },
  { id:'cl',    flag:'⭐', label:'Champions League' },
  { id:'laliga',flag:'🇪🇸', label:'La Liga' },
  { id:'seria', flag:'🇮🇹', label:'Serie A' },
  { id:'bund',  flag:'🇩🇪', label:'Bundesliga' },
  { id:'ll1',   flag:'🇫🇷', label:'Ligue 1' },
  { id:'afcon', flag:'🌍', label:'AFCON' },
];

// ── Build all markets for a match ─────────────────────────────
function buildMarkets(home: number, draw: number, away: number, homeTeam: string, awayTeam: string): Market[] {
  const h = (v: number) => v.toFixed(2);
  const over25 = (1/(0.55*(1/home+1/away+1/draw)*0.55)).toFixed(2);
  const under25 = (1/(0.45*(1/home+1/away+1/draw)*0.45)).toFixed(2);

  return [
    {
      type: '1X2', label: 'Match Result',
      selections: [
        { key:'1',  label:`1 ${homeTeam}`, odds: home },
        { key:'X',  label:'X Draw',        odds: draw },
        { key:'2',  label:`2 ${awayTeam}`, odds: away },
      ],
    },
    {
      type: 'DC', label: 'Double Chance',
      selections: [
        { key:'1X', label:'1X Home/Draw', odds: parseFloat(h(1/(1/home+1/draw))) },
        { key:'12', label:'12 Home/Away', odds: parseFloat(h(1/(1/home+1/away))) },
        { key:'X2', label:'X2 Draw/Away', odds: parseFloat(h(1/(1/draw+1/away))) },
      ],
    },
    {
      type: 'BTTS', label: 'Both Teams Score',
      selections: [
        { key:'gg',  label:'GG (Both Score Yes)', odds: parseFloat(h(1.75+Math.random()*.3)) },
        { key:'ng',  label:'NG (Both Score No)',  odds: parseFloat(h(1.90+Math.random()*.3)) },
      ],
    },
    {
      type: 'OVER_UNDER', label: 'Total Goals',
      selections: [
        { key:'over_0.5',  label:'Over 0.5 goals',  odds: parseFloat(h(1.20+Math.random()*.15)) },
        { key:'under_0.5', label:'Under 0.5 goals', odds: parseFloat(h(5.50+Math.random()*.5)) },
        { key:'over_1.5',  label:'Over 1.5 goals',  odds: parseFloat(h(1.45+Math.random()*.2)) },
        { key:'under_1.5', label:'Under 1.5 goals', odds: parseFloat(h(2.60+Math.random()*.3)) },
        { key:'over_2.5',  label:'Over 2.5 goals',  odds: parseFloat(over25) },
        { key:'under_2.5', label:'Under 2.5 goals', odds: parseFloat(under25) },
        { key:'over_3.5',  label:'Over 3.5 goals',  odds: parseFloat(h(2.30+Math.random()*.3)) },
        { key:'under_3.5', label:'Under 3.5 goals', odds: parseFloat(h(1.55+Math.random()*.2)) },
      ],
    },
    {
      type: 'DNB', label: 'Draw No Bet',
      selections: [
        { key:'dnb_1', label:`${homeTeam} DNB`, odds: parseFloat(h(home * 0.85)) },
        { key:'dnb_2', label:`${awayTeam} DNB`, odds: parseFloat(h(away * 0.85)) },
      ],
    },
    {
      type: 'FIRST_GOAL', label: 'First Goal Scorer (team)',
      selections: [
        { key:'fg_home',  label:`${homeTeam} scores first`, odds: parseFloat(h(1/(1/home+1/draw)*1.15)) },
        { key:'fg_away',  label:`${awayTeam} scores first`, odds: parseFloat(h(1/(1/away+1/draw)*1.15)) },
        { key:'fg_no',    label:'No Goal',                  odds: parseFloat(h(7+Math.random()*3)) },
      ],
    },
    {
      type: 'HT_FT', label: 'Half-Time / Full-Time',
      selections: [
        { key:'ht1_ft1', label:'Home / Home', odds: parseFloat(h(home*1.8)) },
        { key:'ht1_ftX', label:'Home / Draw', odds: parseFloat(h(12+Math.random()*5)) },
        { key:'ht1_ft2', label:'Home / Away', odds: parseFloat(h(20+Math.random()*8)) },
        { key:'htX_ft1', label:'Draw / Home', odds: parseFloat(h(3.5+Math.random())) },
        { key:'htX_ftX', label:'Draw / Draw', odds: parseFloat(h(5+Math.random()*2)) },
        { key:'htX_ft2', label:'Draw / Away', odds: parseFloat(h(4+Math.random()*2)) },
        { key:'ht2_ft1', label:'Away / Home', odds: parseFloat(h(22+Math.random()*8)) },
        { key:'ht2_ftX', label:'Away / Draw', odds: parseFloat(h(14+Math.random()*5)) },
        { key:'ht2_ft2', label:'Away / Away', odds: parseFloat(h(away*1.9)) },
      ],
    },
    {
      type: 'CORRECT_SCORE', label: 'Correct Score',
      selections: [
        { key:'cs_1_0', label:'1-0',  odds: parseFloat(h(5.5+Math.random()*2)) },
        { key:'cs_2_0', label:'2-0',  odds: parseFloat(h(8+Math.random()*3)) },
        { key:'cs_2_1', label:'2-1',  odds: parseFloat(h(7+Math.random()*3)) },
        { key:'cs_1_1', label:'1-1',  odds: parseFloat(h(5+Math.random()*2)) },
        { key:'cs_0_0', label:'0-0',  odds: parseFloat(h(9+Math.random()*3)) },
        { key:'cs_0_1', label:'0-1',  odds: parseFloat(h(9+Math.random()*4)) },
        { key:'cs_0_2', label:'0-2',  odds: parseFloat(h(12+Math.random()*4)) },
        { key:'cs_1_2', label:'1-2',  odds: parseFloat(h(10+Math.random()*4)) },
        { key:'cs_other',label:'Other',odds: parseFloat(h(4+Math.random()*2)) },
      ],
    },
  ];
}

// ── Build demo matches ─────────────────────────────────────────
const DEMO_MATCHES: Match[] = [
  { id:'m1',  league:'kpl',    leagueFlag:'🇰🇪', leagueLabel:'Kenyan Premier League', homeTeam:'Gor Mahia', awayTeam:'AFC Leopards', homeLogo:'🟢', awayLogo:'🔵', kickoff:new Date(Date.now()+3600000).toISOString(),   status:'upcoming', markets: buildMarkets(1.85,3.10,4.20,'Gor Mahia','AFC Leopards'), popular:true },
  { id:'m2',  league:'kpl',    leagueFlag:'🇰🇪', leagueLabel:'Kenyan Premier League', homeTeam:'Tusker FC', awayTeam:'KCB FC', homeLogo:'🟡', awayLogo:'🔴', kickoff:new Date(Date.now()-1800000).toISOString(), status:'live', minute:62, homeScore:1, awayScore:0, markets: buildMarkets(1.75,3.30,4.50,'Tusker FC','KCB FC') },
  { id:'m3',  league:'kpl',    leagueFlag:'🇰🇪', leagueLabel:'Kenyan Premier League', homeTeam:'Bandari FC', awayTeam:'Sofapaka', homeLogo:'⚓', awayLogo:'⚫', kickoff:new Date(Date.now()+7200000).toISOString(), status:'upcoming', markets: buildMarkets(2.20,3.00,3.10,'Bandari','Sofapaka') },
  { id:'m4',  league:'epl',    leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagueLabel:'Premier League', homeTeam:'Arsenal', awayTeam:'Chelsea', homeLogo:'🔴', awayLogo:'🔵', kickoff:new Date(Date.now()+10800000).toISOString(), status:'upcoming', markets: buildMarkets(2.10,3.40,3.50,'Arsenal','Chelsea'), popular:true },
  { id:'m5',  league:'epl',    leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagueLabel:'Premier League', homeTeam:'Man City', awayTeam:'Liverpool', homeLogo:'🩵', awayLogo:'🔴', kickoff:new Date(Date.now()+18000000).toISOString(), status:'upcoming', markets: buildMarkets(1.90,3.60,3.80,'Man City','Liverpool'), popular:true },
  { id:'m6',  league:'epl',    leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿', leagueLabel:'Premier League', homeTeam:'Tottenham', awayTeam:'Newcastle', homeLogo:'⚪', awayLogo:'⚫', kickoff:new Date(Date.now()+25200000).toISOString(), status:'upcoming', markets: buildMarkets(2.30,3.20,2.90,'Tottenham','Newcastle') },
  { id:'m7',  league:'cl',     leagueFlag:'⭐',  leagueLabel:'Champions League', homeTeam:'Real Madrid', awayTeam:'Bayern Munich', homeLogo:'⚪', awayLogo:'🔴', kickoff:new Date(Date.now()+86400000).toISOString(), status:'upcoming', markets: buildMarkets(1.95,3.50,3.80,'Real Madrid','Bayern'), popular:true },
  { id:'m8',  league:'cl',     leagueFlag:'⭐',  leagueLabel:'Champions League', homeTeam:'PSG', awayTeam:'Man City', homeLogo:'🔵', awayLogo:'🩵', kickoff:new Date(Date.now()+90000000).toISOString(), status:'upcoming', markets: buildMarkets(2.40,3.20,2.70,'PSG','Man City') },
  { id:'m9',  league:'laliga', leagueFlag:'🇪🇸', leagueLabel:'La Liga', homeTeam:'Barcelona', awayTeam:'Atletico', homeLogo:'🔵', awayLogo:'🔴', kickoff:new Date(Date.now()+172800000).toISOString(), status:'upcoming', markets: buildMarkets(1.75,3.80,4.50,'Barcelona','Atletico') },
  { id:'m10', league:'bund',   leagueFlag:'🇩🇪', leagueLabel:'Bundesliga', homeTeam:'Dortmund', awayTeam:'Leverkusen', homeLogo:'🟡', awayLogo:'🔴', kickoff:new Date(Date.now()+259200000).toISOString(), status:'upcoming', markets: buildMarkets(2.10,3.30,3.10,'Dortmund','Leverkusen') },
];

// ── Bet Slip ──────────────────────────────────────────────────
function BetSlip({ slip, onRemove, onClear, onPlace }: {
  slip: BetSelection[]; onRemove: (matchId:string,marketType:MarketType)=>void;
  onClear: ()=>void; onPlace: (stake:number)=>Promise<void>;
}) {
  const { data: wallet } = useWallet();
  const [stake, setStake] = useState('100');
  const [placing, setPlacing] = useState(false);
  const totalOdds = slip.reduce((a,b) => a*b.odds, 1);
  const potWin = parseFloat(stake||'0') * totalOdds;

  const handlePlace = async () => {
    const amt = parseFloat(stake);
    if (!amt || amt < 10) return toast.error('Min stake KES 10');
    if (amt > Number(wallet?.balance||0)) return toast.error('Insufficient balance');
    setPlacing(true);
    await onPlace(amt);
    setPlacing(false);
  };

  return (
    <div className="card space-y-3 sticky top-4">
      <div className="flex items-center justify-between">
        <p className="section-title text-sm">🎯 Bet Slip</p>
        <div className="flex items-center gap-2">
          <span className={clsx('text-[10px] font-bold px-2 py-0.5 rounded-full', slip.length>0?'bg-green/15 text-green':'bg-white/5 text-subtle')}>{slip.length} sel.</span>
          {slip.length>0 && <button onClick={onClear} className="text-danger text-[10px] hover:underline">Clear</button>}
        </div>
      </div>

      {slip.length===0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">⚽</div>
          <p className="text-subtle text-xs">Click any odds to add to slip</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {slip.map(b => (
              <div key={`${b.matchId}-${b.marketType}`} className="bg-card2 border border-border rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-white font-semibold truncate">{b.matchLabel}</p>
                    <p className="text-[10px] text-subtle mt-0.5">{b.marketLabel}</p>
                    <p className="text-[11px] text-green font-bold mt-0.5">{b.selectionLabel}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-display font-black text-gold text-base">{b.odds}</span>
                    <button onClick={()=>onRemove(b.matchId,b.marketType)} className="text-subtle hover:text-danger"><X size={12}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-subtle">Total odds</span>
              <span className="font-display font-black text-gold text-xl">{totalOdds.toFixed(2)}x</span>
            </div>

            <div>
              <label className="label text-[10px]">Stake (KES)</label>
              <input type="number" value={stake} onChange={e=>setStake(e.target.value)} className="input text-sm font-bold" min="10"/>
              <div className="grid grid-cols-4 gap-1 mt-1.5">
                {[50,100,500,1000].map(a=>(
                  <button key={a} onClick={()=>setStake(String(a))} className="py-1 text-[10px] font-bold bg-card2 border border-border rounded-lg text-muted hover:text-white">{a}</button>
                ))}
              </div>
            </div>

            <div className="bg-green/5 border border-green/15 rounded-xl p-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-subtle">Potential Win</span>
                <span className="font-display font-black text-green text-lg">{formatKES(potWin)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-subtle">Profit</span>
                <span className="text-green">{formatKES(potWin - parseFloat(stake||'0'))}</span>
              </div>
            </div>

            <button onClick={handlePlace} disabled={placing} className="btn-primary w-full justify-center py-3 font-bold">
              {placing ? <Loader2 size={16} className="animate-spin"/> : `⚽ Place Bet — ${formatKES(parseFloat(stake||'0'))}`}
            </button>
          </div>
        </>
      )}

      <div className="text-center text-[10px] text-subtle mt-2 leading-relaxed">
        Odds subject to change · 18+ · Bet responsibly
      </div>
    </div>
  );
}

// ── Market section ────────────────────────────────────────────
function MarketSection({ market, match, slip, onToggle }: {
  market: Market; match: Match;
  slip: BetSelection[];
  onToggle: (b: BetSelection) => void;
}) {
  const [open, setOpen] = useState(market.type === '1X2');

  return (
    <div className="border-t border-border pt-3">
      <button onClick={() => setOpen(o => !o)} className="flex items-center justify-between w-full text-left mb-2">
        <span className="text-[11px] text-muted uppercase tracking-wider font-bold">{market.label}</span>
        {open ? <ChevronUp size={13} className="text-subtle"/> : <ChevronDown size={13} className="text-subtle"/>}
      </button>
      {open && (
        <div className={clsx(
          'grid gap-2',
          market.type === 'OVER_UNDER' ? 'grid-cols-2' :
          market.type === 'CORRECT_SCORE' ? 'grid-cols-3' :
          market.type === 'HT_FT' ? 'grid-cols-3' :
          'grid-cols-3'
        )}>
          {market.selections.map(sel => {
            const active = slip.some(b => b.matchId === match.id && b.marketType === market.type && b.key === sel.key);
            return (
              <button key={sel.key}
                onClick={() => onToggle({
                  matchId: match.id,
                  matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
                  marketType: market.type,
                  marketLabel: market.label,
                  key: sel.key,
                  selectionLabel: sel.label,
                  odds: sel.odds,
                })}
                className={clsx(
                  'flex flex-col items-center py-2 px-2 rounded-xl border text-center transition-all hover:scale-[1.03] active:scale-95',
                  active ? 'bg-green/15 border-green/40 text-green' : 'bg-card2 border-border text-muted hover:border-border2 hover:text-white'
                )}>
                <span className="text-[9px] opacity-70 mb-0.5 truncate w-full text-center">{sel.label}</span>
                <span className={clsx('font-display font-black text-sm', active ? 'text-green' : 'text-white')}>{sel.odds.toFixed(2)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Match Card ────────────────────────────────────────────────
function MatchCard({ match, slip, onToggle }: { match: any; slip:BetSelection[]; onToggle:(b:BetSelection)=>void }) {
  const [expanded, setExpanded] = useState(false);
  const inSlip = slip.some(b => b.matchId === match.id);

  const kickoffLabel = () => {
    if (match.status === 'live') return { text:`${match.minute}'`, color:'text-danger', pulse:true };
    if (match.status === 'finished') return { text:'FT', color:'text-subtle', pulse:false };
    const diff = new Date(match.kickoff).getTime() - Date.now();
    if (diff < 3600000) return { text:`${Math.floor(diff/60000)}m`, color:'text-gold', pulse:false };
    return { text:new Date(match.kickoff).toLocaleTimeString('en-KE',{hour:'2-digit',minute:'2-digit'}), color:'text-subtle', pulse:false };
  };
  const kl = kickoffLabel();

 // const main = match.markets.find(m => m.type === '1X2');
 const main = [match.oddsHome, match.oddsDraw, match.oddsAway].every(o => o) ? {
    type: '1X2',
    label: 'Match Result',
    selections: [
      { key:'1', label:`1 ${match.homeTeam}`, odds: match.oddsHome! },
      { key:'X', label:'X Draw', odds: match.oddsDraw! },
      { key:'2', label:`2 ${match.awayTeam}`, odds: match.oddsAway! },
    ],
  } : null;

  return (
    <div className={clsx('card border transition-all', match.popular && 'border-green/15', inSlip && 'border-green/25 bg-green/2')}>
      {/* Match header */}
      <div className="flex items-start gap-2 mb-3">
        {match.popular && <span className="text-[9px] bg-danger/80 text-white font-black px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">🔥</span>}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-[10px] text-subtle mb-2 flex-wrap">
            <span>{match.leagueFlag}</span>
            <span className="uppercase font-semibold tracking-wide">{match.leagueLabel}</span>
            <span>·</span>
            <span className={clsx('flex items-center gap-1', kl.color)}>
              {kl.pulse && <span className="w-1.5 h-1.5 rounded-full bg-danger animate-pulse"/>}
              {kl.text}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 text-right">
              <span className="text-sm font-bold text-white">{match.homeTeam}</span>
              <span className="ml-1">{match.homeLogo}</span>
            </div>
            <div className="shrink-0 text-center px-2">
              {match.status === 'live' || match.status === 'finished' ? (
                <span className="font-display font-black text-xl text-white">{match.homeScore} - {match.awayScore}</span>
              ) : (
                <span className="text-subtle text-xs">vs</span>
              )}
            </div>
            <div className="flex-1 text-left">
              <span>{match.awayLogo}</span>
              <span className="ml-1 text-sm font-bold text-white">{match.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick 1X2 odds */}
      {main && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {main.selections.map(sel => {
            const active = slip.some(b => b.matchId === match.id && b.marketType === main.type && b.key === sel.key);
            return (
              <button key={sel.key}
                onClick={() => onToggle({
                  matchId: match.id,
                  matchLabel: `${match.homeTeam} vs ${match.awayTeam}`,
                  marketType: main.type as MarketType,
                  marketLabel: main.label,
                  key: sel.key,
                  selectionLabel: sel.label,
                  odds: sel.odds,
                })}
                className={clsx(
                  'flex flex-col items-center py-2 px-2 rounded-xl border text-center transition-all hover:scale-[1.03] active:scale-95',
                  active ? 'bg-green/15 border-green/40 text-green' : 'bg-card2 border-border text-muted hover:border-border2 hover:text-white'
                )}>
                <span className="text-[9px] opacity-70 mb-0.5 truncate w-full text-center">{sel.label}</span>
                <span className={clsx('font-display font-black text-sm', active ? 'text-green' : 'text-white')}>{sel.odds}</span>
              </button>
            );
          })}
        </div>
      )}  

    {/* All Markets */}
    { }
    

      
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function SportsPage() {
  const { data: wallet, refetch } = useWallet();
  const [league, setLeague] = useState('all');
  const [slip, setSlip] = useState<BetSelection[]>([]);
  const [section, setSection] = useState<'matches'|'mybets'>('matches');
  const [myBets, setMyBets] = useState<any[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const oddsTimer = useRef<ReturnType<typeof setInterval>>();

  // Load from API or use demo
  useEffect(() => {
    setLoadingMatches(true);
    api.get('/sports/matches').then(r => {
      if (r.data?.data?.length > 0) setMatches(r.data.data);
    }).catch(() => {}).finally(() => setLoadingMatches(false));
    loadMyBets();

    // Simulate live odds updates every 30s


    return () => clearInterval(oddsTimer.current);
  }, []);

  const loadMyBets = () => {
    api.get('/sports/my-bets').then(r => setMyBets(r.data?.data || [])).catch(() => {});
  };

  // ── Toggle bet in slip (update instead of duplicate) ──────
  const toggleBet = useCallback((b: BetSelection) => {
    setSlip(prev => {
      // Check if same match + same market already exists
      const existingIdx = prev.findIndex(x => x.matchId === b.matchId && x.marketType === b.marketType);

      if (existingIdx >= 0) {
        const existing = prev[existingIdx];
        if (existing.key === b.key) {
          // Same selection — remove it
          toast(`Removed: ${b.selectionLabel}`, { icon:'❌', duration:1200 });
          return prev.filter((_, i) => i !== existingIdx);
        } else {
          // Different selection on same market — replace it (the fix!)
          toast(`Updated to: ${b.selectionLabel} @ ${b.odds.toFixed(2)}`, { icon:'🔄', duration:1500 });
          const copy = [...prev];
          copy[existingIdx] = b;
          return copy;
        }
      }

      // New selection
      if (prev.length >= 10) return toast.error('Max 10 selections') as any || prev;
      toast(`Added: ${b.selectionLabel} @ ${b.odds}`, { icon:'✅', duration:1200 });
      return [...prev, b];
    });
  }, []);

  const removeBet = (matchId: string, marketType: MarketType) => {
    setSlip(prev => prev.filter(b => !(b.matchId===matchId && b.marketType===marketType)));
  };

  const placeBet = async (stake: number) => {
    const totalOdds = slip.reduce((a,b) => a*b.odds, 1);
    try {
      await api.post('/sports/bet', {
        stake,
        selections: slip.map(b => ({ matchId:b.matchId, outcome:b.key, odds:b.odds, outcomeLabel:b.selectionLabel, matchLabel:b.matchLabel })),
        totalOdds,
      });
      toast.success('Bet placed! Good luck 🍀');
      setSlip([]);
      refetch();
      loadMyBets();
      setSection('mybets');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to place bet');
    }
  };

  const filtered = league === 'all' ? matches : matches.filter(m => m.league === league);
  const live     = filtered.filter(m => m.status === 'live');
  const upcoming = filtered.filter(m => m.status === 'upcoming');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="page-header flex items-center gap-2"><Trophy size={20} className="text-green"/> Sports Betting</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted">Bal: <span className="text-green font-bold">{formatKES(Number(wallet?.balance||0))}</span></span>
          <button onClick={() => { setLoadingMatches(true); setTimeout(()=>setLoadingMatches(false),800); }} className="text-subtle hover:text-muted">
            <RefreshCw size={14} className={loadingMatches?'animate-spin':''}/>
          </button>
        </div>
      </div>

      {/* Section toggle */}
      <div className="flex gap-1 bg-card border border-border rounded-xl p-1">
        <button onClick={()=>setSection('matches')} className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all', section==='matches'?'bg-green text-black':'text-muted hover:text-white')}>
          ⚽ Matches
        </button>
        <button onClick={()=>setSection('mybets')} className={clsx('flex-1 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1', section==='mybets'?'bg-green text-black':'text-muted hover:text-white')}>
          📋 My Bets
          {myBets.filter(b=>b.status==='PENDING').length > 0 && <span className="bg-gold text-black text-[9px] font-black px-1.5 py-0.5 rounded-full">{myBets.filter(b=>b.status==='PENDING').length}</span>}
        </button>
      </div>

      {section === 'matches' && (
        <div className="flex gap-4 flex-col lg:flex-row">
          {/* Left: Leagues + Matches */}
          <div className="flex-1 space-y-4 min-w-0">
            {/* League tabs */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {LEAGUES.map(l => (
                <button key={l.id} onClick={()=>setLeague(l.id)}
                  className={clsx('shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all whitespace-nowrap',
                    league===l.id?'bg-green/10 border-green/30 text-green':'bg-card border-border text-muted hover:border-border2')}>
                  <span>{l.flag}</span><span>{l.label}</span>
                </button>
              ))}
            </div>

            {/* Live */}
            {live.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-danger animate-pulse"/>
                  <p className="text-xs font-bold text-danger uppercase tracking-wide">Live Now ({live.length})</p>
                </div>
                <div className="space-y-3">
                  {live.map(m => <MatchCard key={m.id} match={m} slip={slip} onToggle={toggleBet}/>)}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={12} className="text-muted"/>
                  <p className="text-xs font-bold text-muted uppercase tracking-wide">Upcoming ({upcoming.length})</p>
                </div>
                <div className="space-y-3">
                  {upcoming.map(m => <MatchCard key={m.id} match={m} slip={slip} onToggle={toggleBet}/>)}
                </div>
              </div>
            )}

            {filtered.length === 0 && !loadingMatches && (
              <div className="card text-center py-12"><div className="text-4xl mb-3">⚽</div><p className="text-muted">No matches for this league</p></div>
            )}
          </div>

          {/* Right: Bet Slip */}
          <div className="w-full lg:w-72 shrink-0">
            <BetSlip slip={slip} onRemove={removeBet} onClear={()=>setSlip([])} onPlace={placeBet}/>
          </div>
        </div>
      )}

      {section === 'mybets' && (
        <div className="space-y-3 max-w-2xl">
          {myBets.length === 0 && (
            <div className="card text-center py-12">
              <div className="text-4xl mb-3">📋</div>
              <p className="text-muted">No bets yet</p>
              <button onClick={()=>setSection('matches')} className="btn-primary mt-4 mx-auto text-sm">Place First Bet</button>
            </div>
          )}
          {myBets.map((b:any) => (
            <div key={b.id} className={clsx('card border', b.status==='WON'?'border-green/20':b.status==='LOST'?'border-danger/20':'border-border')}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-subtle">{new Date(b.createdAt).toLocaleString()}</span>
                <span className={clsx('text-[10px] font-black px-2.5 py-0.5 rounded-full', b.status==='WON'?'bg-green/15 text-green':b.status==='LOST'?'bg-danger/15 text-danger':'bg-gold/15 text-gold')}>
                  {b.status==='WON'?'✅ WON':b.status==='LOST'?'❌ LOST':'⏳ PENDING'}
                </span>
              </div>
              <div className="space-y-1 mb-3">
                {(b.selections||[]).map((s:any,i:number) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-muted truncate">{s.matchLabel}</span>
                    <span className="text-green font-semibold shrink-0">→ {s.outcomeLabel}</span>
                    <span className="text-gold ml-auto shrink-0">{Number(s.odds).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-2 flex-wrap gap-2">
                <span className="text-subtle">Stake: <strong className="text-white">{formatKES(Number(b.stake))}</strong></span>
                <span className="text-subtle">Odds: <strong className="text-gold">{Number(b.totalOdds).toFixed(2)}x</strong></span>
                <span className="text-subtle">Potential: <strong className="text-green">{formatKES(Number(b.potentialWin))}</strong></span>
                {b.status==='WON' && <span className="font-bold text-green">Won: {formatKES(Number(b.winAmount))}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
