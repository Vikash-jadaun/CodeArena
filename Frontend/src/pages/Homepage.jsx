import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Bookmark, Check, ChevronLeft, ChevronRight, Search, Target } from 'lucide-react';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axiosClient';
import AppHeader from '../components/AppHeader';

const PAGE_SIZE = 8;
const getTagName = (tags) => Array.isArray(tags) ? tags.join(', ') : tags || 'General';
const getDifficultyClass = (difficulty) => `difficulty-pill difficulty-${(difficulty || '').toLowerCase()}`;
const getSavedBookmarks = () => {
  try {
    const saved = JSON.parse(window.localStorage.getItem('codearena-bookmarks') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

function Homepage() {
  const { user } = useSelector((state) => state.auth);
  const [problems, setProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [filters, setFilters] = useState({ search: '', difficulty: 'all', tag: 'all', status: 'all', sort: 'default' });
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState(getSavedBookmarks);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      setLoading(true);
      setFetchError('');
      try {
        const requests = [axiosClient.get('/problem/getAllProblem')];
        if (user) requests.push(axiosClient.get('/problem/problemSolvedByUser'));
        const [problemResponse, solvedResponse] = await Promise.all(requests);
        if (!active) return;
        setProblems(Array.isArray(problemResponse.data) ? problemResponse.data : []);
        setSolvedProblems(Array.isArray(solvedResponse?.data) ? solvedResponse.data : []);
      } catch (error) {
        if (active) setFetchError(error.response?.data?.message || 'Unable to load your problems right now.');
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, [user]);

  const solvedIds = useMemo(() => new Set(solvedProblems.map((problem) => problem._id)), [solvedProblems]);
  const tags = useMemo(() => [...new Set(problems.map((problem) => getTagName(problem.tags)).filter(Boolean))].sort(), [problems]);
  const filteredProblems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const result = problems.filter((problem) => {
      const isSolved = solvedIds.has(problem._id);
      return (!search || problem.title?.toLowerCase().includes(search))
        && (filters.difficulty === 'all' || problem.difficulty?.toLowerCase() === filters.difficulty)
        && (filters.tag === 'all' || getTagName(problem.tags) === filters.tag)
        && (filters.status === 'all' || (filters.status === 'solved' ? isSolved : !isSolved));
    });
    if (filters.sort === 'title') result.sort((a, b) => a.title.localeCompare(b.title));
    if (filters.sort === 'difficulty') {
      const order = { easy: 0, medium: 1, hard: 2 };
      result.sort((a, b) => (order[a.difficulty?.toLowerCase()] ?? 3) - (order[b.difficulty?.toLowerCase()] ?? 3) || a.title.localeCompare(b.title));
    }
    return result;
  }, [problems, filters, solvedIds]);

  const pageCount = Math.max(1, Math.ceil(filteredProblems.length / PAGE_SIZE));
  const visibleProblems = filteredProblems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const completion = problems.length ? Math.round((solvedIds.size / problems.length) * 100) : 0;
  const topicStats = useMemo(() => {
    const topics = new Map();
    problems.forEach((problem) => {
      const topic = getTagName(problem.tags);
      const current = topics.get(topic) || { total: 0, solved: 0 };
      current.total += 1;
      if (solvedIds.has(problem._id)) current.solved += 1;
      topics.set(topic, current);
    });
    return [...topics.entries()].sort((a, b) => b[1].total - a[1].total).slice(0, 4);
  }, [problems, solvedIds]);

  const toggleBookmark = (id) => {
    const next = bookmarks.includes(id) ? bookmarks.filter((bookmark) => bookmark !== id) : [...bookmarks, id];
    setBookmarks(next);
    localStorage.setItem('codearena-bookmarks', JSON.stringify(next));
  };
  const updateFilters = (nextFilters) => {
    setFilters(nextFilters);
    setPage(1);
  };
  const challengePool = problems.filter((problem) => !solvedIds.has(problem._id));
  const challengeIndex = challengePool.length ? (new Date().getDate() - 1) % challengePool.length : 0;
  const featuredProblem = challengePool[challengeIndex] || problems[0];
  const name = user?.firstName || 'there';

  return (
    <div className="app-shell">
      <AppHeader />
      <main className="page-container">
        <div className="page-heading">
          <div><p className="eyebrow">Your workspace</p><h1>Welcome back, {name}</h1><p>Keep your problem solving streak moving forward.</p></div>
        </div>

        {fetchError && <div className="panel" role="alert" style={{ marginBottom: 16, color: 'var(--app-danger)' }}>{fetchError}</div>}

        <section className="stat-grid" aria-label="Problem statistics">
          <StatCard label="Total problems" value={loading ? '—' : problems.length} foot="Available in the library" />
          <StatCard label="Solved" value={loading ? '—' : solvedIds.size} foot="Problems completed" />
          <StatCard label="Unsolved" value={loading ? '—' : Math.max(0, problems.length - solvedIds.size)} foot="Ready for your next session" />
          <StatCard label="Completion" value={loading ? '—' : `${completion}%`} foot="Across all available problems" />
        </section>

        <section className="dashboard-grid">
          <div className="panel">
            <h2 className="panel-title"><span>Daily challenge</span><Target size={17} color="var(--app-primary)" /></h2>
            {featuredProblem ? <div className="challenge-card"><div><span className={getDifficultyClass(featuredProblem.difficulty)}>{featuredProblem.difficulty}</span><h3>{featuredProblem.title}</h3><p>{getTagName(featuredProblem.tags)} · Selected from your available problems</p></div><NavLink className="primary-button" to={`/problem/${featuredProblem._id}`}>Solve problem <ArrowRight size={15} /></NavLink></div> : <div className="empty-state">{loading ? 'Loading your challenge…' : 'No problems are available yet.'}</div>}
          </div>
          <div className="panel">
            <h2 className="panel-title">Topic progress</h2>
            {topicStats.length ? <div className="progress-list">{topicStats.map(([topic, stats]) => <div className="progress-row" key={topic}><span>{topic}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${stats.total ? stats.solved / stats.total * 100 : 0}%` }} /></div><span>{stats.solved}/{stats.total}</span></div>)}</div> : <div className="empty-state">Topic progress appears when problems are available.</div>}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading" style={{ marginTop: 0 }}><div><p className="eyebrow">Practice library</p><h2>Problems</h2></div><span className="topic-pill">{filteredProblems.length} results</span></div>
          <div className="problem-tools">
            <label className="field search-field" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Search size={15} color="var(--app-muted)" /><input aria-label="Search problem titles" placeholder="Search problems" value={filters.search} onChange={(event) => updateFilters({ ...filters, search: event.target.value })} style={{ width: '100%', outline: 0, border: 0, color: 'var(--app-text)', background: 'transparent' }} /></label>
            <select aria-label="Filter by difficulty" className="select-field" value={filters.difficulty} onChange={(event) => updateFilters({ ...filters, difficulty: event.target.value })}><option value="all">All difficulties</option><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
            <select aria-label="Filter by topic" className="select-field" value={filters.tag} onChange={(event) => updateFilters({ ...filters, tag: event.target.value })}><option value="all">All topics</option>{tags.map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select>
            <select aria-label="Filter by status" className="select-field" value={filters.status} onChange={(event) => updateFilters({ ...filters, status: event.target.value })}><option value="all">All statuses</option><option value="solved">Solved</option><option value="unsolved">Unsolved</option></select>
            <select aria-label="Sort problems" className="select-field" value={filters.sort} onChange={(event) => updateFilters({ ...filters, sort: event.target.value })}><option value="default">Default order</option><option value="title">Title A–Z</option><option value="difficulty">Difficulty</option></select>
          </div>
          <div className="problem-table-wrap"><table className="problem-table"><thead><tr><th>Problem</th><th>Difficulty</th><th>Topic</th><th>Status</th><th aria-label="Bookmark" /></tr></thead><tbody>
            {loading ? <tr><td colSpan="5" className="empty-state">Loading problems…</td></tr> : visibleProblems.length ? visibleProblems.map((problem) => <tr key={problem._id}><td><NavLink className="problem-name" to={`/problem/${problem._id}`}>{problem.title}</NavLink></td><td><span className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</span></td><td><span className="topic-pill">{getTagName(problem.tags)}</span></td><td><span className={`status-pill ${solvedIds.has(problem._id) ? 'status-solved' : 'status-unsolved'}`}>{solvedIds.has(problem._id) ? <><Check size={13} /> Solved</> : 'Unsolved'}</span></td><td><button className={`bookmark-button ${bookmarks.includes(problem._id) ? 'saved' : ''}`} aria-label={bookmarks.includes(problem._id) ? 'Remove bookmark' : 'Bookmark problem'} title={bookmarks.includes(problem._id) ? 'Remove bookmark' : 'Bookmark problem'} onClick={() => toggleBookmark(problem._id)}><Bookmark size={16} fill={bookmarks.includes(problem._id) ? 'currentColor' : 'none'} /></button></td></tr>) : <tr><td colSpan="5" className="empty-state">No problems match these filters.</td></tr>}
          </tbody></table></div>
          <div className="pagination"><span>Showing {filteredProblems.length ? (page - 1) * PAGE_SIZE + 1 : 0}–{Math.min(page * PAGE_SIZE, filteredProblems.length)} of {filteredProblems.length}</span><div className="pagination-actions"><button className="icon-button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button><span style={{ alignSelf: 'center', padding: '0 7px' }}>{page} / {pageCount}</span><button className="icon-button" disabled={page >= pageCount} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={16} /></button></div></div>
        </section>

        <div className="section-heading"><h2>Solved problems</h2><span className="topic-pill">{solvedProblems.length} completed</span></div>
        <section className="panel" style={{ padding: 0, overflow: 'hidden' }}>{solvedProblems.length ? <div>{solvedProblems.slice(0, 4).map((problem) => <div key={problem._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 17px', borderBottom: '1px solid var(--app-border)' }}><NavLink className="problem-name" to={`/problem/${problem._id}`}>{problem.title}</NavLink><span className={getDifficultyClass(problem.difficulty)}>{problem.difficulty}</span></div>)}</div> : <div className="empty-state">Solve a problem and it will appear here.</div>}</section>
      </main>
    </div>
  );
}

function StatCard({ label, value, foot }) {
  return <div className="stat-card"><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">{foot}</div></div>;
}

export default Homepage;
