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
import CoursesComp from './Components/CoursesComp.jsx';
import ClassComp from './Components/ClassComp.jsx';
import ModuleViewer from './Components/Moduleviewer.jsx';
import UserPage from './Pages/UserPage.jsx';
import UserOrientationComp from './Components/UserOrientationComp.jsx';
import GenerateQuestions from './Components/GenerateQuestions.jsx';
import GeneratedPreview from './Components/GeneratedPreview.jsx';
import GenerationProgress from './Components/GenerationProgress.jsx';
import QuestionBankPage from './Pages/QuestionBankPage.jsx';
import ExamCalendarPage from './Pages/ExamCalendarPage.jsx';
import ExamFormPage from './Pages/ExamFormPage.jsx';
import ExamDetailsPage from './Pages/ExamDetailsPage.jsx';
import ExamSubmissionsPage from './Pages/ExamSubmissionsPage.jsx';
import ExamReviewPage from './Pages/ExamReviewPage.jsx';
import StudentCalendarPage from './Pages/StudentCalendarPage.jsx';
import ExamInstructionsPage from './Pages/ExamInstructionsPage.jsx';
import ExamTakerPage from './Pages/ExamTakerPage.jsx';
import ExamReviewPanel from './Pages/ExamReviewPanel.jsx';
import ResultsPage from './Pages/ResultsPage.jsx';


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
      { path: '/student', element: <RequireAuth><RequireRole allowedRoles={['student', 'admin']}><StudentPage /></RequireRole></RequireAuth> ,
      children:[
        { index: true, element: <Navigate to="/student/classes" replace />},
        { path: 'classes', element: <ClassComp />},
        { path: 'courses/:cid', element: <CoursesComp />},
        { path: 'modules/:cid', element: <ModuleViewer />},
        { path: 'exams', element: <StudentCalendarPage /> },
        { path: 'exams/:examId/instructions', element: <ExamInstructionsPage /> },
        { path: 'exams/:examId/take', element: <ExamTakerPage /> },
        { path: 'exams/:examId/review', element: <ExamReviewPanel /> },
        { path: 'exams/:examId/results', element: <ResultsPage /> },
      ]},
      { path: '/teacher', element: <RequireAuth><RequireRole allowedRoles={['teacher', 'admin']}><TeacherPage /></RequireRole></RequireAuth>,
      children:[
        { index: true, element: <Navigate to="/teacher/classes" replace />},
        { path: 'classes', element: <ClassComp />},
        { path: 'courses/:cid', element: <CoursesComp />},
        { path: 'modules/:cid', element: <ModuleViewer />},
        { path: 'genques/:classId?', element: <GenerateQuestions />},
        { path: 'genprogress', element: <GenerationProgress />},
        { path: 'genpreview', element: <GeneratedPreview />},
        { path: 'question-bank/:classId', element: <QuestionBankPage />},
        { path: 'exams', element: <ExamCalendarPage /> },
        { path: 'exams/create', element: <ExamFormPage /> },
        { path: 'exams/:examId/edit', element: <ExamFormPage /> },
        { path: 'exams/:examId', element: <ExamDetailsPage /> },
        { path: 'exams/:examId/submissions', element: <ExamSubmissionsPage /> },
        { path: 'exams/:examId/submissions/:studentId', element: <ExamReviewPage /> },
      ]
    },

      { path: '/home' , element: <RequireAuth><RequireRole allowedRoles={['user' , 'admin']}><UserPage /></RequireRole></RequireAuth> ,
      children:[
        { index: true, element: <Navigate to="/home/orientation" replace />},
        { path: 'orientation', element: <UserOrientationComp />}
      ]},
    ],
  },
]);


createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <RouterProvider router={router} />
  </GoogleOAuthProvider>
)