import apiClient from "./apiClient";

export const fetchCombinedData = async () => {
    try {
        console.log('Fetching combined data');
        const response = await apiClient.get('combined-data/'); // Asegúrate de que la ruta sea correcta
        return response.data;  // Contendrá las 4 listas
    } catch (error) {
        console.error('Error fetching combined data:', error);
        return null;  // Retorna null en caso de error
    }
};
//export createTicket
//export patchTicket
export default fetchCombinedData;

