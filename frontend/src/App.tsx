import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import CrawlForm from './components/CrawlForm';
import ResultsViewer from './components/ResultsViewer';
import LoadingSpinner from './components/LoadingSpinner';
import CrawlHistory from './components/CrawlHistory';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CrawlForm />} />
        <Route path="/results/:domain" element={<ResultsViewer />} />
        <Route path="/history" element={<CrawlHistory />} />
        <Route
          path="*"
          element={
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <h1>404 - Page Not Found</h1>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </Layout>
  );
};

export default App; 