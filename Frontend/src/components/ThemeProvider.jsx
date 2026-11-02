import { useEffect, useMemo, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { ThemeContext, useTheme } from './themeContext';

const getInitialTheme = () => {
  const savedTheme = window.localStorage.getItem('codearena-theme');
  return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('codearena-theme', theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    toggleTheme: () => setTheme((currentTheme) => currentTheme === 'dark' ? 'light' : 'dark')
  }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const Icon = theme === 'dark' ? Sun : Moon;
  return (
    <button className={`icon-button ${className}`} type="button" onClick={toggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
      <Icon size={16} />
    </button>
  );
}
