export function Badge({ tone = 'neutral', children, className = '' }) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}
export function PriorityBadge({ priority }) {
  const labels = { p0: 'P0 Critical', p1: 'P1 High', p2: 'P2 Normal', p3: 'P3 Low' };
  return <Badge tone={priority}>{labels[priority] || priority}</Badge>;
}
export function HumanBadge({ needed }) {
  return <Badge tone={needed ? 'warning' : 'success'}>{needed ? 'Human needed' : 'Auto-reply OK'}</Badge>;
}
export function PageHeader({ title, description, children }) {
  return <header className="page-header"><div><h1>{title}</h1>{description && <p className="mt-4 text-muted">{description}</p>}</div>{children}</header>;
}
export function EmptyState({ title, children }) {
  return <div className="empty-state"><h2>{title}</h2><p className="mt-2 text-muted">{children}</p></div>;
}
export function ArrowIcon({ direction = 'right', className = '' }) {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className={`size-4 shrink-0 ${className}`} style={direction === 'left' ? { transform: 'rotate(180deg)' } : undefined}><path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export function NavIcon({ name }) {
  const paths = {
    Queue: <><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 9v12" /></>,
    Review: <><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 8h6M9 12h6M9 16h3" /></>,
    'Test console': <><path d="m7 7-5 5 5 5m10-10 5 5-5 5M14 4l-4 16" /></>,
    Rules: <><path d="M5 4h14v17l-7-4-7 4zM9 8h6M9 11h6" /></>,
    Insights: <><path d="M4 20h17M7 15v-4m5 4V5m5 10V8" /></>,
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="nav-icon" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.Rules}</svg>;
}
