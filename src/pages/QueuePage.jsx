import { Link, useSearchParams } from 'react-router-dom';
import { demoTickets } from '../data/demo';
import { ticketPath } from '../lib/routes';
import { useConsole } from '../context/ConsoleContext';
import { Badge, EmptyState, HumanBadge, PageHeader, PriorityBadge } from '../components/ui';
const filters = [['all', 'All'], ['complaints', 'Complaints'], ['reports', 'In-game reports'], ['human', 'Needs a human'], ['auto', 'Auto-reply'], ['duplicates', 'Duplicates']];
export default function QueuePage() {
  const [params, setParams] = useSearchParams();
  const rawFilter = params.get('filter');
  const active = filters.some(([key]) => key === rawFilter) ? rawFilter : 'all';
  const { state } = useConsole();
  const tickets = demoTickets.filter(t => active === 'all' || active === 'complaints' && t.kind === 'complaint' || active === 'reports' && t.kind === 'report' || active === 'human' && t.needsHuman || active === 'auto' && !t.needsHuman && !t.duplicate || active === 'duplicates' && t.duplicate);
  return <>
    <PageHeader title="Ticket queue" description="Review incoming requests and prioritize what matters." />
    <section className="queue-summary" aria-label="Queue overview">{[
      ['Total tickets', demoTickets.length], ['Need review', demoTickets.filter(t => t.needsHuman).length],
      ['Auto-reply ready', demoTickets.filter(t => !t.needsHuman && !t.duplicate).length], ['Duplicate group', demoTickets.filter(t => t.duplicate).length],
    ].map(([label, count]) => <div key={label}><strong>{String(count).padStart(2, '0')}</strong><span>{label}</span></div>)}</section>
    <div className="queue-toolbar"><div><h2>All tickets</h2><p className="text-muted text-sm mt-2">Prioritized sample requests</p></div>
    <div className="filter-bar" aria-label="Filter queue">{filters.map(([key, label]) => <button type="button" key={key} aria-pressed={active === key} className={`button ${active === key ? 'button-dark' : 'button-outline'}`} onClick={() => setParams(key === 'all' ? {} : { filter: key })}>{label}</button>)}</div></div>
    <section className="panel queue-panel" aria-label="Ticket queue">
      <div className="table-scroll"><table className="queue-table">
        <thead><tr><th scope="col">Priority</th><th scope="col">Request</th><th scope="col">Category</th><th scope="col">Lang</th><th scope="col">Next step</th></tr></thead>
        <tbody>{tickets.map(ticket => {
          const status = state.statuses?.[ticket.id];
          return <tr key={ticket.id}><td data-label="Priority"><PriorityBadge priority={ticket.priority} /></td><td data-label="Request"><Link className="ticket-link" to={ticketPath(ticket.id)}>{ticket.request}</Link></td><td data-label="Category" className="text-muted text-sm">{ticket.duplicate ? 'merged group' : ticket.category}</td><td data-label="Language" className="uppercase">{ticket.lang}</td><td data-label="Next step"><div className="next-step">{status ? <Badge tone={status === 'sent' ? 'success' : 'warning'}>{status === 'sent' ? 'Sent · preview' : 'Escalated · preview'}</Badge> : ticket.duplicate ? <Badge tone="subtle">{state.merged ? 'Merged · preview' : 'Duplicates'}</Badge> : <HumanBadge needed={ticket.needsHuman} />}<span className="text-muted text-sm">{status ? 'saved in this browser' : ticket.nextStep}</span></div></td></tr>;
        })}</tbody>
      </table></div>
      {!tickets.length && <EmptyState title="No tickets in this view">Choose another filter to see more requests.</EmptyState>}
    </section>
    <p className="page-footnote">{tickets.length} sample {tickets.length === 1 ? 'request' : 'requests'} · Select a request to review its conversation and draft.</p>
  </>;
}
