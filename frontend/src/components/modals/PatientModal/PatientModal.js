import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Avatar,
  Chip,
  Divider,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  Tabs,
  Tab
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import LocationIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import { dateFormatters, nameFormatters, ageFormatters } from '../../../utils/formatters';

// Tab panel component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`patient-tabpanel-${index}`}
      aria-labelledby={`patient-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

const PatientModal = ({
  open = false,
  onClose,
  patient = null,
  onEdit,
  onDelete,
  loading = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  if (!patient) return null;

  const age = ageFormatters.fromBirthDate(patient.birthDate);
  const ageGroup = ageFormatters.getGroup(age);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Handle close
  const handleClose = () => {
    if (!loading && onClose) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 600,
          maxHeight: isMobile ? '100vh' : '90vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ pb: 1, bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                width: 48,
                height: 48,
                fontSize: '1.2rem'
              }}
            >
              {nameFormatters.initials(patient.name)}
            </Avatar>
            <Box>
              <Typography variant="h6" component="div">
                {nameFormatters.titleCase(patient.name)}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Patient ID: {patient.id.slice(-8).toUpperCase()}
              </Typography>
            </Box>
          </Box>
          
          <IconButton
            onClick={handleClose}
            disabled={loading}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons="auto"
        >
          <Tab 
            label="Overview" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Details" 
            icon={<HistoryIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: 0, bgcolor: 'grey.50' }}>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            {/* Basic Info Card */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Basic Information
                  </Typography>
                  
                  <Box display="flex" flexDirection="column" gap={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Full Name
                      </Typography>
                      <Typography variant="body1">
                        {patient.name}
                      </Typography>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Email Address
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body1">
                          {patient.email}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Age & Birth Date
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <CakeIcon fontSize="small" color="action" />
                        <Typography variant="body1">
                          {age} years old
                        </Typography>
                        <Chip
                          label={ageGroup.label}
                          size="small"
                          color={ageGroup.color}
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        Born on {dateFormatters.toBrazilian(patient.birthDate)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Contact Info Card */}
            <Grid item xs={12} md={6}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <LocationIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Contact Information
                  </Typography>
                  
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Address
                    </Typography>
                    <Typography variant="body1" paragraph>
                      {patient.address}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Registration Info Card */}
            <Grid item xs={12}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    <CalendarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Registration Information
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Registered On
                        </Typography>
                        <Typography variant="body1">
                          {dateFormatters.toBrazilian(patient.createdAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dateFormatters.relative(patient.createdAt)}
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Last Updated
                        </Typography>
                        <Typography variant="body1">
                          {dateFormatters.toBrazilian(patient.updatedAt)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {dateFormatters.relative(patient.updatedAt)}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Details Tab */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  Patient Statistics
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="primary">
                        {age}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Years Old
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center" p={2}>
                      <Typography variant="h4" color="success.main">
                        {Math.floor((Date.now() - new Date(patient.createdAt)) / (1000 * 60 * 60 * 24))}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Days Registered
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Box textAlign="center" p={2}>
                      <Chip
                        label={ageGroup.label}
                        color={ageGroup.color}
                        size="large"
                        sx={{ fontSize: '1rem', py: 2 }}
                      />
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        Age Group
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 3 }} />
                
                {/* Raw Data (for development) */}
                {process.env.NODE_ENV === 'development' && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Raw Patient Data (Development Only)
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'grey.100',
                        p: 2,
                        borderRadius: 1,
                        overflow: 'auto',
                        fontSize: '0.75rem',
                        maxHeight: 200
                      }}
                    >
                      {JSON.stringify(patient, null, 2)}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </TabPanel>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 1, bgcolor: 'grey.50' }}>
        <Box display="flex" gap={1} width="100%" justifyContent="space-between">
          <Box display="flex" gap={1}>
            {onEdit && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => onEdit(patient)}
                disabled={loading}
                size="large"
              >
                Edit Patient
              </Button>
            )}
            
            {onDelete && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => onDelete(patient)}
                disabled={loading}
                size="large"
              >
                Delete
              </Button>
            )}
          </Box>
          
          <Button
            variant="text"
            onClick={handleClose}
            disabled={loading}
            size="large"
          >
            Close
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default PatientModal;