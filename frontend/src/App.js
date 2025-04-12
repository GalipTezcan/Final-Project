import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [baseUrl, setBaseUrl] = useState('');
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxUrl, setMaxUrl] = useState(10);
  const [message, setMessage] = useState('');

  const handleCrawl = async () => {
    try {
      const response = await axios.post('http://localhost:5000/crawl', {
        base_url: baseUrl,
        max_depth: maxDepth,
        max_url: maxUrl
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <div className="App">
      <h1>Web Crawler</h1>
      <div>
        <input
          type="text"
          placeholder="Base URL"
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Depth"
          value={maxDepth}
          onChange={(e) => setMaxDepth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max URL"
          value={maxUrl}
          onChange={(e) => setMaxUrl(e.target.value)}
        />
        <button onClick={handleCrawl}>Crawl</button>
      </div>
      <p>{message}</p>
    </div>
  );
}

export default App; 