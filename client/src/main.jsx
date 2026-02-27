import { createRoot } from 'react-dom/client';
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import LoginPage from './Pages/LoginPage.jsx';
import RegisterPage from './Pages/RegisterPage.jsx';
import ForgotPasswordPage from './Pages/ForgotPasswordPage.jsx';
import ResetPasswordPage from './Pages/ResetPasswordPage.jsx';
import RequireAuth from './Protection/RequireAuth.jsx';
import RequireRole from './Protection/RequireRole.jsx';
import ThemeWrapper from './Wrapper/ThemeWrapper.jsx';
import AdminPage from './Pages/AdminPage.jsx';
import StudentPage from './Pages/StudentPage.jsx';
import TeacherPage from './Pages/TeacherPage.jsx';
import AdminUserList from './Components/AdminUserList.jsx';
import NotFoundPage from './Pages/NotFoundPage.jsx';


const router = createBrowserRouter([
  {
    element: <ThemeWrapper />,
    children: [
      { path: '/', element: <App /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot', element: <ForgotPasswordPage /> },
      { path: '/reset/:token', element: <ResetPasswordPage /> },
      { path: '/dashboard', element:<RequireAuth><RequireRole allowedRoles={['admin']}><AdminPage /></RequireRole></RequireAuth>,children:[
        {index: true, element: <Navigate to="/dashboard/users" replace />},
        {path: 'users', element: <AdminUserList />},
      ]},
      { path: '/student', element: <RequireAuth><RequireRole allowedRoles={['user', 'admin']}><StudentPage /></RequireRole></RequireAuth> },
      { path: '/teacher', element: <RequireAuth><RequireRole allowedRoles={['user', 'admin']}><TeacherPage /></RequireRole></RequireAuth> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
  </GoogleOAuthProvider>
)