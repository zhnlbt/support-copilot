import { Link } from 'react-router-dom';
import { useConsole } from '../context/ConsoleContext';
import { routes } from '../lib/routes';
import { Badge, PageHeader } from '../components/ui';
const metrics = [ ['Category accuracy', 'validation set'], ['Priority macro-F1', 'validation set'], ['Draft rating', 'blind review, 1 to 5'], ['Needs a human', 'share of tickets'], ['Cost and speed', 'goal: $0.002, 5 s'] ];
export default function InsightsPage() {
  const { state, update, setNotice } = useConsole();
  function template(status) { update({ template: status }); setNotice(`Template ${status} in the local demo workspace.`); }
  return <>
    <PageHeader title="Insights" description="Monitor quality, operational workload and automation impact." />
    <div className="metrics-grid">{metrics.map(([label, caption]) => <section className="panel metric" key={label}><h2>{label}</h2><p className="metric-value" aria-label="Not measured">—</p><p className="text-sm text-muted">{caption}</p></section>)}</div>
    <p className="page-footnote mb-5">Metrics have not been connected. No validation scores are inferred from sample tickets.</p>
    <div className="two-column insights-grid">
      <section className="panel"><div className="panel-heading"><h2>Duplicate detection</h2><Badge tone="primary">1 GROUP</Badge></div><h3 className="insight-title">5 similar tickets</h3><p className="mt-6">One player sent 5 tickets about the same issue within an hour. They are shown as one request.</p><div className="flex flex-wrap items-center gap-3 mt-4"><button type="button" className="button button-outline" disabled={state.merged} onClick={() => { update({ merged: true }); setNotice('Five sample tickets merged into one local preview group.'); }}>{state.merged ? 'Group merged' : 'Merge group'}</button><Link className="text-link text-sm" to={`${routes.queue}?filter=duplicates`}>View duplicate group</Link></div><p className="text-xs text-muted mt-4">Synthetic example · merging affects this browser only.</p></section>
      <section className="panel"><div className="panel-heading"><h2>Suggested reply template</h2><Badge tone="primary">DRAFT</Badge></div><p className="text-muted text-sm mt-6">Sample topic: stuck in textures</p><div className="message mt-3" lang="ru">Здравствуйте! Уточните, где застрял ваш персонаж, и опишите, что произошло. Администратор поможет разобраться.</div>
        {state.template ? <div className="flex flex-wrap gap-3 items-center mt-5"><Badge tone={state.template === 'approved' ? 'success' : 'subtle'}>{state.template === 'approved' ? 'Approved' : 'Dismissed'} · local preview</Badge><button type="button" className="text-link text-sm" onClick={() => update({ template: null })}>Undo</button></div> : <div className="flex gap-2 mt-5"><button type="button" className="button button-primary" onClick={() => template('approved')}>Approve</button><button type="button" className="button button-outline" onClick={() => template('dismissed')}>Dismiss</button></div>}
        <p className="text-xs text-muted mt-4">Illustrative template · no historical frequency has been measured.</p>
      </section>
    </div>
  </>;
}
