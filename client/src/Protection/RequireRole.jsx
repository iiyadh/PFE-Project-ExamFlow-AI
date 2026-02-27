import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore.js";


const RequireRole = ({ children , allowedRoles }) => {

  const { role } = useAuthStore();
  console.log("User role:", role);

  if (!allowedRoles.includes(role)) {
    if (role === 'user') {
      return <Navigate to="/student" replace />;
    }
  }

  return children;
};

export default RequireRole;