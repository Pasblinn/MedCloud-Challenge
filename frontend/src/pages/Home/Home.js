import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Chip,
  LinearProgress,
  useTheme
} from '@mui/material';
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  BarChart as StatsIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  Elderly as ElderlyIcon,
  Face as ChildIcon,
  Person as AdultIcon
} from '@mui/icons-material';
import { usePatientStats } from '../../hooks/usePatients';
import { numberFormatters } from '../../utils/formatters';
import Loading from '../../components/common/Loading/Loading';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { data: stats, isLoading, error } = usePatientStats();

  // Quick actions
  const quickActions = [
    {
      title: 'Add New Patient',
      description: 'Register a new patient in the system',
      icon: <PersonAddIcon />,
      color: 'primary',
      action: () => navigate('/patients?action=create')
    },
    {
      title: 'View All Patients',
      description: 'Browse and manage existing patients',
      icon: <PeopleIcon />,
      color: 'info',
      action: () => navigate('/patients')
    },
    {
      title: 'View Statistics',
      description: 'Analyze patient demographics and trends',
      icon: <StatsIcon />,
      color: 'success',
      action: () => navigate('/patients?tab=stats')
    }
  ];

  // Render statistics cards
  const renderStatsCards = () => {
    if (isLoading) {
      return (
        <Grid container spacing={3}>
          {[...Array(4)].map((_, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card>
                <CardContent>
                  <Box className="skeleton" height={40} mb={2} />
                  <Box className="skeleton" height={60} mb={1} />
                  <Box className="skeleton" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (error || !stats) {
      return (
        <Card>
          <CardContent>
            <Typography variant="h6" color="error" align="center">
              Unable to load statistics
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              Please try again later
            </Typography>
          </CardContent>
        </Card>
      );
    }

    const statCards = [
      {
        title: 'Total Patients',
        value: numberFormatters.integer(stats.total || 0),
        icon: <GroupIcon sx={{ fontSize: 40 }} />,
        color: 'primary.main',
        progress: 100
      },
      {
        title: 'Adults (18-64)',
        value: numberFormatters.integer(stats.adults || 0),
        subtitle: `${stats.demographics?.adultPercentage || 0}% of total`,
        icon: <AdultIcon sx={{ fontSize: 40 }} />,
        color: 'success.main',
        progress: parseFloat(stats.demographics?.adultPercentage || 0)
      },
      {
        title: 'Minors (0-17)',
        value: numberFormatters.integer(stats.minors || 0),
        subtitle: `${stats.demographics?.minorPercentage || 0}% of total`,
        icon: <ChildIcon sx={{ fontSize: 40 }} />,
        color: 'info.main',
        progress: parseFloat(stats.demographics?.minorPercentage || 0)
      },
      {
        title: 'Seniors (65+)',
        value: numberFormatters.integer(stats.seniors || 0),
        subtitle: `${stats.demographics?.seniorPercentage || 0}% of total`,
        icon: <ElderlyIcon sx={{ fontSize: 40 }} />,
        color: 'warning.main',
        progress: parseFloat(stats.demographics?.seniorPercentage || 0)
      }
    ];

    return (
      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              elevation={2}
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[4]
                }
              }}
            >
              <CardContent sx={{ pb: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <TrendingUpIcon color="success" />
                </Box>

                <Typography variant="h4" component="div" gutterBottom>
                  {stat.value}
                </Typography>

                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {stat.title}
                </Typography>

                {stat.subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {stat.subtitle}
                  </Typography>
                )}

                {stat.progress !== undefined && stat.progress < 100 && (
                  <Box mt={2}>
                    <LinearProgress
                      variant="determinate"
                      value={stat.progress}
                      sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color
                        }
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Container maxWidth="xl">
      {/* Hero Section */}
      <Box mb={4}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontWeight: 700
          }}
        >
          Patient Management System
        </Typography>
        
        <Typography 
          variant="h6" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: 600 }}
        >
          Manage patient records efficiently with our modern healthcare management solution. 
          Add, edit, search, and analyze patient data with ease.
        </Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <Chip 
            label="CRUD Operations" 
            color="primary" 
            variant="outlined"
          />
          <Chip 
            label="Real-time Search" 
            color="info" 
            variant="outlined"
          />
          <Chip 
            label="Data Analytics" 
            color="success" 
            variant="outlined"
          />
          <Chip 
            label="Responsive Design" 
            color="warning" 
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Statistics Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          📊 Patient Statistics
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Overview of your patient database
        </Typography>

        {renderStatsCards()}

        {stats && stats.averageAge && (
          <Box mt={3} textAlign="center">
            <Card elevation={1} sx={{ display: 'inline-block', px: 4, py: 2 }}>
              <Typography variant="h6" color="primary">
                Average Patient Age
              </Typography>
              <Typography variant="h3" component="div">
                {stats.averageAge} years
              </Typography>
            </Card>
          </Box>
        )}
      </Box>

      {/* Quick Actions Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          🚀 Quick Actions
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Get started with common tasks
        </Typography>

        <Grid container spacing={3}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                elevation={2}
                sx={{ 
                  height: '100%',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${action.color}.main`,
                      mb: 2,
                      width: 56,
                      height: 56
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  
                  <Typography variant="h6" gutterBottom>
                    {action.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {action.description}
                  </Typography>
                </CardContent>
                
                <CardActions>
                  <Button
                    fullWidth
                    variant="contained"
                    color={action.color}
                    onClick={action.action}
                    size="large"
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Features Section */}
      <Box mb={4}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          ✨ Key Features
        </Typography>

        <Grid container spacing={2}>
          {[
            'Complete CRUD operations',
            'Advanced search and filtering',
            'Real-time data validation',
            'Responsive design',
            'Data export capabilities', 
            'Performance optimized'
          ].map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Chip 
                label={feature}
                variant="outlined"
                sx={{ width: '100%', justifyContent: 'flex-start', py: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default Home;