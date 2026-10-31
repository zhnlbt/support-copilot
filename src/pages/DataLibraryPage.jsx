import { useEffect, useMemo, useState } from 'react';
import { PageHeader } from '../components/ui';
import { knowledgeFileUrl } from '../lib/api';

const sources = [
  { key: 'examples', label: 'Historical examples', file: 'admin_exemplars.json', field: 'exemplars' },
  { key: 'rules', label: 'Rules', file: 'rules_kb.json', field: 'rules' },
  { key: 'templates', label: 'Suggested templates', file: 'suggested_templates.json' },
  { key: 'priors', label: 'Rule priors', file: 'rule_priors.json', field: 'tokens' },
];
const PAGE_SIZE = 25;

function recordsFor(source, data) {
  const value = source.field ? data?.[source.field] : data;
  if (source.key === 'priors') {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error(`${source.file}: expected a tokens object.`);
    }
    return Object.entries(value).map(([token, statistics]) => ({ token, ...statistics }));
  }
  if (!Array.isArray(value)) throw new Error(`${source.file}: expected an array.`);
  return value;
}

export default function DataLibraryPage() {
  const [datasets, setDatasets] = useState(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [tab, setTab] = useState('examples');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError('');
    setDatasets(null);
    Promise.all(sources.map(async source => {
      const response = await fetch(knowledgeFileUrl(source.file), {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`${source.file}: HTTP ${response.status}.`);
      const raw = await response.json();
      return [source.key, { raw, records: recordsFor(source, raw) }];
    }))
      .then(entries => { if (!controller.signal.aborted) setDatasets(Object.fromEntries(entries)); })
      .catch(err => {
        if (!controller.signal.aborted) setError(`Cannot load data: ${err.message} Check the backend at port 8000.`);
      });
    return () => controller.abort();
  }, [attempt]);

  const source = sources.find(item => item.key === tab);
  const selected = datasets?.[tab];
  const filtered = useMemo(() => {
    const search = query.trim().toLocaleLowerCase();
    return (selected?.records || []).filter(record =>
      !search || JSON.stringify(record).toLocaleLowerCase().includes(search));
  }, [selected, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const metadata = selected && !Array.isArray(selected.raw)
    ? Object.fromEntries(Object.entries(selected.raw).filter(([key]) => key !== source.field))
    : null;

  return <>
    <PageHeader title="Data library" description="Browse the supplied backend knowledge files." />
    <p className="alert mb-5">Historical examples are reference material, not live tickets or triage results. Reply placeholders and historical verdicts are shown exactly as stored.</p>
    {error ? <div className="error-box" role="alert">
      <p>{error}</p><button className="button button-outline mt-3" onClick={() => setAttempt(value => value + 1)}>Retry</button>
    </div> : !datasets ? <p role="status">Loading the four data files…</p> : <>
      <div className="flex flex-wrap gap-2 mb-5" aria-label="Data sources">
        {sources.map(item => <button key={item.key} className={`button ${tab === item.key ? 'button-primary' : 'button-outline'}`}
          aria-pressed={tab === item.key} onClick={() => { setTab(item.key); setQuery(''); setPage(0); }}>
          {item.label} ({datasets[item.key].records.length.toLocaleString()})
        </button>)}
      </div>
      <section className="panel">
        <label htmlFor="library-search" className="field-label">Search {source.label.toLowerCase()}</label>
        <input id="library-search" type="search" className="field" value={query}
          placeholder="Search any field, including reply text or rule ID…"
          onChange={event => { setQuery(event.target.value); setPage(0); }} />
        <p className="text-muted text-sm mt-3" role="status">{filtered.length.toLocaleString()} matching records · {source.file}</p>
        {metadata && <details className="raw-response mt-4"><summary>Metadata and global statistics</summary>
          <pre>{JSON.stringify(metadata, null, 2)}</pre>
        </details>}
        <div className="mt-5 space-y-3">
          {visible.map((record, index) => {
            const id = record.ticket_id ?? record.id ?? record.cluster_id ?? record.token ?? index;
            const title = record.query || record.title || record.topic || record.token || String(id);
            return <details key={`${tab}:${id}`} className="raw-response">
              <summary style={{ overflowWrap: 'anywhere' }}>{title}</summary>
              <div className="p-4">
                {(record.template || record.admin_reply_template || record.text) &&
                  <p className="message mb-3">{record.template || record.admin_reply_template || record.text}</p>}
                <pre>{JSON.stringify(record, null, 2)}</pre>
              </div>
            </details>;
          })}
          {!filtered.length && <p className="text-muted">No matching records.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-5">
          <button className="button button-outline" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>Previous</button>
          <span className="text-sm">Page {currentPage + 1} of {pageCount}</span>
          <button className="button button-outline" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>Next</button>
        </div>
      </section>
    </>}
  </>;
}
