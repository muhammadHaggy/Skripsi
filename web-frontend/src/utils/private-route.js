import { useJwt } from 'react-jwt';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = sessionStorage.getItem('token');
  const { isExpired } = useJwt(token);
  if (!token || isExpired) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default PrivateRoute;