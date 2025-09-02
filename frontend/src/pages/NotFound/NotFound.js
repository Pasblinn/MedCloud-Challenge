import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  useTheme
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';

const NotFound = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToPatients = () => {
    navigate('/patients');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <>
      <Helmet>
        <title>404 - Page Not Found | Patient Management System</title>
        <meta name="description" content="The page you're looking for doesn't exist." />
      </Helmet>

      <Container maxWidth="md">
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="70vh"
          textAlign="center"
        >
          <Paper
            elevation={4}
            sx={{
              p: 6,
              borderRadius: 4,
              background: `linear-gradient(135deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            {/* 404 Number */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '8rem', md: '12rem' },
                fontWeight: 'bold',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                lineHeight: 0.8,
                mb: 2
              }}
            >
              404
            </Typography>

            {/* Error Message */}
            <Typography variant="h4" color="text.primary" gutterBottom>
              Oops! Page Not Found
            </Typography>

            <Typography 
              variant="h6" 
              color="text.secondary" 
              paragraph
              sx={{ maxWidth: 500, mx: 'auto' }}
            >
              The page you're looking for doesn't exist or has been moved. 
              Don't worry, let's get you back on track!
            </Typography>

            {/* Search Icon */}
            <SearchIcon 
              sx={{ 
                fontSize: 60, 
                color: theme.palette.grey[400], 
                my: 3 
              }} 
            />

            {/* Action Buttons */}
            <Box 
              display="flex" 
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={2} 
              justifyContent="center"
              mt={4}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                sx={{ minWidth: 160 }}
              >
                Go Home
              </Button>

              <Button
                variant="outlined"
                size="large"
                startIcon={<PeopleIcon />}
                onClick={handleGoToPatients}
                sx={{ minWidth: 160 }}
              >
                View Patients
              </Button>

              <Button
                variant="text"
                size="large"
                startIcon={<ArrowBackIcon />}
                onClick={handleGoBack}
                sx={{ minWidth: 160 }}
              >
                Go Back
              </Button>
            </Box>

            {/* Help Text */}
            <Box mt={4} p={3} bgcolor="grey.50" borderRadius={2}>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                💡 Quick Navigation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • <strong>Home:</strong> Dashboard and overview<br/>
                • <strong>Patients:</strong> Manage patient records<br/>
                • <strong>Go Back:</strong> Return to the previous page
              </Typography>
            </Box>

            {/* Additional Info */}
            <Typography 
              variant="caption" 
              color="text.secondary"
              display="block"
              mt={3}
            >
              Error Code: 404 | Patient Management System
            </Typography>
          </Paper>

          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              left: '10%',
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: `${theme.palette.primary.main}10`,
              zIndex: -1
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '15%',
              right: '15%',
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: `${theme.palette.secondary.main}08`,
              zIndex: -1
            }}
          />
        </Box>
      </Container>
    </>
  );
};

export default NotFound;