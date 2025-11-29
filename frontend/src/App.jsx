import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Courses from "./pages/Courses";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import Chatbot from "./pages/Chatbot";
import Enrollments from "./pages/Enrollments";

const HomeRedirect = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  try {
    const user = JSON.parse(localStorage.getItem('authUser') || '{}');
    const target = user?.role === 'STUDENT' ? '/chatbot' : '/dashboard';
    return <Navigate to={target} replace />;
  } catch {
    return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/app" element={<HomeRedirect />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/students" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <Students />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <Courses />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/chatbot" 
          element={
            <PrivateRoute allowedRoles={['STUDENT']}>
              <Chatbot />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/enrollments" 
          element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <Enrollments />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
