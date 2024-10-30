import apiClient from "./apiClient";

export const listarUsuarios = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await apiClient.get('lista-usuario/', {
            headers: {Authorization: `Token ${token}`,},
            }); // Reemplaza con tu endpoint real
        return response.data;
    } catch (error) {
        console.error('Error fetching usuarios:', error);
        throw error; // Lanza el error para manejarlo en el componente que llama esta función
    }
};
export default listarUsuarios;
