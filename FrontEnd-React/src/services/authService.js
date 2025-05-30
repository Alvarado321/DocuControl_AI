import api from './api';

const authService = {
  // Iniciar sesión
  login: async (email, password) => {
    try {
      const response = await api.post('/api/auth/login', {
        email,
        password,
      });
      
      const { access_token, usuario } = response.data;
      
      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(usuario));
      
      return { success: true, data: { token: access_token, user: usuario } };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al iniciar sesión',
      };
    }
  },

  // Registrar nuevo usuario
  register: async (userData) => {
    try {
      const response = await api.post('/api/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al registrar usuario',
      };
    }
  },

  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    try {
      const response = await api.get('/api/auth/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Error al obtener perfil',
      };
    }
  },

  // Cerrar sesión
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Obtener datos del usuario desde localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token de acceso
  getToken: () => {
    return localStorage.getItem('access_token');
  },
};

export default authService;
