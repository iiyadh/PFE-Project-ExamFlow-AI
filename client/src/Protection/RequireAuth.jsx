import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";
import FullLogolight from '../assets/FullLogolight.png';
import '../App.css';
import { useThemeStore } from "../store/themeStore.js";

const RequireAuth = ({ children }) => {
  const { checkAuth , isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const { darkMode } = useThemeStore();


  useEffect(() => {
    const runCheck = async () => {
      try {
        const res = await checkAuth();
        setResult(res.data);
      } finally {
        setLoading(false);
      }
    };
    runCheck();
  }, [checkAuth]);


  const Logo = () =>{
    if (darkMode) {
      return <img src={FullLogolight} alt="Logo" className="h-100 w-auto animate-[logoPulse_2s_ease-in-out_infinite]"
      style={
        { filter: 'invert(1) brightness(1.1)'}
      }/>
    }
    return <img src={FullLogolight} alt="Logo" className="h-100 w-auto animate-[logoPulse_2s_ease-in-out_infinite]"/>
  }

  if (loading)
  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <Logo />
        </div>
        <div className="flex space-x-2">
          <span className="h-2 w-2 rounded-full bg-primary animate-ping [animation-delay:0ms]" />
          <span className="h-2 w-2 rounded-full bg-accent animate-ping [animation-delay:333ms]" />
          <span className="h-2 w-2 rounded-full bg-ai animate-ping [animation-delay:666ms]" />
        </div>

      </div>
    </div>
  )

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if ( result && result.status && result.status === 'BANNED') {
      return <Navigate to="/banned" replace />;
    }

    if (result && result.status && result.status === 'INACTIVE') {
      return <Navigate to="/suspended" replace />;
    }

    return children;
};

export default RequireAuth;