import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { routes } from '../lib/routes';
import { useConsole } from '../context/ConsoleContext';
import { dataMode } from '../lib/api';
import { NavIcon } from './ui';
const navigation = [
  ['Queue', routes.queue], ['Review', routes.review], ['Test console', routes.testConsole], ['Rules', routes.rules], ['Insights', routes.insights],
];
export default function AppLayout() {
  const { pathname } = useLocation();
  const { notice, setNotice, storageError } = useConsole();
  useEffect(() => {
    const title = navigation.find(([, path]) => pathname.startsWith(path))?.[0] || 'Page not found';
    document.title = `${title} · Support Copilot`;
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 6500);
    return () => clearTimeout(timer);
  }, [notice, setNotice]);
  return <div className="app-shell">
    <a href="#main-content" className="skip-link">Skip to content</a>
    <aside className="sidebar">
      <NavLink to={routes.queue} className="brand" aria-label="Support Copilot home"><span className="brand-mark" aria-hidden="true">S</span><span className="brand-name">SUPPORT<small>COPILOT</small></span></NavLink>
      <nav aria-label="Main navigation" className="navigation">
        {navigation.map(([label, path]) => <NavLink key={path} to={path} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}><NavIcon name={label} /><span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-footer"><strong>ADMIN WORKSPACE</strong><span className="mode-dot" /><span>{dataMode === 'api' ? 'API test mode' : 'Demo workspace'}</span><p>{dataMode === 'api' ? 'Rules and data use backend · queue and insights are previews' : 'Synthetic data · saved locally'}</p></div>
    </aside>
    <main id="main-content" tabIndex={-1} className="main-content">
      {storageError && <div className="alert mb-5" role="alert">Browser storage is unavailable. Changes will last for this session only.</div>}
      <div className="workspace-mode" aria-label="Workspace mode">{dataMode === 'api' ? 'API TEST' : 'DEMO'}</div><Outlet />
    </main>
    {notice && <div className="toast" role="status"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notification">×</button></div>}
  </div>;
}
