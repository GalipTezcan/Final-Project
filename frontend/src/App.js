import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import CrawlForm from './components/CrawlForm';
import ResultsViewer from './components/ResultsViewer';
import CrawlHistory from './components/CrawlHistory';
import Dashboard from './components/Dashboard';
import './App.css';

const NotFound = () => (
  <div className="not-found-container">
    <h1 className="not-found-title">404</h1>
    <h2 className="not-found-subtitle">Page Not Found</h2>
    <p className="not-found-text">The page you are looking for does not exist or has been moved.</p>
    <a href="/" className="not-found-link">Go back to homepage</a>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CrawlForm />} />
          <Route path="/results/:domain" element={<ResultsViewer />} />
          <Route path="/history" element={<CrawlHistory />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App; 