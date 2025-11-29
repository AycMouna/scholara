import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('authToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    try {
      const user = JSON.parse(localStorage.getItem('authUser') || '{}');
      if (!user.role || !allowedRoles.includes(user.role)) {
        const fallback = user.role === 'STUDENT' ? '/chatbot' : '/dashboard';
        return <Navigate to={fallback} replace />;
      }
    } catch {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
}

export default PrivateRoute;
