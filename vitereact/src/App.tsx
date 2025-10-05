import React, { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAppStore } from '@/store/main';
import GV_TopNav from '@/components/views/GV_TopNav';
import GV_Footer from '@/components/views/GV_Footer';
import UV_HomePage from '@/components/views/UV_HomePage';
import UV_AboutMe from '@/components/views/UV_AboutMe';
import UV_ResumeCV from '@/components/views/UV_ResumeCV';
import UV_Portfolio from '@/components/views/UV_Portfolio';
import UV_Testimonials from '@/components/views/UV_Testimonials';
import UV_Services from '@/components/views/UV_Services';
import UV_Contact from '@/components/views/UV_Contact';
import UV_Blog from '@/components/views/UV_Blog';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppStore((state) => state.authentication_state.authentication_status.is_authenticated);
  const isLoading = useAppStore((state) => state.authentication_state.authentication_status.is_loading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const isLoading = useAppStore((state) => state.authentication_state.authentication_status.is_loading);
  const initializeAuth = useAppStore((state) => state.initialize_auth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <div className="App min-h-screen flex flex-col">
          <GV_TopNav />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<UV_HomePage />} />
              <Route path="/about" element={<UV_AboutMe />} />
              <Route path="/resume" element={<UV_ResumeCV />} />
              <Route path="/portfolio" element={<UV_Portfolio />} />
              <Route path="/portfolio/:project_id" element={<ProtectedRoute><UV_Portfolio /></ProtectedRoute>} />
              <Route path="/testimonials" element={<UV_Testimonials />} />
              <Route path="/services" element={<UV_Services />} />
              <Route path="/contact" element={<UV_Contact />} />
              <Route path="/blog" element={<UV_Blog />} />
              <Route 
                path="/blog/:post_slug" 
                element={<ProtectedRoute><UV_Blog /></ProtectedRoute>} 
              />
              {/* Catch all - could redirect to not-found or home based on accessibility */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <GV_Footer />
        </div>
      </QueryClientProvider>
    </Router>
  );
};

export default App;