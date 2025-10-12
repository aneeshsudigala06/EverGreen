import React, { useState, useEffect, useMemo } from 'react'
import './App.css'
// import bundled CSV as raw string (Vite supports ?raw)
import bundledCsv from './assets/transactions.csv?raw';

// --- SVG ICONS ---
const Icon = ({ className, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    style={{ overflow: 'visible' }}
    className={className}
  >
    {children}
  </svg>
);
const CheckCircle = ({className}) => <Icon className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></Icon>;
const XCircle = ({className}) => <Icon className={className}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></Icon>;
const MinusCircle = ({className}) => <Icon className={className}><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12"/></Icon>;
const TrendingUp = ({className}) => <Icon className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Icon>;
const Leaf = ({className}) => <Icon className={className}><path d="M11 20A7 7 0 0 1 4 13V7a7 7 0 0 1 14 0v6a7 7 0 0 1-7 7z" /><path d="M11 20v-9" /></Icon>;
const Info = ({className}) => <Icon className={className}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="8"/><path d="M11 12h1v4"/></Icon>;

// --- MOCK DATA ---
const mockTransactions = [
  { id: 1, merchant: "Local Farmers' Market", amount: 42.50, date: "2025-10-26", category: "Groceries", type: "sustainable", recommendation: "Buying local reduces carbon emissions from transport!" },
  { id: 2, merchant: "Shell Gas Station", amount: 55.12, date: "2025-10-26", category: "Transport", type: "unsustainable", recommendation: "For short trips, consider biking or walking. For longer ones, public transit is a great alternative." },
  { id: 3, merchant: "Everlane", amount: 120.00, date: "2025-10-25", category: "Shopping", type: "sustainable", recommendation: "Everlane is known for its transparent sourcing and ethical factories." },
  { id: 4, merchant: "Zara", amount: 89.99, date: "2025-10-24", category: "Shopping", type: "unsustainable", recommendation: "Fast fashion has a high environmental cost. Consider brands that use sustainable materials or explore local thrift shops." },
  { id: 5, merchant: "ChargePoint EV Station", amount: 22.50, date: "2025-10-23", category: "Transport", type: "sustainable", recommendation: "Charging your EV is a great way to reduce your carbon footprint." },
  { id: 6, merchant: "Starbucks", amount: 5.75, date: "2025-10-22", category: "Food & Drink", type: "neutral", recommendation: "Bringing your own reusable cup can earn you a discount and reduce waste!" },
  { id: 7, merchant: "United Airlines", amount: 432.80, date: "2025-10-21", category: "Travel", type: "unsustainable", recommendation: "Air travel has a significant carbon footprint. For future trips, look into purchasing carbon offsets." },
  { id: 8, merchant: "Patagonia", amount: 180.45, date: "2025-10-20", category: "Shopping", type: "sustainable", recommendation: "Patagonia's commitment to recycled materials and their Worn Wear program make them a leader in sustainable apparel." },
];

// --- HELPERS ---
const formatDate = (iso) => {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (e) {
    return iso;
  }
}

// --- SVG TREE COMPONENTS ---
const Sprout = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50,90 C55,80 60,70 50,60 C40,70 45,80 50,90 Z" fill="#A3BF9B"/><path d="M50,60 C45,50 55,50 50,40 C55,50 45,50 50,60" fill="#6A8A5B"/></svg>
);
const Sapling = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 90 V 40" stroke="#8B5E3C" strokeWidth="3" /><path d="M50,50 C40,40 60,40 50,30" fill="#6A8A5B" /><path d="M50,60 C45,55 55,55 50,50" fill="#6A8A5B" /><path d="M40,70 Q50,65 60,70" fill="#A3BF9B" /></svg>
);
const GrowingTree = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 90 V 30" stroke="#8B5E3C" strokeWidth="4" /><path d="M50 50 L 30 40" stroke="#8B5E3C" strokeWidth="3" /><path d="M50 60 L 70 50" stroke="#8B5E3C" strokeWidth="3" /><circle cx="50" cy="25" r="15" fill="#4A7856" /><circle cx="30" cy="35" r="10" fill="#6A8A5B" /><circle cx="70" cy="45" r="12" fill="#6A8A5B" /><circle cx="55" cy="40" r="10" fill="#A3BF9B" /></svg>
);
const FlourishingTree = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full"><path d="M50 90 V 30" stroke="#704214" strokeWidth="5" /><path d="M50 60 L 25 45" stroke="#704214" strokeWidth="4" /><path d="M50 50 L 75 40" stroke="#704214" strokeWidth="4" /><path d="M50 70 L 35 60" stroke="#704214" strokeWidth="3" /><path d="M50 75 L 65 65" stroke="#704214" strokeWidth="3" /><circle cx="50" cy="20" r="18" fill="#3B6B46" /><circle cx="25" cy="38" r="15" fill="#4A7856" /><circle cx="75" cy="33" r="16" fill="#4A7856" /><circle cx="35" cy="55" r="12" fill="#6A8A5B" /><circle cx="65" cy="60" r="13" fill="#6A8A5B" /><circle cx="55" cy="35" r="14" fill="#A3BF9B" /></svg>
);

// --- HELPER COMPONENTS ---
const TransactionIcon = ({ type }) => {
  switch (type) {
    case 'sustainable': return <CheckCircle className="text-green-500" />;
    case 'unsustainable': return <XCircle className="text-amber-500" />;
    default: return <MinusCircle className="text-gray-400" />;
  }
};

const Header = () => (
  <header className="p-4 flex justify-between items-center bg-slate-800/70 border border-slate-700 rounded-2xl shadow-sm mx-4 md:mx-6 mt-4">
    <div className="flex items-center space-x-2">
      <span className="translate-y-0.5 inline-block">
        <Leaf className="text-teal-400 w-8 h-8" />
      </span>
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight">EverGreen</h1>
    </div>
    <div className="font-semibold text-sm text-slate-300">by <span className="text-teal-300 font-bold">Capital One</span></div>
  </header>
);

const RecommendationModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-sm w-full transform transition-all duration-300 scale-95 hover:scale-100" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-amber-400"/>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">A Greener Choice</h3>
          <p className="mt-2 text-sm text-slate-300">
            Your purchase at <span className="font-bold text-slate-100">{transaction.merchant}</span> could be more sustainable.
          </p>
        </div>
        <div className="mt-4 bg-slate-700/50 rounded-lg p-4">
          <h4 className="font-semibold text-teal-300">Recommendation:</h4>
          <p className="mt-1 text-sm text-teal-200">{transaction.recommendation + "."}</p>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-teal-500 text-slate-900 font-semibold py-2 px-4 rounded-lg hover:bg-teal-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-300 transition-colors"
        >
          Got it!
        </button>
      </div>
    </div>
  );
};

const GraphModal = ({ transactions = [], open, onClose }) => {
  const [hover, setHover] = React.useState(null); // {x,y,month,label,value}
  if (!open) return null;

  // Aggregate transactions by month (YYYY-MM) and compute cumulative monthly score
  const byMonth = {};
  transactions.forEach(t => {
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { month: key, label: d.toLocaleString(undefined, { month: 'short', year: 'numeric' }), score: 0 };
    if (t.type === 'sustainable') byMonth[key].score += 5;
    else if (t.type === 'unsustainable') byMonth[key].score -= 2;
  });

  // Sort months chronologically
  const months = Object.values(byMonth).sort((a, b) => a.month.localeCompare(b.month));

  // compute cumulative
  let cum = 0;
  const cumulative = months.map(m => {
    cum += m.score;
    return { ...m, cumulative: cum };
  });

  const width = 480;
  const height = 200;
  const pad = 28;
  const points = cumulative.map((m, i) => m.cumulative);
  const maxY = Math.max(...points, 10);
  const minY = Math.min(...points, 0);
  const range = maxY - minY || 1;

  const coords = cumulative.map((m, i) => {
    const x = pad + (i / Math.max(cumulative.length - 1, 1)) * (width - pad * 2);
    const y = pad + (1 - (m.cumulative - minY) / range) * (height - pad * 2);
    const year = Number(String(m.month).split('-')[0]);
    return { x, y, month: m.label, value: m.cumulative, year };
  });

  const polyPoints = coords.map(c => `${c.x},${c.y}`).join(' ');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4" onClick={onClose}>
  <div className="bg-slate-800/90 border border-slate-700 rounded-2xl shadow-2xl p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <h3 className="text-lg font-semibold text-slate-100">Sustainability Over Time</h3>
        </div>
        <p className="text-sm text-slate-300 mt-2">Monthly Cumulative Score (Sustainable +5, Unsustainable -2)</p>

        <div className="mt-4">
          {coords.length === 0 ? (
            <div className="text-sm text-slate-300">No Monthly Data Available</div>
          ) : (
            <svg width="100%" viewBox={`0 0 ${width} ${height + 30}`} preserveAspectRatio="xMidYMid meet" className="w-full">
              <defs>
                <linearGradient id="g" x1="0" x2="1">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
              </defs>
              {/* grid lines */}
              {[0,0.25,0.5,0.75,1].map((p, idx) => {
                const y = pad + p * (height - pad * 2);
                return <line key={idx} x1={pad} x2={width - pad} y1={y} y2={y} stroke="#334155" strokeWidth={0.5} />
              })}

              {/* polyline */}
              <polyline fill="none" stroke="url(#g)" strokeWidth="3" points={polyPoints} strokeLinecap="round" strokeLinejoin="round" />

              {/* points */}
              {coords.map((c, i) => (
                <g key={i}>
                  <circle
                    cx={c.x}
                    cy={c.y}
                    r={4}
                    fill="#10b981"
                    onMouseEnter={() => setHover({ x: c.x, y: c.y, month: c.month, value: c.value })}
                    onMouseLeave={() => setHover(null)}
                  />
                  {/* invisible larger hit area */}
                  <rect x={c.x - 8} y={0} width={16} height={height} fill="transparent" onMouseEnter={() => setHover({ x: c.x, y: c.y, month: c.month, value: c.value })} onMouseLeave={() => setHover(null)} />
                </g>
              ))}

              {/* x-axis ticks & labels */}
              {coords.length > 0 && (() => {
                // Render year labels at the first month of each year (no skipping of years)
                const fontSize = 12;
                const years = {};
                coords.forEach((c) => {
                  if (!years[c.year]) years[c.year] = c;
                });
                return Object.keys(years).map((y) => {
                  const c = years[y];
                  const lx = c.x;
                  const ly = height - pad + 14;
                  return (
                    <g key={`year-${y}`}>
                      <line x1={lx} x2={lx} y1={height - pad} y2={height - pad + 6} stroke="#475569" strokeWidth={1} />
                      <text x={lx} y={ly + 8} fill="#94a3b8" fontSize={fontSize} textAnchor="middle">{y}</text>
                    </g>
                  );
                });
              })()}

              {/* tooltip */}
              {hover && (
                <g>
                  <rect x={hover.x + 8} y={hover.y - 28} rx={6} ry={6} width={140} height={36} fill="#0f172a" opacity={0.95} />
                  <text x={hover.x + 16} y={hover.y - 10} fill="#cbd5e1" fontSize={12}>{hover.month}</text>
                  <text x={hover.x + 16} y={hover.y + 6} fill="#e6fffa" fontSize={13} fontWeight={700}>Score: {hover.value}</text>
                </g>
              )}
            </svg>
          )}
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="px-4 py-2 bg-teal-500 text-slate-900 rounded-lg font-semibold hover:bg-teal-400">Close</button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [score, setScore] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showScoreInfo, setShowScoreInfo] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  useEffect(() => {
    // Try to load a larger transactions CSV from public/assets/transactions.csv
    const parseAndSet = (txt) => {
      // Simple CSV parser that handles quoted fields with commas
      const parseCsv = (text) => {
        const rows = [];
        let cur = '';
        let row = [];
        let inQuotes = false;
        for (let i = 0; i < text.length; i++) {
          const ch = text[i];
          if (ch === '"') {
            inQuotes = !inQuotes;
          } else if (ch === ',' && !inQuotes) {
            row.push(cur);
            cur = '';
          } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
            if (cur !== '' || row.length) row.push(cur);
            if (row.length) rows.push(row.map(s => s.trim()));
            cur = '';
            row = [];
            if (ch === '\r' && text[i+1] === '\n') i++;
          } else {
            cur += ch;
          }
        }
        if (cur !== '' || row.length) row.push(cur);
        if (row.length) rows.push(row.map(s => s.trim()));
        return rows;
      };

      try {
        const rows = parseCsv(txt);
        if (!rows.length) throw new Error('empty csv');
        const header = rows.shift().map(h => h.replace(/^\uFEFF/, ''));
        const parsed = rows.map(cols => {
          const obj = {};
          header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
          return {
            id: Number(obj.id) || Math.floor(Math.random()*1000000),
            merchant: obj.merchant || 'Unknown',
            amount: Number(obj.amount) || 0,
            date: obj.date || new Date().toISOString().slice(0,10),
            category: obj.category || 'Other',
            type: (obj.type || 'neutral').toLowerCase(),
            recommendation: obj.recommendation || ''
          };
        });
        console.log('Loaded bundled CSV transactions:', parsed.length);
        setTransactions(parsed);
        return true;
      } catch (e) {
        console.warn('Bundled CSV parse failed', e);
        return false;
      }
    };

    // Prefer bundled CSV import
    if (typeof bundledCsv === 'string' && bundledCsv.length > 10) {
      const ok = parseAndSet(bundledCsv);
      if (ok) return;
    }

    // Fallback to fetching public assets CSV
    const loadCsv = async () => {
      try {
        const res = await fetch('/assets/transactions.csv');
        if (!res.ok) throw new Error('no csv');
        const txt = await res.text();
        const ok = parseAndSet(txt);
        if (!ok) setTransactions(mockTransactions);
      } catch (e) {
        console.warn('Failed to fetch CSV, falling back to mockTransactions', e);
        setTransactions(mockTransactions);
      }
    };
    loadCsv();
  }, []);

  useEffect(() => {
    const calculateScore = () => {
      return transactions.reduce((acc, t) => {
        if (t.type === 'sustainable') return acc + 5;
        if (t.type === 'unsustainable') return acc - 2;
        return acc;
      }, 0);
    };
    const newScore = calculateScore();

    let currentScore = score;
    if (currentScore !== newScore) {
      const step = (newScore - currentScore) > 0 ? 1 : -1;
      const timer = setInterval(() => {
        currentScore += step;
        setScore(currentScore);
        if (currentScore === newScore) {
          clearInterval(timer);
        }
      }, 20);
      return () => clearInterval(timer);
    }
  }, [transactions]);

  const TreeComponent = useMemo(() => {
    if (score < 15) return Sprout;
    if (score < 40) return Sapling;
    if (score < 75) return GrowingTree;
    return FlourishingTree;
  }, [score]);

  const treeStageName = useMemo(() => {
    if (score < 15) return "Sprout";
    if (score < 40) return "Sapling";
    if (score < 75) return "Growing Tree";
    return "Flourishing Tree";
  }, [score]);

  const handleTransactionClick = (transaction) => {
    if (transaction.type === 'unsustainable') {
      setSelectedTransaction(transaction);
    }
  };

  return (
    <div className="antialiased bg-transparent min-h-screen">
      <Header />
      <main className="p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-slate-800/70 border border-slate-700 rounded-2xl shadow-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 text-center">
              <h2 className="text-xl font-bold text-slate-100">Your Growth</h2>
              <p className="text-sm text-slate-300 mt-1">Overview of Recent Sustainability Progress</p>
            </div>
            <div className="p-6 flex flex-col">
              <div className="-mx-6">
                <div className="border-b border-slate-700">
                  <div className="py-6 flex flex-col items-center justify-center gap-3">
                    <div className="w-32 h-32 md:w-44 md:h-44 transition-all duration-500 ease-in-out">
                      <TreeComponent />
                    </div>
                    <div className="font-bold text-2xl text-teal-300 mt-1">{treeStageName}</div>
                  </div>
                </div>
              </div>

              <div className="mt-6 w-full flex flex-col items-center my-auto py-4 space-y-4">
                <div className="flex items-center justify-center gap-4 text-slate-300">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">Sustainability Score</span>
                    <button
                      aria-label="What does this score mean"
                      title="What does this score mean"
                      onClick={() => setShowScoreInfo(true)}
                      className="p-1 rounded-full bg-slate-800/70 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-300 hover:text-teal-200"
                    >
                      <Info className="w-5 h-5" />
                    </button>
                    <button
                      aria-label="Show score graph"
                      title="Show score graph"
                      onClick={() => setShowGraphModal(true)}
                      className="p-1 rounded-full bg-slate-800/70 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 text-teal-300 hover:text-teal-200"
                    >
                      <TrendingUp className="w-5 h-5"/>
                    </button>
                  </div>
                </div>

                <div className="text-5xl font-bold text-slate-100">{score}</div>

                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-400 h-2.5 rounded-full" style={{ width: `${Math.min(score, 100)}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-800/70 border border-slate-700 rounded-2xl shadow-lg">
            <div className="p-6 border-b border-slate-700 text-center">
              <h2 className="text-xl font-bold text-slate-100">Recent Transactions</h2>
              <p className="text-sm text-slate-300 mt-1">Review Recent Purchases and Impact</p>
            </div>
            <div className="max-h-96 md:max-h-[70vh] overflow-y-auto">
              <ul className="divide-y divide-slate-700">
                {transactions.map(t => (
                <li 
                  key={t.id} 
                  className={`p-4 flex items-center justify-between transition-all duration-200 ${t.type === 'unsustainable' ? 'cursor-pointer hover:bg-amber-900/40' : 'hover:bg-slate-700/40'}`}
                  onClick={() => handleTransactionClick(t)}
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="p-2 bg-slate-700 rounded-full flex-shrink-0">
                      <TransactionIcon type={t.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-100 text-left truncate">{t.merchant}</p>
                      <p className="text-sm text-slate-300 text-left truncate">{t.category} · {formatDate(t.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-100">{t.amount.toLocaleString(undefined, {style:'currency', currency:'USD'})}</p>
                    {t.type === 'unsustainable' && <span className="text-xs text-amber-300 font-semibold">Greener Choice Available</span>}
                  </div>
                </li>
              ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <RecommendationModal transaction={selectedTransaction} onClose={() => setSelectedTransaction(null)} />
  <GraphModal transactions={transactions} open={showGraphModal} onClose={() => setShowGraphModal(false)} />
      {showScoreInfo && (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4" onClick={() => setShowScoreInfo(false)}>
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl shadow-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-100">Sustainability Score Explanation</h3>
            <p className="mt-3 text-sm text-slate-300">The Sustainability Score is an estimate of how environmentally friendly your recent purchases are. It is calculated from transaction types in your activity - Sustainable purchases add points. Unsustainable choices subtract points. Neutral transactions are weighted lightly.</p>
            <ul className="mt-3 text-sm text-slate-300 list-disc list-inside space-y-1 text-left pl-5">
              <li><span className="font-semibold text-slate-100">0 - 14 (Sprout):</span> Getting Started - Small changes like reusable cups and local shopping help a lot.</li>
              <li><span className="font-semibold text-slate-100">15 - 39 (Sapling):</span> Good Progress - Consider swapping some transport or shopping habits for greener alternatives.</li>
              <li><span className="font-semibold text-slate-100">40 - 74 (Growing Tree):</span> Being Consistent - Keep it up and explore bigger changes like EVs or sustainable brands.</li>
              <li><span className="font-semibold text-slate-100">75+ (Flourishing):</span> Excellent - You are prioritizing sustainability in your spending.</li>
            </ul>
            <div className="mt-6 text-right">
              <button onClick={() => setShowScoreInfo(false)} className="px-4 py-2 bg-teal-500 text-slate-900 rounded-lg font-semibold hover:bg-teal-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
