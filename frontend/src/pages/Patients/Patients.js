import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Alert,
  Fab,
  Dialog,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Avatar,
  Chip,
  useTheme,
  useMediaQuery,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  GetApp as ExportIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon
} from '@mui/icons-material';

// Components
import PatientForm from '../../components/forms/PatientForm/PatientForm';
import SearchForm from '../../components/forms/SearchForm/SearchForm';
import { usePatients } from '../../contexts/PatientContext';

const Patients = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Use PatientContext for data management
  const {
    patients,
    loading,
    error,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
    clearError,
    filters,
    updateFilters
  } = usePatients();
  
  // Modal states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // The PatientContext now auto-loads patients, so we don't need manual initialization here

  // Check URL params for actions
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'create' || action === 'add') {
      setShowCreateForm(true);
      // Remove the action parameter
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  // Calculate age from birth date
  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  };

  // Get age group
  const getAgeGroup = (birthDate) => {
    const age = calculateAge(birthDate);
    if (age === 'N/A') return { label: 'Unknown', color: 'default' };
    if (age < 18) return { label: 'Menor', color: 'info' };
    if (age >= 65) return { label: 'Idoso', color: 'warning' };
    return { label: 'Adulto', color: 'success' };
  };

  // Handle search/filter changes
  const handleFiltersChange = (newFilters) => {
    updateFilters(newFilters);
  };

  // Handle patient actions
  const handleCreatePatient = async (patientData) => {
    try {
      await createPatient(patientData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Failed to create patient:', error);
    }
  };

  const handleEditPatient = (patient) => {
    setSelectedPatient(patient);
    setShowEditForm(true);
  };

  const handleUpdatePatient = async (patientData) => {
    try {
      await updatePatient(selectedPatient.id, patientData);
      setShowEditForm(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error('Failed to update patient:', error);
    }
  };

  const handleDeletePatient = async (patient) => {
    if (window.confirm(`Are you sure you want to delete ${patient.name}?`)) {
      try {
        await deletePatient(patient.id);
      } catch (error) {
        console.error('Failed to delete patient:', error);
      }
    }
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(patients, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'patients.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchPatients();
  };

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box mb={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Patients
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage patient records and information
            </Typography>
          </Box>

          {!isMobile && (
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={loading}
              >
                Refresh
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<ExportIcon />}
                onClick={handleExport}
              >
                Export
              </Button>
              
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateForm(true)}
                size="large"
              >
                Add Patient
              </Button>
            </Box>
          )}
        </Box>

        {/* Statistics bar */}
        <Box display="flex" gap={2} flexWrap="wrap">
          <Typography variant="body2" color="text.secondary">
            Showing {patients.length} patients
          </Typography>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {/* Search Form */}
      <Box mb={3}>
        <SearchForm
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
          loading={loading}
        />
      </Box>

      {/* Patients Table */}
      <Paper elevation={1}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && patients.length === 0 ? (
                // Loading skeleton
                Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={2}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Skeleton width={120} height={24} />
                      </Box>
                    </TableCell>
                    <TableCell><Skeleton width={150} height={24} /></TableCell>
                    <TableCell><Skeleton width={60} height={24} /></TableCell>
                    <TableCell><Skeleton width={200} height={24} /></TableCell>
                    <TableCell>
                      <Box display="flex" gap={1} justifyContent="center">
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton variant="circular" width={32} height={32} />
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              ) : patients.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={5}>
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No patients found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try adjusting your search filters or add your first patient.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                // Patient rows
                patients.map((patient) => {
                  const age = calculateAge(patient.birthDate);
                  const ageGroup = getAgeGroup(patient.birthDate);
                  
                  return (
                    <TableRow key={patient.id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar 
                            sx={{ 
                              bgcolor: 'primary.main',
                              width: 40,
                              height: 40,
                              fontSize: '0.875rem'
                            }}
                          >
                            {patient.name ? patient.name.charAt(0).toUpperCase() : 'P'}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="medium">
                              {patient.name || 'Unnamed Patient'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {patient.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography variant="body2">
                          {patient.email}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box display="flex" flexDirection="column" gap={0.5}>
                          <Typography variant="body2" fontWeight="medium">
                            {age !== 'N/A' ? `${age} years` : 'N/A'}
                          </Typography>
                          <Chip 
                            label={ageGroup.label} 
                            size="small" 
                            color={ageGroup.color}
                            variant="outlined"
                          />
                        </Box>
                      </TableCell>
                      
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                          title={patient.address}
                        >
                          {patient.address || 'No address provided'}
                        </Typography>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditPatient(patient)}
                            title="Edit Patient"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePatient(patient)}
                            title="Delete Patient"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Floating Action Button (Mobile) */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add patient"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000
          }}
          onClick={() => setShowCreateForm(true)}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Create Patient Form */}
      <Dialog
        open={showCreateForm}
        onClose={() => !loading && setShowCreateForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { m: 2 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <PatientForm
            onSubmit={handleCreatePatient}
            onCancel={() => setShowCreateForm(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Patient Form */}
      <Dialog
        open={showEditForm}
        onClose={() => !loading && setShowEditForm(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { m: 2 }
        }}
      >
        <DialogContent sx={{ p: 0 }}>
          <PatientForm
            patient={selectedPatient}
            onSubmit={handleUpdatePatient}
            onCancel={() => {
              setShowEditForm(false);
              setSelectedPatient(null);
            }}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default Patients;