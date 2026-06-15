import { lazy } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import { Layout } from './Layout';

// Each route is code-split so the initial load only pulls in the shell. The
// named exports are adapted to the default-export shape React.lazy expects.
const LandingPage = lazy(() =>
  import('../features/landing/LandingPage').then((m) => ({ default: m.LandingPage }))
);
const KnowledgeTreePage = lazy(() =>
  import('../features/tree/KnowledgeTreePage').then((m) => ({ default: m.KnowledgeTreePage }))
);
const CoursesPage = lazy(() =>
  import('../features/courses/CoursesPage').then((m) => ({ default: m.CoursesPage }))
);
const PathsPage = lazy(() =>
  import('../features/paths/PathsPage').then((m) => ({ default: m.PathsPage }))
);
const PlaygroundPage = lazy(() =>
  import('../features/playground/PlaygroundPage').then((m) => ({ default: m.PlaygroundPage }))
);
const LearnPage = lazy(() =>
  import('../features/learn/LearnPage').then((m) => ({ default: m.LearnPage }))
);
const MentorPage = lazy(() =>
  import('../features/mentor/MentorPage').then((m) => ({ default: m.MentorPage }))
);
const MissionsListPage = lazy(() =>
  import('../features/missions/MissionsListPage').then((m) => ({ default: m.MissionsListPage }))
);
const MissionPage = lazy(() =>
  import('../features/missions/MissionPage').then((m) => ({ default: m.MissionPage }))
);
const TopicPage = lazy(() =>
  import('../features/topics/TopicPage').then((m) => ({ default: m.TopicPage }))
);
const PracticePage = lazy(() =>
  import('../features/practice/PracticePage').then((m) => ({ default: m.PracticePage }))
);
const ReviewPage = lazy(() =>
  import('../features/review/ReviewPage').then((m) => ({ default: m.ReviewPage }))
);
const BookmarksPage = lazy(() =>
  import('../features/bookmarks/BookmarksPage').then((m) => ({ default: m.BookmarksPage }))
);
const DashboardPage = lazy(() =>
  import('../features/progress/DashboardPage').then((m) => ({ default: m.DashboardPage }))
);
const CertificatePage = lazy(() =>
  import('../features/certificate/CertificatePage').then((m) => ({ default: m.CertificatePage }))
);
const VerifyPage = lazy(() =>
  import('../features/certificate/VerifyPage').then((m) => ({ default: m.VerifyPage }))
);

// A hash router is used so deep links work on GitHub Pages with no server
// rewrites. Existing routes are preserved for backward compatibility.
export const router = createHashRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'tree', element: <KnowledgeTreePage /> },
      { path: 'learn', element: <LearnPage /> },
      { path: 'mentor', element: <MentorPage /> },
      { path: 'missions', element: <MissionsListPage /> },
      { path: 'mission/:id', element: <MissionPage /> },
      { path: 'roadmap', element: <Navigate to="/tree" replace /> },
      { path: 'courses', element: <CoursesPage /> },
      { path: 'paths', element: <PathsPage /> },
      { path: 'playground', element: <PlaygroundPage /> },
      { path: 'topic/:id', element: <TopicPage /> },
      { path: 'practice/:topicId', element: <PracticePage /> },
      { path: 'review', element: <ReviewPage /> },
      { path: 'bookmarks', element: <BookmarksPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'certificate', element: <CertificatePage /> },
      { path: 'verify/:id', element: <VerifyPage /> },
    ],
  },
]);
