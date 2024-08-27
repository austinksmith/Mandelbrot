const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// Middleware to set COOP and COEP headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Route for serving index.html manually
app.get('/', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'index.html');
  
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Server Error');
      return;
    }
    res.setHeader('Content-Type', 'text/html');
    res.send(data);
  });
});

// Route for serving static files manually
app.get('/static/*', (req, res) => {
  const filePath = path.join(__dirname, 'public', req.params[0]);
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(404).send('File Not Found');
      return;
    }

    // Determine the content type based on file extension
    let contentType;
    if (filePath.endsWith('.js')) {
      contentType = 'application/javascript';
    } else if (filePath.endsWith('.css')) {
      contentType = 'text/css';
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      contentType = 'image/jpeg';
    } else if (filePath.endsWith('.png')) {
      contentType = 'image/png';
    } else if (filePath.endsWith('.svg')) {
      contentType = 'image/svg+xml';
    } else {
      contentType = 'text/plain'; // Default content type
    }

    res.setHeader('Content-Type', contentType);
    res.send(data);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
