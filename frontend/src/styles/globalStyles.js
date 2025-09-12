import { GlobalStyles } from '@mui/material';

const globalStyles = (
  <GlobalStyles
    styles={(theme) => ({
      // Reset and base styles
      '*': {
        boxSizing: 'border-box'
      },
      
      html: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        height: '100%',
        width: '100%'
      },
      
      body: {
        height: '100%',
        width: '100%',
        margin: 0,
        padding: 0,
        fontFamily: theme.typography.fontFamily,
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        lineHeight: 1.5
      },
      
      '#root': {
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column'
      },

      // Custom utility classes
      '.full-height': {
        height: '100vh'
      },
      
      '.full-width': {
        width: '100%'
      },
      
      '.flex-center': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      },
      
      '.flex-column': {
        display: 'flex',
        flexDirection: 'column'
      },
      
      '.flex-row': {
        display: 'flex',
        flexDirection: 'row'
      },
      
      '.flex-wrap': {
        flexWrap: 'wrap'
      },
      
      '.flex-grow': {
        flexGrow: 1
      },
      
      '.text-center': {
        textAlign: 'center'
      },
      
      '.text-left': {
        textAlign: 'left'
      },
      
      '.text-right': {
        textAlign: 'right'
      },
      
      '.cursor-pointer': {
        cursor: 'pointer'
      },
      
      // Animations
      '.fade-in': {
        animation: 'fadeIn 0.3s ease-in-out'
      },
      
      '.slide-in': {
        animation: 'slideIn 0.3s ease-in-out'
      },
      
      '@keyframes fadeIn': {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      
      '@keyframes slideIn': {
        from: { 
          opacity: 0, 
          transform: 'translateY(20px)' 
        },
        to: { 
          opacity: 1, 
          transform: 'translateY(0)' 
        }
      },
      
      // Loading states
      '.skeleton': {
        backgroundColor: theme.palette.grey[200],
        borderRadius: theme.shape.borderRadius,
        animation: 'skeleton-loading 1.2s ease-in-out infinite'
      },
      
      '@keyframes skeleton-loading': {
        '0%': { opacity: 1 },
        '50%': { opacity: 0.4 },
        '100%': { opacity: 1 }
      },
      
      // Custom scrollbar
      '.custom-scrollbar': {
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.grey[400]} transparent`,
        
        '&::-webkit-scrollbar': {
          width: 8,
          height: 8
        },
        
        '&::-webkit-scrollbar-track': {
          background: 'transparent'
        },
        
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.grey[400],
          borderRadius: 4,
          border: '2px solid transparent',
          backgroundClip: 'content-box',
          
          '&:hover': {
            backgroundColor: theme.palette.grey[600]
          }
        }
      },
      
      // Form styles
      '.form-container': {
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(2)
      },
      
      '.form-row': {
        display: 'flex',
        gap: theme.spacing(2),
        
        [theme.breakpoints.down('sm')]: {
          flexDirection: 'column'
        }
      },
      
      '.form-actions': {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: theme.spacing(1),
        marginTop: theme.spacing(3),
        
        [theme.breakpoints.down('sm')]: {
          justifyContent: 'stretch',
          flexDirection: 'column'
        }
      },
      
      // Card styles
      '.stats-card': {
        padding: theme.spacing(3),
        textAlign: 'center',
        transition: 'all 0.2s ease-in-out',
        
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      },
      
      '.info-card': {
        padding: theme.spacing(2),
        marginBottom: theme.spacing(2),
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.custom?.borderRadius?.medium || 8
      },
      
      // Table styles
      '.data-table': {
        '& .MuiTableHead-root': {
          backgroundColor: theme.palette.grey[50]
        },
        
        '& .MuiTableRow-root': {
          '&:hover': {
            backgroundColor: theme.palette.action.hover
          }
        },
        
        '& .MuiTableCell-root': {
          borderBottom: `1px solid ${theme.palette.divider}`
        }
      },
      
      // Status indicators
      '.status-active': {
        color: theme.palette.success.main,
        fontWeight: 500
      },
      
      '.status-inactive': {
        color: theme.palette.error.main,
        fontWeight: 500
      },
      
      '.status-pending': {
        color: theme.palette.warning.main,
        fontWeight: 500
      },
      
      // Age groups
      '.age-minor': {
        color: theme.palette.info.main
      },
      
      '.age-adult': {
        color: theme.palette.success.main
      },
      
      '.age-senior': {
        color: theme.palette.warning.main
      },
      
      // Print styles
      '@media print': {
        body: {
          backgroundColor: 'white !important',
          color: 'black !important'
        },
        
        '.no-print': {
          display: 'none !important'
        },
        
        '.print-break': {
          pageBreakBefore: 'always'
        },
        
        '.print-break-inside-avoid': {
          pageBreakInside: 'avoid'
        }
      },
      
      // Mobile specific
      [theme.breakpoints.down('sm')]: {
        '.mobile-hidden': {
          display: 'none'
        },
        
        '.mobile-full-width': {
          width: '100%'
        },
        
        '.mobile-text-center': {
          textAlign: 'center'
        }
      },
      
      // Desktop specific
      [theme.breakpoints.up('md')]: {
        '.desktop-only': {
          display: 'block'
        }
      },
      
      [theme.breakpoints.down('md')]: {
        '.desktop-only': {
          display: 'none'
        }
      },
      
      // Focus styles
      '.focus-visible': {
        outline: `2px solid ${theme.palette.primary.main}`,
        outlineOffset: 2
      },
      
      // Error states
      '.error-text': {
        color: theme.palette.error.main,
        fontSize: '0.875rem',
        marginTop: theme.spacing(0.5)
      },
      
      '.success-text': {
        color: theme.palette.success.main,
        fontSize: '0.875rem',
        marginTop: theme.spacing(0.5)
      },
      
      // Loading overlay
      '.loading-overlay': {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      },
      
      // Backdrop
      '.backdrop': {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    })}
  />
);

export default globalStyles;