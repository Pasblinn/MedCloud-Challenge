import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';

const TestConnection = () => {
  const [status, setStatus] = useState('testing');
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    setApiUrl(process.env.REACT_APP_API_URL || 'http://localhost:3001/api');
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setStatus('testing');
      setError(null);
      
      const url = `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/health`;
      console.log('Testing connection to:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Connection successful:', data);
      setStatus('success');
    } catch (err) {
      console.error('Connection failed:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Connection Test
      </Typography>
      
      <Typography variant="body1" gutterBottom>
        API URL: {apiUrl}
      </Typography>
      
      {status === 'testing' && (
        <Box display="flex" alignItems="center" gap={2}>
          <CircularProgress size={20} />
          <Typography>Testing connection...</Typography>
        </Box>
      )}
      
      {status === 'success' && (
        <Alert severity="success">
          ✅ Successfully connected to backend!
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert severity="error">
          ❌ Connection failed: {error}
        </Alert>
      )}
      
      <Button 
        variant="contained" 
        onClick={testConnection}
        sx={{ mt: 2 }}
      >
        Test Again
      </Button>
    </Box>
  );
};

export default TestConnection;