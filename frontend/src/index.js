import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import globalStyles from './styles/globalStyles';
import { PatientProvider } from './contexts/PatientContext';
import { ThemeContextProvider } from './contexts/ThemeContext';

// Import CSS
import 'react-toastify/dist/ReactToastify.css';

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false
    }
  }
});

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Something went wrong.</h1>
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// App wrapper component
const AppWrapper = () => {
  return (
    <React.StrictMode>
      <HelmetProvider>
        <ErrorBoundary>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <ThemeContextProvider>
                <CssBaseline />
                {globalStyles}
                <PatientProvider>
                  <App />
                  <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="colored"
                  />
                </PatientProvider>
              </ThemeContextProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </ErrorBoundary>
      </HelmetProvider>
    </React.StrictMode>
  );
};

// Get root element and render
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AppWrapper />);