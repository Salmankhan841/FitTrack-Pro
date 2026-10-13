import { jwtDecode } from 'jwt-decode';

export const getToken = () => sessionStorage.getItem('token');
export const setToken = (token) => sessionStorage.setItem('token', token);
export const clearToken = () => sessionStorage.removeItem('token');

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  // Allow mock tokens for development
  if (token.startsWith('mock-jwt-token')) return false;

  try {
    const decoded = jwtDecode(token);
    // exp is in seconds, Date.now() is in ms
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};
