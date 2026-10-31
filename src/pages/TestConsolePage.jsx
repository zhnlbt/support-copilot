import { useEffect, useRef, useState } from 'react';
import { demoTickets } from '../data/demo';
import { dataMode, requestTriage } from '../lib/api';
import { simulateTriage } from '../lib/demoTriage';
import { Badge, EmptyState, HumanBadge, PageHeader, PriorityBadge } from '../components/ui';

export default function TestConsolePage() {
  const [kind, setKind] = useState('complaint');
  const [message, setMessage] = useState(demoTickets[2].conversation[0].text);
  const [images, setImages] = useState('2');
  const [result, setResult] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stale, setStale] = useState(false);
  const controller = useRef(null);
  const lock = useRef(false);
  useEffect(() => () => controller.current?.abort(), []);
  function change(setter, value) { setter(value); setStale(!!result); }
  async function run(event) {
    event.preventDefault();
    if (lock.current) return;
    const count = Number(images);
    if (!message.trim() || !Number.isInteger(count) || count < 0 || count > 100) {
      setError('Enter a player message and a screenshot count from 0 to 100.'); return;
    }
    lock.current = true; setBusy(true); setError(''); setResult(null); setElapsed(null); setStale(false);
    controller.current = new AbortController();
    const signal = controller.current.signal;
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; controller.current?.abort(); }, 90000);
    const start = performance.now();
    try {
      const ticket = { kind, server_lang: 'ru', images_count: count, messages: [{ role: 'player', text: message.trim(), attachments: count }] };
      const response = dataMode === 'api' ? await requestTriage(ticket, { signal }) : simulateTriage(ticket);
      if (signal.aborted) return;
      setResult(response); setElapsed(performance.now() - start);
    } catch (err) {
      if (signal.aborted && !timedOut) return;
      setError(timedOut ? 'The request timed out after 90 seconds. The service may be rate limited. Please try again.' : err.message || 'Unable to reach the triage service.');
    } finally { clearTimeout(timer); lock.current = false; setBusy(false); }
  }
  return <>
    <PageHeader title="Test console" description="Try a request and inspect its classification and suggested reply." />
    <div className="two-column console-grid">
      <section className="panel tall-panel"><h2 className="input-heading">Input request</h2><form onSubmit={run}>
        <label className="field-label" htmlFor="ticket-type">Type</label><select id="ticket-type" className="field" value={kind} onChange={e => change(setKind, e.target.value)}><option value="complaint">Complaint</option><option value="report">In-game report</option></select>
        <label className="field-label mt-4" htmlFor="player-message">Player message</label><textarea id="player-message" className="field" rows={5} value={message} maxLength={10000} required onChange={e => change(setMessage, e.target.value)} />
        <label className="field-label mt-5" htmlFor="screenshots">Screenshots attached</label><input id="screenshots" type="number" className="field" min="0" max="100" step="1" value={images} required onChange={e => change(setImages, e.target.value)} />
        <button className="button button-primary mt-4" type="submit" disabled={busy || !message.trim()}>{busy ? 'Running triage…' : 'Run triage'}</button>
        <p className="text-muted text-sm mt-4">{dataMode === 'demo' ? 'Demo mode: runs a synthetic simulation locally. No API request or cost.' : 'API mode: sends this message to the configured triage service.'}</p>
        {error && <div className="error-box mt-4" role="alert">{error}</div>}
      </form></section>
      <section className="panel tall-panel" aria-busy={busy} aria-label="Triage result"><div className="panel-heading"><h2>Triage result</h2>{result && <Badge tone="success">COMPLETED</Badge>}</div>
        <div aria-live="polite">{busy ? <div className="empty-state"><span className="spinner" aria-hidden="true" /><p className="text-muted mt-4">Waiting for the triage service…</p></div> : result ? <>
          {stale && <p className="alert text-sm mt-4">The input changed. Run triage again to update this result.</p>}
          <p className="eyebrow mt-6">Classification</p><div className="flex flex-wrap gap-2 mt-4"><Badge>Language: {result.lang.toUpperCase()}</Badge><Badge>{result.category}</Badge><PriorityBadge priority={result.priority} /><Badge tone={result.is_spam_or_duplicate ? 'warning' : 'success'}>{result.is_spam_or_duplicate ? 'Spam or duplicate' : 'Not spam'}</Badge><HumanBadge needed={result.needs_human} /></div>
          <div className="message mt-4"><p className="text-muted text-sm">Draft reply{result.draft_reply.cited.length ? `, cites ${result.draft_reply.cited.join(', ')}` : ', no rule cited'}</p><p lang={result.draft_reply.lang} className="mt-1">{result.draft_reply.text}</p></div>
          <div className="mt-5 text-sm text-muted"><p className="eyebrow mb-3">Performance</p><p>{dataMode === 'demo' ? `Local simulation: ${Math.max(1, Math.round(elapsed))} ms · $0 API cost` : `Round trip: ${(elapsed / 1000).toFixed(2)} s · cost unavailable from this endpoint`}</p><p className="mt-1">Targets: under 5 s and under $0.002 per ticket.</p></div>
          {result.confidence === 0 && <p className="alert mt-4 text-sm">The service returned a fallback. This request needs an administrator.</p>}
          <details className="raw-response mt-4"><summary>Raw response</summary><pre>{JSON.stringify(result, null, 2)}</pre></details>
        </> : <EmptyState title="Ready when you are">Run a request to see its category, priority, draft reply, and raw response.</EmptyState>}</div>
      </section>
    </div>
  </>;
}
