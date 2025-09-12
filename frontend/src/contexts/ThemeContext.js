import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { STORAGE_KEYS, THEME_CONFIG } from '../utils/constants';

// Create context
const ThemeContext = createContext();

// Custom hook to use theme context
export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeContextProvider');
  }
  return context;
};

// Base theme configuration
const createAppTheme = (mode = 'light') => {
  const isLight = mode === 'light';
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: THEME_CONFIG.COLORS.PRIMARY,
        light: isLight ? '#42a5f5' : '#64b5f6',
        dark: isLight ? '#1565c0' : '#0d47a1',
        contrastText: '#ffffff'
      },
      secondary: {
        main: THEME_CONFIG.COLORS.SECONDARY,
        light: isLight ? '#ff5983' : '#ff6090',
        dark: isLight ? '#9a0036' : '#880e4f'
      },
      success: {
        main: isLight ? '#2e7d32' : '#4caf50',
        light: isLight ? '#4caf50' : '#66bb6a',
        dark: isLight ? '#1b5e20' : '#2e7d32'
      },
      warning: {
        main: isLight ? '#ed6c02' : '#ff9800',
        light: isLight ? '#ff9800' : '#ffb74d',
        dark: isLight ? '#e65100' : '#f57c00'
      },
      error: {
        main: isLight ? '#d32f2f' : '#f44336',
        light: isLight ? '#ef5350' : '#e57373',
        dark: isLight ? '#c62828' : '#d32f2f'
      },
      info: {
        main: isLight ? '#0288d1' : '#2196f3',
        light: isLight ? '#03a9f4' : '#64b5f6',
        dark: isLight ? '#01579b' : '#1976d2'
      },
      background: {
        default: isLight ? '#fafafa' : '#0a0a0a',
        paper: isLight ? '#ffffff' : '#1a1a1a'
      },
      text: {
        primary: isLight ? '#212121' : '#ffffff',
        secondary: isLight ? '#757575' : '#b0b0b0'
      },
      divider: isLight ? '#e0e0e0' : '#333333',
      action: {
        hover: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
        selected: isLight ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.12)'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
        lineHeight: 1.4
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
        lineHeight: 1.4
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.5
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.6
      },
      button: {
        textTransform: 'none',
        fontWeight: 500
      }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: isLight ? '#fafafa' : '#0a0a0a',
            transition: 'background-color 0.3s ease-in-out'
          }
        }
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? THEME_CONFIG.COLORS.PRIMARY : '#1a1a1a',
            color: '#ffffff',
            boxShadow: isLight 
              ? '0px 2px 8px rgba(0, 0, 0, 0.08)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.5)'
          }
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 24px',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)'
            }
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
            boxShadow: isLight 
              ? '0px 2px 8px rgba(0, 0, 0, 0.08)' 
              : '0px 2px 8px rgba(0, 0, 0, 0.3)',
            border: isLight ? 'none' : '1px solid rgba(255, 255, 255, 0.12)'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
            borderRadius: 12
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          head: {
            backgroundColor: isLight ? '#f5f5f5' : '#2a2a2a',
            color: isLight ? '#212121' : '#ffffff',
            fontWeight: 600
          },
          body: {
            borderBottom: `1px solid ${isLight ? '#e0e0e0' : '#333333'}`
          }
        }
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
              '& fieldset': {
                borderColor: isLight ? '#e0e0e0' : '#333333'
              },
              '&:hover fieldset': {
                borderColor: THEME_CONFIG.COLORS.PRIMARY
              }
            }
          }
        }
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
            borderRight: `1px solid ${isLight ? '#e0e0e0' : '#333333'}`
          }
        }
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            backgroundColor: isLight ? '#ffffff' : '#1a1a1a',
            borderRadius: 16
          }
        }
      }
    }
  });
};

// Theme context provider
export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Get saved theme or default to light
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_MODE);
    return saved || THEME_CONFIG.MODES.LIGHT;
  });

  const [theme, setTheme] = useState(() => createAppTheme(themeMode));

  // Update theme when mode changes
  useEffect(() => {
    const newTheme = createAppTheme(themeMode);
    setTheme(newTheme);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.THEME_MODE, themeMode);
  }, [themeMode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setThemeMode(prev => 
      prev === THEME_CONFIG.MODES.LIGHT 
        ? THEME_CONFIG.MODES.DARK 
        : THEME_CONFIG.MODES.LIGHT
    );
  };

  // Set specific theme mode
  const setMode = (mode) => {
    if (Object.values(THEME_CONFIG.MODES).includes(mode)) {
      setThemeMode(mode);
    }
  };

  const contextValue = {
    theme,
    themeMode,
    toggleTheme,
    setMode,
    isDarkMode: themeMode === THEME_CONFIG.MODES.DARK,
    isLightMode: themeMode === THEME_CONFIG.MODES.LIGHT
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};