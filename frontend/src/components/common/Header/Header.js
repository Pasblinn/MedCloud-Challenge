import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  BarChart as StatsIcon,
  Brightness4,
  Brightness7,
  GetApp as ExportIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { usePatientStats } from '../../../hooks/usePatients';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { toggleTheme, isDarkMode } = useAppTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  
  // Get patient statistics
  const { data: stats } = usePatientStats();

  // Navigation items
  const navigationItems = [
    {
      label: 'Home',
      path: '/',
      icon: <HomeIcon />
    },
    {
      label: 'Patients',
      path: '/patients',
      icon: <PeopleIcon />
    },
    {
      label: 'Statistics',
      path: '/statistics',
      icon: <StatsIcon />
    }
  ];

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  // Handle export menu
  const handleExportClick = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExport = (format) => {
    // Export functionality would be implemented here
    console.log(`Exporting in ${format} format`);
    handleExportClose();
  };

  // Mobile drawer content
  const drawerContent = (
    <Box sx={{ width: 280, pt: 2 }}>
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="h6" color="primary">
          Patient Management
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Healthcare Management System
        </Typography>
      </Box>
      
      <Divider />
      
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Statistics in mobile drawer */}
      {stats && (
        <Box sx={{ px: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Quick Stats
          </Typography>
          <Box display="flex" flexDirection="column" gap={1}>
            <Chip 
              size="small" 
              label={`${stats.total} Total Patients`}
              color="primary"
              variant="outlined"
            />
            <Chip 
              size="small" 
              label={`Avg Age: ${stats.averageAge || 0} years`}
              color="info"
              variant="outlined"
            />
          </Box>
        </Box>
      )}
    </Box>
  );

  return (
    <>
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={() => setMobileMenuOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo and title */}
          <Box 
            display="flex" 
            alignItems="center" 
            sx={{ cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            <PeopleIcon sx={{ mr: 1, fontSize: 28 }} />
            <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
              {isMobile ? 'PMS' : 'Patient Management'}
            </Typography>
          </Box>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
              {navigationItems.map((item) => (
                <Button
                  key={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  variant={location.pathname === item.path ? 'outlined' : 'text'}
                  sx={{ 
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    '&.MuiButton-outlined': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)'
                    }
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Statistics chips */}
          {!isMobile && stats && (
            <Box display="flex" gap={1} mr={2}>
              <Chip 
                size="small" 
                label={`${stats.total} Patients`}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
              <Chip 
                size="small" 
                label={`Avg: ${stats.averageAge || 0}y`}
                sx={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white'
                }}
              />
            </Box>
          )}

          {/* Action buttons */}
          <Box display="flex" alignItems="center" gap={1}>
            {/* Add patient button */}
            <Tooltip title="Add New Patient">
              <IconButton
                color="inherit"
                onClick={() => navigate('/patients?action=create')}
              >
                <AddIcon />
              </IconButton>
            </Tooltip>

            {/* Export menu */}
            <Tooltip title="Export Data">
              <IconButton
                color="inherit"
                onClick={handleExportClick}
              >
                <ExportIcon />
              </IconButton>
            </Tooltip>

            {/* Theme toggle */}
            <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}>
              <IconButton color="inherit" onClick={toggleTheme}>
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: 'background.default'
          }
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Export menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleExport('json')}>
          Export as JSON
        </MenuItem>
        <MenuItem onClick={() => handleExport('csv')}>
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          Export as PDF
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;