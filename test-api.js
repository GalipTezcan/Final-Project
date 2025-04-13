// Simple script to test the API endpoint
fetch('http://localhost/api/v1/crawl', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://daily.dev/',
    max_depth: 2,
    max_urls: 10
  })
})
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  }); 