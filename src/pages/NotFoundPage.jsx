import { Link } from 'react-router-dom';
import { routes } from '../lib/routes';
export default function NotFoundPage() {
  return <section className="panel max-w-xl"><p className="text-muted text-sm mb-3">404 · Page not found</p><h1>This page isn't in the queue.</h1><p className="text-muted mt-4">Check the address or return to the support workspace.</p><Link to={routes.queue} className="button button-dark mt-6">Back to queue</Link></section>;
}
