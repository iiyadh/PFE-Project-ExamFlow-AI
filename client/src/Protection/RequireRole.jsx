import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";


const RequireRole = ({ children , allowedRoles }) => {

  const { role } = useAuthStore();

  if (!allowedRoles.includes(role)) {
    if (role === 'teacher') {
      return <Navigate to="/teacher" replace />;
    }
    if (role === 'student') {
      return <Navigate to="/student" replace />;
    }
    if (role === 'user') {
      return <Navigate to="/home" replace />;
    }
  }

  return children;
};

export default RequireRole;