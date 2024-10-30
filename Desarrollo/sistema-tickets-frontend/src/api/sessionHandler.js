import apiClient from './apiClient';

// Configuración base para las solicitudes

export const loginUser = async (correo, password) => {
  
  try {
    if (localStorage.getItem('token')) {await logoutUser()}
    // Enviar solicitud de inicio de sesión al backend
    const response = await apiClient.post('login/', { correo, password });

    const newToken = response.data.token;
    if (newToken) {
      // Almacenar el token en localStorage
      localStorage.setItem('token', newToken);
      console.log('Token almacenado con éxito:',newToken); // Mensaje de éxito en la consola
    }
    
    return response.data; // Devolver los datos de respuesta
  } catch (error) {
      console.error('Error during login:', error);
      return null; // Retornar null en caso de error
    }
  };
export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      console.warn('No hay token almacenado para cerrar sesión.');
      return;
    }

    await apiClient.post('logout/', null, {
      headers: {Authorization: `Token ${token}`,},
    });

    localStorage.removeItem('token'); // Elimina el token del almacenamiento local
    console.log('Sesión cerrada y token eliminado.');
  } catch (error) {
    console.error('Error during logout:', error);
  }
};
export default loginUser;