import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  IconButton,
  Chip,
  Avatar,
  Box,
  Typography,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  useTheme,
  useMediaQuery,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationIcon from '@mui/icons-material/LocationOn';
import CakeIcon from '@mui/icons-material/Cake';
import PersonIcon from '@mui/icons-material/Person';
import { dateFormatters, nameFormatters, ageFormatters } from '../../../utils/formatters';
import { AGE_GROUPS } from '../../../utils/constants';

const PatientTable = ({
  patients = [],
  loading = false,
  pagination = {},
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  selectedPatients = [],
  onSelectionChange
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Handle menu
  const handleMenuClick = (event, patient) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedPatient(null);
  };

  // Handle selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allPatientIds = patients.map(patient => patient.id);
      onSelectionChange && onSelectionChange(allPatientIds);
    } else {
      onSelectionChange && onSelectionChange([]);
    }
  };

  const handleSelectPatient = (patientId) => {
    if (selectedPatients.includes(patientId)) {
      const newSelection = selectedPatients.filter(id => id !== patientId);
      onSelectionChange && onSelectionChange(newSelection);
    } else {
      onSelectionChange && onSelectionChange([...selectedPatients, patientId]);
    }
  };

  // Get age group styling
  const getAgeGroupChip = (age) => {
    const ageGroup = ageFormatters.getGroup(age);
    return (
      <Chip
        label={ageGroup.label}
        size="small"
        color={ageGroup.color}
        variant="outlined"
      />
    );
  };

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    onPageChange && onPageChange(newPage + 1); // MUI uses 0-based indexing
  };

  const handleRowsPerPageChange = (event) => {
    onRowsPerPageChange && onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  // Mobile card view
  if (isMobile) {
    return (
      <Box>
        {patients.map((patient) => (
          <Card key={patient.id} sx={{ mb: 2 }} onClick={() => onView && onView(patient)}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="start">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {nameFormatters.initials(patient.name)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {nameFormatters.titleCase(patient.name)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {patient.email}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={(e) => handleMenuClick(e, patient)}
                  size="small"
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>
              
              <Box mt={2} display="flex" gap={1} flexWrap="wrap">
                <Chip
                  icon={<CakeIcon />}
                  label={`${ageFormatters.fromBirthDate(patient.birthDate)} years`}
                  size="small"
                  variant="outlined"
                />
                {getAgeGroupChip(ageFormatters.fromBirthDate(patient.birthDate))}
                <Chip
                  label={dateFormatters.relative(patient.createdAt)}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              </Box>

              <Box mt={1}>
                <Typography variant="body2" color="text.secondary" noWrap>
                  <LocationIcon sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                  {patient.address}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        ))}

        {/* Pagination for mobile */}
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={(pagination.page || 1) - 1}
          onPageChange={handlePageChange}
          rowsPerPage={pagination.limit || 10}
          onRowsPerPageChange={handleRowsPerPageChange}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>
    );
  }

  // Desktop table view
  return (
    <>
      <TableContainer component={Paper} elevation={1}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedPatients.length > 0 && 
                      selectedPatients.length < patients.length
                    }
                    checked={
                      patients.length > 0 && 
                      selectedPatients.length === patients.length
                    }
                    onChange={handleSelectAll}
                  />
                </TableCell>
              )}
              <TableCell>Patient</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Age</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Registered</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          
          <TableBody>
            {loading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {selectable && <TableCell padding="checkbox" />}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar />
                      <Box>
                        <Box height={20} width={120} className="skeleton" />
                        <Box height={16} width={80} className="skeleton" mt={1} />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Box height={16} width={150} className="skeleton" /></TableCell>
                  <TableCell><Box height={16} width={60} className="skeleton" /></TableCell>
                  <TableCell><Box height={16} width={200} className="skeleton" /></TableCell>
                  <TableCell><Box height={16} width={80} className="skeleton" /></TableCell>
                  <TableCell><Box height={16} width={100} className="skeleton" /></TableCell>
                </TableRow>
              ))
            ) : patients.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={selectable ? 7 : 6} 
                  align="center" 
                  sx={{ py: 4 }}
                >
                  <PersonIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No patients found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search filters
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              patients.map((patient) => (
                <TableRow 
                  key={patient.id}
                  hover
                  sx={{ cursor: onView ? 'pointer' : 'default' }}
                  onClick={() => onView && onView(patient)}
                >
                  {selectable && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedPatients.includes(patient.id)}
                        onChange={() => handleSelectPatient(patient.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </TableCell>
                  )}
                  
                  {/* Patient name and avatar */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {nameFormatters.initials(patient.name)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {nameFormatters.titleCase(patient.name)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {patient.id.slice(-8)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Email */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {patient.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Age */}
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="body2">
                        {ageFormatters.fromBirthDate(patient.birthDate)} years
                      </Typography>
                      {getAgeGroupChip(ageFormatters.fromBirthDate(patient.birthDate))}
                    </Box>
                  </TableCell>

                  {/* Address */}
                  <TableCell>
                    <Tooltip title={patient.address}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{ maxWidth: 200 }}
                      >
                        {patient.address}
                      </Typography>
                    </Tooltip>
                  </TableCell>

                  {/* Registration date */}
                  <TableCell>
                    <Typography variant="body2">
                      {dateFormatters.toBrazilian(patient.createdAt)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {dateFormatters.relative(patient.createdAt)}
                    </Typography>
                  </TableCell>

                  {/* Actions */}
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuClick(e, patient)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.total || 0}
        page={(pagination.page || 1) - 1}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit || 10}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} of ${count}`
        }
        labelRowsPerPage="Rows per page:"
      />

      {/* Actions menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          onEdit && onEdit(selectedPatient);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Patient</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => {
          onDelete && onDelete(selectedPatient);
          handleMenuClose();
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Patient</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default PatientTable;