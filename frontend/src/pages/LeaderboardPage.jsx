import React, { useEffect, useState } from 'react';
import * as analyticsApi from '../api/analyticsApi';
import * as resultApi from '../api/resultApi';

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export default function LeaderboardPage() {
  const [examId, setExamId] = useState('');
  const [limit, setLimit] = useState(10);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function init() {
      try {
        const stats = await analyticsApi.getDashboardStats();
        if (!mounted) return;
        const defaultExamId = stats?.data?.defaultExamId || stats?.defaultExamId;
        if (defaultExamId) {
          setExamId(String(defaultExamId));
          loadLeaderboard(defaultExamId, limit);
        }
      } catch (e) {
        console.debug('No default exam id', e.message);
      }
    }
    init();
    return () => {
      mounted = false;
    };
  }, []);

  async function loadLeaderboard(eid, lim = limit) {
    if (!eid) {
      setError('Please provide an examId');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsApi.getTopPerformers(Number(eid), lim);
      setData(res?.data || []);
    } catch (e) {
      setError(e.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    if (!examId) return setError('Exam ID required to export');
    try {
      const blob = await resultApi.exportResultsCSV({ examId: Number(examId) });
      const filename = `leaderboard_exam_${examId}.csv`;
      downloadBlob(blob, filename);
    } catch (e) {
      setError(e.message || 'Export failed');
    }
  }

  const top1 = data[0];
  const top2 = data[1];
  const top3 = data[2];

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title & Filter Bar */}
        <section className="mb-8 border-b border-surface-variant pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-secondary font-sans uppercase tracking-widest text-xs font-semibold">
                Global Performance Rankings
              </span>
              <h1 className="font-headline text-3xl font-black text-primary mt-1">
                TU Mock Entrance Leaderboard
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold">
                <span className="text-secondary">Exam ID:</span>
                <input
                  type="text"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  placeholder="Exam ID"
                  className="bg-transparent border-b border-surface-variant w-20 text-center font-bold outline-none text-primary"
                />
              </div>

              <div className="flex items-center gap-2 bg-surface-container-lowest border border-surface-variant px-3 py-1.5 rounded-lg text-xs font-semibold">
                <span className="text-secondary">Limit:</span>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="bg-transparent outline-none font-bold text-primary"
                >
                  {[5, 10, 25, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} Top
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => loadLeaderboard(examId, limit)}
                className="bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold text-xs hover:opacity-90 transition-opacity"
              >
                Refresh Rankings
              </button>

              <button
                onClick={handleExport}
                className="border border-outline-variant text-primary px-4 py-2 rounded-lg font-semibold text-xs hover:bg-surface-container transition-all"
              >
                Export CSV
              </button>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-600">
            {error}
          </div>
        )}

        {/* Top 3 Podium Highlights */}
        {!loading && data.length >= 3 && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {/* Rank 2 */}
            <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl flex flex-col items-center justify-center text-center order-2 md:order-1 border-b-4 border-b-secondary-container shadow-sm">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full border-2 border-secondary bg-surface-container-high flex items-center justify-center font-black text-xl text-primary">
                  2
                </div>
              </div>
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">RANK 2</span>
              <h3 className="font-headline text-lg font-bold text-primary mt-1">
                {top2?.name || top2?.userName || top2?.user?.name || `Scholar #${top2?.userId || '2'}`}
              </h3>
              <div className="mt-4 pt-3 border-t border-surface-variant w-full grid grid-cols-2 text-xs">
                <div>
                  <p className="text-[10px] text-secondary uppercase font-bold">Score</p>
                  <p className="font-bold text-primary text-base">{top2?.score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase font-bold">Completed</p>
                  <p className="font-medium text-secondary">
                    {top2?.completedAt ? new Date(top2.completedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rank 1 (Main Featured Anchor) */}
            <div className="bg-surface-container-lowest border-2 border-primary p-6 rounded-xl flex flex-col items-center justify-center text-center order-1 md:order-2 border-b-4 border-b-primary shadow-md scale-105 z-10">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full border-4 border-primary bg-primary text-on-primary flex items-center justify-center font-black text-2xl shadow-md">
                  👑 1
                </div>
              </div>
              <span className="text-primary font-black text-xs uppercase tracking-widest">RANK 1 · CHAMPION</span>
              <h2 className="font-headline text-xl font-bold text-primary mt-1">
                {top1?.name || top1?.userName || top1?.user?.name || `Scholar #${top1?.userId || '1'}`}
              </h2>
              <div className="mt-4 pt-3 border-t border-primary w-full grid grid-cols-2 text-xs">
                <div>
                  <p className="text-[10px] text-primary uppercase font-bold">Top Score</p>
                  <p className="font-black text-primary text-lg">{top1?.score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-primary uppercase font-bold">Completed</p>
                  <p className="font-medium text-secondary">
                    {top1?.completedAt ? new Date(top1.completedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Rank 3 */}
            <div className="bg-surface-container-lowest border border-surface-variant p-6 rounded-xl flex flex-col items-center justify-center text-center order-3 border-b-4 border-b-outline-variant shadow-sm">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full border-2 border-outline-variant bg-surface-container-high flex items-center justify-center font-black text-xl text-primary">
                  3
                </div>
              </div>
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">RANK 3</span>
              <h3 className="font-headline text-lg font-bold text-primary mt-1">
                {top3?.name || top3?.userName || top3?.user?.name || `Scholar #${top3?.userId || '3'}`}
              </h3>
              <div className="mt-4 pt-3 border-t border-surface-variant w-full grid grid-cols-2 text-xs">
                <div>
                  <p className="text-[10px] text-secondary uppercase font-bold">Score</p>
                  <p className="font-bold text-primary text-base">{top3?.score}</p>
                </div>
                <div>
                  <p className="text-[10px] text-secondary uppercase font-bold">Completed</p>
                  <p className="font-medium text-secondary">
                    {top3?.completedAt ? new Date(top3.completedAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Detailed Rankings Table */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm overflow-hidden">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-surface-container-low border-b border-surface-variant text-left text-xs uppercase tracking-wider text-secondary font-semibold">
                <th className="px-6 py-3.5">Rank</th>
                <th className="px-6 py-3.5">Student Name</th>
                <th className="px-6 py-3.5">Score Points</th>
                <th className="px-6 py-3.5">Date Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-secondary">
                    Loading leaderboard rankings...
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-secondary">
                    No leaderboard data available for this exam.
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => {
                  const rankNum = row.rank ?? idx + 1;
                  const isTopThree = rankNum <= 3;

                  return (
                    <tr
                      key={row.userId || idx}
                      className={`transition-colors hover:bg-surface-container-low ${
                        isTopThree ? 'bg-surface-container-lowest font-semibold' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-xs font-bold ${
                            rankNum === 1
                              ? 'bg-primary text-on-primary'
                              : rankNum === 2
                                ? 'bg-secondary-container text-primary'
                                : rankNum === 3
                                  ? 'bg-surface-container-highest text-primary'
                                  : 'text-secondary'
                          }`}
                        >
                          {rankNum}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">
                        {row.name || row.userName || row.user?.name || `User #${row.userId}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-primary">{row.score} pts</td>
                      <td className="px-6 py-4 text-xs text-secondary">
                        {row.completedAt ? new Date(row.completedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

