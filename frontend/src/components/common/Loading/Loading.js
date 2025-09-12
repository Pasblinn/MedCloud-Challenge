import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  LinearProgress,
  Skeleton,
  Stack
} from '@mui/material';

// Main loading component
const Loading = ({ 
  type = 'circular', 
  size = 'medium', 
  message = 'Loading...', 
  fullHeight = true,
  color = 'primary'
}) => {
  const getSizeValue = () => {
    switch (size) {
      case 'small': return 24;
      case 'large': return 64;
      case 'medium':
      default: return 40;
    }
  };

  const renderCircularLoader = () => (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight={fullHeight ? '50vh' : 'auto'}
      p={3}
    >
      <CircularProgress 
        size={getSizeValue()} 
        color={color}
        sx={{ mb: 2 }}
      />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          textAlign="center"
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  const renderLinearLoader = () => (
    <Box width="100%" p={2}>
      <LinearProgress color={color} />
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary" 
          textAlign="center"
          mt={1}
        >
          {message}
        </Typography>
      )}
    </Box>
  );

  switch (type) {
    case 'linear':
      return renderLinearLoader();
    case 'circular':
    default:
      return renderCircularLoader();
  }
};

// Skeleton loader for table rows
export const TableRowSkeleton = ({ columns = 4, rows = 5 }) => (
  <Stack spacing={1}>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <Box key={rowIndex} display="flex" gap={2} alignItems="center">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={colIndex}
            variant="rectangular"
            width={colIndex === 0 ? 60 : 120}
            height={32}
            sx={{ borderRadius: 1 }}
          />
        ))}
      </Box>
    ))}
  </Stack>
);

// Skeleton loader for cards
export const CardSkeleton = ({ count = 3 }) => (
  <Stack spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Box key={index} p={2} border={1} borderColor="grey.200" borderRadius={2}>
        <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={60} />
      </Box>
    ))}
  </Stack>
);

// Page loading overlay
export const PageLoading = ({ message = 'Loading page...' }) => (
  <Box
    position="fixed"
    top={0}
    left={0}
    right={0}
    bottom={0}
    display="flex"
    alignItems="center"
    justifyContent="center"
    bgcolor="rgba(255, 255, 255, 0.9)"
    zIndex={9999}
  >
    <Box textAlign="center">
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {message}
      </Typography>
    </Box>
  </Box>
);

// Button loading state
export const ButtonLoading = ({ loading, children, ...props }) => (
  <Box position="relative" display="inline-block">
    {children}
    {loading && (
      <CircularProgress
        size={24}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: '-12px',
          marginLeft: '-12px',
        }}
      />
    )}
  </Box>
);

export default Loading;