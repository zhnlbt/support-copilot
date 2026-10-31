import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import QueuePage from './pages/QueuePage';
import ReviewPage from './pages/ReviewPage';
import TestConsolePage from './pages/TestConsolePage';
import RulesPage from './pages/RulesPage';
import InsightsPage from './pages/InsightsPage';
import DataLibraryPage from './pages/DataLibraryPage';
import NotFoundPage from './pages/NotFoundPage';
import { routes } from './lib/routes';
function ReviewRoute() {
  const { pathname } = useLocation();
  return <ReviewPage key={pathname} />;
}
export default function App() {
  return <Routes><Route element={<AppLayout />}>
    <Route index element={<Navigate to={routes.queue} replace />} />
    <Route path={routes.queue} element={<QueuePage />} />
    <Route path={routes.review} element={<ReviewRoute />} />
    <Route path={`${routes.review}/:ticketId`} element={<ReviewRoute />} />
    <Route path={routes.testConsole} element={<TestConsolePage />} />
    <Route path={routes.rules} element={<RulesPage />} />
    <Route path={routes.insights} element={<InsightsPage />} />
    <Route path={routes.dataLibrary} element={<DataLibraryPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes>;
}

//я больше не хочу этим заниматься
