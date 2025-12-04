import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'white' | 'lcars';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>('white');

  const toggleTheme = () => {
    setTheme(prev => prev === 'white' ? 'lcars' : 'white');
  };

  useEffect(() => {
    if (theme === 'lcars') {
      document.body.classList.add('lcars');
    } else {
      document.body.classList.remove('lcars');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
