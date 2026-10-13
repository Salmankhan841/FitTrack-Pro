import { useSelector } from 'react-redux';
import { isTokenExpired } from '../utils/tokenHelpers';

export const useAuth = () => {
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const tokenExpired = () => isTokenExpired(token);

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    tokenExpired,
  };
};
