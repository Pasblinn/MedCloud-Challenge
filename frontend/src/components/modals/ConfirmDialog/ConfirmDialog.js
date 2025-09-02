import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Box,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

const ConfirmDialog = ({
  open = false,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning', // 'warning', 'error', 'info', 'success'
  loading = false,
  maxWidth = 'sm',
  fullWidth = true,
  patient = null // For patient-specific dialogs
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get icon and color based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />,
          color: 'error.main',
          confirmColor: 'error'
        };
      case 'success':
        return {
          icon: <SuccessIcon sx={{ fontSize: 48, color: 'success.main' }} />,
          color: 'success.main',
          confirmColor: 'success'
        };
      case 'info':
        return {
          icon: <InfoIcon sx={{ fontSize: 48, color: 'info.main' }} />,
          color: 'info.main',
          confirmColor: 'info'
        };
      case 'warning':
      default:
        return {
          icon: <WarningIcon sx={{ fontSize: 48, color: 'warning.main' }} />,
          color: 'warning.main',
          confirmColor: 'warning'
        };
    }
  };

  const typeConfig = getTypeConfig();

  // Handle confirm
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
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
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: isMobile ? 0 : 2,
          minHeight: isMobile ? '100vh' : 'auto'
        }
      }}
    >
      {/* Header with close button */}
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" component="span">
            {title || 'Confirmation Required'}
          </Typography>
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          textAlign="center"
          py={2}
        >
          {/* Icon */}
          {typeConfig.icon}

          {/* Message */}
          <DialogContentText 
            sx={{ 
              mt: 2, 
              fontSize: '1rem',
              color: 'text.primary'
            }}
          >
            {message || 'Are you sure you want to proceed?'}
          </DialogContentText>

          {/* Patient-specific information */}
          {patient && (
            <Box 
              mt={2} 
              p={2} 
              bgcolor="grey.50" 
              borderRadius={1}
              width="100%"
            >
              <Typography variant="subtitle2" gutterBottom>
                Patient Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Name:</strong> {patient.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>Email:</strong> {patient.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <strong>ID:</strong> {patient.id}
              </Typography>
            </Box>
          )}

          {/* Warning message for destructive actions */}
          {type === 'error' && (
            <Box 
              mt={2}
              p={2}
              bgcolor="error.50"
              borderRadius={1}
              border={1}
              borderColor="error.200"
              width="100%"
            >
              <Typography 
                variant="body2" 
                color="error.main"
                fontWeight={500}
              >
                ⚠️ This action cannot be undone
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          size="large"
          fullWidth={isMobile}
        >
          {cancelText}
        </Button>
        
        <Button
          onClick={handleConfirm}
          disabled={loading}
          variant="contained"
          color={typeConfig.confirmColor}
          size="large"
          fullWidth={isMobile}
          startIcon={loading ? null : (type === 'error' ? <DeleteIcon /> : null)}
        >
          {loading ? 'Processing...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Pre-configured dialog components
export const DeletePatientDialog = ({ open, onClose, onConfirm, patient, loading }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Delete Patient"
    message={`Are you sure you want to delete ${patient?.name}? This action cannot be undone and will permanently remove all patient data.`}
    confirmText="Delete Patient"
    cancelText="Keep Patient"
    type="error"
    loading={loading}
    patient={patient}
  />
);

export const ClearDataDialog = ({ open, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Clear All Data"
    message="Are you sure you want to clear all data? This will remove all patients and cannot be undone."
    confirmText="Clear All Data"
    cancelText="Cancel"
    type="error"
    loading={loading}
  />
);

export const LogoutDialog = ({ open, onClose, onConfirm, loading }) => (
  <ConfirmDialog
    open={open}
    onClose={onClose}
    onConfirm={onConfirm}
    title="Sign Out"
    message="Are you sure you want to sign out of your account?"
    confirmText="Sign Out"
    cancelText="Stay Signed In"
    type="info"
    loading={loading}
  />
);

export default ConfirmDialog;