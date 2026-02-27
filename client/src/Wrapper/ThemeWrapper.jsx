import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { useThemeStore } from '../store/themeStore.js';

const ThemeWrapper = () => {
  const { darkMode } = useThemeStore();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return <Outlet />;
};

export default ThemeWrapper;