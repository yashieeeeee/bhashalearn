import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('bhashalearn-theme') === 'dark';
  });

  useEffect(() => {
  localStorage.setItem('bhashalearn-theme', dark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  // Force body background
  document.body.style.background = dark ? '#0F0A06' : '#FAF6F0';
  document.body.style.color = dark ? '#FAF6F0' : '#1A1208';
}, [dark]);

  const toggle = () => setDark(d => !d);

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}