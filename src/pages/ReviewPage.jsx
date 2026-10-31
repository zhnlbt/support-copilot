import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { defaultTicketId, demoTickets, languages } from '../data/demo';
import { rulePath, routes } from '../lib/routes';
import { useConsole } from '../context/ConsoleContext';
import { ArrowIcon, Badge, HumanBadge, PriorityBadge } from '../components/ui';

export default function ReviewPage() {
  const { ticketId = defaultTicketId } = useParams();
  const ticket = demoTickets.find(t => t.id === ticketId);
  const { state, saveDraft, setStatus, setNotice } = useConsole();
  const [confirmSend, setConfirmSend] = useState(false);
  const editor = useRef(null);
  if (!ticket) return <section className="panel"><h1>Ticket not found</h1><p className="mt-4 text-muted">This ticket is not available in the demo workspace.</p><Link className="button button-dark mt-6" to={routes.queue}>Back to queue</Link></section>;
  const draft = typeof state.drafts?.[ticket.id] === 'string' ? state.drafts[ticket.id] : ticket.draft;
  const status = state.statuses?.[ticket.id];
  const conversation = ticket.conversation || [{ role: 'player', text: ticket.request, attachments: ticket.images }];
  function send() {
    setStatus(ticket.id, 'sent'); setConfirmSend(false); setNotice('Reply marked as sent in this demo. No message was sent to a player.');
  }
  return <>
    <header className="review-header">
      <div><Link className="back-link" to={routes.queue}><ArrowIcon direction="left" />Back to queue</Link><h1>Ticket review</h1><p className="text-muted review-subtitle">{ticket.title} · {ticket.id}</p></div>
      <div className="flex flex-wrap items-center gap-2"><PriorityBadge priority={ticket.priority} /><Badge>{ticket.lang.toUpperCase()}</Badge><HumanBadge needed={ticket.needsHuman} /></div>
    </header>
    <div className={`alert ${!ticket.needsHuman ? 'alert-success' : ''}`}><strong>{ticket.needsHuman ? 'A person must confirm this one.' : 'This draft is ready for review.'}</strong> The draft below is a suggestion. Punishments are always approved by an administrator.</div>
    <div className="review-grid">
      <div className="flex flex-col gap-4">
        <section className="panel conversation-panel"><div className="panel-heading"><h2>Conversation</h2><Badge tone="subtle">{ticket.images} attachments</Badge></div><div className="mt-3 space-y-2">{conversation.map((message, i) => <article className={`message ${message.role === 'player' ? 'message-player' : 'message-accused'}`} key={i}><p className="text-muted text-sm">{message.role === 'player' ? `Player${message.attachments ? `, ${message.attachments} screenshots attached` : ''}` : 'Accused player'}</p><p lang={ticket.lang} className="mt-1">{message.text}</p></article>)}</div></section>
        <section className="panel facts-panel"><h2>Extracted facts</h2><p className="text-muted text-sm mt-3">Taken from the player's words. Not verified.</p><dl className="facts-list">{[
          ['Nickname', ticket.nickname || 'Not mentioned'], ['Rule claimed', ticket.refs.join(', ') || 'Not mentioned'], ['Evidence', ticket.images ? `${ticket.images} screenshots (count only)` : 'None attached'], ['Server', ticket.server || 'Not mentioned'],
        ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></section>
      </div>
      <section className="panel draft-panel"><div className="panel-heading"><h2>Suggested response</h2><Badge tone="primary">DRAFT</Badge></div><p className="eyebrow mt-6">{languages[ticket.lang] || ticket.lang}</p>
        <label className="field-label mt-6" htmlFor="draft">Edit before sending</label>
        <textarea id="draft" ref={editor} lang={ticket.lang} value={draft} onChange={e => { saveDraft(ticket.id, e.target.value); setConfirmSend(false); }} rows={5} className="field draft-editor" />
        <p className="text-muted text-xs mt-2" role="status">{state.drafts?.[ticket.id] !== undefined ? 'Draft saved in this browser.' : 'Suggested draft · edit as needed.'}</p>
        <div className="mt-5"><p className="text-muted text-sm">Rule reference</p><div className="flex flex-wrap gap-2 mt-1">{ticket.refs.length ? ticket.refs.map(ref => <Link key={ref} className="badge badge-success" to={rulePath(`ОП:${ref}`)}>{ref} Player insult: preview rule <ArrowIcon /></Link>) : <span className="text-sm text-muted">No rule cited.</span>}</div></div>
        <div className="mt-4"><label htmlFor="confidence" className="text-muted text-sm">Confidence {Math.round(ticket.confidence * 100)}%</label><progress id="confidence" className="confidence-progress" value={ticket.confidence} max="1">{Math.round(ticket.confidence * 100)}%</progress></div>
        <p className="mt-3"><strong>{ticket.needsHuman ? 'Why a person: ' : 'Why this draft: '}</strong>{ticket.reasons[0]}</p>
        <div className="draft-actions">
          {status && <p className="mb-3 text-sm" role="status"><Badge tone={status === 'sent' ? 'success' : 'warning'}>{status === 'sent' ? 'Marked as sent' : 'Escalated'} · local preview</Badge></p>}
          {confirmSend && <div className="confirmation mb-4" role="region" aria-label="Confirm reply"><p className="text-sm">Confirm this edited reply for the demo workspace. This records a local action; it does not contact a player.</p><div className="flex gap-2 mt-3"><button type="button" className="button button-primary" onClick={send}>Confirm send</button><button type="button" className="button button-outline" onClick={() => setConfirmSend(false)}>Cancel</button></div></div>}
          <div className="flex flex-wrap gap-2"><button type="button" className="button button-primary" disabled={!draft.trim() || status === 'sent'} onClick={() => setConfirmSend(true)}>Send</button><button type="button" className="button button-outline" onClick={() => { editor.current.focus(); editor.current.setSelectionRange(0, draft.length); }}>Edit</button><button type="button" className="button button-outline" disabled={status === 'escalated'} onClick={() => { setStatus(ticket.id, 'escalated'); setConfirmSend(false); setNotice('Ticket escalated in the local demo workspace.'); }}>Escalate</button></div>
          <p className="text-muted text-sm mt-3">Your edits are saved locally. Server feedback storage can be connected later.</p>
        </div>
      </section>
    </div>
  </>;
}
