import { createHashRouter } from 'react-router-dom';
import { Layout } from './Layout';
import { RoadmapPage } from '../features/roadmap/RoadmapPage';
import { PlaygroundPage } from '../features/playground/PlaygroundPage';
import { TopicPage } from '../features/topics/TopicPage';
import { PracticePage } from '../features/practice/PracticePage';
import { DashboardPage } from '../features/progress/DashboardPage';
import { CertificatePage } from '../features/certificate/CertificatePage';
import { VerifyPage } from '../features/certificate/VerifyPage';

// A hash router is used so that deep links work on GitHub Pages without any
// server-side rewrite configuration.
export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <RoadmapPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'topic/:id', element: <TopicPage /> },
      { path: 'practice/:topicId', element: <PracticePage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'certificate', element: <CertificatePage /> },
      { path: 'verify/:id', element: <VerifyPage /> },
    ],
  },
]);
