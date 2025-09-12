import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { Helmet } from 'react-helmet-async';

// Components
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import Loading from './components/common/Loading/Loading';
import ErrorBoundary from './components/common/ErrorBoundary/ErrorBoundary';

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home/Home'));
const Patients = lazy(() => import('./pages/Patients/Patients'));
const Statistics = lazy(() => import('./pages/Statistics/Statistics'));
const NotFound = lazy(() => import('./pages/NotFound/NotFound'));

// Routes configuration
const routes = [
  {
    path: '/',
    element: <Home />,
    title: 'Home - Patient Management System'
  },
  {
    path: '/patients',
    element: <Patients />,
    title: 'Patients - Patient Management System'
  },
  {
    path: '/patients/:id',
    element: <Patients />,
    title: 'Patient Details - Patient Management System'
  },
  {
    path: '/statistics',
    element: <Statistics />,
    title: 'Statistics - Patient Management System'
  },
  {
    path: '/404',
    element: <NotFound />,
    title: 'Page Not Found - Patient Management System'
  }
];

// Main App Component
const App = () => {
  return (
    <>
      {/* Global SEO */}
      <Helmet>
        <title>Patient Management System</title>
        <meta name="description" content="Modern Patient Management System built with React and Material-UI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>

      {/* Main Application Layout */}
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <Header />
        
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            py: { xs: 2, md: 3 },
            px: { xs: 1, sm: 2, md: 3 }
          }}
        >
          <Container maxWidth="xl">
            <ErrorBoundary>
              <Suspense fallback={<Loading />}>
                <Routes>
                  {routes.map((route, index) => (
                    <Route 
                      key={index}
                      path={route.path} 
                      element={
                        <>
                          <Helmet>
                            <title>{route.title}</title>
                          </Helmet>
                          {route.element}
                        </>
                      } 
                    />
                  ))}
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Container>
        </Box>

        <Footer />
      </Box>
    </>
  );
};

export default App;