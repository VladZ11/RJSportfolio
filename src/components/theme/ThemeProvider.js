import { createTheme, ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import React, { useState, useMemo } from 'react';

// Improved theme creation with explicit background colors
const getTheme = (mode) => createTheme({
  palette: {
    type: mode,
    background: {
      default: mode === 'light' ? '#ffffff' : '#121212',
      paper: mode === 'light' ? '#f5f5f5' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#000000' : '#ffffff',
      secondary: mode === 'light' ? '#3d3d3d' : '#b0b0b0',
    }
  },
  overrides: {
    MuiCssBaseline: {
      '@global': {
        body: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#121212',
          transition: 'background-color 0.3s ease',
        },
      },
    },
  },
  // Keep your existing typography settings
  typography: {
    // ...existing typography...
  }
});

export const ThemeContext = React.createContext({
  theme: 'dark', // Changed from themeMode to theme
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Changed from themeMode to theme

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Use theme instead of themeMode
  const muiTheme = useMemo(() => getTheme(theme), [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
